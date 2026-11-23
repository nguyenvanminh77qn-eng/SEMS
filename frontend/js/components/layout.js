(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderLayout() {
    const host = document.getElementById('sems-layout');
    const main = document.querySelector('main.main-content');
    if (!host || !main) return;

    const routes = window.SEMS_NAVIGATION || [];
    const currentPage = document.body.dataset.semsPage || '';
    const navItems = routes.map((route) => `
      <div class="nav-item">
        <a href="${escapeHtml(route.file)}" class="nav-link${route.page === currentPage ? ' active' : ''}"${route.page === currentPage ? ' aria-current="page"' : ''}>
          ${escapeHtml(route.label)}
        </a>
      </div>
    `).join('');

    host.innerHTML = `
      <header class="mobile-topbar">
        <div class="brand-title">SEMS Admin</div>
        <button class="menu-toggle-btn" id="menuToggle" aria-label="Mở menu" aria-expanded="false">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </header>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <div class="app-container">
        <aside class="sidebar" id="sidebar">
          <div>
            <div class="sidebar-header"><div class="brand-title">SEMS Admin</div></div>
            <nav class="sidebar-nav" aria-label="Điều hướng chính">${navItems}</nav>
          </div>
          <div class="sidebar-footer">
            <div class="user-profile-widget">
              <div class="avatar-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span class="user-name">Admin</span>
            </div>
            <a href="#" class="account-settings-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Cài đặt tài khoản</span>
            </a>
          </div>
        </aside>
      </div>
    `;

    const app = host.querySelector('.app-container');
    app.appendChild(main);

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function closeMenu() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    menuToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      overlay.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    overlay.addEventListener('click', closeMenu);
    document.body.classList.add('sems-layout-ready');
  }

  renderLayout();
})();
