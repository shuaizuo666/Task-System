import React from 'react';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US'); // 英文日期格式
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'TODO': 'Todo', // 待办
      'IN_PROGRESS': 'In Progress', // 进行中
      'COMPLETED': 'Completed' // 已完成
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      'HIGH': 'High', // 高
      'MEDIUM': 'Medium', // 中
      'LOW': 'Low' // 低
    };
    return labels[priority] || priority;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'TODO': '#6c757d',
      'IN_PROGRESS': '#0d6efd',
      'COMPLETED': '#198754'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'HIGH': '#dc3545',
      'MEDIUM': '#ffc107',
      'LOW': '#28a745'
    };
    return colors[priority] || '#6c757d';
  };

  return (
    <div 
      className="task-card hover-lift"
      style={{
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', flex: 1 }}>{task.title}</h3>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: getStatusColor(task.status),
            color: 'white',
            whiteSpace: 'nowrap'
          }}>
            {getStatusLabel(task.status)}
          </span>
          <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: getPriorityColor(task.priority),
            color: 'white',
            whiteSpace: 'nowrap'
          }}>
            {getPriorityLabel(task.priority)}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p style={{ 
          margin: '8px 0',
          color: '#6c757d',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {task.description}
        </p>
      )}
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #e9ecef'
      }}>
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          <div>Due Date: {formatDate(task.dueDate)}</div> {/* 截止日期 */}
          <div style={{ marginTop: '4px' }}>Created At: {formatDate(task.createdAt)}</div> {/* 创建于 */}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit(task)}
            className="btn-primary"
            style={{
              padding: '6px 16px',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            ✏️ Edit
          </button> {/* 编辑 */}
          <button
            onClick={() => onDelete(task.id)}
            className="btn-primary"
            style={{
              padding: '6px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            🗑️ Delete
          </button> {/* 删除 */}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;