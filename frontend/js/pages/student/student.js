/* ==========================================================
   Dữ liệu mẫu + hàm tiện ích dùng chung (chưa có backend)
   Khi có API thật, chỉ cần thay dữ liệu ở file này.
   ========================================================== */
window.QN = (function () {
  // "Hôm nay" của bản demo: khớp với tài liệu thiết kế (22/10/2026).
  // Muốn dùng ngày thật, đổi thành: new Date()
  const TODAY = new Date(2026, 9, 22);

  const TYPES = {
    "van-hoa": "Văn hóa",
    "the-thao": "Thể thao",
    "tinh-nguyen": "Tình nguyện",
    "hoc-thuat": "Học thuật",
  };

  const student = {
    name: "Nguyễn Văn A",
    mssv: "4751050099",
    phone: "0901234567",
    email: "4751050099@student.qnu.edu.vn",
  };

  // seats = số chỗ còn lại; points = có điểm rèn luyện
  const events = [
    { id: 16, title: "Hội thảo kỹ năng viết CV", type: "hoc-thuat", date: "2026-09-25", time: "08:00", place: "Hội trường A", seats: 18, points: false },
    { id: 15, title: "Tuần lễ chào tân sinh viên", type: "van-hoa", date: "2026-09-28", time: "07:30", place: "Sân trường", seats: 14, points: true },
    { id: 1, title: "Sinh hoạt lớp bắt đầu tháng", type: "hoc-thuat", date: "2026-10-05", time: "07:30", place: "Phòng A8.07", seats: 32, points: false },
    { id: 2, title: "Hội thảo khởi nghiệp sinh viên", type: "hoc-thuat", date: "2026-10-08", time: "08:00", place: "Hội trường A", seats: 20, points: true },
    { id: 3, title: "Ngày hội hiến máu tình nguyện", type: "tinh-nguyen", date: "2026-10-12", time: "07:00", place: "Sân trường", seats: 58, points: true },
    { id: 4, title: "Giải cờ vua sinh viên", type: "the-thao", date: "2026-10-14", time: "14:00", place: "Nhà đa năng", seats: 12, points: false },
    { id: 5, title: "Giao lưu các câu lạc bộ", type: "van-hoa", date: "2026-10-22", time: "18:00", place: "Khu A8.07", seats: 39, points: false },
    { id: 6, title: "Giải bóng đá của khoa", type: "the-thao", date: "2026-10-24", time: "07:30", place: "Sân vận động trường", seats: 30, points: true },
    { id: 7, title: "Chiến dịch tình nguyện cuối tuần", type: "tinh-nguyen", date: "2026-10-25", time: "07:00", place: "Phòng A8.07", seats: 45, points: true },
    { id: 8, title: "Đêm văn nghệ sinh viên", type: "van-hoa", date: "2026-10-27", time: "18:00", place: "Phòng Hội trường B", seats: 32, points: true },
    { id: 9, title: "Hội thảo kỹ năng nghề nghiệp", type: "hoc-thuat", date: "2026-10-28", time: "08:00", place: "Phòng A8.07", seats: 12, points: true },
    { id: 10, title: "Cuộc thi Olympic Tin học", type: "hoc-thuat", date: "2026-11-03", time: "08:00", place: "Phòng máy B2", seats: 40, points: true },
    { id: 11, title: "Ngày hội việc làm Quy Nhơn", type: "hoc-thuat", date: "2026-11-07", time: "08:00", place: "Hội trường A", seats: 150, points: true },
    { id: 12, title: "Giải bóng chuyền sinh viên", type: "the-thao", date: "2026-11-14", time: "15:00", place: "Nhà đa năng", seats: 24, points: false },
    { id: 13, title: "Dọn vệ sinh bãi biển Quy Nhơn", type: "tinh-nguyen", date: "2026-11-15", time: "06:00", place: "Bãi biển Quy Nhơn", seats: 60, points: true },
    { id: 14, title: "Liên hoan tiếng hát sinh viên", type: "van-hoa", date: "2026-11-20", time: "18:30", place: "Hội trường A", seats: 80, points: true },
  ];

  // Đăng ký của sinh viên: registered (sắp tới) | attended (đã tham gia) | cancelled (đã hủy)
  const myRegs = { 5: "registered", 7: "registered", 8: "registered", 9: "registered", 1: "attended", 2: "attended", 3: "attended", 16: "attended" };

  const notifications = [
    { id: 1, cat: "Điểm rèn luyện", date: "22/10/2026", unit: "Phòng Công tác sinh viên", title: "Quy định tích lũy điểm rèn luyện học kỳ I", sum: "Hướng dẫn chi tiết về cách tham gia và tích lũy điểm rèn luyện thông qua các hoạt động của trường.", unread: true },
    { id: 2, cat: "Sự kiện", date: "20/10/2026", unit: "Đoàn Thanh niên", title: "Lịch hoạt động văn hóa, thể thao toàn trường", sum: "Cập nhật lịch các sự kiện hoạt động văn hóa, thể thao trong tháng.", unread: true },
    { id: 3, cat: "Điểm danh", date: "15/10/2026", unit: "Quản trị hệ thống", title: "Hướng dẫn điểm danh bằng QR Code", sum: "Quy trình và những lưu ý khi điểm danh bằng mã QR tại các sự kiện.", unread: false },
    { id: 4, cat: "Sự kiện", date: "10/10/2026", unit: "Khoa CNTT", title: "Thông báo mở đăng ký sự kiện Coder Tour", sum: "Thông tin thời gian, địa điểm và hạn đăng ký tham gia.", unread: false },
    { id: 5, cat: "Điểm rèn luyện", date: "01/10/2026", unit: "Phòng Công tác sinh viên", title: "Thời hạn khiếu nại điểm rèn luyện", sum: "Sinh viên có thắc mắc về điểm rèn luyện gửi phản hồi trong thời hạn quy định.", unread: false },
    { id: 6, cat: "Sự kiện", date: "29/09/2026", unit: "Đoàn Thanh niên", title: "Mở đăng ký Giải bóng đá của khoa", sum: "Các đội đăng ký thi đấu trước ngày 20/10 tại văn phòng Đoàn khoa.", unread: false },
    { id: 7, cat: "Điểm danh", date: "25/09/2026", unit: "Quản trị hệ thống", title: "Điểm danh cần gửi ảnh minh chứng", sum: "Từ tháng 10, quét QR xong cần gửi thêm ảnh có mặt tại sự kiện để được ghi nhận.", unread: false },
    { id: 8, cat: "Điểm rèn luyện", date: "20/09/2026", unit: "Phòng Công tác sinh viên", title: "Công bố điểm rèn luyện học kỳ II năm học 2025–2026", sum: "Sinh viên xem điểm rèn luyện trên cổng thông tin và phản hồi nếu có sai sót.", unread: false },
    { id: 9, cat: "Sự kiện", date: "18/09/2026", unit: "Khoa Kinh tế", title: "Hội thảo kỹ năng nghề nghiệp mở đăng ký", sum: "Hội thảo dành cho sinh viên năm cuối, số lượng có hạn.", unread: false },
    { id: 10, cat: "Sự kiện", date: "12/09/2026", unit: "Đoàn Thanh niên", title: "Chiến dịch tình nguyện cuối tuần", sum: "Kêu gọi sinh viên tham gia hoạt động tình nguyện tại địa phương.", unread: false },
    { id: 11, cat: "Điểm danh", date: "05/09/2026", unit: "Quản trị hệ thống", title: "Cập nhật quy định điểm danh muộn", sum: "Sinh viên điểm danh sau giờ bắt đầu nhưng còn trong khung giờ cho phép sẽ được ghi nhận là đến muộn.", unread: false },
    { id: 12, cat: "Điểm rèn luyện", date: "01/09/2026", unit: "Phòng Công tác sinh viên", title: "Kế hoạch đánh giá điểm rèn luyện năm học mới", sum: "Thời gian, hình thức và tiêu chí đánh giá điểm rèn luyện năm học 2026–2027.", unread: false },
  ];

  /* ---------- hàm tiện ích ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const toKey = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const fmtDMY = (d) => pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();

  function statusOf(ev) {
    const d = parseDate(ev.date).getTime();
    const t = dayStart(TODAY).getTime();
    if (d < t) return "ended";
    if (d === t) return "ongoing";
    return "upcoming";
  }
  const STATUS_LABEL = { ended: "Đã kết thúc", ongoing: "Đang diễn ra", upcoming: "Sắp diễn ra" };
  const STATUS_CLASS = { ended: "tag-ended", ongoing: "tag-live", upcoming: "tag-soon" };

  // Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
  const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const byId = (id) => events.find((e) => e.id === Number(id));

  // HTML ô lịch: THG 10 / 22
  function dateTile(ev) {
    const d = parseDate(ev.date);
    const cls = statusOf(ev) === "ended" ? " is-past" : ev.points ? " is-points" : "";
    return '<div class="date-tile' + cls + '" aria-hidden="true"><span class="m">THG ' + (d.getMonth() + 1) + '</span><span class="d">' + d.getDate() + "</span></div>";
  }

  function typeTag(ev) { return '<span class="tag tag-type">' + TYPES[ev.type] + "</span>"; }
  function statusTag(ev) { const s = statusOf(ev); return '<span class="tag ' + STATUS_CLASS[s] + '">' + STATUS_LABEL[s] + "</span>"; }
  function pointsTag(ev) { return ev.points ? '<span class="tag tag-points">Có điểm rèn luyện</span>' : ""; }


  /* ---------- Đăng ký / hủy đăng ký (lưu localStorage, chồng lên dữ liệu mẫu) ---------- */
  const REG_KEY = "qn_regs";
  let overlay = {};
  try { overlay = JSON.parse(localStorage.getItem(REG_KEY)) || {}; } catch (e) { overlay = {}; }
  Object.keys(overlay).forEach((id) => {
    const ev = events.find((e) => e.id === Number(id));
    if (!ev) return;
    const was = myRegs[id] === "registered", now = overlay[id] === "registered";
    if (was && !now) ev.seats++;
    if (!was && now) ev.seats--;
    myRegs[id] = overlay[id];
  });
  function setReg(id, status) {
    const ev = byId(id);
    const was = myRegs[id] === "registered", now = status === "registered";
    if (was && !now) ev.seats++;
    if (!was && now) ev.seats--;
    myRegs[id] = status;
    overlay[id] = status;
    try { localStorage.setItem(REG_KEY, JSON.stringify(overlay)); } catch (e) { /* bỏ qua */ }
  }

  // "Bây giờ" của bản demo = ngày TODAY + giờ phút thật của máy
  function nowDemo() {
    const n = new Date();
    return new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), n.getHours(), n.getMinutes());
  }

  /* ---------- Thông tin mở rộng của sự kiện ---------- */
  const TOTAL = { 9: 60 };
  const POINTS = { 6: 10 };
  const ORG_BY_TYPE = { "van-hoa": "Đoàn Thanh niên", "the-thao": "Khoa Giáo dục thể chất", "tinh-nguyen": "Hội Sinh viên", "hoc-thuat": "Phòng Công tác sinh viên" };
  const ORG = { 9: "Đoàn Thanh niên" };

  function info(ev) {
    const d = parseDate(ev.date);
    const [h, m] = ev.time.split(":").map(Number);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
    const end = new Date(start.getTime() + 3 * 3600000);          // mặc định kéo dài 3 giờ
    const deadline = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 17, 0); // 1 ngày trước, 17:00
    const total = TOTAL[ev.id] || ev.seats + 20 + ((ev.id * 7) % 30);
    return {
      start, end, deadline, total,
      registered: Math.max(0, total - ev.seats),
      points: ev.points ? POINTS[ev.id] || 5 : 0,
      organizer: ORG[ev.id] || ORG_BY_TYPE[ev.type],
      code: "DK-" + (1000 + ev.id * 42),
      range: fmtDMY(d) + " - " + ev.time + " đến " + pad(end.getHours()) + ":" + pad(end.getMinutes()),
    };
  }

  function conflictOf(ev) {
    const a = info(ev);
    return events.find((o) => {
      if (o.id === ev.id || myRegs[o.id] !== "registered") return false;
      const b = info(o);
      return a.start < b.end && b.start < a.end;
    });
  }

  // Kiểm tra điều kiện đăng ký: { ok, msg }
  function checkRegister(ev) {
    const i = info(ev);
    if (statusOf(ev) === "ended") return { ok: false, msg: "Sự kiện đã kết thúc nên không thể đăng ký." };
    if (myRegs[ev.id] === "registered") return { ok: false, msg: "Bạn đã đăng ký sự kiện này rồi." };
    if (nowDemo() > i.deadline) return { ok: false, msg: "Đã quá hạn đăng ký của sự kiện này." };
    if (ev.seats <= 0) return { ok: false, msg: "Sự kiện đã hết chỗ." };
    const c = conflictOf(ev);
    if (c) return { ok: false, msg: "Sự kiện này trùng lịch với “" + c.title + "” mà bạn đã đăng ký." };
    return { ok: true };
  }
  const canCancel = (ev) => info(ev).start - nowDemo() > 24 * 3600000;

  /* ---------- Biểu tượng theo loại sự kiện ---------- */
  function icon(type, size) {
    const paths = {
      "van-hoa": '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
      "the-thao": '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 5h-5L8 10z"/><path d="M12 3v4M16 10l4-1M14.5 15l2.5 4M9.5 15 7 19M8 10 4 9"/>',
      "tinh-nguyen": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
      "hoc-thuat": '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c0 1.4 2.2 3 5 3s5-1.6 5-3v-4.5"/>',
    };
    const n = size || 44;
    return '<svg width="' + n + '" height="' + n + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[type] + "</svg>";
  }

  // Lưu thông báo cần hiện ở trang kế tiếp (dùng sau khi hủy đăng ký, gửi đánh giá)
  function flash(msg) { try { sessionStorage.setItem("qn_flash", msg); } catch (e) { /* bỏ qua */ } }
  function takeFlash() { try { const m = sessionStorage.getItem("qn_flash"); sessionStorage.removeItem("qn_flash"); return m; } catch (e) { return null; } }

  return { setReg, nowDemo, info, conflictOf, checkRegister, canCancel, icon, flash, takeFlash, TODAY, TYPES, student, events, myRegs, notifications, pad, dayStart, parseDate, toKey, fmtDMY, statusOf, STATUS_LABEL, norm, esc, byId, dateTile, typeTag, statusTag, pointsTag };
})();
/* ==========================================================
   JS dùng chung: thanh điều hướng, breadcrumb, toast
   Mỗi trang khai báo <body data-nav="..."> để đánh dấu mục đang chọn.
   ========================================================== */
(function () {
  // Các trang đã làm xong. Trang nào chưa có trong danh sách này sẽ hiện
  // thông báo "sẽ có ở đợt sau" thay vì mở trang lỗi 404.
  // => Khi làm thêm trang mới, chỉ cần thêm tên file vào đây.
  const BUILT = [
    "notifications.html",
    "activity-calendar.html",
    "my-events.html",
    "qr-checkin.html",
    "event-list.html",
    "event-detail.html",
    "event-register.html",
    "event-review.html",
  ];

  const ICON = {
    chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    qr: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/></svg>',
    user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  };

  /* ---------- Đăng nhập (bản demo, lưu trong localStorage) ---------- */
  const LOGIN_KEY = "qn_logged_in";
  // Tài khoản demo để xem thử (khớp với sinh viên mẫu ở trên)
  const DEMO_ACCOUNT = { mssv: "4751050099", password: "123456" };
  function isLoggedIn() { try { return localStorage.getItem(LOGIN_KEY) === "1"; } catch (e) { return false; } }
  function setLoggedIn(v) { try { v ? localStorage.setItem(LOGIN_KEY, "1") : localStorage.removeItem(LOGIN_KEY); } catch (e) { /* bỏ qua */ } }

  function loginModal() {
    const wrap = document.createElement("div");
    wrap.className = "backdrop is-open";
    wrap.innerHTML =
      '<form class="modal" role="dialog" aria-modal="true" aria-labelledby="loginTitle" novalidate>' +
      '<button class="icon-btn modal-close" type="button" aria-label="Đóng" data-close>&times;</button>' +
      '<h2 id="loginTitle">Đăng nhập</h2>' +
      '<div class="alert alert-warn" role="note" style="margin-bottom:14px"><strong>Tài khoản demo</strong><br>Mã số sinh viên: <b>' + DEMO_ACCOUNT.mssv + '</b><br>Mật khẩu: <b>' + DEMO_ACCOUNT.password + '</b></div>' +
      '<div class="field"><label for="lgMssv">Mã số sinh viên</label><input class="input" id="lgMssv" autocomplete="username" inputmode="numeric"></div>' +
      '<div class="field"><label for="lgPass">Mật khẩu</label><input class="input" id="lgPass" type="password" autocomplete="current-password"></div>' +
      '<div class="field-error" id="lgErr" role="alert"></div>' +
      '<button class="btn btn-primary btn-block" type="submit">Đăng nhập</button></form>';
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.addEventListener("click", (e) => { if (e.target === wrap || e.target.closest("[data-close]")) close(); });
    wrap.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    wrap.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const u = wrap.querySelector("#lgMssv").value.trim(), pw = wrap.querySelector("#lgPass").value;
      if (!u || !pw) { wrap.querySelector("#lgErr").textContent = "Vui lòng nhập mã số sinh viên và mật khẩu."; return; }
      if (u !== DEMO_ACCOUNT.mssv || pw !== DEMO_ACCOUNT.password) { wrap.querySelector("#lgErr").textContent = "Mã số sinh viên hoặc mật khẩu không đúng."; return; }
      setLoggedIn(true);
      location.reload();
    });
    wrap.querySelector("#lgMssv").focus();
  }

  // Khối thay thế cho nội dung cá nhân khi chưa đăng nhập
  function gateHTML(title, text) {
    return (
      '<section class="card login-gate"><div class="gate-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>' +
      "<h2>" + title + "</h2><p>" + text + '</p><button class="btn btn-primary" type="button" data-login>Đăng nhập</button></section>'
    );
  }

  function headerHTML(active) {
    const eventsActive = ["events", "my-events", "register"].indexOf(active) > -1;
    const a = (key, href, text) =>
      '<a class="nav-link' + (active === key ? " is-active" : "") + '" href="' + href + '"' + (active === key ? ' aria-current="page"' : "") + ">" + text + "</a>";
    const m = (key, href, text) =>
      '<a href="' + href + '"' + (active === key ? ' class="is-active" aria-current="page"' : "") + ">" + text + "</a>";
    const s = window.QN.student;

    return (
      '<header class="site-header" id="siteHeader"><div class="container nav-inner">' +
      '<a class="brand" href="notifications.html" aria-label="Đại học Quy Nhơn - Cổng thông tin sinh viên">' +
      '<img class="brand-mark" src="../../images/student/logo.png" width="46" height="46" alt="">' +
      '<span><span class="brand-name">Đại học Quy Nhơn</span><span class="brand-sub">Cổng thông tin sinh viên</span></span></a>' +
      '<button class="nav-toggle" id="navToggle" aria-label="Mở menu" aria-expanded="false" aria-controls="mainNav">' + ICON.menu + "</button>" +
      '<nav class="nav" id="mainNav" aria-label="Điều hướng chính">' +
      a("home", "home.html", "Trang chủ") +
      '<div class="has-menu" id="eventsMenu">' +
      '<button class="nav-trigger' + (eventsActive ? " is-active" : "") + '" type="button" aria-haspopup="true" aria-expanded="false">Sự kiện ' + ICON.chevron + "</button>" +
      '<div class="menu" role="menu">' +
      m("events", "event-list.html", "Danh sách sự kiện") +
      m("register", "event-register.html", "Đăng kí") +
      m("my-events", "my-events.html", "Sự kiện của tôi") +
      "</div></div>" +
      a("calendar", "activity-calendar.html", "Lịch hoạt động") +
      a("notices", "notifications.html", "Thông báo") +
      "</nav>" +
      '<div class="nav-actions">' +
      '<a class="btn-qr' + (active === "qr" ? " is-active" : "") + '" href="qr-checkin.html">' + ICON.qr + "Quét QR điểm danh</a>" +
      (isLoggedIn()
        ? '<div class="has-menu" id="accountMenu"><button class="account" type="button" aria-haspopup="true" aria-expanded="false" title="MSSV ' + s.mssv + '"><span class="avatar">' + ICON.user + "</span>" + s.name + ICON.chevron + '</button><div class="menu menu-right" role="menu"><button type="button" id="logoutBtn">Đăng xuất</button></div></div>'
        : '<button class="btn btn-primary btn-sm" type="button" id="loginBtn" data-login>Đăng nhập</button>') +
      "</div></div></header>"
    );
  }

  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("is-show"), 2600);
  }

  function goBack(e) {
    e.preventDefault();
    if (history.length > 1) history.back();
    else location.href = "notifications.html";
  }

  function init() {
    const active = document.body.dataset.nav || "";
    const slot = document.getElementById("siteHeaderSlot");
    if (slot) slot.outerHTML = headerHTML(active);

    const header = document.getElementById("siteHeader");
    document.addEventListener("click", (e) => { if (e.target.closest("[data-login]")) loginModal(); });
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => { setLoggedIn(false); location.reload(); });
    const accMenu = document.getElementById("accountMenu");
    if (accMenu) {
      const t = accMenu.querySelector(".account");
      t.addEventListener("click", (e) => { e.stopPropagation(); const o = accMenu.classList.toggle("is-open"); t.setAttribute("aria-expanded", String(o)); });
      document.addEventListener("click", (e) => { if (!accMenu.contains(e.target)) accMenu.classList.remove("is-open"); });
    }
    const toggle = document.getElementById("navToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = header.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    const menuWrap = document.getElementById("eventsMenu");
    if (menuWrap) {
      const trigger = menuWrap.querySelector(".nav-trigger");
      const setOpen = (v) => { menuWrap.classList.toggle("is-open", v); trigger.setAttribute("aria-expanded", String(v)); };
      trigger.addEventListener("click", (e) => { e.stopPropagation(); setOpen(!menuWrap.classList.contains("is-open")); });
      document.addEventListener("click", (e) => { if (!menuWrap.contains(e.target)) setOpen(false); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    }

    const fm = window.QN.takeFlash(); if (fm) setTimeout(() => toast(fm), 300);
    document.querySelectorAll("[data-back]").forEach((el) => el.addEventListener("click", goBack));

    // Liên kết tới trang chưa làm -> hiện thông báo thay vì lỗi 404
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!/^[\w-]+\.html(\?.*)?$/.test(href)) return;
      const file = href.split("?")[0];
      if (BUILT.indexOf(file) === -1) {
        e.preventDefault();
        toast("Trang này sẽ được thêm ở đợt sau.");
      }
    });
  }

  window.QNUI = { toast, ICON, isLoggedIn, openLogin: loginModal, gate: gateHTML };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
