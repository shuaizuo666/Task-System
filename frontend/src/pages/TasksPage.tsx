import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { Task, TaskRequest, TaskList, TaskListRequest } from '../types/task';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskFilters from '../components/TaskFilters';
import SearchBar from '../components/SearchBar';
import ListSidebar from '../components/ListSidebar';
import ListForm from '../components/ListForm';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const TasksPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [renderError, setRenderError] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [listRefreshTrigger, setListRefreshTrigger] = useState(0);
  const [showListForm, setShowListForm] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false);
  const [deletingList, setDeletingList] = useState<TaskList | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, priorityFilter, searchQuery, selectedListId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading tasks with params:', {
        currentPage,
        pageSize,
        statusFilter,
        priorityFilter,
        selectedListId,
        searchQuery
      });
      const response = await taskService.getAllTasks(
        currentPage, 
        pageSize,
        statusFilter || undefined,
        priorityFilter || undefined,
        selectedListId || undefined,
        searchQuery || undefined
      );
      console.log('Tasks loaded successfully:', response);
      setTasks(response.tasks || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load tasks'; // 加载任务失败
        setError(errorMsg);
        showError(errorMsg);
        console.error('Error loading tasks:', err);
        console.error('Error details:', {
          response: err.response,
          message: err.message,
          stack: err.stack
        });
        // Set empty state on error to prevent white screen
        setTasks([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (taskId: number) => {
    setDeletingTaskId(taskId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingTaskId === null) return;

    try {
        setError(null);
        await taskService.deleteTask(deletingTaskId);
        setShowDeleteConfirm(false);
        setDeletingTaskId(null);
        success('Task deleted successfully'); // 任务已成功删除
        await loadTasks();
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to delete task'; // 删除任务失败
        setError(errorMsg);
        showError(errorMsg);
        setShowDeleteConfirm(false);
        setDeletingTaskId(null);
      }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingTaskId(null);
  };

  const handleFormSubmit = async (taskData: TaskRequest) => {
    try {
        if (editingTask) {
          await taskService.updateTask(editingTask.id, taskData);
          success('Task updated successfully'); // 任务已成功更新
        } else {
          await taskService.createTask(taskData);
          success('Task created successfully'); // 任务已成功创建
        }
        setShowForm(false);
        setEditingTask(null);
        await loadTasks();
      } catch (err) {
        throw err;
      }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handlePriorityChange = (priority: string) => {
    setPriorityFilter(priority);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page when search changes
  };

  const handleListSelect = (listId: number | null) => {
    setSelectedListId(listId);
    setCurrentPage(0); // Reset to first page when list changes
  };

  const handleCreateList = () => {
    setEditingList(null);
    setShowListForm(true);
  };

  const handleEditList = (list: TaskList) => {
    setEditingList(list);
    setShowListForm(true);
  };

  const handleDeleteList = (list: TaskList) => {
    // Prevent deleting default list at UI level
    if (list.isDefault) {
      const errorMsg = 'Cannot delete default list'; // 无法删除默认列表
      setError(errorMsg);
      showError(errorMsg);
      return;
    }
    setDeletingList(list);
    setShowDeleteListConfirm(true);
  };

  const handleDeleteListConfirm = async () => {
    if (!deletingList) return;

    try {
        setError(null);
        await taskService.deleteList(deletingList.id);
        setShowDeleteListConfirm(false);
        
        // If the deleted list was selected, switch to all tasks view
        if (selectedListId === deletingList.id) {
          setSelectedListId(null);
        }
        
        setDeletingList(null);
        success('List deleted successfully'); // 列表已成功删除
        setListRefreshTrigger(prev => prev + 1);
        await loadTasks();
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to delete list'; // 删除列表失败
        setError(errorMsg);
        showError(errorMsg);
        setShowDeleteListConfirm(false);
        setDeletingList(null);
      }
  };

  const handleDeleteListCancel = () => {
    setShowDeleteListConfirm(false);
    setDeletingList(null);
  };

  const handleListFormSubmit = async (listData: TaskListRequest) => {
    try {
        if (editingList) {
          await taskService.updateList(editingList.id, listData);
          success('List updated successfully'); // 列表已成功更新
        } else {
          await taskService.createList(listData);
          success('List created successfully'); // 列表已成功创建
        }
        setShowListForm(false);
        setEditingList(null);
        setListRefreshTrigger(prev => prev + 1);
        await loadTasks();
      } catch (err) {
        throw err;
      }
  };

  const handleListFormCancel = () => {
    setShowListForm(false);
    setEditingList(null);
  };

  // Error boundary for rendering errors
  if (renderError) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#dc3545' }}>Page loading error</h2> {/* 页面加载出错 */}
        <p>{renderError}</p>
        <button
          onClick={() => {
            setRenderError(null);
            window.location.reload();
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0d6efd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Reload {/* 重新加载 */}
        </button>
      </div>
    );
  }

  try {
    return (
      <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Sidebar - hidden on mobile by default */}
      <div
        style={{
          position: sidebarOpen ? 'relative' : 'absolute',
          left: sidebarOpen ? 0 : '-280px',
          transition: 'left 0.3s ease',
          zIndex: 100
        }}
      >
        <ListSidebar
          selectedListId={selectedListId}
          onListSelect={handleListSelect}
          onCreateList={handleCreateList}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          refreshTrigger={listRefreshTrigger}
        />
      </div>
      
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        overflowY: 'auto',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: '1'
              }}
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'} // 隐藏侧边栏 / 显示侧边栏
            >
              ☰
            </button>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Task Management</h1> {/* 任务管理 */}
          </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            📊 Dashboard {/* 📊 仪表板 */}
          </button>
          <button
            onClick={handleCreateTask}
            style={{
              padding: '8px 16px',
              backgroundColor: '#198754',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            + Create Task {/* + 创建任务 */}
          </button>
          <span style={{ fontSize: '14px', color: '#6c757d' }}>Welcome, {user?.username}!</span> {/* 欢迎, {user?.username}! */}
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout {/* 登出 */}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search task title or description..." // 搜索任务标题或描述...
      />

      <TaskFilters
        status={statusFilter}
        priority={priorityFilter}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
      />

      {loading ? (
        <div style={{ padding: '60px 20px' }}>
          <LoadingSpinner size="large" message="Loading tasks..." /> {/* 加载任务中... */}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={searchQuery || statusFilter || priorityFilter ? '🔍' : '📋'}
          title={searchQuery || statusFilter || priorityFilter ? 'No matching tasks found' : 'No tasks yet'} // 没有找到匹配的任务 / 暂无任务
          description={
            searchQuery || statusFilter || priorityFilter
              ? 'Try adjusting filters or search keywords' // 尝试调整筛选条件或搜索关键词
              : 'Click "Create Task" to add your first task' // 点击"创建任务"按钮开始添加您的第一个任务
          }
          action={
            !searchQuery && !statusFilter && !priorityFilter
              ? {
                  label: 'Create first task', // 创建第一个任务
                  onClick: handleCreateTask
                }
              : undefined
          }
        />
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#6c757d' }}>Total {totalElements} tasks</p> {/* 共 {totalElements} 个任务 */}
          </div>

          <div style={{ 
            display: 'grid', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: currentPage === 0 ? '#e9ecef' : 'white',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous Page {/* 上一页 */}
              </button>
              
              <span style={{ padding: '0 16px' }}>
                Page {currentPage + 1} / {totalPages} {/* 第 {currentPage + 1} / {totalPages} 页 */}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: currentPage >= totalPages - 1 ? '#e9ecef' : 'white',
                  cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Next Page {/* 下一页 */}
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Confirm Delete" // 确认删除
          message="Are you sure you want to delete this task? This action cannot be undone." // 确定要删除这个任务吗？此操作无法撤销。
          confirmText="Delete" // 删除
          cancelText="Cancel" // 取消
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmButtonColor="#dc3545"
        />
      )}

      {showListForm && (
        <ListForm
          list={editingList}
          onSubmit={handleListFormSubmit}
          onCancel={handleListFormCancel}
        />
      )}

      {showDeleteListConfirm && deletingList && (
        <ConfirmDialog
          title="Confirm Delete List" // 确认删除列表
          message={`Are you sure you want to delete list "${deletingList.name}"? Tasks in this list will be moved to the default list. This action cannot be undone.`} // 确定要删除列表
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteListConfirm}
          onCancel={handleDeleteListCancel}
          confirmButtonColor="#dc3545"
        />
      )}
      </div>
    </div>
    );
  } catch (err: any) {
    console.error('Render error in TasksPage:', err);
    setRenderError(err.message || 'Unknown error'); // 未知错误
    return null;
  }
};

export default TasksPage;