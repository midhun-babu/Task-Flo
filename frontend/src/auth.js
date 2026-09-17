import { api } from './api.js';

export function renderAuth(container, onSuccess) {
  container.innerHTML = `
    <div class="center-container fade-in">
      <div class="glass-panel auth-card">
        <div class="auth-header">
          <h1 class="text-gradient">Task-Flo</h1>
          <p>Immersive task management</p>
        </div>
        
        <form id="auth-form" class="slide-up">
          <div class="input-group">
            <label>Email</label>
            <input type="email" id="email" class="input-field" placeholder="your@email.com" required>
          </div>
          <div class="input-group">
            <label>Password</label>
            <input type="password" id="password" class="input-field" placeholder="••••••••" required>
          </div>
          <div id="error-msg" style="color: var(--danger-color); margin-bottom: 10px; font-size: 0.9rem; display: none;"></div>
          <button type="submit" class="btn" style="width: 100%;">Enter Space</button>
        </form>
        
        <div class="auth-footer">
          New here? <a href="#" id="toggle-auth">Create an account</a>
        </div>
      </div>
    </div>
  `;

  let isLogin = true;
  const form = document.getElementById('auth-form');
  const toggleLink = document.getElementById('toggle-auth');
  const errorMsg = document.getElementById('error-msg');

  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    if (isLogin) {
      toggleLink.textContent = "Create an account";
      toggleLink.previousSibling.textContent = "New here? ";
      form.querySelector('button').textContent = "Enter Space";
      
      const nameGroup = document.getElementById('name-group');
      if (nameGroup) nameGroup.remove();
    } else {
      toggleLink.textContent = "Sign in";
      toggleLink.previousSibling.textContent = "Already have an account? ";
      form.querySelector('button').textContent = "Join Space";
      
      const nameGroup = document.createElement('div');
      nameGroup.className = "input-group slide-up";
      nameGroup.id = "name-group";
      nameGroup.innerHTML = `
        <label>Name</label>
        <input type="text" id="name" class="input-field" placeholder="Your Name" required>
      `;
      form.insertBefore(nameGroup, form.firstChild);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      errorMsg.style.display = 'none';
      if (isLogin) {
        await api.login(email, password);
      } else {
        const name = document.getElementById('name').value;
        await api.register(name, email, password, 'admin'); // Defaulting to admin so they can create tasks
      }
      onSuccess();
    } catch (error) {
      errorMsg.textContent = error.message;
      errorMsg.style.display = 'block';
    }
  });
}
