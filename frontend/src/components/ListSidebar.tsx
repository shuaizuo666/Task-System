import React, { useState, useEffect } from 'react';
import { TaskList } from '../types/task';
import { taskService } from '../services/taskService';

interface ListSidebarProps {
  selectedListId: number | null;
  onListSelect: (listId: number | null) => void;
  onCreateList: () => void;
  onEditList: (list: TaskList) => void;
  onDeleteList: (list: TaskList) => void;
  refreshTrigger?: number;
}

const ListSidebar: React.FC<ListSidebarProps> = ({
  selectedListId,
  onListSelect,
  onCreateList,
  onEditList,
  onDeleteList,
  refreshTrigger
}) => {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLists();
  }, [refreshTrigger]);

  const loadLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getAllLists();
      setLists(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lists'); // 加载列表失败
      console.error('Error loading lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleListClick = (listId: number) => {
    onListSelect(listId);
  };

  const handleAllTasksClick = () => {
    onListSelect(null);
  };

  return (
    <div style={{
      width: '280px',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      padding: '20px',
      height: '100vh',
      overflowY: 'auto',
      position: 'sticky',
      top: 0
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Task Lists</h3> {/* 任务列表 */}
        <button
          onClick={onCreateList}
          style={{
            padding: '6px 12px',
            backgroundColor: '#0d6efd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
          title="Create new list" /* 创建新列表 */
        >
          + New {/* + 新建 */}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '8px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
          <p style={{ fontSize: '14px' }}>Loading...</p> {/* 加载中... */}
        </div>
      ) : (
        <>
          {/* All Tasks Option */}
          <div
            onClick={handleAllTasksClick}
            style={{
              padding: '12px',
              marginBottom: '8px',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: selectedListId === null ? '#0d6efd' : 'white',
              color: selectedListId === null ? 'white' : '#212529',
              border: '1px solid',
              borderColor: selectedListId === null ? '#0d6efd' : '#dee2e6',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: selectedListId === null ? '600' : '500' }}>
              📋 All Tasks {/* 📋 所有任务 */}
            </span>
          </div>

          {/* Task Lists */}
          {lists.map(list => (
            <div
              key={list.id}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedListId === list.id ? '#0d6efd' : 'white',
                color: selectedListId === list.id ? 'white' : '#212529',
                border: '1px solid',
                borderColor: selectedListId === list.id ? '#0d6efd' : '#dee2e6',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <div
                onClick={() => handleListClick(list.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: selectedListId === list.id ? '600' : '500',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {list.isDefault && <span>⭐</span>}
                    <span>{list.name}</span>
                  </div>
                  {list.taskCount !== undefined && (
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8
                    }}>
                      {list.taskCount} tasks {/* 个任务 */}
                    </div>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginLeft: '8px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditList(list);
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'transparent',
                      color: selectedListId === list.id ? 'white' : '#6c757d',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Edit list" /* 编辑列表 */
                  >
                    ✏️
                  </button>
                  {!list.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteList(list);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'transparent',
                        color: selectedListId === list.id ? 'white' : '#dc3545',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Delete list" /* 删除列表 */
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {lists.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#6c757d',
              fontSize: '14px'
            }}>
              No lists yet {/* 暂无列表 */}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListSidebar;