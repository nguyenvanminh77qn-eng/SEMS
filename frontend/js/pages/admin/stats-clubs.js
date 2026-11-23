/**
 * LOGIC THỐNG KÊ CLB/ĐƠN VỊ (MH-28)
 * Lọc thời gian thực & Xem thêm mượt mà KHÔNG giật khung hình
 */

const CLUBS_YEAR_DATA = {
  '2023': {
    kpi: { count: '150', events: '750', students: '12,500' },
    top5: [
      { label: 'CLB Tình nguyện Xanh', value: 1200 },
      { label: 'Đội Văn nghệ Sinh viên', value: 950 },
      { label: 'CLB Tin học', value: 880 },
      { label: 'Hội Sinh viên', value: 720 },
      { label: 'CLB Tiếng Anh', value: 650 }
    ],
    ranking: [
      { rank: 1, name: 'CLB Tình nguyện Xanh', events: 25, students: 1200, rate: '85%' },
      { rank: 2, name: 'Đội Văn nghệ Sinh viên', events: 18, students: 950, rate: '78%' },
      { rank: 3, name: 'CLB Tin học', events: 20, students: 880, rate: '75%' },
      { rank: 4, name: 'Hội Sinh viên', events: 15, students: 720, rate: '70%' },
      { rank: 5, name: 'CLB Tiếng Anh', events: 22, students: 650, rate: '68%' },
      { rank: 6, name: 'CLB Kỹ năng mềm', events: 14, students: 580, rate: '65%' },
      { rank: 7, name: 'CLB Sách & Hành động', events: 12, students: 520, rate: '64%' },
      { rank: 8, name: 'CLB Thể thao & Cầu lông', events: 16, students: 490, rate: '62%' },
      { rank: 9, name: 'CLB Robot & Tự động hóa', events: 10, students: 430, rate: '60%' },
      { rank: 10, name: 'Đội Công tác Xã hội', events: 11, students: 390, rate: '58%' },
      { rank: 11, name: 'CLB Guitar & Âm nhạc', events: 9, students: 350, rate: '56%' },
      { rank: 12, name: 'CLB Nhiếp ảnh & Truyền thông', events: 8, students: 310, rate: '55%' },
      { rank: 13, name: 'CLB Môi trường Xanh', events: 7, students: 280, rate: '53%' },
      { rank: 14, name: 'CLB Bóng rổ Sinh viên', events: 6, students: 240, rate: '50%' },
      { rank: 15, name: 'CLB Hóa học Trẻ', events: 5, students: 190, rate: '48%' }
    ]
  },
  '2024': {
    kpi: { count: '168', events: '890', students: '15,200' },
    top5: [
      { label: 'CLB Tin học', value: 1350 },
      { label: 'CLB Tình nguyện Xanh', value: 1280 },
      { label: 'Đội Văn nghệ Sinh viên', value: 1100 },
      { label: 'CLB Robot & AI', value: 920 },
      { label: 'Hội Sinh viên', value: 850 }
    ],
    ranking: [
      { rank: 1, name: 'CLB Tin học', events: 30, students: 1350, rate: '92%' },
      { rank: 2, name: 'CLB Tình nguyện Xanh', events: 28, students: 1280, rate: '88%' },
      { rank: 3, name: 'Đội Văn nghệ Sinh viên', events: 22, students: 1100, rate: '82%' },
      { rank: 4, name: 'CLB Robot & AI', events: 20, students: 920, rate: '80%' },
      { rank: 5, name: 'Hội Sinh viên', events: 18, students: 850, rate: '76%' },
      { rank: 6, name: 'CLB Tiếng Anh', events: 24, students: 810, rate: '74%' },
      { rank: 7, name: 'CLB Khởi nghiệp Trẻ', events: 15, students: 640, rate: '70%' },
      { rank: 8, name: 'CLB Thể thao', events: 18, students: 580, rate: '68%' }
    ]
  },
  '2022': {
    kpi: { count: '135', events: '620', students: '10,100' },
    top5: [
      { label: 'Đội Văn nghệ Sinh viên', value: 1050 },
      { label: 'CLB Tình nguyện Xanh', value: 980 },
      { label: 'Hội Sinh viên', value: 750 },
      { label: 'CLB Tiếng Anh', value: 620 },
      { label: 'CLB Tin học', value: 580 }
    ],
    ranking: [
      { rank: 1, name: 'Đội Văn nghệ Sinh viên', events: 20, students: 1050, rate: '80%' },
      { rank: 2, name: 'CLB Tình nguyện Xanh', events: 22, students: 980, rate: '79%' },
      { rank: 3, name: 'Hội Sinh viên', events: 14, students: 750, rate: '72%' },
      { rank: 4, name: 'CLB Tiếng Anh', events: 18, students: 620, rate: '66%' },
      { rank: 5, name: 'CLB Tin học', events: 15, students: 580, rate: '64%' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const selYear = document.getElementById('clubYearSelect');
  const selSemester = document.getElementById('clubSemesterSelect');
  const selMonth = document.getElementById('clubMonthSelect');
  const btnFilter = document.getElementById('btnFilterSubmit');
  const btnReset = document.getElementById('btnResetFilter');

  const kpiCount = document.getElementById('kpiClubsCount');
  const kpiEvents = document.getElementById('kpiClubsEvents');
  const kpiStudents = document.getElementById('kpiClubsStudents');

  const tbody = document.getElementById('clubsRankingTableBody');
  const btnShowMore = document.getElementById('btnShowMore');

  let currentClubs = [];
  let renderedCount = 0;
  const STEP = 5;

  function createRowElement(club) {
    const tr = document.createElement('tr');
    tr.className = 'table-row-new';
    tr.innerHTML = `
      <td>${club.rank}</td>
      <td>${club.name}</td>
      <td>${club.events}</td>
      <td>${club.students}</td>
      <td>${club.rate}</td>
    `;
    return tr;
  }

  function applyFilter() {
    const year = selYear.value || '2023';
    const dataYear = CLUBS_YEAR_DATA[year] || CLUBS_YEAR_DATA['2023'];

    kpiCount.textContent = dataYear.kpi.count;
    kpiEvents.textContent = dataYear.kpi.events;
    kpiStudents.textContent = dataYear.kpi.students;

    // Render animated horizontal bar chart
    SEMSCharts.renderHorizontalBarChart('clubsParticipationChart', {
      data: dataYear.top5,
      maxVal: 1400
    });

    currentClubs = dataYear.ranking;
    tbody.innerHTML = '';
    renderedCount = 0;
    loadMore();
  }

  function loadMore() {
    const nextBatch = currentClubs.slice(renderedCount, renderedCount + STEP);
    nextBatch.forEach(item => {
      tbody.appendChild(createRowElement(item));
    });
    renderedCount += nextBatch.length;

    if (renderedCount >= currentClubs.length) {
      btnShowMore.textContent = `Đã hiển thị tất cả (${currentClubs.length}/${currentClubs.length})`;
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
