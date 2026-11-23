/* MH-09 - Sự kiện của tôi và lịch sử tham gia */
(function () {
  const Q = window.QN;
  const { events, myRegs, esc } = Q;

  let reviewed = {};
  try { reviewed = JSON.parse(localStorage.getItem("qn_reviews")) || {}; } catch (e) { reviewed = {}; }

  const tabsEl = document.getElementById("tabs");
  const listEl = document.getElementById("evList");

  if (!window.QNUI.isLoggedIn()) {
    tabsEl.hidden = true;
    listEl.innerHTML = window.QNUI.gate("Đăng nhập để xem sự kiện của bạn", "Danh sách sự kiện đã đăng ký và lịch sử tham gia chỉ hiển thị sau khi bạn đăng nhập.");
    return;
  }

  const TAB_LABEL = { registered: "Sắp tới", attended: "Lịch sử đã tham gia", cancelled: "Đã hủy" };
  const EMPTY = {
    registered: ["Chưa có sự kiện sắp tới", "Xem Danh sách sự kiện để đăng ký tham gia."],
    attended: ["Chưa có lịch sử tham gia", "Các sự kiện bạn đã điểm danh sẽ hiện ở đây."],
    cancelled: ["Bạn chưa hủy sự kiện nào", "Các sự kiện bạn đã hủy đăng ký sẽ hiện ở đây."],
  };

  // Lấy từ URL ?tab=... để mở đúng tab (ví dụ từ trang đánh giá quay về)
  let current = new URLSearchParams(location.search).get("tab");
  if (!TAB_LABEL[current]) current = "registered";

  const itemsOf = (tab) =>
    events
      .filter((e) => myRegs[e.id] === tab)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  function card(ev, tab) {
    const regTag = '<span class="tag tag-registered">Đã đăng kí</span>';
    const tags =
      tab === "registered"
        ? Q.typeTag(ev) + Q.statusTag(ev) + Q.pointsTag(ev)
        : tab === "attended"
        ? Q.typeTag(ev) + regTag + Q.pointsTag(ev)
        : Q.typeTag(ev) + '<span class="tag tag-ended">Đã hủy</span>';

    const action =
      tab === "registered"
        ? '<a class="btn btn-primary btn-sm" href="event-register.html?id=' + ev.id + '">Đã đăng kí</a>'
        : tab === "attended"
        ? '<a class="btn btn-primary btn-sm" href="event-review.html?id=' + ev.id + '">' + (reviewed[ev.id] ? "Sửa đánh giá" : "Đánh giá") + "</a>"
        : "";

    return (
      '<article class="card ev">' + Q.dateTile(ev) +
      '<div class="ev-body"><h2 class="ev-title">' + esc(ev.title) + "</h2>" +
      '<div class="ev-tags">' + tags + "</div>" +
      '<p class="ev-meta"><b>' + ev.time + "</b> tại " + esc(ev.place) + ", Đại học Quy Nhơn - Còn " + ev.seats + " chỗ</p>" +
      (action ? '<div class="ev-mine-action">' + action + "</div>" : "") +
      "</div></article>"
    );
  }

  function render() {
    tabsEl.querySelectorAll("[data-tab]").forEach((b) => {
      const t = b.dataset.tab;
      b.textContent = TAB_LABEL[t] + " (" + itemsOf(t).length + ")";
      b.setAttribute("aria-selected", String(t === current));
    });
    const items = itemsOf(current);
    listEl.innerHTML = items.length
      ? items.map((e) => card(e, current)).join("")
      : '<div class="card empty"><strong>' + EMPTY[current][0] + "</strong>" + EMPTY[current][1] + "</div>";
  }

  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (!b) return;
    current = b.dataset.tab;
    render();
  });

  render();
})();
