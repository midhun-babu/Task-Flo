const API_URL = '/api/v1';

export const api = {
  _currentUser: null,

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
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
  },

  // --- Auth ---
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.accessToken) this.token = data.data.accessToken;
    this._currentUser = data.data?.user || null;
    return data;
  },

  async register(name, email, password, role = 'employee') {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    if (data.data?.accessToken) this.token = data.data.accessToken;
    this._currentUser = data.data?.user || null;
    return data;
  },

  async getMe() {
    const data = await this.request('/auth/me');
    this._currentUser = data.data?.user || null;
    return data;
  },

  logout() {
    this.token = null;
    this._currentUser = null;
  },

  // --- Tasks ---
  async getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tasks${query ? '?' + query : ''}`);
  },

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(taskId, taskData) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    });
  },

  async updateTaskStatus(taskId, status) {
    return this.request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
