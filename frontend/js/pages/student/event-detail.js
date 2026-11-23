/* MH-12 - Chi tiết sự kiện */
(function () {
  const Q = window.QN;
  const { esc } = Q;
  const page = document.getElementById("page");

  const ev = Q.byId(new URLSearchParams(location.search).get("id"));
  if (!ev) {
    page.innerHTML = '<div class="card empty" style="margin-top:32px"><strong>Không tìm thấy sự kiện</strong><a href="event-list.html">Quay lại danh sách sự kiện</a></div>';
    return;
  }

  const i = Q.info(ev);
  const state = { tab: "intro" };

  // Nội dung 3 thẻ (bản demo: dùng mẫu chung theo loại sự kiện)
  const INTRO = {
    "van-hoa": "Chương trình văn hóa giúp sinh viên giao lưu, thể hiện bản thân và gắn kết với cộng đồng trường.",
    "the-thao": "Hoạt động thể thao giúp sinh viên rèn luyện sức khỏe, tinh thần đồng đội và tác phong thi đấu lành mạnh.",
    "tinh-nguyen": "Hoạt động tình nguyện giúp sinh viên đóng góp cho cộng đồng và tích lũy kinh nghiệm thực tế.",
    "hoc-thuat": "Hội thảo giúp sinh viên rèn luyện kỹ năng giao tiếp, làm việc nhóm, viết CV và phỏng vấn, chuẩn bị tốt cho công việc tương lai.",
  };

  function tabContent() {
    if (state.tab === "program") {
      const t = (min) => { const d = new Date(i.start.getTime() + min * 60000); return Q.pad(d.getHours()) + ":" + Q.pad(d.getMinutes()); };
      return '<h2>Chương trình</h2><ul class="timeline">' +
        "<li><b>" + t(-30) + "</b> Đón tiếp và điểm danh bằng mã QR</li>" +
        "<li><b>" + t(0) + "</b> Khai mạc</li>" +
        "<li><b>" + t(30) + "</b> Nội dung chính của chương trình</li>" +
        "<li><b>" + t(120) + "</b> Giao lưu, hỏi đáp</li>" +
        "<li><b>" + t(165) + "</b> Tổng kết và bế mạc</li></ul>";
    }
    if (state.tab === "rules") {
      return "<h2>Quy định</h2><ul>" +
        "<li>Hạn đăng ký: trước sự kiện 1 ngày, 17:00.</li>" +
        "<li>Chỉ được hủy đăng ký khi còn hơn 24 giờ trước sự kiện.</li>" +
        "<li>Đã đăng ký mà vắng mặt không lý do sẽ không được cộng điểm rèn luyện.</li>" +
        "<li>Điểm danh bằng cách quét mã QR do ban tổ chức hiển thị tại sự kiện và gửi ảnh xác nhận.</li>" +
        "<li>Đến đúng giờ, giữ trật tự và làm theo hướng dẫn của ban tổ chức.</li></ul>";
    }
    return "<h2>Giới thiệu</h2><p>" + INTRO[ev.type] + "</p>" +
      "<h3>Đối tượng tham gia</h3><ul><li>Sinh viên các khoa đang theo học tại trường.</li><li>Giảng viên và cán bộ quan tâm.</li></ul>" +
      "<h3>Liên hệ</h3><p>Ban tổ chức: " + esc(i.organizer) + ", Đại học Quy Nhơn.</p>";
  }

  function related() {
    // Ưu tiên sự kiện cùng loại, sau đó là sự kiện sắp diễn ra khác
    const others = Q.events.filter((e) => e.id !== ev.id && Q.statusOf(e) !== "ended");
    others.sort((a, b) => (b.type === ev.type) - (a.type === ev.type) || a.date.localeCompare(b.date));
    return others.slice(0, 3).map((e) =>
      '<a class="rel" href="event-detail.html?id=' + e.id + '"><b>' + esc(e.title) + "</b><span>" + Q.fmtDMY(Q.parseDate(e.date)) + " - " + Q.TYPES[e.type] + "</span></a>"
    ).join("");
  }

  function asideHTML() {
    const mine = Q.myRegs[ev.id] === "registered";
    const pct = Math.min(100, Math.round((i.registered / i.total) * 100));
    let buttons;
    if (!window.QNUI.isLoggedIn()) {
      buttons = '<button class="btn btn-primary btn-block" type="button" data-login>Đăng nhập để đăng ký</button>';
    } else if (mine) {
      buttons =
        '<a class="btn btn-primary btn-block" href="event-register.html?id=' + ev.id + '">Đã đăng ký</a>' +
        '<a class="btn btn-danger btn-block" href="event-register.html?id=' + ev.id + '&mode=cancel">Hủy đăng ký</a>';
    } else {
      const chk = Q.checkRegister(ev);
      buttons = chk.ok
        ? '<a class="btn btn-primary btn-block" href="event-register.html?id=' + ev.id + '">Đăng ký tham gia</a>'
        : '<button class="btn btn-block" type="button" disabled>Đăng ký tham gia</button><p class="field-error">' + esc(chk.msg) + "</p>";
    }
    return (
      '<aside class="card aside"><h2 class="aside-title">Đăng ký tham gia</h2>' +
      '<div id="countdown"></div>' +
      '<p class="seats"><b>' + ev.seats + "</b> chỗ còn lại</p>" +
      '<p class="muted small">' + i.registered + "/" + i.total + " sinh viên đã đăng ký</p>" +
      '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Tỷ lệ đăng ký"><span style="width:' + pct + '%"></span></div>' +
      '<div class="stack">' + buttons + "</div>" +
      '<p class="muted small">Hạn đăng ký: trước sự kiện 1 ngày, 17:00</p></aside>'
    );
  }

  function render() {
    page.innerHTML =
      '<nav class="crumbs" aria-label="Đường dẫn"><a class="back" href="#" data-back>&lsaquo; Quay lại</a>' +
      '<span class="sep">/</span><a href="event-list.html">Sự kiện</a><span class="sep">/</span><span aria-current="page">Chi tiết sự kiện</span></nav>' +
      '<div class="detail-layout"><div class="detail-main">' +
      '<div class="hero t-' + ev.type + '" role="img" aria-label="Ảnh bìa sự kiện">' + Q.icon(ev.type, 84) + "</div>" +
      '<section class="card pad"><div class="ev-tags">' + Q.typeTag(ev) + Q.pointsTag(ev) + Q.statusTag(ev) + "</div>" +
      '<h1 class="page-title" style="margin-top:12px">' + esc(ev.title) + "</h1>" +
      '<dl class="info-grid">' +
      "<div><dt>Thời gian</dt><dd>" + i.range + "</dd></div>" +
      "<div><dt>Địa điểm</dt><dd>" + esc(ev.place) + ", Đại học Quy Nhơn</dd></div>" +
      "<div><dt>Điểm rèn luyện</dt><dd>" + (i.points ? '<span class="pts">+' + i.points + " điểm</span>" : "Không có") + "</dd></div>" +
      "<div><dt>Đơn vị tổ chức</dt><dd>" + esc(i.organizer) + "</dd></div></dl></section>" +
      '<div class="tabs" role="tablist" id="tabs" style="margin:20px 0 14px">' +
      ["intro:Giới thiệu", "program:Chương trình", "rules:Quy định"].map((t) => {
        const [k, l] = t.split(":");
        return '<button class="chip" role="tab" type="button" data-tab="' + k + '" aria-selected="' + (k === state.tab) + '">' + l + "</button>";
      }).join("") + "</div>" +
      '<section class="card pad prose" id="tabBody"></section>' +
      '<section class="card pad" style="margin-top:20px"><h2 class="section-title" style="margin-top:0">Sự kiện liên quan</h2><div class="rel-grid">' + related() + "</div></section>" +
      "</div>" + asideHTML() + "</div>";
    document.getElementById("tabBody").innerHTML = tabContent();
    tickCountdown();
  }

  /* Đếm ngược đến lúc sự kiện bắt đầu */
  function tickCountdown() {
    const el = document.getElementById("countdown");
    if (!el) return;
    const diff = i.start - Q.nowDemo();
    if (Q.statusOf(ev) === "ended" || Q.nowDemo() > i.end) {
      el.innerHTML = '<p class="muted">Sự kiện đã kết thúc.</p>';
      return;
    }
    if (diff <= 0) { el.innerHTML = '<p class="live-now">Sự kiện đang diễn ra</p>'; return; }
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000);
    const box = (n, l) => '<div><b>' + n + "</b><span>" + l + "</span></div>";
    el.innerHTML = '<p class="muted small" style="margin:0 0 6px">Bắt đầu sau</p><div class="countdown">' + box(d, "ngày") + box(h, "giờ") + box(m, "phút") + "</div>";
  }
  setInterval(tickCountdown, 30000);

  page.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (!b) return;
    state.tab = b.dataset.tab;
    page.querySelectorAll("[data-tab]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    document.getElementById("tabBody").innerHTML = tabContent();
  });

  document.title = ev.title + " - Cổng thông tin sinh viên Đại học Quy Nhơn";
  render();
})();
