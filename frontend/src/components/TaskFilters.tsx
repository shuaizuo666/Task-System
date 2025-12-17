import React from 'react';
import { TaskStatus, TaskPriority } from '../types/task';

interface TaskFiltersProps {
  status: string;
  priority: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  status,
  priority,
  onStatusChange,
  onPriorityChange
}) => {
  const statusOptions = [
    { value: '', label: 'All Status' }, // 全部状态
    { value: TaskStatus.TODO, label: 'Todo' }, // 待办
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' }, // 进行中
    { value: TaskStatus.COMPLETED, label: 'Completed' } // 已完成
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' }, // 全部优先级
    { value: TaskPriority.HIGH, label: 'High' }, // 高
    { value: TaskPriority.MEDIUM, label: 'Medium' }, // 中
    { value: TaskPriority.LOW, label: 'Low' } // 低
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="status-filter" style={{ fontSize: '14px', fontWeight: '500' }}>
          Status Filter {/* 状态筛选 */}
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: 'white',
            minWidth: '150px'
          }}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="priority-filter" style={{ fontSize: '14px', fontWeight: '500' }}>
          Priority Filter {/* 优先级筛选 */}
        </label>
        <select
          id="priority-filter"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: 'white',
            minWidth: '150px'
          }}
        >
          {priorityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;