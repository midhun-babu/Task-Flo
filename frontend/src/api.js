const API_URL = 'http://localhost:5000/api'; // Default backend URL

export const api = {
  get token() {
    return localStorage.getItem('taskflo_token');
  },
  
  set token(value) {
    if (value) {
      localStorage.setItem('taskflo_token', value);
    } else {
      localStorage.removeItem('taskflo_token');
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) this.token = data.token;
    return data;
  },

  async register(name, email, password, role = 'user') {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    if (data.token) this.token = data.token;
    return data;
  },

  async getMe() {
    return this.request('/auth/me');
  },

  logout() {
    this.token = null;
  },

  // Tasks endpoints
  async getTasks(status = '') {
    const query = status ? `?status=${status}` : '';
    return this.request(`/tasks${query}`);
  },

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  async updateTaskStatus(taskId, status) {
    return this.request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
