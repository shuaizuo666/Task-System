import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskRequest, TaskList } from '../types/task';
import { taskService } from '../services/taskService';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (taskData: TaskRequest) => Promise<void>;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [listId, setListId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setListId(task.listId);
    }
  }, [task]);

  const loadLists = async () => {
    try {
      setLoadingLists(true);
      const data = await taskService.getAllLists();
      setLists(data);
    } catch (err) {
      console.error('Error loading lists:', err);
    } finally {
      setLoadingLists(false);
    }
  };

  const validateForm = (): boolean => {
    // Validate title is not empty or whitespace only
    if (!title || title.trim().length === 0) {
      setError('Task title cannot be empty'); // 任务标题不能为空
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const taskData: TaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        listId
      };

      await onSubmit(taskData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed, please try again'); // 操作失败，请重试
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="scale-in modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
          {task ? 'Edit Task' : 'Create Task'} {/* 编辑任务/创建任务 */}
        </h2>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Title <span style={{ color: '#dc3545' }}>*</span> {/* 标题 */}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title" /* 输入任务标题 */
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              disabled={submitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Description {/* 描述 */}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)" /* 输入任务描述（可选） */
              rows={4}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Status {/* 状态 */}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={submitting}
              >
                <option value={TaskStatus.TODO}>Todo</option> {/* 待办 */}
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option> {/* 进行中 */}
                <option value={TaskStatus.COMPLETED}>Completed</option> {/* 已完成 */}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Priority {/* 优先级 */}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={submitting}
              >
                <option value={TaskPriority.LOW}>Low</option> {/* 低 */}
                <option value={TaskPriority.MEDIUM}>Medium</option> {/* 中 */}
                <option value={TaskPriority.HIGH}>High</option> {/* 高 */}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Due Date {/* 截止日期 */}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              disabled={submitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Task List {/* 任务列表 */}
            </label>
            <select
              value={listId || ''}
              onChange={(e) => setListId(e.target.value ? Number(e.target.value) : undefined)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              disabled={submitting || loadingLists}
            >
              <option value="">Default List</option> {/* 默认列表 */}
              {lists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name} {list.isDefault ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel {/* 取消 */}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: submitting ? '#6c757d' : '#0d6efd',
                color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {submitting ? (
                <>
                  <span style={{ 
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Submitting... {/* 提交中... */}
                </>
              ) : (
                task ? '✓ Update' : '+ Create' // ✓ 更新 / + 创建
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;