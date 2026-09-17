import { api } from './api.js';

// Map backend status enums → display labels
const STATUS_LABEL = {
  pending:     'To Do',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

// Map display label → backend enum (for status transitions)
const NEXT_STATUS = {
  pending:     'in_progress',
  in_progress: 'completed',
  completed:   'pending',
};

const NEXT_LABEL = {
  pending:     'Start →',
  in_progress: 'Done ✓',
  completed:   '↩ Revert',
};

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
            <div class="column-title">🗒️ To Do <span class="task-count" id="count-pending">0</span></div>
            <button class="btn btn-ghost" style="padding: 4px 12px; font-size: 1.2rem;" id="add-task-btn" title="New Task">+</button>
          </div>
          <div class="task-list" id="list-pending"></div>
        </div>

        <div class="kanban-column" id="col-in-progress">
          <div class="column-header">
            <div class="column-title">⚡ In Progress <span class="task-count" id="count-in_progress">0</span></div>
          </div>
          <div class="task-list" id="list-in_progress"></div>
        </div>

        <div class="kanban-column" id="col-done">
          <div class="column-header">
            <div class="column-title">✅ Completed <span class="task-count" id="count-completed">0</span></div>
          </div>
          <div class="task-list" id="list-completed"></div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div id="modal-backdrop" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.3); backdrop-filter:blur(4px); z-index:99;"></div>

    <!-- New Task Modal -->
    <div id="task-modal" class="glass-panel" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); padding:32px; width:460px; z-index:100; animation: slideUp 0.3s ease;">
      <h3 style="margin-bottom: 24px; font-size:1.4rem;">✨ New Task</h3>
      <div class="input-group">
        <label>Title</label>
        <input type="text" id="task-title-input" class="input-field" placeholder="What needs to be done?">
      </div>
      <div class="input-group">
        <label>Description</label>
        <textarea id="task-desc-input" class="input-field" placeholder="Add more details..." rows="3" style="resize:vertical;"></textarea>
      </div>
      <div style="display:flex; gap:16px;">
        <div class="input-group" style="flex:1;">
          <label>Priority</label>
          <select id="task-priority-input" class="input-field">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div class="input-group" style="flex:1;">
          <label>Due Date</label>
          <input type="date" id="task-due-input" class="input-field">
        </div>
      </div>
      <div id="modal-error" style="color:var(--danger-color); font-size:0.9rem; margin-bottom:10px; display:none;"></div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
        <button class="btn btn-ghost" id="cancel-task-btn">Cancel</button>
        <button class="btn" id="save-task-btn">Create Task</button>
      </div>
    </div>
  `;

  // Load current user
  let currentUserId = null;
  try {
    const userResponse = await api.getMe();
    const user = userResponse.data?.user;
    currentUserId = user?._id;
    document.getElementById('user-name').textContent = user?.name || 'User';
    document.getElementById('user-avatar').textContent = (user?.name || 'U').charAt(0).toUpperCase();
  } catch (error) {
    api.logout();
    onLogout();
    return;
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    api.logout();
    onLogout();
  });

  // Set default due date to 7 days from now
  const defaultDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  document.getElementById('task-due-input').value = defaultDue.toISOString().split('T')[0];

  const loadTasks = async () => {
    try {
      const response = await api.getTasks();
      const tasks = response.data || [];
      renderTasks(tasks);
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const renderTasks = (tasks) => {
    const cols = ['pending', 'in_progress', 'completed'];
    const counts = { pending: 0, in_progress: 0, completed: 0 };

    cols.forEach(s => {
      const el = document.getElementById(`list-${s}`);
      if (el) el.innerHTML = '';
    });

    tasks.forEach(task => {
      const status = task.status;
      if (!counts.hasOwnProperty(status)) return;
      counts[status]++;

      const card = document.createElement('div');
      card.className = 'task-card slide-up';

      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && status !== 'completed';

      card.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-desc">${task.description || 'No description'}</div>
        <div class="task-meta">
          <span class="task-priority priority-${task.priority?.toLowerCase()}">${task.priority?.toUpperCase()}</span>
          <span style="font-size:0.75rem; ${isOverdue ? 'color:var(--danger-color);' : 'color:var(--text-secondary);'}">
            📅 ${dueDate}${isOverdue ? ' Overdue' : ''}
          </span>
        </div>
        <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end;">
          <button class="btn btn-ghost status-btn" style="padding:6px 14px; font-size:0.85rem;"
            data-id="${task._id}" data-status="${status}">
            ${NEXT_LABEL[status] || ''}
          </button>
        </div>
      `;

      const list = document.getElementById(`list-${status}`);
      if (list) list.appendChild(card);
    });

    cols.forEach(s => {
      const el = document.getElementById(`count-${s}`);
      if (el) el.textContent = counts[s];
    });

    // Status change buttons
    document.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const currentStatus = e.currentTarget.getAttribute('data-status');
        const newStatus = NEXT_STATUS[currentStatus];
        if (!newStatus) return;
        btn.disabled = true;
        btn.textContent = '...';
        try {
          await api.updateTaskStatus(id, newStatus);
          await loadTasks();
        } catch (err) {
          console.error('Status update failed', err);
          btn.disabled = false;
        }
      });
    });
  };

  // Modal logic
  const modal = document.getElementById('task-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const modalError = document.getElementById('modal-error');

  const openModal = () => {
    modal.style.display = 'block';
    backdrop.style.display = 'block';
    document.getElementById('task-title-input').focus();
  };
  const closeModal = () => {
    modal.style.display = 'none';
    backdrop.style.display = 'none';
    modalError.style.display = 'none';
    document.getElementById('task-title-input').value = '';
    document.getElementById('task-desc-input').value = '';
  };

  document.getElementById('add-task-btn').addEventListener('click', openModal);
  document.getElementById('cancel-task-btn').addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.getElementById('save-task-btn').addEventListener('click', async () => {
    const title = document.getElementById('task-title-input').value.trim();
    const desc = document.getElementById('task-desc-input').value.trim();
    const priority = document.getElementById('task-priority-input').value;
    const dueDate = document.getElementById('task-due-input').value;

    if (!title) {
      modalError.textContent = 'Title is required.';
      modalError.style.display = 'block';
      return;
    }

    const saveBtn = document.getElementById('save-task-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Creating...';
    try {
      await api.createTask({
        title,
        description: desc,
        priority,
        dueDate,
        assignedTo: currentUserId,  // auto-assign to self
      });
      closeModal();
      await loadTasks();
    } catch (err) {
      modalError.textContent = err.message || 'Failed to create task.';
      modalError.style.display = 'block';
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Create Task';
    }
  });

  loadTasks();
}
