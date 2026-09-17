import { api } from './api.js';

export async function renderDashboard(container, onLogout) {
  container.innerHTML = `
    <div class="dashboard-layout fade-in">
      <header class="dashboard-header glass-panel">
        <h2 class="text-gradient">Task-Flo</h2>
        <div class="user-profile">
          <span id="user-name">Loading...</span>
          <div class="avatar" id="user-avatar">?</div>
          <button class="btn btn-ghost" id="logout-btn">Logout</button>
        </div>
      </header>

      <div class="kanban-board">
        <div class="kanban-column" id="col-todo">
          <div class="column-header">
            <div class="column-title">To Do <span class="task-count" id="count-todo">0</span></div>
            <button class="btn btn-ghost" style="padding: 4px 10px;" id="add-task-btn">+</button>
          </div>
          <div class="task-list" id="list-todo" data-status="To Do"></div>
        </div>
        
        <div class="kanban-column" id="col-in-progress">
          <div class="column-header">
            <div class="column-title">In Progress <span class="task-count" id="count-in-progress">0</span></div>
          </div>
          <div class="task-list" id="list-in-progress" data-status="In Progress"></div>
        </div>
        
        <div class="kanban-column" id="col-done">
          <div class="column-header">
            <div class="column-title">Completed <span class="task-count" id="count-done">0</span></div>
          </div>
          <div class="task-list" id="list-done" data-status="Completed"></div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div id="task-modal" class="glass-panel" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); padding:30px; width:400px; z-index:100;">
      <h3 id="modal-title" style="margin-bottom: 20px;">New Task</h3>
      <div class="input-group">
        <label>Title</label>
        <input type="text" id="task-title-input" class="input-field" placeholder="Task title">
      </div>
      <div class="input-group">
        <label>Description</label>
        <textarea id="task-desc-input" class="input-field" placeholder="Description" rows="3"></textarea>
      </div>
      <div class="input-group">
        <label>Priority</label>
        <select id="task-priority-input" class="input-field" style="background:#1a1a2e;">
          <option value="Low">Low</option>
          <option value="Medium" selected>Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button class="btn btn-ghost" id="cancel-task-btn">Cancel</button>
        <button class="btn" id="save-task-btn">Save</button>
      </div>
    </div>
  `;

  try {
    const userResponse = await api.getMe();
    const user = userResponse.data;
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
  } catch (error) {
    onLogout();
    return;
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    api.logout();
    onLogout();
  });

  const loadTasks = async () => {
    try {
      const response = await api.getTasks();
      const tasks = response.data;
      renderTasks(tasks);
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const renderTasks = (tasks) => {
    const lists = {
      'To Do': document.getElementById('list-todo'),
      'In Progress': document.getElementById('list-in-progress'),
      'Completed': document.getElementById('list-done')
    };

    const counts = {
      'To Do': 0,
      'In Progress': 0,
      'Completed': 0
    };

    Object.values(lists).forEach(list => list.innerHTML = '');

    tasks.forEach(task => {
      if (lists[task.status]) {
        counts[task.status]++;
        const card = document.createElement('div');
        card.className = 'task-card slide-up';
        card.innerHTML = `
          <div class="task-title">${task.title}</div>
          <div class="task-desc">${task.description}</div>
          <div class="task-meta">
            <span class="task-priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <span style="cursor:pointer;" class="status-btn" data-id="${task._id}" data-status="${task.status}">
              ${task.status === 'To Do' ? 'Start →' : task.status === 'In Progress' ? 'Done →' : '← Revert'}
            </span>
          </div>
        `;
        lists[task.status].appendChild(card);
      }
    });

    document.getElementById('count-todo').textContent = counts['To Do'];
    document.getElementById('count-in-progress').textContent = counts['In Progress'];
    document.getElementById('count-done').textContent = counts['Completed'];

    document.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const currentStatus = e.target.getAttribute('data-status');
        let newStatus = 'In Progress';
        if (currentStatus === 'In Progress') newStatus = 'Completed';
        else if (currentStatus === 'Completed') newStatus = 'To Do';
        
        await api.updateTaskStatus(id, newStatus);
        loadTasks();
      });
    });
  };

  // Modal logic
  const modal = document.getElementById('task-modal');
  document.getElementById('add-task-btn').addEventListener('click', () => {
    modal.style.display = 'block';
  });
  document.getElementById('cancel-task-btn').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  document.getElementById('save-task-btn').addEventListener('click', async () => {
    const title = document.getElementById('task-title-input').value;
    const desc = document.getElementById('task-desc-input').value;
    const priority = document.getElementById('task-priority-input').value;
    
    if (title) {
      await api.createTask({ title, description: desc, priority });
      modal.style.display = 'none';
      document.getElementById('task-title-input').value = '';
      document.getElementById('task-desc-input').value = '';
      loadTasks();
    }
  });

  loadTasks();
}
