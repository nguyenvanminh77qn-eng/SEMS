/**
 * LOGIC THỐNG KÊ LƯỢT SINH VIÊN THAM GIA (MH-27)
 * Lọc thời gian thực & Xem thêm mượt mà KHÔNG giật khung hình
 */

const STUDENT_YEAR_DATA = {
  '2022': {
    kpi: { total: 850, unique: 620, rate: '78%' },
    chart: [
      { label: 'Tháng 1', value: 72 }, { label: 'Tháng 2', value: 50 }, { label: 'Tháng 3', value: 92 },
      { label: 'Tháng 4', value: 60 }, { label: 'Tháng 5', value: 82 }, { label: 'Tháng 6', value: 40 },
      { label: 'Tháng 7', value: 76 }, { label: 'Tháng 8', value: 56 }, { label: 'Tháng 9', value: 88 },
      { label: 'Tháng 10', value: 66 }, { label: 'Tháng 11', value: 98 }, { label: 'Tháng 12', value: 45 }
    ],
    events: [
      { name: 'Hội thảo Hướng nghiệp 2023', organizer: 'Phòng CTSV', date: '10/03/2023', registered: 200, attended: 180, rate: '90%' },
      { name: 'Giải bóng đá Sinh viên', organizer: 'Đoàn trường', date: '15/04/2023', registered: 150, attended: 120, rate: '80%' },
      { name: 'Cuộc thi Sáng tạo Robot', organizer: 'CLB Robot', date: '22/05/2023', registered: 100, attended: 95, rate: '95%' },
      { name: 'Ngày hội Tình nguyện', organizer: 'Hội Sinh viên', date: '01/06/2023', registered: 300, attended: 225, rate: '75%' },
      { name: 'Workshop Kỹ năng thuyết trình & Phỏng vấn', organizer: 'CLB Kỹ năng', date: '18/06/2023', registered: 180, attended: 165, rate: '91.6%' },
      { name: 'Ngày hội Hiến máu nhân đạo đợt 2', organizer: 'Hội Chữ thập đỏ', date: '05/07/2023', registered: 250, attended: 230, rate: '92%' },
      { name: 'Olympic Tiếng Anh Sinh viên', organizer: 'CLB Tiếng Anh', date: '12/08/2023', registered: 210, attended: 195, rate: '92.8%' },
      { name: 'Diễn đàn Công nghệ AI & Cloud', organizer: 'CLB Tin học', date: '15/09/2023', registered: 320, attended: 290, rate: '90.6%' },
      { name: 'Cuộc thi Ý tưởng Khởi nghiệp Sáng tạo', organizer: 'Trung tâm ĐMST', date: '10/10/2023', registered: 140, attended: 125, rate: '89.2%' },
      { name: 'Hội trại Truyền thống Sinh viên', organizer: 'Đoàn trường', date: '18/11/2023', registered: 450, attended: 410, rate: '91.1%' },
      { name: 'Giải Cầu lông Cán bộ Đoàn Hội', organizer: 'CLB Thể thao', date: '28/11/2023', registered: 90, attended: 82, rate: '91.1%' },
      { name: 'Dạ hội Chào năm mới 2024', organizer: 'Đội Văn nghệ', date: '25/12/2023', registered: 380, attended: 350, rate: '92.1%' }
    ]
  },
  '2023': {
    kpi: { total: 1120, unique: 890, rate: '84%' },
    chart: [
      { label: 'Tháng 1', value: 80 }, { label: 'Tháng 2', value: 65 }, { label: 'Tháng 3', value: 95 },
      { label: 'Tháng 4', value: 75 }, { label: 'Tháng 5', value: 90 }, { label: 'Tháng 6', value: 55 },
      { label: 'Tháng 7', value: 85 }, { label: 'Tháng 8', value: 70 }, { label: 'Tháng 9', value: 92 },
      { label: 'Tháng 10', value: 80 }, { label: 'Tháng 11', value: 100 }, { label: 'Tháng 12', value: 60 }
    ],
    events: [
      { name: 'Ngày hội Chào Tân sinh viên 2023', organizer: 'Đoàn trường', date: '15/09/2023', registered: 500, attended: 480, rate: '96%' },
      { name: 'Cuộc thi Lập trình sinh viên DevFest', organizer: 'CLB Tin học', date: '20/10/2023', registered: 220, attended: 205, rate: '93%' },
      { name: 'Hội diễn Văn nghệ 20/11', organizer: 'Đội Văn nghệ', date: '18/11/2023', registered: 350, attended: 330, rate: '94%' },
      { name: 'Ngày hội Hiến máu Giọt hồng', organizer: 'Hội Chữ thập đỏ', date: '05/12/2023', registered: 280, attended: 260, rate: '92%' }
    ]
  },
  '2024': {
    kpi: { total: 1350, unique: 1040, rate: '88%' },
    chart: [
      { label: 'Tháng 1', value: 85 }, { label: 'Tháng 2', value: 70 }, { label: 'Tháng 3', value: 98 },
      { label: 'Tháng 4', value: 80 }, { label: 'Tháng 5', value: 92 }, { label: 'Tháng 6', value: 65 },
      { label: 'Tháng 7', value: 88 }, { label: 'Tháng 8', value: 75 }, { label: 'Tháng 9', value: 95 },
      { label: 'Tháng 10', value: 85 }, { label: 'Tháng 11', value: 100 }, { label: 'Tháng 12', value: 70 }
    ],
    events: [
      { name: 'Ngày hội Tuyển dụng Việc làm 2024', organizer: 'Phòng CTSV', date: '12/03/2024', registered: 420, attended: 400, rate: '95%' },
      { name: 'Giải Futsal Sinh viên', organizer: 'Đoàn trường', date: '15/04/2024', registered: 200, attended: 185, rate: '92.5%' },
      { name: 'Hội thảo Trí tuệ nhân tạo GenAI', organizer: 'Khoa CNTT', date: '25/05/2024', registered: 310, attended: 295, rate: '95%' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const selYear = document.getElementById('studentYearSelect');
  const selEvent = document.getElementById('studentEventSelect');
  const btnFilter = document.getElementById('btnFilterSubmit');
  const btnReset = document.getElementById('btnResetFilter');
  const tbody = document.getElementById('studentParticipationTableBody');
  const btnShowMore = document.getElementById('btnShowMore');

  const kpiTotal = document.getElementById('kpiStudentTotal');
  const kpiUnique = document.getElementById('kpiStudentUnique');
  const kpiRate = document.getElementById('kpiStudentRate');

  let currentEvents = [];
  let renderedCount = 0;
  const STEP = 4;

  function createRowElement(item) {
    const tr = document.createElement('tr');
    tr.className = 'table-row-new';
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.organizer}</td>
      <td>${item.date}</td>
      <td>${item.registered}</td>
      <td>${item.attended}</td>
      <td>${item.rate}</td>
    `;
    return tr;
  }

  function applyFilter() {
    const year = selYear.value || '2022';
    const eventQuery = (selEvent.value || '').toLowerCase().trim();

    const dataYear = STUDENT_YEAR_DATA[year] || STUDENT_YEAR_DATA['2022'];
    kpiTotal.textContent = dataYear.kpi.total;
    kpiUnique.textContent = dataYear.kpi.unique;
    kpiRate.textContent = dataYear.kpi.rate;

    // Filter events
    currentEvents = dataYear.events.filter(e => {
      return !eventQuery || e.name.toLowerCase().includes(eventQuery);
    });

    // Render Chart with smooth animations
    SEMSCharts.renderMonthlyBarChart('studentParticipationChart', {
      data: dataYear.chart,
      yMax: 100,
      yStep: 25,
      yPrefix: '-',
      height: 280,
      barColor: '#1E70EB'
    });

    // Reset table cleanly
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
  selEvent.addEventListener('change', applyFilter);

  btnReset.addEventListener('click', () => {
    selYear.value = '2022';
    selEvent.value = '';
    applyFilter();
  });

  // Initial load
  applyFilter();
});
