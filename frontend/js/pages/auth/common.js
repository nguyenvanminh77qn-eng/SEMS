// SEMS – JavaScript dùng chung cho trang chủ và trang tin tức.
// Hiện chưa có máy chủ tìm kiếm nên chặn form tìm kiếm tải lại trang.
// TODO: thay bằng lệnh gọi API tìm kiếm khi có backend.
document.querySelectorAll('form[role="search"]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
  });
});
