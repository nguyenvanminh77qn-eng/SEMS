/* MH-14 - Đánh giá sự kiện */
(function () {
  const Q = window.QN;
  const { esc } = Q;
  const page = document.getElementById("page");
  if (!window.QNUI.isLoggedIn()) {
    page.innerHTML = window.QNUI.gate("Đăng nhập để đánh giá sự kiện", "Bạn cần đăng nhập để gửi đánh giá cho sự kiện đã tham gia.");
    return;
  }
  const KEY = "qn_reviews";

  const ev = Q.byId(new URLSearchParams(location.search).get("id"));
  if (!ev) { location.replace("my-events.html?tab=attended"); return; }

  let reviews = {};
  try { reviews = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { reviews = {}; }

  const GOOD = ["Nội dung hấp dẫn", "Tổ chức chuyên nghiệp", "Địa điểm thuận tiện", "Diễn giả / MC tốt", "Có ích cho học tập", "Thời gian hợp lý"];
  const STAR_LABEL = ["", "Rất không hài lòng", "Không hài lòng", "Bình thường", "Hài lòng", "Rất hài lòng"];
  let rating = reviews[ev.id] ? reviews[ev.id].rating : 0;

  const starSvg = (on) =>
    '<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z" fill="' + (on ? "#f5a623" : "none") + '" stroke="' + (on ? "#f5a623" : "#9fb0c4") + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  function render() {
    const done = !!reviews[ev.id];
    page.innerHTML =
      '<nav class="crumbs" aria-label="Đường dẫn"><a class="back" href="#" data-back>&lsaquo; Quay lại</a>' +
      '<span class="sep">/</span><span aria-current="page">Đánh giá sự kiện</span></nav>' +
      '<section class="card pad review"><span class="tag tag-live">Đã tham gia</span>' +
      '<h1 class="page-title" style="margin-top:12px;font-size:26px">Đánh giá: ' + esc(ev.title) + "</h1>" +
      '<p class="muted">' + Q.fmtDMY(Q.parseDate(ev.date)) + " - Ý kiến của bạn giúp ban tổ chức làm tốt hơn.</p>" +
      (done ? '<div class="alert alert-ok" style="margin-top:16px">Bạn đã gửi đánh giá cho sự kiện này. Có thể sửa và gửi lại bên dưới.</div>' : "") +
      '<div class="alert alert-err" id="formErr" role="alert" hidden></div>' +

      '<div class="field" style="margin-top:20px"><span class="label" id="starLabel">Mức độ hài lòng chung</span>' +
      '<div class="stars" role="radiogroup" aria-labelledby="starLabel">' +
      [1, 2, 3, 4, 5].map((n) => '<button type="button" class="star" role="radio" data-star="' + n + '" aria-label="' + n + ' sao, ' + STAR_LABEL[n] + '" aria-checked="' + (n === rating) + '">' + starSvg(n <= rating) + "</button>").join("") +
      '<span class="star-text" id="starText">' + STAR_LABEL[rating] + "</span></div></div>" +

      '<fieldset class="filter-group" style="margin-top:20px"><legend>Bạn thấy điểm nào tốt? (Không bắt buộc)</legend>' +
      GOOD.map((g, k) => '<label class="check"><input type="checkbox" name="good" value="' + k + '"' + (reviews[ev.id] && reviews[ev.id].good.includes(k) ? " checked" : "") + "> " + g + "</label>").join("") + "</fieldset>" +

      '<div class="field"><label for="comment">Góp ý thêm (Không bắt buộc)</label>' +
      '<textarea class="input" id="comment" rows="5" maxlength="1000" placeholder="Bạn thích gì, cần cải thiện gì?">' + esc(reviews[ev.id] ? reviews[ev.id].comment : "") + "</textarea></div>" +
      '<label class="check" style="margin-top:12px"><input type="checkbox" id="anon"' + (reviews[ev.id] && reviews[ev.id].anon ? " checked" : "") + "> Gửi ẩn danh (ban tổ chức không thấy tên bạn)</label>" +
      '<div class="row-actions"><button class="btn btn-primary" id="send" type="button">Gửi đánh giá</button><button class="btn" id="later" type="button">Để sau</button></div></section>';
    bind();
  }

  function setRating(n) {
    rating = n;
    page.querySelectorAll(".star").forEach((b) => {
      const k = Number(b.dataset.star);
      b.innerHTML = starSvg(k <= n);
      b.setAttribute("aria-checked", String(k === n));
    });
    document.getElementById("starText").textContent = STAR_LABEL[n];
    document.getElementById("formErr").hidden = true;
  }

  function bind() {
    page.querySelector(".stars").addEventListener("click", (e) => {
      const b = e.target.closest("[data-star]");
      if (b) setRating(Number(b.dataset.star));
    });
    // Phím mũi tên đổi số sao (đúng với nhóm radio)
    page.querySelector(".stars").addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setRating(Math.min(5, rating + 1)); }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setRating(Math.max(1, rating - 1)); }
    });

    document.getElementById("send").addEventListener("click", () => {
      if (!rating) {
        const el = document.getElementById("formErr");
        el.textContent = "Vui lòng chọn số sao để đánh giá mức độ hài lòng chung.";
        el.hidden = false;
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      reviews[ev.id] = {
        rating,
        good: [...page.querySelectorAll('input[name="good"]:checked')].map((i) => Number(i.value)),
        comment: document.getElementById("comment").value.trim(),
        anon: document.getElementById("anon").checked,
      };
      try { localStorage.setItem(KEY, JSON.stringify(reviews)); } catch (e) { /* bỏ qua */ }
      Q.flash("Cảm ơn bạn! Đánh giá đã được gửi.");
      location.href = "my-events.html?tab=attended";
    });

    document.getElementById("later").addEventListener("click", () => { location.href = "my-events.html?tab=attended"; });
  }

  document.title = "Đánh giá: " + ev.title + " - Cổng thông tin sinh viên Đại học Quy Nhơn";
  render();
})();
