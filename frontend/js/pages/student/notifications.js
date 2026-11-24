/* MH-07 - Thông báo của tôi */
(function () {
  const { notifications, esc } = window.QN;
  const PER_PAGE = 5;
  const KEY = "qn_read_notices";

  const listEl = document.getElementById("noticeList");
  const pagEl = document.getElementById("pagination");
  const infoEl = document.getElementById("unreadInfo");
  const markAllBtn = document.getElementById("markAll");

  let page = 1;

  // Trạng thái đã đọc lưu trong localStorage để tải lại trang vẫn còn
  let readIds = [];
  try { readIds = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { readIds = []; }
  const saveRead = () => { try { localStorage.setItem(KEY, JSON.stringify(readIds)); } catch (e) { /* bỏ qua */ } };
  const isUnread = (n) => n.unread && readIds.indexOf(n.id) === -1;

  function render() {
    const totalPages = Math.ceil(notifications.length / PER_PAGE);
    page = Math.min(Math.max(page, 1), totalPages);
    const items = notifications.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    listEl.innerHTML = items.map((n) => {
      const unread = isUnread(n);
      return (
        '<article class="card notice ' + (unread ? "is-unread" : "is-read") + '">' +
        (unread ? '<span class="dot" title="Chưa đọc"></span><span class="sr-only">Chưa đọc.</span>' : "") +
        '<div class="notice-meta"><span class="tag tag-type">' + esc(n.cat) + "</span><span>" + esc(n.date) + " - " + esc(n.unit) + "</span></div>" +
        '<span class="notice-side"><span class="tag tag-public">Công khai</span></span>' +
        '<h2 class="notice-title">' + esc(n.title) + "</h2>" +
        '<p class="notice-sum">' + esc(n.sum) + "</p>" +
        '<a class="notice-link" href="chi-tiet-notifications.html?id=' + n.id + '" data-id="' + n.id + '">Xem chi tiết →</a>' +
        "</article>"
      );
    }).join("");

    // Phân trang
    let html = '<button class="page-btn" data-page="' + (page - 1) + '" aria-label="Trang trước"' + (page === 1 ? " disabled" : "") + ">&lsaquo;</button>";
    for (let i = 1; i <= totalPages; i++) {
      html += '<button class="page-btn" data-page="' + i + '"' + (i === page ? ' aria-current="page"' : "") + ">" + i + "</button>";
    }
    html += '<button class="page-btn" data-page="' + (page + 1) + '" aria-label="Trang sau"' + (page === totalPages ? " disabled" : "") + ">&rsaquo;</button>";
    pagEl.innerHTML = html;

    const unreadCount = notifications.filter(isUnread).length;
    infoEl.textContent = unreadCount ? "Bạn có " + unreadCount + " thông báo chưa đọc." : "Bạn đã đọc hết thông báo.";
    markAllBtn.disabled = unreadCount === 0;
  }

  pagEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-page]");
    if (!b || b.disabled) return;
    page = Number(b.dataset.page);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Nhấn "Xem chi tiết" -> đánh dấu thông báo đó là đã đọc
  listEl.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-id]");
    if (!link) return;
    const id = Number(link.dataset.id);
    if (readIds.indexOf(id) === -1) { readIds.push(id); saveRead(); }
    setTimeout(render, 0);
  });

  markAllBtn.addEventListener("click", () => {
    notifications.forEach((n) => { if (readIds.indexOf(n.id) === -1) readIds.push(n.id); });
    saveRead();
    render();
    window.QNUI.toast("Đã đánh dấu tất cả thông báo là đã đọc.");
  });

  render();
})();
