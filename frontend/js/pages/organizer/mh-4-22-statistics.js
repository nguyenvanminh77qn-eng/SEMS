// ==========================================
// MH 4.22 - Thống kê và báo cáo sự kiện được phân công
// (đi cùng css/mh-4-22-statistics.css)
//
// Gồm: bảng điểm danh (tìm kiếm, lọc, phân trang), đổi trạng thái điểm danh
//      tại chỗ, biểu đồ thống kê, nộp kết quả lên hệ thống.
// Mở từ trang chi tiết (MH 4.21) khi sự kiện đã kết thúc.
// Nút "Danh sách người đăng ký" mở MH 4.19.
// ==========================================

// Dữ liệu điểm danh mẫu cho các sự kiện đã kết thúc
// qr = điểm danh bằng mã QR, onsite = điểm danh tại chỗ (theo danh sách),
// late = đến muộn (QR), none = chưa điểm danh
const attendanceTemplates = {
    5: ["qr", "none", "none", "onsite", "late", "qr", "none", "qr", "late", "qr", "none"],
    3: ["qr", "qr", "none", "qr", "onsite", "late", "qr", "none", "qr", "qr", "none"]
};

const attendanceStore = {};

const attendanceStatusInfo = {
    present: { label: "Đã điểm danh",   cls: "status-present" },
    late:    { label: "Đến muộn",       cls: "status-late" },
    none:    { label: "Chưa điểm danh", cls: "status-none" },
    absent:  { label: "Vắng mặt",       cls: "status-absent" }
};

const attendancePerPage = 10;
let attendancePage = 1;


// ------------------------------------------
// Dữ liệu điểm danh của một sự kiện
// ------------------------------------------

function getAttendance(event) {

    if (!attendanceStore[event.id]) {

        const template = attendanceTemplates[event.id] || [];

        attendanceStore[event.id] = students.map((student, index) => {

            const type = template[index] || "none";

            let status = "none";
            let method = null;

            if (type === "qr") {
                status = "present";
                method = "qr";
            } else if (type === "onsite") {
                status = "present";
                method = "onsite";
            } else if (type === "late") {
                status = "late";
                method = "qr";
            } else if (event.submitted) {
                status = "absent";
            }

            return { studentId: student.id, status, method };
        });
    }

    return attendanceStore[event.id];
}


// ------------------------------------------
// Mở trang thống kê
// ------------------------------------------

function openStatistics() {

    if (!currentEvent || currentEvent.status !== "ended") {
        return;
    }

    showPage("statisticsPage");

    attendancePage = 1;

    document.getElementById("attendanceSearch").value = "";
    document.getElementById("attendanceFilter").value = "all";

    document.getElementById("statisticsEventName").textContent =
        `${currentEvent.name} · ${currentEvent.date}`;

    renderAttendance();
}


// ------------------------------------------
// Bảng điểm danh
// ------------------------------------------

function renderAttendance() {

    if (!currentEvent) return;

    const records = getAttendance(currentEvent);
    const locked = currentEvent.submitted;

    const keyword = document.getElementById("attendanceSearch")
        .value.toLowerCase().trim();

    const filter = document.getElementById("attendanceFilter").value;

    const rows = records
        .map(record => ({
            record,
            student: students.find(s => s.id === record.studentId)
        }))
        .filter(({ record, student }) => {

            const matchKeyword =
                student.name.toLowerCase().includes(keyword) ||
                student.id.includes(keyword);

            const matchStatus =
                filter === "all" || record.status === filter;

            return matchKeyword && matchStatus;
        });

    const totalPages = Math.max(1, Math.ceil(rows.length / attendancePerPage));

    if (attendancePage > totalPages) {
        attendancePage = totalPages;
    }

    const start = (attendancePage - 1) * attendancePerPage;

    const pageRows = rows.slice(start, start + attendancePerPage);

    const table = document.getElementById("attendanceTable");

    if (pageRows.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center">
                    Không tìm thấy sinh viên phù hợp.
                </td>
            </tr>
        `;

    } else {

        table.innerHTML = pageRows.map(({ record, student }, index) => {

            const info = attendanceStatusInfo[record.status];

            // Chưa nộp kết quả: được đổi "Chưa điểm danh" <-> "Đã điểm danh" (tại chỗ)
            const editable = !locked &&
                (record.status === "none" || record.method === "onsite");

            const statusCell = editable ? `
                <select class="status-select"
                    onchange="changeAttendanceStatus('${record.studentId}', this.value)">
                    <option value="none" ${record.status === "none" ? "selected" : ""}>Chưa điểm danh</option>
                    <option value="present" ${record.status === "present" ? "selected" : ""}>Đã điểm danh</option>
                </select>
            ` : `<span class="status-tag ${info.cls}">${info.label}</span>`;

            const evidence = record.method === "qr" ? `
                <span class="evidence-thumb" title="Ảnh minh chứng do sinh viên gửi">
                    <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                </span>
            ` : "";

            const note =
                record.method === "qr" ? "Mã QR" :
                record.method === "onsite" ? "Điểm danh tại chỗ" : "";

            return `
                <tr>
                    <td>${start + index + 1}</td>
                    <td>${student.name}</td>
                    <td>${student.id}</td>
                    <td>${student.className}</td>
                    <td>${student.faculty}</td>
                    <td>${statusCell}</td>
                    <td>${evidence}</td>
                    <td>${note}</td>
                </tr>
            `;

        }).join("");
    }

    document.getElementById("attendanceCount").textContent =
        `Hiển thị ${rows.length}/${records.length} sinh viên`;

    renderAttendancePagination(totalPages);
    renderAttendanceChart(records);
    updateSubmitState();
}


// ------------------------------------------
// Phân trang bảng điểm danh
// ------------------------------------------

function renderAttendancePagination(totalPages) {

    const box = document.getElementById("attendancePagination");

    if (totalPages <= 1) {
        box.innerHTML = "";
        return;
    }

    let html = `
        <button ${attendancePage === 1 ? "disabled" : ""}
            onclick="changeAttendancePage(${attendancePage - 1})">‹</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button class="${i === attendancePage ? "active" : ""}"
                onclick="changeAttendancePage(${i})">${i}</button>
        `;
    }

    html += `
        <button ${attendancePage === totalPages ? "disabled" : ""}
            onclick="changeAttendancePage(${attendancePage + 1})">›</button>
    `;

    box.innerHTML = html;
}

function changeAttendancePage(page) {
    attendancePage = page;
    renderAttendance();
}


// ------------------------------------------
// Biểu đồ cột: "Đã điểm danh" (gồm Đến muộn) so với "Vắng"
// (Chưa điểm danh + Vắng mặt). Tính trên toàn bộ danh sách,
// không phụ thuộc bộ lọc.
// ------------------------------------------

function renderAttendanceChart(records) {

    const total = records.length;

    const present = records.filter(r =>
        r.status === "present" || r.status === "late").length;

    const absent = total - present;

    const maxBar = 130;

    const column = (count, cls) => {

        const percent = total ? Math.round(count / total * 100) : 0;

        const height = total ? Math.round(count / total * maxBar) : 0;

        return `
            <div class="chart-col">
                <span class="chart-value">${count} (${percent}%)</span>
                <div class="chart-bar ${cls}" style="height:${height}px"></div>
            </div>
        `;
    };

    document.getElementById("attendanceChart").innerHTML =
        column(present, "bar-present") + column(absent, "bar-absent");
}


// ------------------------------------------
// Đổi trạng thái điểm danh tại chỗ
// ------------------------------------------

function changeAttendanceStatus(studentId, value) {

    if (!currentEvent || currentEvent.submitted) return;

    const record = getAttendance(currentEvent)
        .find(r => r.studentId === studentId);

    if (!record) return;

    if (value === "present") {
        record.status = "present";
        record.method = "onsite";
    } else {
        record.status = "none";
        record.method = null;
    }

    renderAttendance();
}


// ------------------------------------------
// Nộp kết quả lên hệ thống
// ------------------------------------------

function updateSubmitState() {

    const submitted = currentEvent.submitted;

    const button = document.getElementById("submitResultButton");

    button.disabled = submitted || currentEvent.status !== "ended";

    const pill = document.getElementById("submitState");

    pill.textContent = submitted ? "Đã nộp kết quả" : "Chưa nộp kết quả";

    pill.className = "submit-pill " + (submitted ? "done" : "pending");
}

function submitAttendance() {

    if (!currentEvent || currentEvent.status !== "ended" ||
        currentEvent.submitted) {
        return;
    }

    const records = getAttendance(currentEvent);

    const missing = records.filter(r => r.status === "none").length;

    const message = missing > 0
        ? `Còn ${missing} sinh viên chưa điểm danh, các sinh viên này sẽ được ghi nhận là "Vắng mặt". Sau khi nộp, kết quả sẽ bị khóa và không thể chỉnh sửa.`
        : "Sau khi nộp, kết quả điểm danh sẽ bị khóa và không thể chỉnh sửa.";

    openConfirm("Nộp kết quả điểm danh", message, "Nộp lên hệ thống", () => {

        records.forEach(record => {
            if (record.status === "none") {
                record.status = "absent";
            }
        });

        currentEvent.submitted = true;

        renderAttendance();

        showToast("Đã nộp kết quả điểm danh lên hệ thống.");
    });
}


// ------------------------------------------
// Tìm kiếm và lọc bảng điểm danh
// ------------------------------------------

document.getElementById("attendanceSearch").addEventListener("input", function () {

    attendancePage = 1;

    renderAttendance();
});

document.getElementById("attendanceFilter").addEventListener("change", function () {

    attendancePage = 1;

    renderAttendance();
});
