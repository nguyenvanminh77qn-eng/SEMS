// SEMS – JavaScript dùng chung cho các trang auth (hiện dùng ở trang chủ home.html).
// (Đăng nhập, header theo vai trò, hộp thoại "Cần đăng nhập" nằm ở auth-core.js; dữ liệu mẫu ở sample-data.js)
window.SEMSUI = (function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Bỏ dấu + chữ thường để tìm kiếm tiếng Việt không phân biệt dấu ("hoi thao" khớp "Hội thảo")
  function fold(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().trim();
  }
  // Thuộc tính cho liên kết cần đăng nhập (khách bấm sẽ hiện hộp thoại "Bạn cần đăng nhập")
  function gate(href, msg) {
    return 'href="' + esc(href) + '" data-auth data-student data-auth-msg="' + esc(msg) + '"';
  }
  var CAT_CLASS = { 'Sự kiện': 'c-event', 'Điểm rèn luyện': 'c-score', 'Điểm danh': 'c-qr', 'Học vụ': 'c-study' };

  // Các form tìm kiếm chưa có máy chủ nên không để trang tải lại
  document.querySelectorAll('form[role="search"]').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  });

  return { esc: esc, fold: fold, gate: gate, catClass: function (c) { return CAT_CLASS[c] || 'c-event'; } };
})();
