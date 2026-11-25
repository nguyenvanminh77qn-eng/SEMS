/* =========================================================
   SEMS – DỮ LIỆU MẪU CHO TRANG CHỦ & TRANG TIN TỨC
   Chưa có backend nên dữ liệu nằm ở đây. Khi có API, chỉ cần thay `events` và `news`
   bằng dữ liệu tải từ máy chủ (giữ nguyên tên trường), giao diện không cần sửa.

   - id của sự kiện trùng với id trong cổng sinh viên (js/pages/student/student.js)
     nên nút "Xem chi tiết" / "Đăng ký ngay" mở đúng sự kiện sau khi đăng nhập.
   - TODAY khớp với "hôm nay" của bản demo cổng sinh viên (22/10/2026).
     Muốn dùng ngày thật, đổi thành: new Date().
   ========================================================= */
window.SEMSData = (function () {
  'use strict';

  var TODAY = new Date(2026, 9, 22);

  var TYPES = { 'hoc-thuat': 'Học thuật', 'van-hoa': 'Văn nghệ', 'the-thao': 'Thể thao', 'tinh-nguyen': 'Tình nguyện' };
  var SCOPES = { khoa: 'Sự kiện của khoa', truong: 'Sự kiện toàn trường', clb: 'Sự kiện câu lạc bộ' };

  // seats = số chỗ còn lại
  var events = [
    { id: 16, title: 'Hội thảo kỹ năng viết CV', type: 'hoc-thuat', scope: 'khoa', date: '2026-09-25', time: '08:00', place: 'Hội trường A', seats: 18 },
    { id: 15, title: 'Tuần lễ chào tân sinh viên', type: 'van-hoa', scope: 'truong', date: '2026-09-28', time: '07:30', place: 'Sân trường', seats: 14 },
    { id: 1, title: 'Sinh hoạt lớp bắt đầu tháng', type: 'hoc-thuat', scope: 'khoa', date: '2026-10-05', time: '07:30', place: 'Phòng A8.07', seats: 32 },
    { id: 2, title: 'Hội thảo khởi nghiệp sinh viên', type: 'hoc-thuat', scope: 'truong', date: '2026-10-08', time: '08:00', place: 'Hội trường A', seats: 20 },
    { id: 3, title: 'Ngày hội hiến máu tình nguyện', type: 'tinh-nguyen', scope: 'truong', date: '2026-10-12', time: '07:00', place: 'Sân trường', seats: 58 },
    { id: 4, title: 'Giải cờ vua sinh viên', type: 'the-thao', scope: 'clb', date: '2026-10-14', time: '14:00', place: 'Nhà đa năng', seats: 12 },
    { id: 5, title: 'Giao lưu các câu lạc bộ', type: 'van-hoa', scope: 'clb', date: '2026-10-22', time: '18:00', place: 'Khu A8.07', seats: 39 },
    { id: 6, title: 'Giải bóng đá của khoa', type: 'the-thao', scope: 'khoa', date: '2026-10-24', time: '07:30', place: 'Sân vận động trường', seats: 30 },
    { id: 7, title: 'Chiến dịch tình nguyện cuối tuần', type: 'tinh-nguyen', scope: 'truong', date: '2026-10-25', time: '07:00', place: 'Phòng A8.07', seats: 45 },
    { id: 8, title: 'Đêm văn nghệ sinh viên', type: 'van-hoa', scope: 'truong', date: '2026-10-27', time: '18:00', place: 'Phòng Hội trường B', seats: 9 },
    { id: 9, title: 'Hội thảo kỹ năng nghề nghiệp', type: 'hoc-thuat', scope: 'khoa', date: '2026-10-28', time: '08:00', place: 'Phòng A8.07', seats: 12 },
    { id: 10, title: 'Cuộc thi Olympic Tin học', type: 'hoc-thuat', scope: 'khoa', date: '2026-11-03', time: '08:00', place: 'Phòng máy B2', seats: 40 },
    { id: 11, title: 'Ngày hội việc làm Quy Nhơn', type: 'hoc-thuat', scope: 'truong', date: '2026-11-07', time: '08:00', place: 'Hội trường A', seats: 150 },
    { id: 12, title: 'Giải bóng chuyền sinh viên', type: 'the-thao', scope: 'clb', date: '2026-11-14', time: '15:00', place: 'Nhà đa năng', seats: 24 },
    { id: 13, title: 'Dọn vệ sinh bãi biển Quy Nhơn', type: 'tinh-nguyen', scope: 'clb', date: '2026-11-15', time: '06:00', place: 'Bãi biển Quy Nhơn', seats: 60 },
    { id: 14, title: 'Liên hoan tiếng hát sinh viên', type: 'van-hoa', scope: 'truong', date: '2026-11-20', time: '18:30', place: 'Hội trường A', seats: 80 }
  ];

  // cat: Sự kiện | Điểm rèn luyện | Điểm danh | Học vụ
  var news = [
    { id: 1, cat: 'Điểm rèn luyện', date: '2026-10-22', unit: 'Phòng Công tác sinh viên', title: 'Quy định tích lũy điểm rèn luyện học kỳ I', sum: 'Hướng dẫn chi tiết về cách tham gia và tích lũy điểm rèn luyện thông qua các hoạt động của trường.' },
    { id: 2, cat: 'Sự kiện', date: '2026-10-20', unit: 'Đoàn Thanh niên', title: 'Lịch hoạt động văn hóa, thể thao toàn trường', sum: 'Cập nhật lịch các sự kiện hoạt động văn hóa, thể thao trong tháng.' },
    { id: 3, cat: 'Điểm danh', date: '2026-10-15', unit: 'Quản trị hệ thống', title: 'Hướng dẫn điểm danh bằng QR Code', sum: 'Quy trình và những lưu ý khi điểm danh bằng mã QR tại các sự kiện.' },
    { id: 4, cat: 'Sự kiện', date: '2026-10-10', unit: 'Khoa CNTT', title: 'Thông báo mở đăng ký sự kiện Coder Tour', sum: 'Thông tin thời gian, địa điểm và hạn đăng ký tham gia.' },
    { id: 5, cat: 'Điểm rèn luyện', date: '2026-10-01', unit: 'Phòng Công tác sinh viên', title: 'Thời hạn khiếu nại điểm rèn luyện', sum: 'Sinh viên có thắc mắc về điểm rèn luyện gửi phản hồi trong thời hạn quy định.' },
    { id: 6, cat: 'Sự kiện', date: '2026-09-29', unit: 'Đoàn Thanh niên', title: 'Mở đăng ký Giải bóng đá của khoa', sum: 'Các đội đăng ký thi đấu trước ngày 20/10 tại văn phòng Đoàn khoa.' },
    { id: 7, cat: 'Điểm danh', date: '2026-09-25', unit: 'Quản trị hệ thống', title: 'Điểm danh cần gửi ảnh minh chứng', sum: 'Từ tháng 10, quét QR xong cần gửi thêm ảnh có mặt tại sự kiện để được ghi nhận.' },
    { id: 8, cat: 'Điểm rèn luyện', date: '2026-09-20', unit: 'Phòng Công tác sinh viên', title: 'Công bố điểm rèn luyện học kỳ II năm học 2025–2026', sum: 'Sinh viên xem điểm rèn luyện trên cổng thông tin và phản hồi nếu có sai sót.' },
    { id: 9, cat: 'Sự kiện', date: '2026-09-18', unit: 'Khoa Kinh tế', title: 'Hội thảo kỹ năng nghề nghiệp mở đăng ký', sum: 'Hội thảo dành cho sinh viên năm cuối, số lượng có hạn.' },
    { id: 10, cat: 'Sự kiện', date: '2026-09-12', unit: 'Đoàn Thanh niên', title: 'Chiến dịch tình nguyện cuối tuần', sum: 'Kêu gọi sinh viên tham gia hoạt động tình nguyện tại địa phương.' },
    { id: 11, cat: 'Điểm danh', date: '2026-09-05', unit: 'Quản trị hệ thống', title: 'Cập nhật quy định điểm danh muộn', sum: 'Sinh viên điểm danh sau giờ bắt đầu nhưng còn trong khung giờ cho phép sẽ được ghi nhận là đến muộn.' },
    { id: 12, cat: 'Điểm rèn luyện', date: '2026-09-01', unit: 'Phòng Công tác sinh viên', title: 'Kế hoạch đánh giá điểm rèn luyện năm học mới', sum: 'Thời gian, hình thức và tiêu chí đánh giá điểm rèn luyện năm học 2026–2027.' },
    { id: 13, cat: 'Học vụ', date: '2026-08-24', unit: 'Phòng Đào tạo', title: 'Lịch đăng ký học phần học kỳ I năm học 2026–2027', sum: 'Thời gian đăng ký học phần theo từng khóa và các lưu ý về số tín chỉ tối thiểu.' },
    { id: 14, cat: 'Học vụ', date: '2026-08-20', unit: 'Phòng Đào tạo', title: 'Thông báo lịch khai giảng năm học mới', sum: 'Lịch khai giảng và tuần sinh hoạt công dân đầu khóa dành cho sinh viên các khóa.' },
    { id: 15, cat: 'Sự kiện', date: '2026-08-15', unit: 'Đoàn Thanh niên', title: 'Chương trình Tiếp sức đến trường 2026', sum: 'Đồng hành cùng tân sinh viên trong ngày nhập học: hướng dẫn thủ tục, hỗ trợ chỗ ở.' }
  ];

  /* ---------- hàm tiện ích ---------- */
  var DAY_MS = 86400000;
  var WEEKDAY = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  function parse(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(iso) { var d = parse(iso); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function weekday(iso) { return WEEKDAY[parse(iso).getDay()]; }
  // Số ngày từ hôm nay đến ngày iso (âm = đã qua)
  function daysFrom(iso) { return Math.round((parse(iso) - TODAY) / DAY_MS); }

  // Trạng thái sự kiện theo ngày: upcoming | live | ended
  function phase(ev) { var d = daysFrom(ev.date); return d > 0 ? 'upcoming' : d === 0 ? 'live' : 'ended'; }
  // Nhãn hiển thị + kiểu huy hiệu
  function status(ev) {
    var ph = phase(ev);
    if (ph === 'ended') return { text: 'Đã kết thúc', cls: 'ended' };
    if (ph === 'live') return { text: 'Đang diễn ra', cls: 'live' };
    if (ev.seats <= 15) return { text: 'Sắp hết chỗ', cls: 'soon' };
    return { text: 'Đang mở đăng ký', cls: 'open' };
  }
  function countdown(ev) {
    var d = daysFrom(ev.date);
    return d < 0 ? 'Đã diễn ra' : d === 0 ? 'Diễn ra hôm nay' : 'Còn ' + d + ' ngày';
  }

  return { TODAY: TODAY, TYPES: TYPES, SCOPES: SCOPES, events: events, news: news,
           parse: parse, fmt: fmt, weekday: weekday, daysFrom: daysFrom, phase: phase, status: status, countdown: countdown };
})();
