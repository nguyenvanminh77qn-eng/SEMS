// ==========================================
// CORE - Trạng thái dùng chung, đồng hồ, chuyển trang
// Mọi màn hình đều dùng file này. Không đặt logic riêng của một màn hình vào đây.
// ==========================================

// Sự kiện đang được mở (các màn hình 4.19, 4.20, 4.22 đều đọc biến này)
let currentEvent = null;


// ------------------------------------------
// Hiển thị ngày và giờ trên header
// ------------------------------------------

function updateClock() {
    const now = new Date();

    document.getElementById("currentDate").textContent =
        now.toLocaleDateString("vi-VN");

    document.getElementById("currentTime").textContent =
        now.toLocaleTimeString("vi-VN");
}

updateClock();
setInterval(updateClock, 1000);


// ------------------------------------------
// Chuyển đổi trang
// ------------------------------------------

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showEventPage() {
    showPage("eventPage");
    renderEvents();            // js/mh-4-21-events.js
}

function showDetailPage() {
    if (currentEvent) {
        showPage("detailPage");
    }
}


// ------------------------------------------
// Tên và màu của trạng thái sự kiện
// ------------------------------------------

function getStatusName(status) {

    const statusNames = {
        upcoming: "Chưa diễn ra",
        ongoing: "Đang diễn ra",
        ended: "Đã kết thúc"
    };

    return statusNames[status];
}

function getStatusClass(status) {

    const statusClasses = {
        upcoming: "status-upcoming",
        ongoing: "status-ongoing",
        ended: "status-ended"
    };

    return statusClasses[status];
}
