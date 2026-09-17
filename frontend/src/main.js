import './style.css';
import { api } from './api.js';
import { renderAuth } from './auth.js';
import { renderDashboard } from './dashboard.js';

const app = document.querySelector('#app');

function init() {
  if (api.token) {
    renderDashboard(app, () => {
      renderAuth(app, init);
    });
  } else {
    renderAuth(app, init);
  }
}

init();
