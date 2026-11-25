// ==========================================
// UI - Hộp thoại xác nhận và thông báo nhỏ (toast)
// Dùng chung: openConfirm() và showToast() được gọi từ nhiều màn hình.
// ==========================================

// ------------------------------------------
// Hộp thoại xác nhận
// ------------------------------------------

let confirmCallback = null;

function openConfirm(title, message, okText, onOk) {

    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;
    document.getElementById("confirmOk").textContent = okText || "Xác nhận";

    confirmCallback = onOk;

    document.getElementById("confirmModal").classList.add("show");
}

function closeConfirm() {

    document.getElementById("confirmModal").classList.remove("show");

    confirmCallback = null;
}

document.getElementById("confirmOk").addEventListener("click", function () {

    const callback = confirmCallback;

    closeConfirm();

    if (callback) callback();
});

document.getElementById("confirmModal").addEventListener("click", function (e) {

    if (e.target === this) {
        closeConfirm();
    }
});


// ------------------------------------------
// Thông báo nhỏ ở cuối màn hình
// ------------------------------------------

let toastTimer = null;

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}
