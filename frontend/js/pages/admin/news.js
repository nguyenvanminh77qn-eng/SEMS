/**
 * LOGIC TRANG QUẢN LÝ TIN TỨC (Admin)
 * (đi cùng css/pages/admin/news.css; dùng dữ liệu và hàm chung của event-shared.js)
 *
 * Gồm: danh sách bài viết, tìm kiếm, sắp xếp mới/cũ,
 *      xem chi tiết, tạo mới, chỉnh sửa, xóa (có hộp thoại xác nhận).
 */
document.addEventListener('DOMContentLoaded', () => {

  const {
    qs, qsa, esc, fmtDate, icon, hydrateIcons, FALLBACK_IMAGE, IMG_ONERROR,
    store, showToast, showModal, hideModal, modalHeader
  } = SEMSEvents;

  const MODAL_ID = 'modalNews';

  let sortMode = 'new';


  // ==========================================
  // 1. DANH SÁCH BÀI VIẾT
  // ==========================================

  const findNews = id => store.news.find(n => n.id === Number(id));

  function renderNews() {
    const keyword = (qs('#newsSearch').value || '').toLowerCase();

    const list = store.news
      .filter(n => n.title.toLowerCase().includes(keyword))
      .sort((a, b) => sortMode === 'new' ? b.ts - a.ts : a.ts - b.ts);

    qs('#newsList').innerHTML = list.map(n => `
      <article class="news-card">
        <img class="ev-img news-card-img" src="${n.image || FALLBACK_IMAGE}" alt="" data-open-news="${n.id}" ${IMG_ONERROR}>
        <div>
          <span class="news-date">${fmtDate(n.ts)}</span>
          <h3 data-open-news="${n.id}">${esc(n.title)}</h3>
          <p class="news-snippet">${esc(n.body)}</p>
          <div class="news-actions">
            <button type="button" class="btn btn-outline" data-open-news="${n.id}">${icon('view')}Xem</button>
            <button type="button" class="btn btn-outline" data-edit-news="${n.id}">${icon('edit')}Sửa</button>
            <button type="button" class="btn btn-danger" data-delete-news="${n.id}">${icon('delete')}Xóa</button>
          </div>
        </div>
      </article>`).join('') ||
      '<div class="ev-empty">Chưa có bài viết nào. Bấm "Tạo bài viết mới" để bắt đầu.</div>';
  }

  function render() {
    renderNews();
    store.save();
    hydrateIcons();
  }


  // ==========================================
  // 2. CHI TIẾT BÀI VIẾT
  // ==========================================

  function newsDetail(id) {
    const n = findNews(id);
    if (!n) return;

    showModal(MODAL_ID, `
      ${modalHeader('Chi tiết bài viết')}
      <div class="modal-body ev-modal-body">
        <img class="ev-img ev-detail-cover" src="${n.image || FALLBACK_IMAGE}" alt="" ${IMG_ONERROR}>
        <p class="news-date" style="margin:16px 0 4px">Đăng ngày ${fmtDate(n.ts)}${n.updated ? ` · Sửa ngày ${fmtDate(n.updated)}` : ''}</p>
        <h2 class="ev-detail-title">${esc(n.title)}</h2>
        <p class="ev-detail-desc" style="margin-top:12px">${esc(n.body)}</p>
        <div class="ev-modal-actions left">
          <button type="button" class="btn btn-primary" data-edit-news="${n.id}">${icon('edit')}Chỉnh sửa</button>
          <button type="button" class="btn btn-danger" data-delete-news="${n.id}">${icon('delete')}Xóa bài viết</button>
        </div>
      </div>`);
  }


  // ==========================================
  // 3. FORM TẠO / CHỈNH SỬA BÀI VIẾT
  // ==========================================

  function newsForm(id = null) {
    const old = id ? findNews(id) : null;

    showModal(MODAL_ID, `
      ${modalHeader(old ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới')}
      <div class="modal-body ev-modal-body news-modal-body">
        <form id="newsForm" class="ev-form-stack">
          <div class="form-group">
            <label class="form-label">Ảnh bài viết</label>
            <label class="ev-upload news-upload" for="newsImage">
              <span id="newsUploadHint">${old && old.image ? `<img id="newsPreview" src="${old.image}">` : 'Chọn ảnh cho bài viết'}</span>
              <input id="newsImage" type="file" accept="image/*">
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">Tiêu đề *</label>
            <input class="form-control" name="title" required value="${esc(old ? old.title : '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Nội dung *</label>
            <textarea class="form-control ev-textarea news-body-input" name="body" required>${esc(old ? old.body : '')}</textarea>
          </div>
          <div class="ev-modal-actions">
            <button type="button" class="btn btn-outline" data-close>Hủy</button>
            <button type="submit" class="btn btn-primary">${old ? 'Lưu thay đổi' : 'Đăng bài viết'}</button>
          </div>
        </form>
      </div>`, 580);

    // Xem trước ảnh vừa chọn
    qs('#newsImage').addEventListener('change', ev => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        qs('#newsUploadHint').innerHTML = `<img id="newsPreview" src="${reader.result}">`;
      };
      reader.readAsDataURL(file);
    });

    qs('#newsForm').addEventListener('submit', ev => {
      ev.preventDefault();

      const data = Object.fromEntries(new FormData(ev.currentTarget).entries());
      const preview = qs('#newsPreview');

      const item = {
        ...old,
        id: old ? old.id : Date.now(),
        title: data.title.trim(),
        body: data.body.trim(),
        image: (preview && preview.src) || (old && old.image) || FALLBACK_IMAGE,
        ts: old ? old.ts : Date.now(),
        ...(old ? { updated: Date.now() } : {})
      };

      store.news = old
        ? store.news.map(x => x.id === old.id ? item : x)
        : [item, ...store.news];

      render();
      hideModal(MODAL_ID);
      showToast(old ? 'Đã cập nhật bài viết.' : 'Đã đăng bài viết.');
    });
  }


  // ==========================================
  // 4. XÁC NHẬN XÓA BÀI VIẾT
  // ==========================================

  function confirmNewsDelete(id) {
    const n = findNews(id);
    if (!n) return;

    showModal(MODAL_ID, `
      ${modalHeader('Xóa bài viết')}
      <div class="modal-body">
        <p class="ev-confirm-text">Bạn có chắc muốn xóa bài viết <b>${esc(n.title)}</b>? Bài viết sẽ biến mất khỏi trang sinh viên.</p>
        <div class="ev-modal-actions">
          <button type="button" class="btn btn-outline" data-close>Hủy</button>
          <button type="button" class="btn btn-danger" id="confirmNewsDelete" data-id="${n.id}">Xóa bài viết</button>
        </div>
      </div>`, 520);
  }


  // ==========================================
  // 5. SỰ KIỆN CLICK / NHẬP LIỆU
  // ==========================================

  document.addEventListener('click', ev => {
    const closest = selector => ev.target.closest(selector);

    const openBtn = closest('[data-open-news]');
    if (openBtn) { newsDetail(openBtn.dataset.openNews); return; }

    const editBtn = closest('[data-edit-news]');
    if (editBtn) { newsForm(editBtn.dataset.editNews); return; }

    const deleteBtn = closest('[data-delete-news]');
    if (deleteBtn) { confirmNewsDelete(deleteBtn.dataset.deleteNews); return; }

    const confirmBtn = closest('#confirmNewsDelete');
    if (confirmBtn) {
      store.news = store.news.filter(n => n.id !== Number(confirmBtn.dataset.id));
      render();
      hideModal(MODAL_ID);
      showToast('Đã xóa bài viết.');
    }
  });

  qs('#btnCreateNews').addEventListener('click', () => newsForm());

  qs('#newsSort').addEventListener('click', ev => {
    const btn = ev.target.closest('[data-sort]');
    if (!btn) return;
    sortMode = btn.dataset.sort;
    qsa('.news-tab', qs('#newsSort')).forEach(x => x.classList.toggle('active', x === btn));
    renderNews();
  });

  qs('#newsSearch').addEventListener('input', renderNews);


  // ==========================================
  // 6. KHỞI CHẠY
  // ==========================================

  hydrateIcons();
  render();
});
