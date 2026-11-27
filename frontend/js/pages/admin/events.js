/**
 * LOGIC TRANG QUẢN LÝ SỰ KIỆN (Admin)
 * (đi cùng css/pages/admin/events.css; dùng dữ liệu và hàm chung của event-shared.js)
 */
document.addEventListener('DOMContentLoaded', () => {

  const {
    qs, qsa, esc, fmt, icon, hydrateIcons, ORGANIZER_NAMES, FALLBACK_IMAGE, IMG_ONERROR,
    store, getEvent, liveEvents, getStatus, badge, progressBar, infoRows,
    canEdit, canDelete, canCancel, canLock, canUnlock, isEnded, deleteBlock,
    attendanceOpen, notifyStudents, showToast, showModal, hideModal, modalHeader, slideTabs
  } = SEMSEvents;

  const MODAL_ID = 'modalEvent';

  let activeFilter = 'all';
  let selectedOrganizers = [];
  let searchTimer = null;


  // ==========================================
  // 1. DANH SÁCH SỰ KIỆN
  // ==========================================

  function eventCard(e) {
    const isOff = e.locked || e.cancelled;

    return `
      <article class="ev-card ${isOff ? 'is-off' : ''}" data-open-event="${e.id}" tabindex="0" role="button" aria-label="Quản lý sự kiện ${esc(e.title)}">
        <img class="ev-img ev-card-img" src="${e.image || FALLBACK_IMAGE}" alt="" loading="lazy" decoding="async" ${IMG_ONERROR}>
        <div class="ev-card-body">
          <div class="ev-card-top">${badge(e)}<span class="ev-card-code">#SEMS-${e.id}</span></div>
          <h3>${esc(e.title)}</h3>
          ${infoRows(e)}
          ${canEdit(e) ? `<div class="ev-card-actions">
            <button type="button" class="btn btn-outline" data-action="edit-event" data-id="${e.id}">${icon('edit')}Chỉnh sửa</button>
          </div>` : ''}
        </div>
      </article>`;
  }

  function renderEvents(animate = false) {
    const grid = qs('#eventGrid');
    const searchInput = qs('#eventSearch');
    if (!grid) return;

    const keyword = ((searchInput && searchInput.value) || '').trim().toLowerCase();

    const list = liveEvents().filter(e =>
      (activeFilter === 'all' || getStatus(e) === activeFilter) &&
      (
        e.title.toLowerCase().includes(keyword) ||
        String(e.location || '').toLowerCase().includes(keyword) ||
        String(e.unit || '').toLowerCase().includes(keyword)
      )
    );

    grid.innerHTML =
      list.map(eventCard).join('') ||
      '<div class="ev-empty">Không tìm thấy sự kiện phù hợp ở mục này.</div>';

    if (animate) {
      grid.classList.remove('is-switching');
      void grid.offsetWidth;
      grid.classList.add('is-switching');
    }

    hydrateIcons(grid);

    const noticeCountEl = qs('#noticeCount');
    if (noticeCountEl) {
      noticeCountEl.textContent = store.notices.length;
      noticeCountEl.classList.toggle('is-zero', !store.notices.length);
    }
  }

  function commitAndRender(animate = false) {
    store.save();
    renderEvents(animate);
  }


  // ==========================================
  // 2. CHI TIẾT SỰ KIỆN
  // ==========================================

  function detailModal(id) {
    const e = getEvent(id);
    if (!e) return;

    const deleteReason = deleteBlock(e);
    const myNotices = store.notices.filter(n => n.eventId === e.id).slice(0, 5);

    showModal(MODAL_ID, `
      ${modalHeader('Chi tiết và quản lý')}
      <div class="modal-body ev-modal-body">

        ${e.cancelled ? `<div class="ev-banner danger">${icon('block')}<div><b>Sự kiện đã bị hủy.</b><br>Lý do: ${esc(e.cancelReason)}<br>Điểm danh đã dừng và mã QR đã bị vô hiệu hóa.</div></div>` : ''}
        ${e.locked ? `<div class="ev-banner warn">${icon('lock')}<div><b>Sự kiện đang bị khóa.</b> Không hiển thị công khai và không nhận đăng ký mới.<br>Lý do: ${esc(e.lockReason)}</div></div>` : ''}

        <div class="ev-detail-stack">
          <img class="ev-img ev-detail-cover" src="${e.image || FALLBACK_IMAGE}" alt="" decoding="async" ${IMG_ONERROR}>

          <div class="ev-detail-intro">
            <div class="ev-detail-head">
              <h2 class="ev-detail-title">${esc(e.title)}</h2>
              ${badge(e)}
            </div>
            <p class="ev-detail-desc">${esc(e.description)}</p>
          </div>

          <div class="ev-detail-grid">
            <div class="ev-detail-item">
              <small>Thời gian</small>
              <span>${fmt(e.start)}</span>
              <span class="ev-detail-subline">${fmt(e.end)}</span>
            </div>
            <div class="ev-detail-item">
              <small>Địa điểm tổ chức</small>
              <span>${esc(e.location)}</span>
            </div>
            <div class="ev-detail-item">
              <small>Đã đăng ký / Tối đa</small>
              <span><b>${e.registered}</b> / ${e.capacity} người</span>
              ${progressBar(e)}
            </div>
            <div class="ev-detail-item">
              <small>Đơn vị tổ chức</small>
              <span>${esc(e.unit)}</span>
            </div>
            <div class="ev-detail-item">
              <small>Người quản lý sự kiện</small>
              <span>${(e.organizers || []).map(esc).join('<br>') || 'Chưa phân công'}</span>
            </div>
            <div class="ev-detail-item">
              <small>Điểm danh và mã QR</small>
              <span>${attendanceOpen(e) ? 'Điểm danh đang mở' : 'Điểm danh đã dừng'}</span>
              <span class="ev-detail-subline">${attendanceOpen(e) ? 'Mã QR đang hiệu lực' : 'Mã QR không hiệu lực'}</span>
            </div>
          </div>
        </div>

        ${myNotices.length ? `
          <h3 class="ev-section-title">Thông báo đã gửi cho sinh viên</h3>
          <ul class="ev-notice-list">
            ${myNotices.map(n => `<li>${esc(n.text)}<small>Gửi ${n.count} sinh viên · ${fmt(n.time)}</small></li>`).join('')}
          </ul>` : ''}

        <div class="ev-modal-actions left">
          ${canEdit(e) ? `<button type="button" class="btn btn-primary" data-action="edit-event" data-id="${e.id}">${icon('edit')}Chỉnh sửa</button>` : ''}
          ${canLock(e) ? `<button type="button" class="btn btn-warning" data-action="reason" data-kind="lock" data-id="${e.id}">${icon('lock')}Khóa sự kiện</button>` : ''}
          ${e.locked ? `<button type="button" class="btn btn-outline" data-action="unlock" data-id="${e.id}" ${canUnlock(e) ? '' : 'disabled'}>${icon('unlock')}Mở khóa</button>` : ''}
          ${canCancel(e) ? `<button type="button" class="btn btn-outline" data-action="reason" data-kind="cancel" data-id="${e.id}">${icon('block')}Hủy sự kiện</button>` : ''}
          ${canDelete(e) ? `<button type="button" class="btn btn-danger" data-action="reason" data-kind="delete" data-id="${e.id}" ${deleteReason ? 'disabled' : ''}>${icon('delete')}Xóa sự kiện</button>` : ''}
        </div>

        ${!e.locked && !e.cancelled && !isEnded(e) ? `<p class="ev-hint">${icon('info')} Hãy khóa sự kiện trước để hiện nút Chỉnh sửa và Xóa sự kiện.</p>` : ''}
        ${canDelete(e) ? (deleteReason
          ? `<p class="ev-hint">${icon('info')} ${deleteReason}</p>`
          : '<p class="ev-hint">Sự kiện chưa có người đăng ký và chưa diễn ra nên có thể xóa (xóa mềm).</p>') : ''}
        ${e.locked && !canUnlock(e) ? '<p class="ev-hint">Không thể mở khóa vì sự kiện đã quá thời gian tổ chức.</p>' : ''}
      </div>`, 640);
  }


  // ==========================================
  // 3. KHÓA / HỦY / XÓA (CÓ NHẬP LÝ DO)
  // ==========================================

  const REASON_CONFIG = {
    lock: { title: 'Khóa sự kiện', label: 'Lý do khóa *', btn: 'btn-warning', desc: 'Sự kiện bị khóa sẽ không hiển thị công khai và không tiếp nhận đăng ký mới.' },
    cancel: { title: 'Hủy sự kiện', label: 'Lý do hủy *', btn: 'btn-danger', desc: 'Hệ thống sẽ dừng điểm danh, vô hiệu hóa mã QR và gửi thông báo đến sinh viên đã đăng ký. Không thể hoàn tác.' },
    delete: { title: 'Xóa sự kiện', label: 'Lý do xóa *', btn: 'btn-danger', desc: 'Sự kiện sẽ được xóa mềm khỏi danh sách quản lý.' }
  };

  function reasonModal(kind, id) {
    const e = getEvent(id);
    const cfg = REASON_CONFIG[kind];
    if (!e) return;

    showModal(MODAL_ID, `
      ${modalHeader(cfg.title)}
      <div class="modal-body">
        <p class="ev-confirm-text">Sự kiện: <b>${esc(e.title)}</b><br>${cfg.desc}${kind === 'cancel' && e.registered ? `<br><b>${e.registered} sinh viên</b> sẽ nhận được thông báo.` : ''}</p>
        <div class="form-group">
          <label class="form-label">${cfg.label}</label>
          <textarea class="form-control ev-textarea" id="reasonText" placeholder="Nhập lý do..."></textarea>
        </div>
        <div class="ev-modal-actions">
          <button type="button" class="btn btn-outline" data-close>Quay lại</button>
          <button type="button" class="btn ${cfg.btn}" id="confirmReason" data-kind="${kind}" data-id="${e.id}" disabled>${cfg.title}</button>
        </div>
      </div>`, 520);

    qs('#reasonText').addEventListener('input', ev => {
      qs('#confirmReason').disabled = !ev.target.value.trim();
    });
  }

  function syncFilterWithEventStatus(e) {
    const status = getStatus(e);
    if (activeFilter !== 'all' && activeFilter !== status) {
      activeFilter = 'all';
      const filterWrap = qs('#eventFilters');
      if (filterWrap) {
        qsa('.ev-tab', filterWrap).forEach(x => x.classList.toggle('active', x.dataset.filter === 'all'));
        slideTabs(filterWrap);
      }
    }
  }

  function applyReason(kind, id, reason) {
    const e = getEvent(id);
    if (!e) return;

    if (kind === 'lock') {
      e.locked = true;
      e.lockReason = reason;
      syncFilterWithEventStatus(e);
      commitAndRender(true);
      detailModal(id);
      showToast('Đã khóa sự kiện. Sự kiện chuyển sang trạng thái Đã khóa.');
      return;
    }

    if (kind === 'cancel') {
      e.cancelled = true;
      e.locked = false;
      e.cancelReason = reason;
      const sent = notifyStudents(e, `Sự kiện "${e.title}" đã bị hủy. Lý do: ${reason}`);
      syncFilterWithEventStatus(e);
      commitAndRender(true);
      detailModal(id);
      showToast(`Đã hủy sự kiện, dừng điểm danh và vô hiệu hóa mã QR.${sent ? ` Đã gửi thông báo đến ${sent} sinh viên đã đăng ký.` : ''}`);
      return;
    }

    if (kind === 'delete') {
      if (deleteBlock(e)) return;
      e.deleted = true;
      e.deleteReason = reason;
      commitAndRender(true);
      hideModal(MODAL_ID);
      showToast('Đã xóa sự kiện (xóa mềm).');
    }
  }

  function unlockEvent(id) {
    const e = getEvent(id);
    if (!e || !canUnlock(e)) return;

    e.locked = false;
    delete e.lockReason;
    syncFilterWithEventStatus(e);
    commitAndRender(true);
    detailModal(id);
    showToast(`Đã mở khóa. Trạng thái hiện tại: ${getStatus(e)}.`);
  }


  // ==========================================
  // 4. FORM TẠO / CHỈNH SỬA SỰ KIỆN
  // ==========================================

  const organizerChips = () => selectedOrganizers.map(name => `
    <span class="ev-organizer-chip">${esc(name)}<button type="button" data-remove-organizer="${esc(name)}" aria-label="Bỏ">×</button></span>`).join('');

  function eventForm(id = null) {
    const e = id ? getEvent(id) : null;
    selectedOrganizers = e ? [...(e.organizers || [])] : [];

    showModal(MODAL_ID, `
      ${modalHeader(e ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới')}
      <div class="modal-body ev-modal-body">

        ${e && e.registered ? `<div class="ev-banner info">${icon('info')}<div>Đã có <b>${e.registered}</b> sinh viên đăng ký. Nếu bạn đổi thời gian, địa điểm hoặc số lượng tối đa, hệ thống sẽ tự gửi thông báo cho các sinh viên này. Số lượng tối đa không được thấp hơn ${e.registered}.</div></div>` : ''}

        <form id="eventForm" data-id="${e ? e.id : ''}">
          <div class="ev-form-stack">

            <div class="form-group">
              <label class="form-label">Ảnh sự kiện</label>
              <label class="ev-upload" for="eventImage">
                <span id="uploadHint">${e && e.image ? `<img id="imagePreview" src="${e.image}">` : 'Chọn ảnh cho sự kiện'}</span>
                <input id="eventImage" type="file" accept="image/*">
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">Tên sự kiện *</label>
              <input class="form-control" name="title" required value="${esc(e ? e.title : '')}">
            </div>

            <div class="form-group">
              <label class="form-label">Mô tả *</label>
              <textarea class="form-control ev-textarea" name="description" required>${esc(e ? e.description : '')}</textarea>
            </div>

            <div class="ev-form-pair">
              <div class="form-group">
                <label class="form-label">Địa điểm tổ chức *</label>
                <input class="form-control" name="location" required value="${esc(e ? e.location : '')}">
              </div>
              <div class="form-group">
                <label class="form-label">Đơn vị tổ chức *</label>
                <input class="form-control" name="unit" required value="${esc(e ? e.unit : '')}">
              </div>
            </div>

            <div class="ev-form-pair">
              <div class="form-group">
                <label class="form-label">Thời gian bắt đầu *</label>
                <input class="form-control" type="datetime-local" name="start" required value="${e ? e.start : ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Thời gian kết thúc *</label>
                <input class="form-control" type="datetime-local" name="end" required value="${e ? e.end : ''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Số lượng đăng ký tối đa *</label>
              <input class="form-control" type="number" name="capacity" min="${Math.max(1, e ? e.registered : 1)}" value="${e ? e.capacity : 100}" required>
              <span class="ev-field-error" id="capErr"></span>
            </div>

            <div class="form-group">
              <label class="form-label">Người quản lý sự kiện</label>
              <div class="ev-organizer-row">
                <select class="form-control" id="organizerSelect">
                  <option value="">Chọn họ tên</option>
                  ${ORGANIZER_NAMES.map(n => `<option>${n}</option>`).join('')}
                </select>
                <button type="button" class="btn btn-outline" data-action="add-organizer">${icon('add')}Thêm</button>
              </div>
              <div class="ev-selected-organizers" id="selectedOrganizers"></div>
            </div>

          </div>

          <div class="ev-modal-actions">
            <button type="button" class="btn btn-outline" data-close>Hủy</button>
            <button type="submit" class="btn btn-primary">${e ? 'Lưu thay đổi' : 'Đăng sự kiện'}</button>
          </div>
        </form>
      </div>`, 600);

    qs('#selectedOrganizers').innerHTML = organizerChips();

    qs('#eventImage').addEventListener('change', ev => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        qs('#uploadHint').innerHTML = `<img id="imagePreview" src="${reader.result}">`;
      };
      reader.readAsDataURL(file);
    });

    qs('#eventForm').addEventListener('submit', saveEvent);
  }

  function saveEvent(ev) {
    ev.preventDefault();

    const form = ev.currentTarget;
    const old = form.dataset.id ? getEvent(form.dataset.id) : null;
    const data = Object.fromEntries(new FormData(form).entries());
    const capacity = Number(data.capacity);

    if (new Date(data.end) <= new Date(data.start)) {
      showToast('Thời gian kết thúc phải sau thời gian bắt đầu.', true);
      return;
    }

    if (old && capacity < old.registered) {
      qs('#capErr').textContent = `Không thể giảm xuống dưới ${old.registered} sinh viên đã đăng ký hợp lệ.`;
      showToast(`Số lượng tối đa phải từ ${old.registered} trở lên.`, true);
      return;
    }

    const imgPreview = qs('#imagePreview');
    const image = (imgPreview && imgPreview.src) || (old && old.image) || FALLBACK_IMAGE;

    const item = {
      registered: 0, attendance: 0, absent: 0, ...old,
      id: old ? old.id : Date.now(),
      title: data.title.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      unit: data.unit.trim(),
      start: data.start,
      end: data.end,
      capacity,
      organizers: [...selectedOrganizers],
      image
    };

    const changes = [];
    if (old) {
      if (old.start !== data.start || old.end !== data.end) changes.push(`thời gian: ${fmt(data.start)} – ${fmt(data.end)}`);
      if (old.location !== item.location) changes.push(`địa điểm: ${item.location}`);
      if (old.capacity !== capacity) changes.push(`số lượng tối đa: ${capacity} người`);
    }

    if (old) {
      store.events = store.events.map(x => x.id === old.id ? item : x);
    } else {
      store.events.unshift(item);
    }

    let sent = 0;
    if (old && changes.length) {
      sent = notifyStudents(item, `Sự kiện "${item.title}" có thay đổi về ${changes.join('; ')}.`);
    }

    syncFilterWithEventStatus(item);
    commitAndRender(true);
    hideModal(MODAL_ID);

    if (sent) {
      showModal(MODAL_ID, `
        ${modalHeader('Đã gửi thông báo thay đổi')}
        <div class="modal-body">
          <div class="ev-banner info">${icon('send')}<div>Đã gửi thông báo đến <b>${sent} sinh viên</b> đã đăng ký sự kiện <b>${esc(item.title)}</b>.</div></div>
          <p class="ev-confirm-text">Nội dung thay đổi:</p>
          <ul class="ev-notice-list">${changes.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
          <div class="ev-modal-actions"><button type="button" class="btn btn-primary" data-close>Đã hiểu</button></div>
        </div>`, 520);
    } else {
      showToast(old ? 'Đã cập nhật sự kiện.' : 'Đã tạo sự kiện mới.');
    }
  }


  // ==========================================
  // 5. NHẬT KÝ THÔNG BÁO ĐÃ GỬI
  // ==========================================

  function noticeLog() {
    showModal(MODAL_ID, `
      ${modalHeader('Thông báo đã gửi cho sinh viên')}
      <div class="modal-body ev-modal-body">
        ${store.notices.length
          ? `<ul class="ev-notice-list">${store.notices.slice(0, 20).map(n => `<li><b>${esc(n.title)}</b><br>${esc(n.text)}<small>Gửi ${n.count} sinh viên · ${fmt(n.time)}</small></li>`).join('')}</ul>`
          : '<div class="ev-empty">Chưa có thông báo nào được gửi.</div>'}
      </div>`, 560);
  }


  // ==========================================
  // 6. SỰ KIỆN CLICK / NHẬP LIỆU
  // ==========================================

  document.addEventListener('click', ev => {
    const target = ev.target;
    const closest = selector => target.closest(selector);

    const actionBtn = closest('[data-action]');
    if (actionBtn) {
      const { action, id, kind } = actionBtn.dataset;

      if (action === 'edit-event') eventForm(id);
      else if (action === 'reason') reasonModal(kind, id);
      else if (action === 'unlock') unlockEvent(id);
      else if (action === 'add-organizer') {
        const name = qs('#organizerSelect').value;
        if (name && !selectedOrganizers.includes(name)) {
          selectedOrganizers.push(name);
          qs('#selectedOrganizers').innerHTML = organizerChips();
        }
      }
      return;
    }

    const openBtn = closest('[data-open-event]');
    if (openBtn) { detailModal(openBtn.dataset.openEvent); return; }

    const confirmBtn = closest('#confirmReason');
    if (confirmBtn && !confirmBtn.disabled) {
      applyReason(confirmBtn.dataset.kind, confirmBtn.dataset.id, qs('#reasonText').value.trim());
      return;
    }

    const removeBtn = closest('[data-remove-organizer]');
    if (removeBtn) {
      selectedOrganizers = selectedOrganizers.filter(n => n !== removeBtn.dataset.removeOrganizer);
      qs('#selectedOrganizers').innerHTML = organizerChips();
    }
  });

  const btnCreate = qs('#btnCreateEvent');
  if (btnCreate) btnCreate.addEventListener('click', () => eventForm());

  const btnNoticeLog = qs('#btnNoticeLog');
  if (btnNoticeLog) btnNoticeLog.addEventListener('click', noticeLog);

  const filterWrap = qs('#eventFilters');
  if (filterWrap) {
    filterWrap.addEventListener('click', ev => {
      const btn = ev.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      qsa('.ev-tab', filterWrap).forEach(x => x.classList.toggle('active', x === btn));
      slideTabs(filterWrap);
      renderEvents(true);
    });
  }

  const gridEl = qs('#eventGrid');
  if (gridEl) {
    gridEl.addEventListener('keydown', ev => {
      const card = ev.target.closest('.ev-card');
      if (card && ev.target === card && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        detailModal(card.dataset.openEvent);
      }
    });
  }

  const searchEl = qs('#eventSearch');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => renderEvents(false), 120);
    });
  }

  setInterval(() => {
    const overlay = qs('#' + MODAL_ID);
    const isOpen = overlay && (overlay.classList.contains('active') || overlay.classList.contains('show') || overlay.style.display === 'flex');
    if (!isOpen) renderEvents(false);
  }, 60000);


  // ==========================================
  // 7. KHỞI CHẠY
  // ==========================================

  hydrateIcons();
  renderEvents(false);
  store.save();
  slideTabs(qs('#eventFilters'));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => slideTabs(qs('#eventFilters')));
  }

  const openId = new URLSearchParams(location.search).get('open');
  if (openId) detailModal(openId);
});