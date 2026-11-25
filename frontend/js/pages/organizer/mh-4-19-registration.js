// ==========================================
// MH 4.19 - Danh sách người đăng ký
// (đi cùng css/mh-4-19-registration.css)
//
// Gồm: bảng danh sách đăng ký, tìm kiếm, xuất Excel (CSV), xuất PDF.
// Trang này mở được từ MH 4.21 (trang chi tiết) hoặc MH 4.22 (thống kê);
// nút Quay lại về đúng nơi đã mở.
// ==========================================

let registrationFrom = "detail";

function showRegistrationPage(from) {
    if (!currentEvent) return;

    registrationFrom = (from === "statistics") ? "statistics" : "detail";

    showPage("registrationPage");
    renderStudents();
    updateExportButtons();
}

function backFromRegistration() {
    if (registrationFrom === "statistics") {
        showPage("statisticsPage");
    } else {
        showDetailPage();
    }
}


// ------------------------------------------
// Hiển thị danh sách sinh viên
// ------------------------------------------

function renderStudents() {

    const table = document.getElementById("studentTable");

    const keyword = document.getElementById("studentSearch")
        .value.toLowerCase().trim();

    const filteredStudents = students.filter(student => {

        return (
            student.name.toLowerCase().includes(keyword) ||
            student.id.includes(keyword) ||
            student.email.toLowerCase().includes(keyword)
        );
    });

    if (filteredStudents.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center">
                    Không tìm thấy sinh viên.
                </td>
            </tr>
        `;

    } else {

        table.innerHTML = filteredStudents.map((student, index) => {

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${student.name}</td>
                    <td>${student.id}</td>
                    <td>${student.email}</td>
                </tr>
            `;

        }).join("");
    }

    document.getElementById("studentCount").textContent =
        `Tìm thấy ${filteredStudents.length} sinh viên`;
}


// ------------------------------------------
// Khóa / mở nút xuất file theo trạng thái sự kiện
// (chỉ xuất được khi sự kiện đang diễn ra)
// ------------------------------------------

function updateExportButtons() {

    const canExport = currentEvent &&
        currentEvent.status === "ongoing";

    document.getElementById("exportExcel").disabled = !canExport;

    document.getElementById("exportPDF").disabled = !canExport;
}


// ------------------------------------------
// Xuất Excel (CSV)
// ------------------------------------------

function exportExcel() {

    if (!currentEvent || currentEvent.status !== "ongoing") {
        alert("Chỉ có thể xuất file khi sự kiện đang diễn ra.");
        return;
    }

    const rows = [
        ["STT", "Tên người dùng", "Mã sinh viên", "Email"]
    ];

    students.forEach((student, index) => {

        rows.push([
            index + 1,
            student.name,
            student.id,
            student.email
        ]);
    });

    const csvContent = "﻿" + rows.map(row =>

        row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(",")

    ).join("\n");

    const blob = new Blob(
        [csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Danh_sach_diem_danh.csv";

    link.click();

    URL.revokeObjectURL(url);
}


// ------------------------------------------
// Xuất PDF (mở cửa sổ in)
// ------------------------------------------

function exportPDF() {

    if (!currentEvent || currentEvent.status !== "ongoing") {
        alert("Chỉ có thể xuất file khi sự kiện đang diễn ra.");
        return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Trình duyệt đang chặn cửa sổ in. Hãy cho phép cửa sổ bật lên.");
        return;
    }

    const tableRows = students.map((student, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td>${student.email}</td>
        </tr>
    `).join("");

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Danh sách điểm danh</title>
            <style>
                body {
                    font-family: Arial;
                    padding: 30px;
                }
                h2, p {
                    text-align: center;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 25px;
                }
                th, td {
                    border: 1px solid #777;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background: #dce2ed;
                }
            </style>
        </head>
        <body>
            <h2>DANH SÁCH ĐIỂM DANH</h2>
            <p>${currentEvent.name}</p>
            <p>${currentEvent.date}</p>

            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên người dùng</th>
                        <th>Mã sinh viên</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.print();
    };
}


// ------------------------------------------
// Tìm kiếm sinh viên
// ------------------------------------------

document.getElementById("studentSearch").addEventListener("input", function () {

    renderStudents();
});
