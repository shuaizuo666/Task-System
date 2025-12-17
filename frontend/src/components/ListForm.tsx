import React, { useState, useEffect } from 'react';
import { TaskList, TaskListRequest } from '../types/task';

interface ListFormProps {
  list?: TaskList | null;
  onSubmit: (listData: TaskListRequest) => Promise<void>;
  onCancel: () => void;
}

const ListForm: React.FC<ListFormProps> = ({ list, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (list) {
      setName(list.name);
    }
  }, [list]);

  const validateForm = (): boolean => {
    // Validate name is not empty or whitespace only
    if (!name || name.trim().length === 0) {
      setError('List name cannot be empty'); // 列表名称不能为空
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

      const listData: TaskListRequest = {
        name: name.trim()
      };

      await onSubmit(listData);
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
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
          {list ? 'Edit List' : 'Create List'} {/* {list ? '编辑列表' : '创建列表'} */}
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
              List Name <span style={{ color: '#dc3545' }}>*</span> {/* 列表名称 */}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter list name" // 输入列表名称
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              disabled={submitting}
              autoFocus
            />
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
              Cancel // 取消
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
                transition: 'all 0.2s ease'
              }}
            >
              {submitting ? 'Submitting...' : (list ? '✓ Update' : '+ Create')} {/* {submitting ? '提交中...' : (list ? '✓ 更新' : '+ 创建')} */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListForm;
