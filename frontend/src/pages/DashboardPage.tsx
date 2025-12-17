import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

interface DashboardStats {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  completedCount: number;
  dueTodayCount: number;
  overdueCount: number;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, removeToast, error: showError } = useToast();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load statistics'; // 加载统计数据失败
      setError(errorMsg);
      showError(errorMsg);
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleGoToTasks = () => {
    navigate('/tasks');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>📊 Dashboard</h1> {/* 仪表板 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleGoToTasks}
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
              📋 View Tasks
            </button> {/* 查看任务 */}
            <span style={{ fontSize: '14px', color: '#6c757d' }}>Welcome, {user?.username}!</span> {/* 欢迎 */}
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
              Logout
            </button> {/* 登出 */}
          </div>
        </div>

        {/* Error Message */}
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

        {/* Loading State */}
        {loading ? (
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '100px 20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <LoadingSpinner size="large" message="Loading statistics..." />
          </div>
        ) : stats ? (
          <>
            {/* Main Statistics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Total Tasks */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #0d6efd'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Total Tasks
                </div> {/* 总任务数 */}
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold',
                  color: '#0d6efd'
                }}>
                  {stats.totalTasks}
                </div>
              </div>

              {/* Todo Tasks */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #6c757d'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Todo
                </div> {/* 待办 */}
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold',
                  color: '#6c757d'
                }}>
                  {stats.todoCount}
                </div>
              </div>

              {/* In Progress Tasks */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #ffc107'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  In Progress
                </div> {/* 进行中 */}
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold',
                  color: '#ffc107'
                }}>
                  {stats.inProgressCount}
                </div>
              </div>

              {/* Completed Tasks */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #198754'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Completed
                </div> {/* 已完成 */}
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold',
                  color: '#198754'
                }}>
                  {stats.completedCount}
                </div>
              </div>
            </div>

            {/* Due Date Statistics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Due Today */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #fd7e14'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Due Today
                </div> {/* 今日到期 */}
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold',
                  color: '#fd7e14'
                }}>
                  {stats.dueTodayCount}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6c757d',
                  marginTop: '8px'
                }}>
                  Tasks due today
                </div> {/* 需要今天完成的任务 */}
              </div>

              {/* Overdue */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #dc3545'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6c757d',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Overdue
                </div> {/* 已逾期 */}
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold',
                  color: '#dc3545'
                }}>
                  {stats.overdueCount}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6c757d',
                  marginTop: '8px'
                }}>
                  Tasks past their due date
                </div> {/* 截止日期已过且未完成 */}
              </div>
            </div>

            {/* Progress Visualization */}
            {stats.totalTasks > 0 && (
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginTop: '30px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Task Completion Progress</h3> {/* 任务完成进度 */}
                
                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  marginBottom: '16px'
                }}>
                  {stats.completedCount > 0 && (
                    <div style={{
                      width: `${(stats.completedCount / stats.totalTasks) * 100}%`,
                      backgroundColor: '#198754',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {stats.completedCount > 0 && `${Math.round((stats.completedCount / stats.totalTasks) * 100)}%`}
                    </div>
                  )}
                  {stats.inProgressCount > 0 && (
                    <div style={{
                      width: `${(stats.inProgressCount / stats.totalTasks) * 100}%`,
                      backgroundColor: '#ffc107',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {stats.inProgressCount > 0 && `${Math.round((stats.inProgressCount / stats.totalTasks) * 100)}%`}
                    </div>
                  )}
                  {stats.todoCount > 0 && (
                    <div style={{
                      width: `${(stats.todoCount / stats.totalTasks) * 100}%`,
                      backgroundColor: '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {stats.todoCount > 0 && `${Math.round((stats.todoCount / stats.totalTasks) * 100)}%`}
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#198754',
                      borderRadius: '4px'
                    }}></div>
                    <span style={{ fontSize: '14px' }}>Completed ({stats.completedCount})</span> {/* 已完成 */}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#ffc107',
                      borderRadius: '4px'
                    }}></div>
                    <span style={{ fontSize: '14px' }}>In Progress ({stats.inProgressCount})</span> {/* 进行中 */}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#6c757d',
                      borderRadius: '4px'
                    }}></div>
                    <span style={{ fontSize: '14px' }}>Todo ({stats.todoCount})</span> {/* 待办 */}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardPage;