// ==========================================
// MH 4.20 - Hiển thị mã QR điểm danh tại địa điểm tổ chức
// (đi cùng css/mh-4-20-qr.css)
//
// Gồm: mở/đóng hộp thoại QR, tạo mã QR mới, đếm ngược 10 phút tự làm mới.
// Nút mở QR nằm ở trang chi tiết (MH 4.21), chỉ hiện khi sự kiện đang diễn ra.
// Cần thư viện qrcode.js (nạp từ CDN trong index.html).
// ==========================================

let qrTimer = null;
let qrCountdownTimer = null;
let qrSeconds = 600;


// ------------------------------------------
// Mở cửa sổ QR
// ------------------------------------------

function openQRModal() {

    if (!currentEvent || currentEvent.status !== "ongoing") {
        return;
    }

    const modal = document.getElementById("qrModal");

    modal.classList.add("show");

    document.getElementById("qrEventName").textContent =
        currentEvent.name;

    refreshQR();

    // Tự động tải lại mã sau mỗi 10 phút

    clearInterval(qrTimer);

    qrTimer = setInterval(() => {
        refreshQR();
    }, 10 * 60 * 1000);
}


// ------------------------------------------
// Tạo và tải lại QR
// ------------------------------------------

function refreshQR() {

    if (!currentEvent || currentEvent.status !== "ongoing") {
        return;
    }

    const qrContainer = document.getElementById("qrcode");

    qrContainer.innerHTML = "";

    const qrData = JSON.stringify({
        eventId: currentEvent.id,
        eventName: currentEvent.name,
        token: crypto.randomUUID(),
        createdAt: new Date().toISOString()
    });

    if (typeof QRCode === "undefined") {

        qrContainer.textContent =
            "Không tải được thư viện QR. Vui lòng kiểm tra kết nối Internet.";

        return;
    }

    new QRCode(qrContainer, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#113163",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Đặt lại thời gian đếm ngược

    qrSeconds = 600;

    clearInterval(qrCountdownTimer);

    updateCountdown();

    qrCountdownTimer = setInterval(updateCountdown, 1000);
}


// ------------------------------------------
// Đếm ngược 10 phút
// ------------------------------------------

function updateCountdown() {

    const countdown =
        document.getElementById("qrCountdown");

    const minutes = Math.floor(qrSeconds / 60);

    const seconds = qrSeconds % 60;

    countdown.textContent =
        `Tự làm mới sau ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (qrSeconds > 0) {
        qrSeconds--;
    }
}


// ------------------------------------------
// Đóng cửa sổ QR
// ------------------------------------------

function closeQRModal() {

    document.getElementById("qrModal").classList.remove("show");

    clearInterval(qrTimer);

    clearInterval(qrCountdownTimer);
}

// Bấm ra ngoài cửa sổ QR để đóng

document.getElementById("qrModal").addEventListener("click", function (e) {

    if (e.target === this) {
        closeQRModal();
    }
});
