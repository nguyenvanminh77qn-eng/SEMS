/* MH-11 - Danh sách sự kiện, tìm kiếm và lọc */
(function () {
  const Q = window.QN;
  const { events, myRegs, esc } = Q;
  const $ = (id) => document.getElementById(id);

  const listEl = $("evList");
  const countEl = $("count");
  const qEl = $("q");
  const sortEl = $("sort");

  // Từ khóa chỉ áp dụng khi nhấn "Tìm kiếm" / Enter (đúng như mô tả trong tài liệu)
  let keyword = "";

  const isMine = (ev) => window.QNUI.isLoggedIn() && !!myRegs[ev.id] && myRegs[ev.id] !== "cancelled";

  if (!window.QNUI.isLoggedIn()) {
    const mine = document.querySelector('#fOther input[value="mine"]');
    mine.disabled = true;
    mine.parentElement.title = "Đăng nhập để dùng bộ lọc này";
    mine.parentElement.style.opacity = "0.55";
  }

  function readFilters() {
    const types = [...document.querySelectorAll("#fType input:checked")].map((i) => i.value);
    const status = document.querySelector('#fStatus input:checked').value;
    const other = [...document.querySelectorAll("#fOther input:checked")].map((i) => i.value);
    return { types, status, points: other.includes("points"), mine: other.includes("mine"), sort: sortEl.value };
  }

  function sortList(list, mode) {
    const t = Q.dayStart(Q.TODAY).getTime();
    const time = (e) => Q.parseDate(e.date).getTime();
    const cmp = {
      // Sắp diễn ra gần nhất lên trước, sự kiện đã kết thúc xếp sau (mới kết thúc trước)
      nearest: (a, b) => {
        const ea = time(a) < t, eb = time(b) < t;
        if (ea !== eb) return ea ? 1 : -1;
        return ea ? time(b) - time(a) : time(a) - time(b);
      },
      latest: (a, b) => time(b) - time(a),
      name: (a, b) => a.title.localeCompare(b.title, "vi"),
      seats: (a, b) => b.seats - a.seats,
    }[mode];
    return list.slice().sort(cmp);
  }

  function actionBtn(ev) {
    if (Q.statusOf(ev) === "ended") return '<span class="btn btn-done btn-sm is-disabled" aria-disabled="true">Đã kết thúc</span>';
    if (isMine(ev)) return '<a class="btn btn-primary btn-sm" href="event-register.html?id=' + ev.id + '">Đã đăng ký</a>';
    return '<a class="btn btn-primary btn-sm" href="event-register.html?id=' + ev.id + '">Đăng ký</a>';
  }

  function card(ev) {
    const ended = Q.statusOf(ev) === "ended";
    return (
      '<article class="card ev' + (ended ? " is-ended" : "") + '">' +
      '<div class="ev-thumb t-' + ev.type + '" role="img" aria-label="Ảnh sự kiện ' + esc(ev.title) + '">' + Q.icon(ev.type) + "</div>" +
      Q.dateTile(ev) +
      '<div class="ev-body"><h2 class="ev-title">' + esc(ev.title) + "</h2>" +
      '<div class="ev-tags">' + Q.typeTag(ev) + Q.statusTag(ev) + Q.pointsTag(ev) + "</div>" +
      '<p class="ev-meta"><b>' + ev.time + "</b> tại " + esc(ev.place) + ", Đại học Quy Nhơn - " + ev.seats + " chỗ</p></div>" +
      '<div class="ev-action">' + actionBtn(ev) + '<a class="ev-link" href="event-detail.html?id=' + ev.id + '">Xem chi tiết →</a></div>' +
      "</article>"
    );
  }

  function render() {
    const f = readFilters();
    const kw = Q.norm(keyword);

    const list = events.filter((ev) =>
      (!kw || Q.norm(ev.title).includes(kw)) &&
      (!f.types.length || f.types.includes(ev.type)) &&
      (f.status === "all" || Q.statusOf(ev) === f.status) &&
      (!f.points || ev.points) &&
      (!f.mine || isMine(ev))
    );

    countEl.innerHTML = "Tìm thấy <b>" + list.length + "</b> sự kiện";
    listEl.innerHTML = list.length
      ? sortList(list, f.sort).map(card).join("")
      : '<div class="card empty"><strong>Không tìm thấy sự kiện phù hợp</strong>Thử đổi từ khóa hoặc nhấn “Xóa bộ lọc” để xem tất cả sự kiện.</div>';
  }

  $("searchForm").addEventListener("submit", (e) => { e.preventDefault(); keyword = qEl.value; render(); });

  document.querySelector(".filters").addEventListener("change", render);

  $("clear").addEventListener("click", () => {
    document.querySelectorAll("#fType input, #fOther input").forEach((i) => { i.checked = false; });
    document.querySelector('#fStatus input[value="all"]').checked = true;
    sortEl.value = "nearest";
    qEl.value = "";
    keyword = "";
    render();
  });

  render();
})();
