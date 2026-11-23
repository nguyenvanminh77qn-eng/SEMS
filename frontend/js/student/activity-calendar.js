/* MH-08 - Lịch hoạt động */
(function () {
  const Q = window.QN;
  const { events, TODAY, TYPES, esc } = Q;

  const gridEl = document.getElementById("calGrid");
  const titleEl = document.getElementById("calTitle");
  const panelEl = document.getElementById("dayPanel");
  const monthView = document.getElementById("monthView");

  const state = {
    view: "month",
    type: "all",
    year: TODAY.getFullYear(),
    month: TODAY.getMonth(), // 0-11
    selected: Q.toKey(TODAY),
  };

  const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const filtered = () => events.filter((e) => state.type === "all" || e.type === state.type);
  const eventsOn = (key) => filtered().filter((e) => e.date === key).sort((a, b) => a.time.localeCompare(b.time));

  function renderMonth() {
    titleEl.textContent = "Tháng " + (state.month + 1) + "/" + state.year;

    const first = new Date(state.year, state.month, 1);
    const startOffset = first.getDay(); // lưới bắt đầu từ Chủ nhật
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
    const weeks = Math.ceil((startOffset + daysInMonth) / 7);
    const todayKey = Q.toKey(TODAY);

    let html = DOW.map((d) => '<div class="cal-dow" role="columnheader">' + d + "</div>").join("");

    for (let i = 0; i < weeks * 7; i++) {
      const date = new Date(state.year, state.month, 1 - startOffset + i);
      const key = Q.toKey(date);
      const other = date.getMonth() !== state.month;
      const evs = eventsOn(key);
      const cls = ["cal-cell"];
      if (other) cls.push("is-other");
      if (key === todayKey) cls.push("is-today");
      if (key === state.selected) cls.push("is-selected");

      const shown = evs.slice(0, 2).map((e) =>
        '<span class="pill' + (e.points ? " is-points" : "") + '" title="' + esc(e.title) + '">' + esc(e.title) + "</span>"
      ).join("");
      const more = evs.length > 2 ? '<span class="more">+' + (evs.length - 2) + " nữa</span>" : "";

      html +=
        '<button type="button" role="gridcell" class="' + cls.join(" ") + '" data-key="' + key + '" ' +
        'aria-label="Ngày ' + Q.fmtDMY(date) + (evs.length ? ", " + evs.length + " hoạt động" : "") + '"' +
        (key === state.selected ? ' aria-selected="true"' : "") + ">" +
        '<span class="num">' + date.getDate() + "</span>" + shown + more + "</button>";
    }
    gridEl.innerHTML = html;
  }

  // Một dòng hoạt động (dùng cho cả danh sách ngày và chế độ Danh sách)
  function actItem(ev) {
    return (
      '<div class="act">' + Q.dateTile(ev) +
      "<div><div class=\"act-title\">" + esc(ev.title) + "</div>" +
      '<div class="act-meta"><b>' + ev.time + "</b> tại " + esc(ev.place) + ", Trường Đại học Quy Nhơn</div>" +
      '<div class="act-tags">' + Q.typeTag(ev) + Q.pointsTag(ev) + "</div></div></div>"
    );
  }

  function renderDayPanel() {
    if (state.view === "list") {
      const list = filtered()
        .filter((e) => {
          const d = Q.parseDate(e.date);
          return d.getFullYear() === state.year && d.getMonth() === state.month;
        })
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

      panelEl.innerHTML =
        '<div class="day-panel-head"><h2>Hoạt động trong tháng ' + (state.month + 1) + "/" + state.year + "</h2></div>" +
        (list.length
          ? '<div class="act-list">' + list.map(actItem).join("") + "</div>"
          : '<div class="empty"><strong>Chưa có hoạt động nào</strong>Thử chọn loại hoạt động khác hoặc chuyển sang tháng khác.</div>');
      return;
    }

    const d = Q.parseDate(state.selected);
    const isToday = state.selected === Q.toKey(TODAY);
    const list = eventsOn(state.selected);
    panelEl.innerHTML =
      '<div class="day-panel-head"><h2>Ngày ' + Q.fmtDMY(d) + "</h2>" + (isToday ? '<span class="tag tag-live">Hôm nay</span>' : "") + "</div>" +
      (list.length
        ? '<div class="act-list">' + list.map(actItem).join("") + "</div>"
        : '<div class="empty"><strong>Không có hoạt động trong ngày này</strong>Chọn một ngày khác trên lịch để xem.</div>');
  }

  function render() {
    // Chế độ Danh sách: ẩn lưới tháng + chú thích, vẫn giữ thanh chuyển tháng
    const isList = state.view === "list";
    gridEl.hidden = isList;
    monthView.querySelector(".legend").hidden = isList;
    renderMonth();
    renderDayPanel();
  }

  function shiftMonth(delta) {
    const d = new Date(state.year, state.month + delta, 1);
    state.year = d.getFullYear();
    state.month = d.getMonth();
    // Giữ ngày được chọn nằm trong tháng đang xem
    const inMonth = TODAY.getFullYear() === state.year && TODAY.getMonth() === state.month;
    state.selected = Q.toKey(inMonth ? TODAY : new Date(state.year, state.month, 1));
    render();
  }

  document.getElementById("prevMonth").addEventListener("click", () => shiftMonth(-1));
  document.getElementById("nextMonth").addEventListener("click", () => shiftMonth(1));

  gridEl.addEventListener("click", (e) => {
    const cell = e.target.closest("[data-key]");
    if (!cell) return;
    state.selected = cell.dataset.key;
    const d = Q.parseDate(state.selected);
    // Nhấn vào ô thuộc tháng khác -> chuyển sang tháng đó
    if (d.getMonth() !== state.month) { state.year = d.getFullYear(); state.month = d.getMonth(); }
    render();
  });

  document.getElementById("viewSeg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-view]");
    if (!b) return;
    state.view = b.dataset.view;
    document.querySelectorAll("#viewSeg .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    render();
  });

  document.getElementById("typeSeg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-type]");
    if (!b) return;
    state.type = b.dataset.type;
    document.querySelectorAll("#typeSeg .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    render();
  });

  render();
})();
