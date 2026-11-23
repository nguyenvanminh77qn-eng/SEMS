/**
 * LOGIC THỐNG KÊ SỐ SỰ KIỆN (MH-26)
 * Lọc dữ liệu thời gian thực (Năm, Học kỳ, Tháng) & Cập nhật KPI, Biểu đồ, Bảng chi tiết
 */

// Dữ liệu theo từng năm
const YEAR_DATA = {
  '2023': {
    kpi: { total: 120, past: 85, upcoming: 35 },
    months: [
      { month: 'Tháng 1', total: 10, past: 8, upcoming: 2, cancelled: 0, chartVal: 95, semester: 1 },
      { month: 'Tháng 2', total: 12, past: 10, upcoming: 2, cancelled: 0, chartVal: 55, semester: 1 },
      { month: 'Tháng 3', total: 8, past: 5, upcoming: 3, cancelled: 0, chartVal: 90, semester: 1 },
      { month: 'Tháng 4', total: 15, past: 12, upcoming: 3, cancelled: 0, chartVal: 45, semester: 1 },
      { month: 'Tháng 5', total: 11, past: 9, upcoming: 2, cancelled: 0, chartVal: 20, semester: 1 },
      { month: 'Tháng 6', total: 14, past: 10, upcoming: 4, cancelled: 0, chartVal: 80, semester: 1 },
      { month: 'Tháng 7', total: 9, past: 7, upcoming: 2, cancelled: 0, chartVal: 75, semester: 2 },
      { month: 'Tháng 8', total: 13, past: 11, upcoming: 2, cancelled: 0, chartVal: 85, semester: 2 },
      { month: 'Tháng 9', total: 10, past: 8, upcoming: 2, cancelled: 0, chartVal: 5, semester: 2 },
      { month: 'Tháng 10', total: 16, past: 14, upcoming: 2, cancelled: 0, chartVal: 3, semester: 2 },
      { month: 'Tháng 11', total: 11, past: 9, upcoming: 2, cancelled: 0, chartVal: 0, semester: 2 },
      { month: 'Tháng 12', total: 10, past: 7, upcoming: 3, cancelled: 0, chartVal: 78, semester: 2 }
    ]
  },
  '2024': {
    kpi: { total: 142, past: 110, upcoming: 32 },
    months: [
      { month: 'Tháng 1', total: 12, past: 10, upcoming: 2, cancelled: 0, chartVal: 85, semester: 1 },
      { month: 'Tháng 2', total: 14, past: 12, upcoming: 2, cancelled: 0, chartVal: 70, semester: 1 },
      { month: 'Tháng 3', total: 15, past: 12, upcoming: 3, cancelled: 0, chartVal: 95, semester: 1 },
      { month: 'Tháng 4', total: 18, past: 15, upcoming: 3, cancelled: 0, chartVal: 65, semester: 1 },
      { month: 'Tháng 5', total: 13, past: 10, upcoming: 3, cancelled: 0, chartVal: 40, semester: 1 },
      { month: 'Tháng 6', total: 16, past: 12, upcoming: 4, cancelled: 0, chartVal: 90, semester: 1 },
      { month: 'Tháng 7', total: 10, past: 8, upcoming: 2, cancelled: 0, chartVal: 60, semester: 2 },
      { month: 'Tháng 8', total: 12, past: 10, upcoming: 2, cancelled: 0, chartVal: 70, semester: 2 },
      { month: 'Tháng 9', total: 11, past: 9, upcoming: 2, cancelled: 0, chartVal: 50, semester: 2 },
      { month: 'Tháng 10', total: 14, past: 11, upcoming: 3, cancelled: 0, chartVal: 40, semester: 2 },
      { month: 'Tháng 11', total: 13, past: 10, upcoming: 3, cancelled: 0, chartVal: 35, semester: 2 },
      { month: 'Tháng 12', total: 14, past: 11, upcoming: 3, cancelled: 0, chartVal: 80, semester: 2 }
    ]
  },
  '2022': {
    kpi: { total: 98, past: 78, upcoming: 20 },
    months: [
      { month: 'Tháng 1', total: 8, past: 6, upcoming: 2, cancelled: 0, chartVal: 60, semester: 1 },
      { month: 'Tháng 2', total: 9, past: 7, upcoming: 2, cancelled: 0, chartVal: 45, semester: 1 },
      { month: 'Tháng 3', total: 10, past: 8, upcoming: 2, cancelled: 0, chartVal: 75, semester: 1 },
      { month: 'Tháng 4', total: 11, past: 9, upcoming: 2, cancelled: 0, chartVal: 55, semester: 1 },
      { month: 'Tháng 5', total: 7, past: 6, upcoming: 1, cancelled: 0, chartVal: 30, semester: 1 },
      { month: 'Tháng 6', total: 12, past: 10, upcoming: 2, cancelled: 0, chartVal: 65, semester: 1 },
      { month: 'Tháng 7', total: 6, past: 5, upcoming: 1, cancelled: 0, chartVal: 40, semester: 2 },
      { month: 'Tháng 8', total: 8, past: 7, upcoming: 1, cancelled: 0, chartVal: 50, semester: 2 },
      { month: 'Tháng 9', total: 9, past: 7, upcoming: 2, cancelled: 0, chartVal: 20, semester: 2 },
      { month: 'Tháng 10', total: 10, past: 8, upcoming: 2, cancelled: 0, chartVal: 25, semester: 2 },
      { month: 'Tháng 11', total: 8, past: 6, upcoming: 2, cancelled: 0, chartVal: 15, semester: 2 },
      { month: 'Tháng 12', total: 9, past: 7, upcoming: 2, cancelled: 0, chartVal: 60, semester: 2 }
    ]
  }
};

const SAMPLE_MONTH_EVENTS = {
  'Tháng 1': [
    { name: 'Chào đón Tân sinh viên K19', organizer: 'Đoàn trường', date: '05/01/2023', participants: 350, status: 'Đã diễn ra' },
    { name: 'Tập huấn Kỹ năng sinh viên', organizer: 'CLB Kỹ năng', date: '12/01/2023', participants: 120, status: 'Đã diễn ra' },
    { name: 'Hội thảo Đổi mới sáng tạo', organizer: 'Trung tâm ĐMST', date: '20/01/2023', participants: 85, status: 'Đã diễn ra' }
  ],
  'Tháng 2': [
    { name: 'Ngày hội Hiến máu nhân đạo đợt 1', organizer: 'Hội Chữ thập đỏ', date: '14/02/2023', participants: 280, status: 'Đã diễn ra' },
    { name: 'Giải bóng đá Nam sinh viên', organizer: 'Đoàn trường', date: '22/02/2023', participants: 160, status: 'Đã diễn ra' }
  ],
  'Tháng 3': [
    { name: 'Hội thảo Hướng nghiệp và Việc làm', organizer: 'Phòng CTSV', date: '10/03/2023', participants: 200, status: 'Đã diễn ra' },
    { name: 'Hội thi Tiếng hát Sinh viên', organizer: 'Đội Văn nghệ', date: '26/03/2023', participants: 180, status: 'Đã diễn ra' },
    { name: 'Lễ kỷ niệm 92 năm ngày thành lập Đoàn', organizer: 'Đoàn trường', date: '26/03/2023', participants: 400, status: 'Đã diễn ra' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const selYear = document.getElementById('eventYearSelect');
  const selSemester = document.getElementById('eventSemesterSelect');
  const selMonth = document.getElementById('eventMonthSelect');
  const btnFilter = document.getElementById('btnFilterSubmit');
  const btnReset = document.getElementById('btnResetFilter');

  const kpiTotal = document.getElementById('kpiTotalEvents');
  const kpiPast = document.getElementById('kpiPastEvents');
  const kpiUpcoming = document.getElementById('kpiUpcomingEvents');
  const tbody = document.getElementById('eventsMonthlyTableBody');

  function applyFilter() {
    const year = selYear.value || '2023';
    const semester = selSemester.value ? parseInt(selSemester.value) : null;
    const month = selMonth.value;

    const dataYear = YEAR_DATA[year] || YEAR_DATA['2023'];
    let months = dataYear.months;

    if (semester) {
      months = months.filter(m => m.semester === semester);
    }

    if (month) {
      months = months.filter(m => m.month === month);
    }

    // Update KPI
    const totalCount = months.reduce((acc, m) => acc + m.total, 0);
    const pastCount = months.reduce((acc, m) => acc + m.past, 0);
    const upcomingCount = months.reduce((acc, m) => acc + m.upcoming, 0);

    kpiTotal.textContent = totalCount;
    kpiPast.textContent = pastCount;
    kpiUpcoming.textContent = upcomingCount;

    // Render Chart with smooth animation
    const chartData = months.map(m => ({ label: m.month, value: m.chartVal }));
    SEMSCharts.renderMonthlyBarChart('eventsMonthlyChart', {
      data: chartData,
      yMax: 100,
      yStep: 25,
      height: 280,
      barColor: '#1E70EB'
    });

    // Render Table
    tbody.innerHTML = '';
    months.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.month}</td>
        <td>${row.total}</td>
        <td>${row.past}</td>
        <td>${row.upcoming}</td>
        <td>${row.cancelled}</td>
        <td><a href="#" class="table-link" data-month="${row.month}">Xem chi tiết</a></td>
      `;

      tr.querySelector('.table-link').addEventListener('click', (e) => {
        e.preventDefault();
        openMonthDetailModal(row.month, row);
      });

      tbody.appendChild(tr);
    });
  }

  function openMonthDetailModal(month, rowData) {
    document.getElementById('monthDetailModalTitle').textContent = `Chi tiết sự kiện - ${month} (Tổng ${rowData.total} sự kiện)`;
    const modalTbody = document.getElementById('monthEventsTableBody');
    modalTbody.innerHTML = '';

    const events = SAMPLE_MONTH_EVENTS[month] || [
      { name: `Sự kiện tiêu biểu 01 - ${month}`, organizer: 'Phòng CTSV', date: `10/${month.replace('Tháng ', '')}/2023`, participants: 180, status: 'Đã diễn ra' },
      { name: `Sự kiện tiêu biểu 02 - ${month}`, organizer: 'Đoàn trường', date: `22/${month.replace('Tháng ', '')}/2023`, participants: 250, status: 'Đã diễn ra' },
      { name: `Tọa đàm chuyên đề ${month}`, organizer: 'CLB Sinh viên', date: `28/${month.replace('Tháng ', '')}/2023`, participants: 120, status: 'Sắp diễn ra' }
    ];

    events.forEach(evt => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${evt.name}</strong></td>
        <td>${evt.organizer}</td>
        <td>${evt.date}</td>
        <td>${evt.participants}</td>
        <td><span class="${evt.status === 'Đã diễn ra' ? 'status-text-active' : 'status-text-locked'}">${evt.status}</span></td>
      `;
      modalTbody.appendChild(tr);
    });

    openModal('modalMonthDetail');
  }

  // Events
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

  // Initial render
  applyFilter();
});
