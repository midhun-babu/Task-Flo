import { api } from './api.js';

export function renderAuth(container, onSuccess) {
  container.innerHTML = `
    <div class="center-container fade-in">
      <div class="glass-panel auth-card">
        <div class="auth-header">
          <h1 class="text-gradient">Task-Flo</h1>
          <p>Immersive task management</p>
        </div>

        <form id="auth-form">
          <div id="name-group" style="display:none;" class="input-group">
            <label>Name</label>
            <input type="text" id="name" class="input-field" placeholder="Your full name">
          </div>
          <div class="input-group">
            <label>Email</label>
            <input type="email" id="email" class="input-field" placeholder="your@email.com" required autocomplete="email">
          </div>
          <div class="input-group">
            <label>Password</label>
            <input type="password" id="password" class="input-field" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <div id="error-msg" style="color:var(--danger-color); margin-bottom:12px; font-size:0.9rem; display:none; padding: 10px; background: rgba(220,38,38,0.08); border-radius: 8px;"></div>
          <button type="submit" id="submit-btn" class="btn" style="width:100%;">Sign In</button>
        </form>

        <div class="auth-footer">
          <span id="toggle-text">Don't have an account?</span>
          <a href="#" id="toggle-auth"> Sign up</a>
        </div>
      </div>
    </div>
  `;

  let isLogin = true;
  const form = document.getElementById('auth-form');
  const toggleLink = document.getElementById('toggle-auth');
  const toggleText = document.getElementById('toggle-text');
  const nameGroup = document.getElementById('name-group');
  const nameInput = document.getElementById('name');
  const submitBtn = document.getElementById('submit-btn');
  const errorMsg = document.getElementById('error-msg');

  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    errorMsg.style.display = 'none';

    if (isLogin) {
      nameGroup.style.display = 'none';
      nameInput.required = false;
      submitBtn.textContent = 'Sign In';
      toggleText.textContent = "Don't have an account?";
      toggleLink.textContent = ' Sign up';
    } else {
      nameGroup.style.display = 'flex';
      nameInput.required = true;
      submitBtn.textContent = 'Create Account';
      toggleText.textContent = 'Already have an account?';
      toggleLink.textContent = ' Sign in';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    errorMsg.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = isLogin ? 'Signing in...' : 'Creating account...';

    try {
      if (isLogin) {
        await api.login(email, password);
      } else {
        const name = nameInput.value.trim();
        if (!name) throw new Error('Name is required.');
        // Register as 'admin' so new users can create tasks
        await api.register(name, email, password, 'admin');
      }
      onSuccess();
    } catch (error) {
      errorMsg.textContent = error.message || 'Something went wrong. Please try again.';
      errorMsg.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isLogin ? 'Sign In' : 'Create Account';
    }
  });
}
