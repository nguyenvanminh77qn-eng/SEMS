// ==========================================
// HEADER - Thông báo, menu tài khoản, đăng xuất
// (đi cùng css/header.css)
// ==========================================

// Tên tài khoản Organizer hiển thị trong menu avatar (có thể đổi tùy ý)
const organizerName = "Trần Minh Khoa";

const notifications = [
    {
        text: "Sự kiện “Tập huấn kỹ năng mềm cho sinh viên” đang diễn ra hôm nay.",
        time: "16/11/2026 08:00",
        eventId: 6,
        read: false
    },
    {
        text: "“Hội thảo Định hướng nghề nghiệp ngành CNTT” có thêm 12 sinh viên đăng ký.",
        time: "15/11/2026 20:15",
        eventId: 2,
        read: false
    },
    {
        text: "Sự kiện “Ngày hội Chào đón Tân sinh viên” đang diễn ra. Mã QR điểm danh đã sẵn sàng.",
        time: "12/11/2026 07:00",
        eventId: 1,
        read: false
    },
    {
        text: "Sự kiện “Hội thao sinh viên năm 2026” đã kết thúc. Hãy hoàn tất điểm danh và nộp kết quả.",
        time: "01/11/2026 17:00",
        eventId: 5,
        read: false
    }
];


// ------------------------------------------
// Thông báo
// ------------------------------------------

function renderNotifications() {

    const list = document.getElementById("notifyList");

    if (notifications.length === 0) {
        list.innerHTML = `<div class="notify-empty">Chưa có thông báo nào.</div>`;
    } else {
        list.innerHTML = notifications.map((n, index) => `
            <button class="notify-item ${n.read ? "" : "unread"}"
                onclick="openNotification(${index})">
                <span class="notify-dot"></span>
                <span>
                    <span class="notify-text">${n.text}</span>
                    <span class="notify-time">${n.time}</span>
                </span>
            </button>
        `).join("");
    }

    const unread = notifications.filter(n => !n.read).length;

    const badge = document.getElementById("notifyBadge");

    badge.textContent = unread;
    badge.classList.toggle("hidden", unread === 0);
}

function openNotification(index) {

    const notification = notifications[index];

    notification.read = true;

    renderNotifications();

    closeMenus();

    openEventDetail(notification.eventId);   // js/mh-4-21-events.js
}

function markAllNotificationsRead() {

    notifications.forEach(n => n.read = true);

    renderNotifications();
}


// ------------------------------------------
// Menu thả xuống (thông báo / tài khoản)
// ------------------------------------------

function toggleMenu(menuId, event) {

    event.stopPropagation();

    const menu = document.getElementById(menuId);

    const willOpen = !menu.classList.contains("show");

    closeMenus();

    if (willOpen) {
        menu.classList.add("show");
    }
}

function closeMenus() {

    document.querySelectorAll(".dropdown.show").forEach(menu => {
        menu.classList.remove("show");
    });
}

// Bấm ra ngoài để đóng menu

document.addEventListener("click", function (e) {

    if (!e.target.closest(".dropdown")) {
        closeMenus();
    }
});


// ------------------------------------------
// Đăng xuất
// ------------------------------------------

function logout() {

    closeMenus();

    openConfirm(
        "Đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
        "Đăng xuất",
        () => {
            currentEvent = null;
            showEventPage();
            showToast("Đã đăng xuất (bản demo chưa có trang đăng nhập).");
        }
    );
}
