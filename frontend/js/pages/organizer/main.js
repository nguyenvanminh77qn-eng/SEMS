// ==========================================
// MAIN - Khởi chạy website (nạp SAU CÙNG)
// Chỉ chứa việc khởi tạo và sự kiện toàn cục, không chứa logic của màn hình nào.
// ==========================================

// Nhấn Esc để đóng menu và hộp thoại xác nhận

document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {
        closeMenus();      // js/header.js
        closeConfirm();    // js/ui.js
    }
});


// Khởi chạy

document.getElementById("accountName").textContent = organizerName;

renderNotifications();

renderEvents();
