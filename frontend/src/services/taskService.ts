import axios from 'axios';
import { Task, TaskListResponse, TaskRequest, TaskList, TaskListRequest } from '../types/task';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const taskService = {
  getAllTasks: async (
    page: number = 0,
    size: number = 20,
    status?: string,
    priority?: string,
    listId?: number,
    search?: string
  ): Promise<TaskListResponse> => {
    const params: any = { page, size };
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (listId) params.listId = listId;
    if (search) params.search = search;

    const response = await axios.get(`${API_URL}/tasks`, { params });
    
    // Backend returns Spring Data Page object with 'content' field
    // Transform it to match our TaskListResponse interface
    const pageData = response.data;
    return {
      tasks: pageData.content || [],
      totalPages: pageData.totalPages || 0,
      totalElements: pageData.totalElements || 0
    };
  },

  getTaskById: async (id: number): Promise<Task> => {
    const response = await axios.get(`${API_URL}/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: TaskRequest): Promise<Task> => {
    const response = await axios.post(`${API_URL}/tasks`, task);
    return response.data;
  },

  updateTask: async (id: number, task: TaskRequest): Promise<Task> => {
    const response = await axios.put(`${API_URL}/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/tasks/${id}`);
  },

  // Task List APIs
  getAllLists: async (): Promise<TaskList[]> => {
    const response = await axios.get(`${API_URL}/lists`);
    return response.data;
  },

  getListById: async (id: number): Promise<TaskList> => {
    const response = await axios.get(`${API_URL}/lists/${id}`);
    return response.data;
  },

  createList: async (list: TaskListRequest): Promise<TaskList> => {
    const response = await axios.post(`${API_URL}/lists`, list);
    return response.data;
  },

  updateList: async (id: number, list: TaskListRequest): Promise<TaskList> => {
    const response = await axios.put(`${API_URL}/lists/${id}`, list);
    return response.data;
  },

  deleteList: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/lists/${id}`);
  },

  // Statistics APIs
  getDashboardStats: async (): Promise<{
    totalTasks: number;
    todoCount: number;
    inProgressCount: number;
    completedCount: number;
    dueTodayCount: number;
    overdueCount: number;
  }> => {
    const response = await axios.get(`${API_URL}/statistics/dashboard`);
    return response.data;
  }
};
