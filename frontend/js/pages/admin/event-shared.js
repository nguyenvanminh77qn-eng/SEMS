/**
 * DÙNG CHUNG CHO CÁC TRANG: Quản lý sự kiện, Quản lý tin tức, Tổng quan sự kiện (Admin)
 *
 * Gồm: dữ liệu mẫu + localStorage, hàm trạng thái sự kiện, icon, toast, modal.
 * Nạp file này TRƯỚC events.js / news.js / overview.js.
 *
 * Mọi thứ gói trong biến duy nhất window.SEMSEvents để không đụng tên
 * với code của các trang khác.
 */
window.SEMSEvents = (function () {

  // ==========================================
  // 1. TIỆN ÍCH NHỎ
  // ==========================================

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const pad2 = n => String(n).padStart(2, '0');

  // Chống chèn HTML khi in dữ liệu người dùng nhập
  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const fmt = d => {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const fmtDate = t => {
    const dt = new Date(t);
    return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('vi-VN');
  };

  // Tạo mốc thời gian mẫu: cách hôm nay `days` ngày, lúc h:m
  function at(days, h, m = 0) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(h, m, 0, 0);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  // Ảnh dự phòng nội bộ (SVG siêu nhẹ, tải 0ms, không gây trắng trang khi mất mạng/chậm mạng)
  const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#DBEAFE"/><stop offset="100%" stop-color="#E0F2FE"/></linearGradient></defs>' +
    '<rect width="600" height="300" fill="url(#g)"/>' +
    '<circle cx="110" cy="75" r="34" fill="#93C5FD" opacity="0.55"/>' +
    '<polygon points="60,250 220,130 340,210 430,150 550,250" fill="#60A5FA" opacity="0.45"/>' +
    '<text x="300" y="156" text-anchor="middle" fill="#1E40AF" font-family="system-ui,sans-serif" font-size="18" font-weight="600">SEMS Event Cover</text>' +
    '</svg>'
  );

  const img = key => `https://images.unsplash.com/${key}?w=520&q=72&auto=format&fit=crop`;
  const IMG_ONERROR = `onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"`;


  // ==========================================
  // 2. ICON (SVG)
  // ==========================================

  const ICONS = {
    event: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
    bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
    search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    delete: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
    unlock: 'M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z',
    block: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z',
    place: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z',
    clock: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
    group: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    unit: 'M17 11V3H7v4H3v14h8v-4h2v4h8V11h-8zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm4 4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2z',
    info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
    view: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'
  };

  const icon = (name, extraClass = '') =>
    `<svg class="ev-ic ${extraClass}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

  function hydrateIcons(root = document) {
    qsa('[data-ic]', root).forEach(el => {
      if (!el.dataset.done) {
        el.insertAdjacentHTML('afterbegin', icon(el.dataset.ic));
        el.dataset.done = 1;
      }
    });
  }


  // ==========================================
  // 3. DỮ LIỆU MẪU + LƯU TRỮ (localStorage)
  // ==========================================

  const sampleEvents = [
    { id: 1, title: 'Ngày hội Chào tân sinh viên 2026', description: 'Chương trình chào đón tân sinh viên với nhiều hoạt động giao lưu, kết nối và trải nghiệm câu lạc bộ.', location: 'Sân trường Đại học Quy Nhơn', start: at(5, 7, 30), end: at(5, 11, 30), capacity: 500, registered: 320, unit: 'Phòng Công tác sinh viên', organizers: ['Nguyễn Minh Anh', 'Trần Quốc Bảo'], attendance: 0, absent: 0, image: img('photo-1523580494863-6f3031224c94') },
    { id: 2, title: 'Workshop Kỹ năng nghiên cứu khoa học', description: 'Chia sẻ phương pháp tìm kiếm tài liệu, xây dựng đề cương và trình bày kết quả nghiên cứu.', location: 'Hội trường A', start: at(1, 13, 30), end: at(1, 16, 30), capacity: 180, registered: 96, unit: 'Khoa Công nghệ thông tin', organizers: ['Lê Hoàng Nam'], attendance: 0, absent: 0, image: img('photo-1517245386807-bb43f82c33c4') },
    { id: 3, title: 'Ngày hội Hiến máu tình nguyện', description: 'Hoạt động hiến máu nhân đạo, lan tỏa tinh thần sẻ chia trong cộng đồng sinh viên.', location: 'Nhà đa năng', start: at(-5, 7), end: at(-5, 11), capacity: 250, registered: 220, unit: 'Đoàn Thanh niên', organizers: ['Phạm Thu Hà', 'Võ Đức Thành'], attendance: 198, absent: 22, image: img('photo-1615461066841-6116e61058f4') },
    { id: 4, title: 'Cuộc thi Ý tưởng khởi nghiệp sinh viên', description: 'Sân chơi dành cho sinh viên trình bày ý tưởng sáng tạo và mô hình khởi nghiệp.', location: 'Phòng hội thảo B', start: at(0, 0, 1), end: at(0, 23, 59), capacity: 120, registered: 80, unit: 'Trung tâm Hỗ trợ sinh viên', organizers: ['Nguyễn Minh Anh'], attendance: 72, absent: 8, image: img('photo-1556761175-b413da4baf72') },
    { id: 5, title: 'Tọa đàm Định hướng nghề nghiệp', description: 'Gặp gỡ cựu sinh viên và doanh nghiệp để định hướng nghề nghiệp sau tốt nghiệp.', location: 'Phòng hội thảo C', start: at(10, 8), end: at(10, 11), capacity: 100, registered: 0, unit: 'Khoa Kinh tế', organizers: [], attendance: 0, absent: 0, image: FALLBACK_IMAGE }
  ];

  const sampleNews = [
    { id: 1, title: 'Sẵn sàng cho Ngày hội Chào tân sinh viên 2026', body: 'Chuỗi hoạt động giao lưu, trải nghiệm và kết nối dành cho tân sinh viên sẽ diễn ra trong tháng 11.\n\nSinh viên hãy theo dõi thông tin và đăng ký tham gia để không bỏ lỡ chương trình.', image: img('photo-1523580494863-6f3031224c94'), ts: Date.now() - 2 * 864e5 },
    { id: 2, title: 'Workshop Kỹ năng nghiên cứu khoa học', body: 'Buổi workshop mang đến những kiến thức hữu ích về phương pháp nghiên cứu và cách phát triển ý tưởng học thuật.', image: img('photo-1517245386807-bb43f82c33c4'), ts: Date.now() - 4 * 864e5 }
  ];

  const ORGANIZER_NAMES = ['Nguyễn Minh Anh', 'Trần Quốc Bảo', 'Lê Hoàng Nam', 'Phạm Thu Hà', 'Võ Đức Thành', 'Đặng Khánh Linh'];

  const STORAGE = { events: 'sems-events-v2', news: 'sems-news-v2', notices: 'sems-notices-v2' };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  let lastSavedSnapshot = '';

  const store = {
    events: load(STORAGE.events, sampleEvents),
    news: load(STORAGE.news, sampleNews),
    notices: load(STORAGE.notices, []),

    save(force = false) {
      try {
        const payload = JSON.stringify({
          events: store.events,
          news: store.news,
          notices: store.notices
        });
        if (!force && payload === lastSavedSnapshot) return;
        localStorage.setItem(STORAGE.events, JSON.stringify(store.events));
        localStorage.setItem(STORAGE.news, JSON.stringify(store.news));
        localStorage.setItem(STORAGE.notices, JSON.stringify(store.notices));
        lastSavedSnapshot = payload;
      } catch {
        showToast('Bộ nhớ trình duyệt đầy, ảnh quá lớn nên chưa lưu được.', true);
      }
    }
  };

  const getEvent = id => store.events.find(e => Number(e.id) === Number(id));
  const liveEvents = () => store.events.filter(e => !e.deleted);


  // ==========================================
  // 4. TRẠNG THÁI VÀ ĐIỀU KIỆN THAO TÁC SỰ KIỆN
  // ==========================================

  function getStatus(e) {
    if (e.cancelled) return 'Đã hủy';
    if (e.locked) return 'Đã khóa';
    const now = new Date();
    if (now < new Date(e.start)) return 'Sắp diễn ra';
    if (now <= new Date(e.end)) return 'Đang diễn ra';
    return 'Đã kết thúc';
  }

  const statusClass = s => ({
    'Đang diễn ra': 'live', 'Sắp diễn ra': 'soon', 'Đã khóa': 'lock', 'Đã hủy': 'cancel'
  }[s] || 'done');

  const badge = e => {
    const s = getStatus(e);
    return `<span class="ev-status ${statusClass(s)}">${s}</span>`;
  };

  const isEnded = e => new Date() > new Date(e.end);

  const canEdit = e => e.locked && !e.cancelled && !isEnded(e);
  const canDelete = e => !!e.locked && !e.cancelled;
  const canCancel = e => !e.cancelled && !isEnded(e);
  const canLock = e => !e.cancelled && !e.locked && !isEnded(e);
  const canUnlock = e => e.locked && !e.cancelled && !isEnded(e);
  const attendanceOpen = e => getStatus(e) === 'Đang diễn ra';

  function deleteBlock(e) {
    if (e.registered > 0) {
      return `Đã có ${e.registered} sinh viên đăng ký, không thể xóa để giữ dữ liệu lịch sử. Hãy hủy sự kiện nếu không tổ chức nữa.`;
    }
    if (new Date() >= new Date(e.start)) {
      return 'Sự kiện đã diễn ra, không thể xóa để giữ dữ liệu lịch sử.';
    }
    return '';
  }

  function notifyStudents(e, text) {
    if (!e.registered) return 0;
    store.notices.unshift({
      id: Date.now() + Math.random(), eventId: e.id, title: e.title,
      text, count: e.registered, time: Date.now()
    });
    return e.registered;
  }


  // ==========================================
  // 5. MẢNH HTML DÙNG CHUNG
  // ==========================================

  function progressBar(e) {
    const cap = Math.max(1, Number(e.capacity) || 1);
    const pct = Math.min(100, Math.round((Number(e.registered) || 0) / cap * 100));
    return `<div class="ev-progress ${pct >= 100 ? 'full' : ''}"><i style="width:${pct}%"></i></div>`;
  }

  function infoRows(e, withRegistered = true) {
    return `<div class="ev-info-list">
      <div class="ev-info-row">${icon('clock')}<span>${fmt(e.start)} – ${fmt(e.end)}</span></div>
      <div class="ev-info-row">${icon('place')}<span>${esc(e.location)}</span></div>
      <div class="ev-info-row">${icon('unit')}<span>${esc(e.unit)}</span></div>
      ${withRegistered ? `<div class="ev-info-row">${icon('group')}<span>Đã đăng ký <b>${e.registered}</b> / ${e.capacity} người</span></div>${progressBar(e)}` : ''}
    </div>`;
  }


  // ==========================================
  // 6. THÔNG BÁO NHỎ (TOAST)
  // ==========================================

  let toastTimer;

  function showToast(message, isError = false) {
    let toast = document.getElementById('evToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'evToast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'ev-toast show' + (isError ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
  }


  // ==========================================
  // 7. MODAL
  // ==========================================

  function showModal(modalId, html, maxWidth = 760) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;
    const content = qs('.modal-content', overlay);
    content.style.maxWidth = maxWidth + 'px';
    content.innerHTML = html;
    hydrateIcons(content);
    if (typeof openModal === 'function') {
      openModal(modalId);
    } else {
      overlay.style.display = 'flex';
    }
  }

  function hideModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;
    if (typeof closeModal === 'function') {
      closeModal(modalId);
    } else {
      overlay.style.display = 'none';
    }
  }

  document.addEventListener('click', ev => {
    const closer = ev.target.closest('[data-close]');
    if (!closer) return;
    const overlay = closer.closest('.modal-overlay');
    if (overlay) hideModal(overlay.id);
  });

  function slideTabs(container) {
    if (!container) return;
    const active = container.querySelector('.active');
    if (!active) return;

    let bar = container.querySelector('.ev-tab-indicator');
    const first = !bar;
    if (first) {
      bar = document.createElement('span');
      bar.className = 'ev-tab-indicator';
      container.prepend(bar);
      bar.style.transition = 'none';
    }

    bar.style.width = active.offsetWidth + 'px';
    bar.style.height = active.offsetHeight + 'px';
    bar.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;

    if (first) {
      void bar.offsetWidth;
      bar.style.transition = '';
      container.classList.add('is-ready');
      window.addEventListener('resize', () => slideTabs(container));
    }
  }

  const modalHeader = title => `
    <div class="modal-header">
      <h2 class="modal-title">${title}</h2>
      <button type="button" class="modal-close-btn" data-close>&times;</button>
    </div>`;


  return {
    qs, qsa, pad2, esc, fmt, fmtDate, at, img, FALLBACK_IMAGE, IMG_ONERROR,
    icon, hydrateIcons, ORGANIZER_NAMES, store, getEvent, liveEvents,
    getStatus, statusClass, badge, isEnded, canEdit, canDelete, canCancel, canLock, canUnlock,
    attendanceOpen, deleteBlock, notifyStudents, progressBar, infoRows,
    showToast, showModal, hideModal, modalHeader, slideTabs
  };
})();