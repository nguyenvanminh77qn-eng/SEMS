/* Chi tiết thông báo */
(function () {
  const Q = window.QN;
  const { notifications, esc } = Q;
  const KEY = "qn_read_notices"; // dùng chung với trang notifications.js
  const page = document.getElementById("page");

  const id = Number(new URLSearchParams(location.search).get("id"));
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx === -1) {
    page.innerHTML = '<div class="card empty" style="margin-top:32px"><strong>Không tìm thấy thông báo</strong><a href="notifications.html">Quay lại danh sách thông báo</a></div>';
    return;
  }
  const n = notifications[idx];

  // Đánh dấu đã đọc
  try {
    const read = JSON.parse(localStorage.getItem(KEY)) || [];
    if (read.indexOf(n.id) === -1) { read.push(n.id); localStorage.setItem(KEY, JSON.stringify(read)); }
  } catch (e) { /* bỏ qua */ }

  // Nội dung chi tiết (bản demo). Thông báo nào chưa có thì dùng phần tóm tắt.
  const BODY = {
    1: "<p>Sinh viên tích lũy điểm rèn luyện thông qua việc đăng ký và tham gia các hoạt động do nhà trường, Đoàn Thanh niên và các khoa tổ chức.</p><h2>Lưu ý</h2><ul><li>Chỉ hoạt động có tích điểm mới được cộng điểm rèn luyện.</li><li>Phải điểm danh bằng mã QR và gửi ảnh xác nhận tại sự kiện.</li><li>Đăng ký mà vắng mặt không lý do sẽ không được cộng điểm.</li></ul>",
    3: "<h2>Các bước điểm danh</h2><ul><li>Mở trang Điểm danh QR trên cổng thông tin.</li><li>Quét mã QR do ban tổ chức hiển thị tại sự kiện.</li><li>Gửi ảnh xác nhận có mặt tại sự kiện.</li><li>Chờ hệ thống ghi nhận kết quả.</li></ul>",
    7: "<p>Từ tháng 10, sau khi quét mã QR, sinh viên cần gửi thêm ảnh có mặt tại sự kiện để được ghi nhận điểm danh.</p>",
  };
  // Liên kết nhanh tới sự kiện liên quan (nếu có)
  const EVENT_LINK = { 6: 6, 9: 9, 10: 7 };

  const evId = EVENT_LINK[n.id];
  const ev = evId ? Q.byId(evId) : null;
  const body = BODY[n.id] || "<p>" + esc(n.sum) + "</p>";

  const prev = notifications[idx + 1];  // thông báo cũ hơn
  const next = notifications[idx - 1];  // thông báo mới hơn

  let actions = '<a class="btn" href="notifications.html">&lsaquo; Danh sách thông báo</a>';
  if (ev) actions += '<a class="btn btn-primary" href="event-detail.html?id=' + ev.id + '">Xem sự kiện: ' + esc(ev.title) + "</a>";
  else if (n.cat === "Sự kiện") actions += '<a class="btn btn-primary" href="event-list.html">Xem danh sách sự kiện</a>';
  else if (n.cat === "Điểm danh") actions += '<a class="btn btn-primary" href="qr-checkin.html">Đi tới điểm danh QR</a>';

  document.title = n.title + " - Cổng thông tin sinh viên Đại học Quy Nhơn";

  page.innerHTML =
    '<nav class="crumbs" aria-label="Đường dẫn">' +
      '<a class="back" href="notifications.html">&lsaquo; Quay lại</a>' +
      '<span class="sep">/</span><a href="../auth/home.html">Trang chủ</a>' +
      '<span class="sep">/</span><a href="notifications.html">Thông báo</a>' +
      '<span class="sep">/</span><span aria-current="page">Chi tiết</span>' +
    "</nav>" +
    '<article class="card nd-card">' +
      '<div class="nd-meta"><span class="tag tag-type">' + esc(n.cat) + "</span><span>" + esc(n.date) + " - " + esc(n.unit) + '</span><span class="tag tag-public">Công khai</span></div>' +
      '<h1 class="nd-title">' + esc(n.title) + "</h1>" +
      '<div class="nd-body">' + body + "</div>" +
      '<div class="nd-actions">' + actions + "</div>" +
    "</article>" +
    '<div class="nd-nav">' +
      (prev ? '<a href="notification-detail.html?id=' + prev.id + '"><small>&lsaquo; Thông báo cũ hơn</small><b>' + esc(prev.title) + "</b></a>" : "<span></span>") +
      (next ? '<a class="next" href="notification-detail.html?id=' + next.id + '"><small>Thông báo mới hơn &rsaquo;</small><b>' + esc(next.title) + "</b></a>" : "<span></span>") +
    "</div>";
})();
