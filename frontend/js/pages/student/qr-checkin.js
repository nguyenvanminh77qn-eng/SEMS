/* MH-10 - Mã QR điểm danh
   Luồng: chọn sự kiện -> quét QR -> (QR hợp lệ) hộp thoại gửi ảnh minh chứng -> xác nhận.
   Quét QR xong CHƯA phải là đã điểm danh; chỉ khi gửi ảnh và nhấn "Xác nhận" mới được ghi nhận.

   Định dạng nội dung mã QR của bản demo:  QNU|<mã sự kiện>|<ok | expired>
   (Khi có backend, thay hàm validate() bằng lời gọi API kiểm tra mã.) */
(function () {
  const Q = window.QN;
  if (!window.QNUI.isLoggedIn()) {
    document.querySelector("main .panel").outerHTML = window.QNUI.gate("Đăng nhập để điểm danh", "Bạn cần đăng nhập để chọn sự kiện đã đăng ký và điểm danh bằng mã QR.");
    return;
  }
  const { events, myRegs, student, esc } = Q;
  const $ = (id) => document.getElementById(id);

  const els = {
    select: $("eventSelect"), status: $("eventStatus"), steps: $("steps"),
    camera: $("camera"), video: $("video"), scanBtn: $("scanBtn"),
    warn: $("msgWarn"), ok: $("msgOk"), err: $("msgErr"), list: $("statusList"),
    backdrop: $("backdrop"), close: $("modalClose"), confirm: $("confirmBtn"),
    fName: $("fName"), fMssv: $("fMssv"), fEvent: $("fEvent"), fPhoto: $("fPhoto"),
    photoErr: $("photoErr"), uploadInner: $("uploadInner"),
  };

  const KEY = "qn_attend";
  let attend = {};
  try { attend = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { attend = {}; }
  const saveAttend = () => { try { localStorage.setItem(KEY, JSON.stringify(attend)); } catch (e) { /* bỏ qua */ } };

  const session = {};      // { [eventId]: { scanAt } }
  let pending = false;     // đã quét hợp lệ, đang chờ gửi ảnh
  let stream = null;
  let timer = null;
  const uploadDefault = els.uploadInner.innerHTML;

  const registered = events.filter((e) => myRegs[e.id] === "registered").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const current = () => Q.byId(els.select.value);
  const nowHM = () => { const n = new Date(); return Q.pad(n.getHours()) + ":" + Q.pad(n.getMinutes()); };
  const toMin = (hm) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };
  const shortDate = (ev) => { const d = Q.parseDate(ev.date); return Q.pad(d.getDate()) + "/" + Q.pad(d.getMonth() + 1); };

  /* ---------- Thông báo ---------- */
  function setMsg(type, text) {
    ["warn", "ok", "err"].forEach((k) => { els[k].hidden = true; });
    if (type) { els[type].textContent = text; els[type].hidden = false; }
  }

  /* ---------- Hiển thị ---------- */
  function renderEventStatus() {
    const ev = current();
    const s = Q.statusOf(ev);
    els.status.className = "tag status-pill " + (s === "ongoing" ? "tag-live" : "tag-soon");
    els.status.textContent = s === "ongoing" ? "Đang diễn ra" : "Sắp diễn ra, chưa đến ngày điểm danh";
  }

  function renderSteps() {
    const done = !!attend[els.select.value];
    const active = done ? 3 : pending ? 2 : 1;
    els.steps.querySelectorAll(".step").forEach((li) => {
      const n = Number(li.dataset.step);
      const isDone = done ? true : n < active;
      li.classList.toggle("is-done", isDone);
      li.classList.toggle("is-active", !isDone && n === active);
    });
  }

  function renderStatusList() {
    const ev = current();
    const a = attend[ev.id];
    const scanAt = a ? a.scanAt : session[ev.id] && session[ev.id].scanAt;
    const rows = [
      ["Thông tin sự kiện", esc(ev.title) + " - " + Q.fmtDMY(Q.parseDate(ev.date)) + ", " + ev.time],
      ["Quét QR", scanAt ? "Đã quét lúc " + scanAt : "Chưa quét"],
      ["Ảnh xác nhận", a ? "Đã gửi - Chờ xác minh" : "Chưa gửi"],
      ["Kết quả", a ? a.result + " (lúc " + a.at + ")" : "Chưa điểm danh"],
    ];
    els.list.innerHTML = rows.map((r) => "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>").join("");
  }

  function renderAll() { renderEventStatus(); renderSteps(); renderStatusList(); }

  /* ---------- Camera ---------- */
  function stopCam() {
    clearInterval(timer); timer = null;
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    els.video.srcObject = null;
    els.camera.classList.remove("is-on");
    els.scanBtn.textContent = "Bắt đầu quét";
  }

  async function startCam() {
    setMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMsg("err", "Trình duyệt này không hỗ trợ camera hoặc trang chưa chạy trên https. Hãy mở bằng Chrome/Safari trên điện thoại, hoặc liên hệ ban tổ chức để được điểm danh thủ công.");
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      els.video.srcObject = stream;
      await els.video.play();
      els.camera.classList.add("is-on");
      els.scanBtn.textContent = "Dừng quét";
    } catch (e) {
      stopCam();
      setMsg("err", "Không truy cập được camera. Hãy cho phép trình duyệt dùng camera, hoặc liên hệ ban tổ chức để được điểm danh thủ công.");
      return;
    }

    if ("BarcodeDetector" in window) {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      timer = setInterval(async () => {
        try {
          const codes = await detector.detect(els.video);
          if (codes.length) handleScan(codes[0].rawValue);
        } catch (e) { /* bỏ qua khung hình lỗi */ }
      }, 300);
    } else {
      setMsg("warn", "Trình duyệt này chưa hỗ trợ đọc mã QR tự động. Hãy dùng Chrome trên Android, hoặc dùng mục “Thử nghiệm không cần camera” bên dưới.");
    }
  }

  els.scanBtn.addEventListener("click", () => (stream ? stopCam() : startCam()));

  /* ---------- Kiểm tra mã QR ---------- */
  // Trả về { ok:true } hoặc { ok:false, msg:"..." }
  function validate(payload) {
    const parts = String(payload).split("|");
    if (parts[0] !== "QNU" || parts.length < 3) return { ok: false, msg: "Đây không phải mã QR điểm danh của sự kiện. Hãy quét mã do ban tổ chức hiển thị." };
    if (parts[2] === "expired") return { ok: false, msg: "Mã QR đã hết hạn. Hãy nhờ ban tổ chức làm mới mã rồi quét lại." };

    const ev = Q.byId(parts[1]);
    if (!ev) return { ok: false, msg: "Không tìm thấy sự kiện của mã QR này." };
    if (!myRegs[ev.id] || myRegs[ev.id] === "cancelled") return { ok: false, msg: "Bạn chưa đăng ký sự kiện “" + ev.title + "” hoặc đã hủy đăng ký nên không thể điểm danh." };

    const sel = current();
    if (ev.id !== sel.id) return { ok: false, msg: "Mã QR này thuộc sự kiện khác. Hãy chọn đúng sự kiện “" + ev.title + "” hoặc quét đúng mã." };
    if (Q.statusOf(ev) !== "ongoing") return { ok: false, msg: "Chưa đến thời gian điểm danh của sự kiện này. Hãy quay lại vào ngày diễn ra sự kiện." };
    if (attend[ev.id]) return { ok: false, msg: "Bạn đã điểm danh sự kiện này lúc " + attend[ev.id].at + " rồi." };
    return { ok: true, ev };
  }

  function handleScan(payload) {
    stopCam();
    const r = validate(payload);
    if (!r.ok) { pending = false; setMsg("err", r.msg); renderAll(); return; }
    session[r.ev.id] = { scanAt: nowHM() };
    pending = true;
    setMsg("warn", "Đã quét QR hợp lệ. Vui lòng gửi ảnh xác nhận để hoàn tất điểm danh.");
    renderAll();
    openModal();
  }

  /* ---------- Hộp thoại xác nhận ---------- */
  function openModal() {
    els.fName.value = student.name;
    els.fMssv.value = student.mssv;
    els.fEvent.innerHTML = registered.map((e) => '<option value="' + e.id + '">' + esc(e.title) + " - " + e.time + "</option>").join("");
    els.fEvent.value = els.select.value;
    els.fEvent.disabled = true; // sự kiện đã được xác định bởi mã QR vừa quét
    els.fPhoto.value = "";
    els.photoErr.textContent = "";
    els.uploadInner.innerHTML = uploadDefault;
    els.backdrop.classList.add("is-open");
    els.fPhoto.focus();
  }

  function closeModal(cancelled) {
    if (!els.backdrop.classList.contains("is-open")) return;
    els.backdrop.classList.remove("is-open");
    if (cancelled) {
      pending = false;
      setMsg("warn", "Bạn chưa gửi ảnh minh chứng nên chưa được tính là đã điểm danh. Hãy quét lại mã QR để tiếp tục.");
      renderAll();
    }
  }

  els.close.addEventListener("click", () => closeModal(true));
  els.backdrop.addEventListener("click", (e) => { if (e.target === els.backdrop) closeModal(true); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(true); });

  els.fPhoto.addEventListener("change", () => {
    const f = els.fPhoto.files[0];
    els.photoErr.textContent = "";
    if (!f) { els.uploadInner.innerHTML = uploadDefault; return; }
    if (!f.type.startsWith("image/")) {
      els.fPhoto.value = "";
      els.photoErr.textContent = "Chỉ nhận file ảnh (JPG, PNG). Hãy chọn lại.";
      els.uploadInner.innerHTML = uploadDefault;
      return;
    }
    const url = URL.createObjectURL(f);
    els.uploadInner.innerHTML = '<img src="' + url + '" alt="Ảnh minh chứng đã chọn"><br><small>' + esc(f.name) + " (nhấn để đổi ảnh)</small>";
  });

  els.confirm.addEventListener("click", () => {
    if (!els.fPhoto.files[0]) { els.photoErr.textContent = "Vui lòng chọn ảnh minh chứng để hoàn tất điểm danh."; return; }
    const ev = current();
    const at = nowHM();
    const late = toMin(at) > toMin(ev.time);
    attend[ev.id] = { scanAt: session[ev.id].scanAt, at, result: late ? "Đến muộn" : "Đã điểm danh" };
    saveAttend();
    pending = false;
    closeModal(false);
    setMsg("ok", "Điểm danh thành công lúc " + at + " - Trạng thái: " + attend[ev.id].result);
    renderAll();
  });

  /* ---------- Chọn sự kiện + giả lập ---------- */
  els.select.innerHTML = registered.map((e) => '<option value="' + e.id + '">' + esc(e.title) + " - " + shortDate(e) + ", " + e.time + "</option>").join("");
  // Mặc định chọn sự kiện đang diễn ra (nếu có)
  const live = registered.find((e) => Q.statusOf(e) === "ongoing");
  if (live) els.select.value = live.id;

  els.select.addEventListener("change", () => { stopCam(); pending = false; setMsg(null); renderAll(); });

  document.querySelector(".demo").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sim]");
    if (!b) return;
    const sel = current();
    const other = registered.find((x) => x.id !== sel.id);
    const unreg = events.find((x) => !myRegs[x.id] && Q.statusOf(x) !== "ended");
    const payloads = {
      valid: "QNU|" + sel.id + "|ok",
      expired: "QNU|" + sel.id + "|expired",
      other: "QNU|" + other.id + "|ok",
      unreg: "QNU|" + unreg.id + "|ok",
      garbage: "https://example.com",
    };
    handleScan(payloads[b.dataset.sim]);
  });

  renderAll();
})();
