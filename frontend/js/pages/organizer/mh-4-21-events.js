// ==========================================
// MH 4.21 - Danh sách sự kiện được phân công và chi tiết sự kiện
// (đi cùng css/mh-4-21-events.css)
//
// Gồm: danh sách thẻ sự kiện, tìm kiếm, lọc theo trạng thái,
//      phân trang, trang chi tiết sự kiện.
// Từ trang chi tiết đi tiếp sang:
//      - MH 4.19 (showRegistrationPage)  khi sự kiện chưa kết thúc
//      - MH 4.22 (openStatistics)        khi sự kiện đã kết thúc
//      - MH 4.20 (openQRModal)           khi sự kiện đang diễn ra
// ==========================================

let currentPage = 1;
const eventsPerPage = 4;


// ------------------------------------------
// Hiển thị danh sách sự kiện
// ------------------------------------------

function renderEvents() {

    const eventList = document.getElementById("eventList");

    const keyword = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const filter = document.getElementById("statusFilter").value;

    let filteredEvents = events.filter(event => {

        const matchName = event.name.toLowerCase().includes(keyword);

        const matchStatus =
            filter === "all" || event.status === filter;

        return matchName && matchStatus;
    });

    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }

    const startIndex = (currentPage - 1) * eventsPerPage;

    const displayedEvents = filteredEvents.slice(
        startIndex,
        startIndex + eventsPerPage
    );

    if (displayedEvents.length === 0) {

        eventList.innerHTML = `
            <div class="empty-message">
                Không tìm thấy sự kiện phù hợp.
            </div>
        `;

    } else {

        eventList.innerHTML = displayedEvents.map(event => {

            return `
                <article class="event-card"
                    onclick="openEventDetail(${event.id})">

                    <div class="event-cover">

                        <span class="cover-text">
                            ${event.coverText}
                        </span>

                        <span class="status-badge ${getStatusClass(event.status)}">
                            ${getStatusName(event.status)}
                        </span>

                    </div>

                    <div class="event-content">

                        <h3>${event.name}</h3>

                        <div class="event-info">
                            <span class="info-icon">▦</span>
                            <span>
                                ${event.date} |
                                ${event.start} - ${event.end}
                            </span>
                        </div>

                        <div class="event-info">
                            <span class="info-icon">⚲</span>
                            <span>${event.location}</span>
                        </div>

                        <div class="event-info">
                            <span class="info-icon">♙</span>
                            <span>
                                ${event.registered} người đăng ký /
                                ${event.maximum} người tối đa
                            </span>
                        </div>

                    </div>

                </article>
            `;

        }).join("");
    }

    renderPagination(totalPages);
}


// ------------------------------------------
// Phân trang danh sách sự kiện
// ------------------------------------------

function renderPagination(totalPages) {

    const pagination = document.getElementById("pagination");

    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    let html = "";

    for (let i = 1; i <= totalPages; i++) {

        html += `
            <button
                class="${currentPage === i ? "active" : ""}"
                onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderEvents();
}


// ------------------------------------------
// Mở chi tiết sự kiện
// ------------------------------------------

function openEventDetail(eventId) {

    currentEvent = events.find(event => event.id === eventId);

    if (!currentEvent) return;

    showPage("detailPage");

    document.getElementById("detailName").textContent =
        currentEvent.name;

    document.getElementById("detailCoverText").textContent =
        currentEvent.coverText;

    const status = document.getElementById("detailStatus");

    status.textContent = getStatusName(currentEvent.status);

    status.className =
        "status-badge " + getStatusClass(currentEvent.status);

    document.getElementById("detailDescription").textContent =
        currentEvent.description;

    document.getElementById("detailTime").textContent =
        `${currentEvent.date} | ${currentEvent.start} - ${currentEvent.end}`;

    document.getElementById("detailLocation").textContent =
        currentEvent.location;

    document.getElementById("detailOrganizer").textContent =
        currentEvent.organizer;

    const percentage = Math.min(
        100,
        Math.round(
            currentEvent.registered / currentEvent.maximum * 100
        )
    );

    document.getElementById("detailProgress").style.width =
        percentage + "%";

    // Nút số lượng người tham gia đổi theo trạng thái

    const participantButton =
        document.getElementById("participantButton");

    if (currentEvent.status === "ended") {

        participantButton.textContent = "Xem thống kê →";

        participantButton.onclick = openStatistics;           // MH 4.22

    } else {

        participantButton.textContent =
            `${currentEvent.registered}/${currentEvent.maximum} người đăng ký →`;

        participantButton.onclick =
            () => showRegistrationPage("detail");              // MH 4.19
    }

    // Chỉ hiện nút QR khi sự kiện đang diễn ra (MH 4.20)

    const qrAction = document.getElementById("qrAction");

    if (currentEvent.status === "ongoing") {
        qrAction.style.display = "block";
    } else {
        qrAction.style.display = "none";
    }
}


// ------------------------------------------
// Tìm kiếm và lọc sự kiện
// ------------------------------------------

document.getElementById("searchInput").addEventListener("input", function () {

    currentPage = 1;

    renderEvents();
});

document.getElementById("statusFilter").addEventListener("change", function () {

    currentPage = 1;

    renderEvents();
});
