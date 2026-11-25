// SEMS – Trang chủ: sự kiện nổi bật (lọc/tìm kiếm), sự kiện tiếp theo, tin tức mới, số liệu thống kê.
(function () {
  'use strict';
  var D = window.SEMSData, U = window.SEMSUI, esc = U.esc;
  var $ = function (id) { return document.getElementById(id); };
  var MAX_EVENTS = 4, MAX_NEWS = 4;

  var ICON_CAL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  var ICON_PIN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';

  function eventHref(ev) { return '../student/event-detail.html?id=' + ev.id; }
  function registerHref(ev) { return '../student/event-register.html?id=' + ev.id; }

  /* ---------- Sự kiện nổi bật ---------- */
  function eventCard(ev) {
    var st = D.status(ev), d = D.parse(ev.date), ended = D.phase(ev) === 'ended';
    var seats = ended ? '' : '<span class="seats">' + (ev.seats <= 15 ? 'Chỉ còn ' : 'Còn ') + ev.seats + ' chỗ</span>';
    var reg = ended
      ? '<span class="btn sm pri is-disabled" aria-disabled="true">Đã kết thúc</span>'
      : '<a class="btn sm pri" ' + U.gate(registerHref(ev), 'Vui lòng đăng nhập để đăng ký tham gia sự kiện.') + '>Đăng ký ngay</a>';
    return '<article class="event">' +
      '<div class="thumb t-' + ev.type + '" role="img" aria-label="Sự kiện ' + esc(D.TYPES[ev.type].toLowerCase()) + '">' +
        '<span class="chip">' + esc(D.TYPES[ev.type]) + '</span>' +
        '<span class="dbadge"><b>' + d.getDate() + '</b>Thg ' + (d.getMonth() + 1) + '</span>' +
      '</div>' +
      '<h3>' + esc(ev.title) + '</h3>' +
      '<p class="row">' + ICON_CAL + '<span>' + esc(D.weekday(ev.date)) + ', ' + D.fmt(ev.date) + ' · ' + esc(ev.time) + '</span></p>' +
      '<p class="row">' + ICON_PIN + '<span>' + esc(ev.place) + '</span></p>' +
      '<p class="row st"><span class="badge ' + st.cls + '">' + esc(st.text) + '</span>' + seats + '</p>' +
      '<div class="act"><a class="btn sm" ' + U.gate(eventHref(ev), 'Vui lòng đăng nhập để xem chi tiết sự kiện.') + '>Xem chi tiết</a>' + reg + '</div>' +
    '</article>';
  }

  function matches(ev, f) {
    if (f.scope && ev.scope !== f.scope) return false;
    if (f.field && ev.type !== f.field) return false;
    var ph = D.phase(ev);
    if (f.time === 'upcoming' && ph === 'ended') return false;   // "sắp diễn ra" gồm cả sự kiện hôm nay
    if (f.time === 'live' && ph !== 'live') return false;
    if (f.time === 'ended' && ph !== 'ended') return false;
    if (f.q && U.fold([ev.title, ev.place, D.TYPES[ev.type], D.SCOPES[ev.scope]].join(' ')).indexOf(f.q) === -1) return false;
    return true;
  }
  // Sự kiện chưa qua xếp theo ngày gần nhất, sự kiện đã qua xếp mới nhất trước
  function order(a, b) {
    var ea = D.phase(a) === 'ended', eb = D.phase(b) === 'ended';
    if (ea !== eb) return ea ? 1 : -1;
    var diff = D.daysFrom(a.date) - D.daysFrom(b.date);
    return ea ? -diff : diff;
  }

  function renderEvents() {
    var f = { scope: $('fScope').value, time: $('fTime').value, field: $('fField').value, q: U.fold($('q').value) };
    var list = D.events.filter(function (ev) { return matches(ev, f); }).sort(order);
    $('events').innerHTML = list.length
      ? list.slice(0, MAX_EVENTS).map(eventCard).join('')
      : '<p class="empty">Không có sự kiện nào phù hợp với bộ lọc hiện tại. Hãy thử đổi từ khóa hoặc chọn “Tất cả”.</p>';
    $('evCount').textContent = list.length ? 'Hiển thị ' + Math.min(list.length, MAX_EVENTS) + '/' + list.length + ' sự kiện phù hợp' : '';
  }

  ['fScope', 'fTime', 'fField'].forEach(function (id) { $(id).addEventListener('change', renderEvents); });
  $('q').addEventListener('input', renderEvents);
  $('heroSearch').addEventListener('submit', function (e) {
    e.preventDefault();
    renderEvents();
    $('su-kien').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- Sự kiện tiếp theo (khung bên phải banner) ---------- */
  function renderSpotlight() {
    var next = D.events.filter(function (ev) { return D.phase(ev) !== 'ended'; }).sort(order)[0];
    var box = $('spotlight');
    if (!next) { box.hidden = true; return; }
    var st = D.status(next);
    box.innerHTML =
      '<span class="spot-label">Sự kiện tiếp theo</span>' +
      '<h2>' + esc(next.title) + '</h2>' +
      '<p class="row">' + ICON_CAL + '<span>' + esc(D.weekday(next.date)) + ', ' + D.fmt(next.date) + ' · ' + esc(next.time) + '</span></p>' +
      '<p class="row">' + ICON_PIN + '<span>' + esc(next.place) + '</span></p>' +
      '<p class="spot-meta"><span class="count">' + esc(D.countdown(next)) + '</span><span class="badge ' + st.cls + '">' + esc(st.text) + '</span></p>' +
      '<a class="btn sm" ' + U.gate(eventHref(next), 'Vui lòng đăng nhập để xem chi tiết sự kiện.') + '>Xem chi tiết</a>';
  }

  /* ---------- Tin tức & thông báo mới ---------- */
  function renderNews() {
    var list = D.news.slice().sort(function (a, b) { return D.daysFrom(b.date) - D.daysFrom(a.date); }).slice(0, MAX_NEWS);
    $('homeNews').innerHTML = list.map(function (n) {
      return '<article class="item">' +
        '<div class="nthumb ' + U.catClass(n.cat) + '" aria-hidden="true">' + esc(n.cat) + '</div>' +
        '<div><h3>' + esc(n.title) + '</h3><p>' + D.fmt(n.date) + ' · ' + esc(n.unit) + '</p>' +
        '<a ' + U.gate('../student/notifications.html', 'Vui lòng đăng nhập để xem chi tiết tin tức.') + '>Xem chi tiết</a></div>' +
      '</article>';
    }).join('');
  }

  /* ---------- Số liệu thống kê: đếm tăng dần khi cuộn tới ---------- */
  function countUp() {
    var nums = document.querySelectorAll('.stat b[data-count]');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function run(el) {
      var end = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = null;
      if (reduce) { el.textContent = end + suffix; return; }
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / 1000, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io.observe(el); });
  }

  renderEvents();
  renderSpotlight();
  renderNews();
  countUp();
})();
