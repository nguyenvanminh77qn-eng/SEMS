/**
 * LOGIC TỶ LỆ ĐĂNG KÝ/THỰC TẾ & ĐÁNH GIÁ (MH-29)
 * Lọc thời gian thực, Animation biểu đồ & Xem thêm mượt mà KHÔNG giật khung hình
 */

const REG_YEAR_DATA = {
  '2023': {
    kpi: { total: 1200, attended: 950, rating: 4.2 },
    regVsAtt: [
      { label: 'Sự kiện A', val1: 325, val2: 235 },
      { label: 'Sự kiện B', val1: 325, val2: 280 },
      { label: 'Sự kiện C', val1: 250, val2: 140 }
    ],
    rating: [
      { label: 'Sự kiện A', score: 3.0 },
      { label: 'Sự kiện B', score: 4.6 },
      { label: 'Sự kiện C', score: 1.1 },
      { label: 'Sự kiện D', score: 4.1 }
    ],
    events: [
      { name: 'Hội thảo Khoa học 2023', registered: 250, attended: 200, rate: '80%', rating: 4.5 },
      { name: 'Ngày hội việc làm', registered: 300, attended: 280, rate: '93%', rating: 4.0 },
      { name: 'Cuộc thi Sáng tạo Công nghệ', registered: 150, attended: 120, rate: '80%', rating: 4.8 },
      { name: 'Workshop Kỹ năng mềm', registered: 400, attended: 300, rate: '75%', rating: 3.9 },
      { name: 'Chương trình Tình nguyện Xanh', registered: 100, attended: 50, rate: '50%', rating: 4.1 },
      { name: 'Giải Bóng đá Sinh viên Toàn trường', registered: 220, attended: 210, rate: '95.5%', rating: 4.7 },
      { name: 'Tọa đàm Gặp gỡ Doanh nghiệp IT', registered: 180, attended: 165, rate: '91.7%', rating: 4.3 },
      { name: 'Diễn đàn Khởi nghiệp Đổi mới sáng tạo', registered: 130, attended: 115, rate: '88.5%', rating: 4.2 },
      { name: 'Ngày hội Hiến máu Giọt hồng Tri ân', registered: 350, attended: 320, rate: '91.4%', rating: 4.9 },
      { name: 'Hội thi Tiếng hát Sinh viên', registered: 280, attended: 260, rate: '92.9%', rating: 4.6 },
      { name: 'Workshop Lập trình ứng dụng Web & AI', registered: 190, attended: 175, rate: '92.1%', rating: 4.4 },
      { name: 'Cuộc thi Thiết kế UI/UX', registered: 110, attended: 95, rate: '86.4%', rating: 4.5 },
      { name: 'Chiến dịch Mùa hè xanh tình nguyện', registered: 260, attended: 245, rate: '94.2%', rating: 4.8 },
      { name: 'Hội thảo Du học & Học bổng Quốc tế', registered: 160, attended: 140, rate: '87.5%', rating: 4.1 },
      { name: 'Lễ hội Văn hóa Quốc tế', registered: 420, attended: 390, rate: '92.9%', rating: 4.7 }
    ]
  },
  '2024': {
    kpi: { total: 1540, attended: 1320, rating: 4.5 },
    regVsAtt: [
      { label: 'Sự kiện 1', val1: 380, val2: 340 },
      { label: 'Sự kiện 2', val1: 350, val2: 310 },
      { label: 'Sự kiện 3', val1: 290, val2: 260 }
    ],
    rating: [
      { label: 'Sự kiện 1', score: 4.2 },
      { label: 'Sự kiện 2', score: 4.8 },
      { label: 'Sự kiện 3', score: 3.8 },
      { label: 'Sự kiện 4', score: 4.6 }
    ],
    events: [
      { name: 'Ngày hội Đổi mới sáng tạo AI 2024', registered: 380, attended: 340, rate: '89.5%', rating: 4.6 },
      { name: 'Olympic Tin học Toàn quốc', registered: 210, attended: 195, rate: '92.8%', rating: 4.8 },
      { name: 'Ngày hội Việc làm Công nghệ TechJob', registered: 450, attended: 420, rate: '93.3%', rating: 4.4 }
    ]
  },
  '2022': {
    kpi: { total: 980, attended: 760, rating: 4.0 },
    regVsAtt: [
      { label: 'Sự kiện X', val1: 280, val2: 210 },
      { label: 'Sự kiện Y', val1: 300, val2: 240 },
      { label: 'Sự kiện Z', val1: 220, val2: 160 }
    ],
    rating: [
      { label: 'Sự kiện X', score: 3.5 },
      { label: 'Sự kiện Y', score: 4.2 },
      { label: 'Sự kiện Z', score: 2.8 },
      { label: 'Sự kiện W', score: 3.9 }
    ],
    events: [
      { name: 'Hội nghị Khoa học Trẻ 2022', registered: 200, attended: 160, rate: '80%', rating: 4.1 },
      { name: 'Giải Chạy Sinh viên Khỏe', registered: 350, attended: 300, rate: '85.7%', rating: 4.3 }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const selYear = document.getElementById('regYearSelect');
  const selSemester = document.getElementById('regSemesterSelect');
  const selMonth = document.getElementById('regMonthSelect');
  const btnFilter = document.getElementById('btnFilterSubmit');
  const btnReset = document.getElementById('btnResetFilter');

  const kpiTotal = document.getElementById('kpiRegTotal');
  const kpiAttended = document.getElementById('kpiRegAttended');
  const kpiRating = document.getElementById('kpiRegRating');

  const tbody = document.getElementById('regEventsTableBody');
  const btnShowMore = document.getElementById('btnShowMore');

  let currentEvents = [];
  let renderedCount = 0;
  const STEP = 5;

  function createRowElement(item) {
    const tr = document.createElement('tr');
    tr.className = 'table-row-new';
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.registered}</td>
      <td>${item.attended}</td>
      <td>${item.rate}</td>
      <td>${item.rating.toFixed(1)}</td>
    `;
    return tr;
  }

  function applyFilter() {
    const year = selYear.value || '2023';
    const dataYear = REG_YEAR_DATA[year] || REG_YEAR_DATA['2023'];

    kpiTotal.textContent = dataYear.kpi.total;
    kpiAttended.textContent = dataYear.kpi.attended;
    kpiRating.textContent = dataYear.kpi.rating;

    // Dual charts with measured animation
    SEMSCharts.renderGroupedBarChart('regVsAttChart', {
      data: dataYear.regVsAtt,
      yMax: 400,
      yStep: 50,
      height: 290
    });

    SEMSCharts.renderScoreBarChart('ratingChart', {
      data: dataYear.rating,
      yMax: 5,
      height: 290
    });

    currentEvents = dataYear.events;
    tbody.innerHTML = '';
    renderedCount = 0;
    loadMore();
  }

  function loadMore() {
    const nextBatch = currentEvents.slice(renderedCount, renderedCount + STEP);
    nextBatch.forEach(item => {
      tbody.appendChild(createRowElement(item));
    });
    renderedCount += nextBatch.length;

    if (renderedCount >= currentEvents.length) {
      btnShowMore.textContent = `Đã hiển thị tất cả (${currentEvents.length}/${currentEvents.length})`;
      btnShowMore.disabled = true;
      btnShowMore.style.opacity = '0.7';
    } else {
      btnShowMore.textContent = 'Xem thêm';
      btnShowMore.disabled = false;
      btnShowMore.style.opacity = '1';
    }
  }

  btnShowMore.addEventListener('click', loadMore);
  btnFilter.addEventListener('click', applyFilter);
  selYear.addEventListener('change', applyFilter);
  selSemester.addEventListener('change', applyFilter);
  selMonth.addEventListener('change', applyFilter);

  btnReset.addEventListener('click', () => {
    selYear.value = '2023';
    selSemester.value = '';
    selMonth.value = '';
    applyFilter();
  });

  // Initial load
  applyFilter();
});
