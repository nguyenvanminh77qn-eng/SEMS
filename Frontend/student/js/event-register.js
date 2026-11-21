/* MH-13 - Đăng ký / hủy đăng ký sự kiện
   Một trang, ba trạng thái:
   - Form đăng ký (chưa đăng ký)
   - Đăng ký thành công (đã đăng ký)
   - Hủy đăng ký (thêm ?mode=cancel vào địa chỉ) */
(function () {
  const Q = window.QN;
  const { esc, student } = Q;
  const page = document.getElementById("page");

  const params = new URLSearchParams(location.search);
  const ev = Q.byId(params.get("id"));
  if (!ev) { location.replace("event-list.html"); return; }

  const i = Q.info(ev);
  const REASONS = ["Trùng lịch cá nhân", "Sức khỏe không đảm bảo", "Có việc gia đình đột xuất", "Đăng ký nhầm sự kiện", "Lý do khác"];
  let mode = params.get("mode") === "cancel" ? "cancel" : "auto";

  const view = () => (!window.QNUI.isLoggedIn() ? "login" : mode === "cancel" && Q.myRegs[ev.id] === "registered" ? "cancel" : Q.myRegs[ev.id] === "registered" ? "success" : "form");

  const NOTES =
    '<aside class="card pad"><h2 class="card-title">Lưu ý</h2><ul class="notes">' +
    "<li>Hạn đăng ký: trước sự kiện 1 ngày, 17:00.</li>" +
    "<li>Hủy đăng ký được khi còn hơn 24 giờ trước sự kiện.</li>" +
    "<li>Đã đăng ký mà vắng mặt không lý do sẽ không được cộng điểm.</li>" +
    "<li>Quét mã QR do ban tổ chức hiển thị tại sự kiện và chụp ảnh xác nhận để điểm danh.</li></ul></aside>";

  function eventCard() {
    return (
      '<section class="card pad"><div class="ev-tags">' + Q.typeTag(ev) + Q.pointsTag(ev) + Q.statusTag(ev) + "</div>" +
      '<h1 class="page-title" style="margin-top:12px;font-size:26px">' + esc(ev.title) + "</h1>" +
      '<dl class="info-grid">' +
      "<div><dt>Thời gian</dt><dd>" + i.range + "</dd></div>" +
      "<div><dt>Địa điểm</dt><dd>" + esc(ev.place) + ", Đại học Quy Nhơn</dd></div>" +
      "<div><dt>Điểm rèn luyện</dt><dd>" + (i.points ? '<span class="pts">+' + i.points + " điểm</span>" : "Không có") + "</dd></div>" +
      "<div><dt>Đơn vị tổ chức</dt><dd>" + esc(i.organizer) + "</dd></div></dl></section>"
    );
  }

  function seatsCard() {
    const pct = Math.min(100, Math.round((i.registered / i.total) * 100));
    return (
      '<aside class="card pad"><h2 class="card-title">Số chỗ</h2>' +
      '<p class="seats"><b>' + ev.seats + "</b> chỗ còn lại</p>" +
      '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Tỷ lệ đăng ký"><span style="width:' + pct + '%"></span></div>' +
      '<p class="muted small">' + i.registered + " / " + i.total + " sinh viên đã đăng ký</p></aside>"
    );
  }

  /* ---------- Ba khối nội dung chính ---------- */
  function formBlock() {
    const chk = Q.checkRegister(ev);
    return (
      '<section class="card pad"><h2 class="card-title">Đăng ký tham gia</h2>' +
      (chk.ok ? "" : '<div class="alert alert-err" role="alert">' + esc(chk.msg) + "</div>") +
      '<div class="alert alert-err" id="formErr" role="alert" hidden></div>' +
      '<div class="form-grid">' +
      '<div class="field"><label for="rName">Họ và tên</label><input class="input" id="rName" value="' + esc(student.name) + '" readonly></div>' +
      '<div class="field"><label for="rMssv">Mã số sinh viên</label><input class="input" id="rMssv" value="' + esc(student.mssv) + '" readonly></div>' +
      '<p class="muted small span2" style="margin:-6px 0 0">Thông tin định danh lấy tự động từ tài khoản đang đăng nhập, chỉ đọc.</p>' +
      '<div class="field"><label for="rPhone">Số điện thoại</label><input class="input" id="rPhone" type="tel" value="' + esc(student.phone) + '" autocomplete="tel"></div>' +
      '<div class="field"><label for="rEmail">Email</label><input class="input" id="rEmail" type="email" value="' + esc(student.email) + '" autocomplete="email"></div>' +
      "</div>" +
      '<label class="check" style="margin-top:14px"><input type="checkbox" id="rAgree"> Tôi cam kết tham gia đúng giờ và đồng ý với các lưu ý của sự kiện.</label>' +
      '<div class="row-actions"><button class="btn btn-primary" id="submitReg" type="button"' + (chk.ok ? "" : " disabled") + '>Xác nhận đăng ký</button>' +
      '<span class="muted small">Khi xác nhận, hệ thống kiểm tra hạn đăng ký, số chỗ còn lại và trùng lịch với sự kiện đã đăng ký.</span></div></section>'
    );
  }

  function successBlock() {
    return (
      '<section class="banner banner-ok"><p>Bạn đã đăng ký thành công</p><div class="code">' + i.code + "</div>" +
      '<p class="small">Thông tin xác nhận được gửi tới ' + esc(student.email) + ".</p></section>" +
      '<div class="row-actions" style="margin-top:20px">' +
      '<button class="btn btn-primary" id="guideBtn" type="button">Hướng dẫn điểm danh</button>' +
      '<a class="btn" href="my-events.html">Sự kiện của tôi</a>' +
      '<a class="btn btn-danger" href="event-register.html?id=' + ev.id + '&mode=cancel">Hủy đăng ký</a></div>'
    );
  }

  function cancelBlock() {
    const ok = Q.canCancel(ev);
    return (
      '<section class="card pad"><h2 class="card-title">Hủy đăng ký</h2>' +
      '<div class="banner banner-warn"><b>Lưu ý:</b> sau khi hủy, chỗ của bạn sẽ được nhường cho sinh viên khác. Bạn vẫn có thể đăng ký lại nếu còn chỗ.</div>' +
      (ok ? "" : '<div class="alert alert-err" role="alert">Chỉ được hủy khi còn hơn 24 giờ trước sự kiện. Sự kiện này không còn đủ thời gian để hủy.</div>') +
      '<div class="alert alert-err" id="formErr" role="alert" hidden></div>' +
      '<div class="field" style="margin-top:16px"><label for="cReason">Lý do hủy</label><select class="input" id="cReason"><option value="">Chọn lý do</option>' +
      REASONS.map((r) => "<option>" + r + "</option>").join("") + "</select></div>" +
      '<div class="row-actions"><button class="btn btn-danger-solid" id="confirmCancel" type="button"' + (ok ? "" : " disabled") + '>Xác nhận hủy</button>' +
      '<button class="btn" id="keepReg" type="button">Giữ đăng ký</button></div></section>'
    );
  }

  /* ---------- Hộp thoại hướng dẫn điểm danh ---------- */
  function guideModal() {
    const w = document.createElement("div");
    w.className = "backdrop is-open";
    w.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="gTitle">' +
      '<button class="icon-btn modal-close" type="button" aria-label="Đóng" data-close>&times;</button>' +
      '<h2 id="gTitle">Hướng dẫn điểm danh</h2>' +
      '<ol class="guide"><li>Đến địa điểm tổ chức đúng giờ.</li>' +
      '<li>Mở mục <b>Quét QR điểm danh</b> và chọn sự kiện của bạn.</li>' +
      '<li>Quét mã QR do ban tổ chức hiển thị tại sự kiện.</li>' +
      '<li>Gửi ảnh xác nhận có mặt và nhấn <b>Xác nhận</b>.</li></ol>' +
      '<a class="btn btn-primary btn-block" href="qr-checkin.html">Mở trang quét QR</a></div>';
    document.body.appendChild(w);
    const close = () => w.remove();
    w.addEventListener("click", (e) => { if (e.target === w || e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); } });
  }

  /* ---------- Vẽ trang ---------- */
  function render() {
    const v = view();
    const crumb = v === "cancel" ? "Hủy đăng ký tham gia" : "Đăng ký tham gia";
    const main =
      v === "login" ? window.QNUI.gate("Đăng nhập để đăng ký tham gia", "Thông tin cá nhân và việc đăng ký sự kiện chỉ hiển thị sau khi bạn đăng nhập.")
      : v === "cancel" ? cancelBlock()
      : v === "success" ? successBlock()
      : formBlock();
    page.innerHTML =
      '<nav class="crumbs" aria-label="Đường dẫn"><a class="back" href="#" data-back>&lsaquo; Quay lại</a>' +
      '<span class="sep">/</span><a href="event-list.html">Sự kiện</a><span class="sep">/</span><span aria-current="page">' + crumb + "</span></nav>" +
      '<div class="reg-layout"><div class="reg-main">' + eventCard() + '<div style="margin-top:20px">' + main + "</div></div>" +
      '<div class="reg-side">' + seatsCard() + '<div style="margin-top:20px">' + NOTES + "</div></div></div>";
    bind(v);
  }

  function showErr(msg) {
    const el = document.getElementById("formErr");
    el.textContent = msg; el.hidden = false;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function bind(v) {
    if (v === "form") {
      document.getElementById("submitReg").addEventListener("click", () => {
        const phone = document.getElementById("rPhone").value.trim();
        const email = document.getElementById("rEmail").value.trim();
        if (!phone || !email) return showErr("Vui lòng nhập đủ số điện thoại và email.");
        if (!/^[0-9+\s]{9,13}$/.test(phone)) return showErr("Số điện thoại chưa đúng. Hãy nhập 9 đến 13 chữ số.");
        if (!/^\S+@\S+\.\S+$/.test(email)) return showErr("Email chưa đúng định dạng, ví dụ ten@student.qnu.edu.vn.");
        if (!document.getElementById("rAgree").checked) return showErr("Bạn cần chọn ô cam kết tham gia trước khi đăng ký.");
        const chk = Q.checkRegister(ev); // kiểm tra lại ngay lúc gửi
        if (!chk.ok) return showErr(chk.msg);
        Q.setReg(ev.id, "registered");
        student.phone = phone; student.email = email;
        window.scrollTo({ top: 0 });
        render();
      });
    }
    if (v === "success") {
      document.getElementById("guideBtn").addEventListener("click", guideModal);
    }
    if (v === "cancel") {
      document.getElementById("confirmCancel").addEventListener("click", () => {
        if (!document.getElementById("cReason").value) return showErr("Vui lòng chọn lý do hủy đăng ký.");
        if (!Q.canCancel(ev)) return showErr("Chỉ được hủy khi còn hơn 24 giờ trước sự kiện.");
        Q.setReg(ev.id, "cancelled");
        Q.flash("Đã hủy đăng ký “" + ev.title + "”.");
        location.href = "my-events.html?tab=cancelled";
      });
      document.getElementById("keepReg").addEventListener("click", () => {
        location.href = "event-register.html?id=" + ev.id; // quay lại trạng thái đã đăng ký
      });
    }
  }

  document.title = "Đăng ký: " + ev.title + " - Cổng thông tin sinh viên Đại học Quy Nhơn";
  render();
})();
