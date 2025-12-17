import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AuthPages.css';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!username.trim()) {
      setError('Username cannot be empty'); // 用户名不能为空
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address'); // 请输入有效的邮箱地址
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long'); // 密码长度至少为8个字符
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match'); // 两次输入的密码不一致
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password);
      // Registration successful, redirect to login
      navigate('/login', { 
        state: { message: 'Registration successful! Please login to your account' } // 注册成功！请登录您的账户
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed, please try again later'); // 注册失败，请稍后重试
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Register</h1> {/* 注册 */}
        <p className="auth-subtitle">Create your task management account</p> {/* 创建您的任务管理账户 */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label> {/* 用户名 */}
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username" /* 请输入用户名 */
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label> {/* 邮箱 */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" /* 请输入邮箱 */
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label> {/* 密码 */}
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters" /* 至少8个字符 */
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label> {/* 确认密码 */}
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password" /* 再次输入密码 */
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'} {/* 注册中... / 注册 */}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login now</Link> {/* 已有账户？ / 立即登录 */}
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;