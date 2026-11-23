/**
 * LOGIC ĐÁNH GIÁ ĐIỂM RÈN LUYỆN (MH-30)
 * Lọc đa tiêu chí thời gian thực & Xem thêm mượt mà KHÔNG giật khung hình
 */

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .trim();
}

function matchesFaculty(faculty, query) {
  const normalizedFaculty = normalizeSearchText(faculty);
  return normalizedFaculty.includes(query) ||
    (query === 'cntt' && normalizedFaculty.includes('cong nghe thong tin'));
}

const ALL_TRAINING_DATA = [
  // 5 dòng ban đầu chuẩn 100% MH-30
  {
    id: 'SV001', name: 'Nguyễn Văn A', class: 'KTPM1-K18', schoolYear: '2023-2024', semester: 'Học kỳ 1',
    activitiesCount: 5, score: 85, rank: 'Giỏi', eligible: true,
    activities: [
      { name: 'Hội thảo Hướng nghiệp 2023', date: '10/03/2023', organizer: 'Phòng CTSV', points: '+20' },
      { name: 'Giải bóng đá Sinh viên', date: '15/04/2023', organizer: 'Đoàn trường', points: '+15' },
      { name: 'Ngày hội Hiến máu nhân đạo', date: '28/04/2023', organizer: 'Hội Chữ thập đỏ', points: '+20' },
      { name: 'Workshop Kỹ năng thuyết trình', date: '12/05/2023', organizer: 'CLB Kỹ năng', points: '+15' },
      { name: 'Chiến dịch Mùa hè xanh', date: '15/07/2023', organizer: 'Đoàn trường', points: '+15' }
    ]
  },
  {
    id: 'SV002', name: 'Trần Thị B', class: 'KTPM1-K18', schoolYear: '2023-2024', semester: 'Học kỳ 1',
    activitiesCount: 3, score: 60, rank: 'Trung bình', eligible: true,
    activities: [
      { name: 'Hội thảo Khởi nghiệp Đổi mới sáng tạo', date: '20/03/2023', organizer: 'Trung tâm ĐMST', points: '+20' },
      { name: 'Ngày hội Tình nguyện Xanh', date: '01/06/2023', organizer: 'Hội Sinh viên', points: '+20' },
      { name: 'Cuộc thi Rung Chuông Vàng', date: '18/09/2023', organizer: 'Liên Chi đoàn', points: '+20' }
    ]
  },
  {
    id: 'SV003', name: 'Lê Văn C', class: 'KTPM2-K18', schoolYear: '2023-2024', semester: 'Học kỳ 1',
    activitiesCount: 6, score: 90, rank: 'Xuất sắc', eligible: true,
    activities: [
      { name: 'Cuộc thi Sáng tạo Robot', date: '22/05/2023', organizer: 'CLB Robot', points: '+20' },
      { name: 'Olympic Tin học sinh viên cấp trường', date: '05/06/2023', organizer: 'Khoa CNTT', points: '+20' },
      { name: 'Hội thảo Trí tuệ nhân tạo GenAI', date: '15/08/2023', organizer: 'CLB Tin học', points: '+15' },
      { name: 'Giải chạy sinh viên khỏe', date: '25/08/2023', organizer: 'Đoàn trường', points: '+10' },
      { name: 'Tập huấn Cán bộ Đoàn Hội', date: '10/09/2023', organizer: 'Đoàn trường', points: '+15' },
      { name: 'Ngày hội Chào tân sinh viên', date: '05/10/2023', organizer: 'Hội Sinh viên', points: '+10' }
    ]
  },
  {
    id: 'SV004', name: 'Phạm Thị D', class: 'KTPM2-K18', schoolYear: '2023-2024', semester: 'Học kỳ 1',
    activitiesCount: 3, score: 55, rank: 'Yếu', eligible: false,
    activities: [
      { name: 'Buổi sinh hoạt lớp định kỳ', date: '15/03/2023', organizer: 'Ban cán sự lớp', points: '+20' },
      { name: 'Tham gia bầu cử Hội sinh viên', date: '10/05/2023', organizer: 'Hội Sinh viên', points: '+15' },
      { name: 'Xem kịch truyền thống', date: '20/06/2023', organizer: 'Đội Văn nghệ', points: '+20' }
    ]
  },
  {
    id: 'SV005', name: 'Hoàng Văn E', class: 'KTPM3-K18', schoolYear: '2023-2024', semester: 'Học kỳ 1',
    activitiesCount: 4, score: 75, rank: 'Khá', eligible: true,
    activities: [
      { name: 'Tọa đàm Giao lưu Cựu sinh viên', date: '14/04/2023', organizer: 'Ban liên lạc CSV', points: '+20' },
      { name: 'Tham quan Doanh nghiệp FPT Software', date: '18/05/2023', organizer: 'Khoa CNTT', points: '+20' },
      { name: 'Hội thảo An toàn thông tin mạng', date: '02/07/2023', organizer: 'CLB Tin học', points: '+20' },
      { name: 'Dọn vệ sinh giảng đường xanh', date: '12/09/2023', organizer: 'Đoàn trường', points: '+15' }
    ]
  },

  // Dữ liệu mở rộng
  {
    id: 'SV006', name: 'Đặng Tuấn Kiệt', class: 'KTPM1-K18', schoolYear: '2023-2024', semester: 'Học kỳ 1',
    activitiesCount: 5, score: 88, rank: 'Giỏi', eligible: true,
    activities: [
      { name: 'Hackathon Sinh viên 2023', date: '12/04/2023', organizer: 'Khoa CNTT', points: '+25' },
      { name: 'Tình nguyện Tiếp sức mùa thi', date: '25/06/2023', organizer: 'Đoàn trường', points: '+20' }
    ]
  },
  {
    id: 'SV007', name: 'Bùi Phương Thảo', class: 'KTPM3-K18', schoolYear: '2023-2024', semester: 'Học kỳ 1',
    activitiesCount: 6, score: 92, rank: 'Xuất sắc', eligible: true,
    activities: [
      { name: 'Giao lưu Thanh niên Quốc tế', date: '15/03/2023', organizer: 'Phòng QHTT', points: '+20' },
      { name: 'Cuộc thi Hùng biện Tiếng Anh', date: '10/05/2023', organizer: 'CLB Tiếng Anh', points: '+20' }
    ]
  },
  {
    id: 'SV008', name: 'Cao Đình Trọng', class: 'KTPM2-K18', schoolYear: '2023-2024', semester: 'Học kỳ 1',
    activitiesCount: 2, score: 48, rank: 'Yếu', eligible: false,
    activities: [
      { name: 'Chào đón tân sinh viên', date: '08/09/2023', organizer: 'Đoàn trường', points: '+25' }
    ]
  },
  {
    id: 'SV009', name: 'Nguyễn Bích Ngọc', class: 'KTPM1-K18', schoolYear: '2023-2024', semester: 'Học kỳ 2',
    activitiesCount: 4, score: 79, rank: 'Khá', eligible: true,
    activities: [
      { name: 'Giải Cầu lông Sinh viên', date: '05/04/2023', organizer: 'CLB Thể thao', points: '+20' }
    ]
  },
  {
    id: 'SV010', name: 'Vũ Minh Đức', class: 'KTPM3-K18', schoolYear: '2023-2024', semester: 'Học kỳ 2',
    activitiesCount: 5, score: 84, rank: 'Giỏi', eligible: true,
    activities: [
      { name: 'Cuộc thi Ý tưởng Sáng tạo Trẻ', date: '15/03/2023', organizer: 'Đoàn trường', points: '+20' }
    ]
  },
  {
    id: 'SV011', name: 'Hà Thị Thu', class: 'KTPM2-K18', schoolYear: '2022-2023', semester: 'Học kỳ 1',
    activitiesCount: 4, score: 76, rank: 'Khá', eligible: true,
    activities: [
      { name: 'Hội thao Khoa CNTT', date: '10/11/2022', organizer: 'Khoa CNTT', points: '+20' }
    ]
  },
  {
    id: 'SV012', name: 'Dương Văn Quý', class: 'KTPM1-K18', schoolYear: '2022-2023', semester: 'Học kỳ 1',
    activitiesCount: 1, score: 42, rank: 'Yếu', eligible: false,
    activities: [
      { name: 'Sinh hoạt định kỳ', date: '15/10/2022', organizer: 'Chi đoàn', points: '+20' }
    ]
  }
].map(student => ({
  ...student,
  faculty: student.faculty || 'Khoa Công nghệ thông tin'
}));

class TrainingScoreManager {
  constructor() {
    this.filteredData = [...ALL_TRAINING_DATA];
    this.renderedCount = 0;
    this.step = 5;

    this.tbody = document.getElementById('trainingTableBody');
    this.btnShowMore = document.getElementById('btnShowMore');
    this.selectAllCb = document.getElementById('selectAllResults');
    this.btnExportExcel = document.getElementById('btnExportExcel');
    this.btnResetFilter = document.getElementById('btnResetFilter');
    this.selYear = document.getElementById('filterYear');
    this.selSemester = document.getElementById('filterSemester');
    this.inputStudentId = document.getElementById('filterStudentId');
    this.inputStudentName = document.getElementById('filterStudentName');
    this.inputFaculty = document.getElementById('filterFaculty');
    this.inputClass = document.getElementById('filterClass');
    this.searchInputs = [
      this.inputStudentId,
      this.inputStudentName,
      this.inputFaculty,
      this.inputClass
    ];
    this.selRank = document.getElementById('filterRank');

    this.kpiTotal = document.getElementById('kpiTotal');
    this.kpiEligible = document.getElementById('kpiEligible');
    this.kpiNotEligible = document.getElementById('kpiNotEligible');

    this.initEvents();
    this.applyFilter();
  }

  createRowElement(student) {
    const tr = document.createElement('tr');
    tr.className = 'table-row-new';
    tr.innerHTML = `
      <td style="text-align: center;"><input type="checkbox" class="table-checkbox training-row-checkbox" data-id="${student.id}"></td>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.faculty}</td>
      <td>${student.class}</td>
      <td>${student.activitiesCount} -<a href="#" class="activity-detail-link">Xem chi tiết</a></td>
      <td>${student.score}</td>
      <td>${student.rank}</td>
    `;

    tr.querySelector('.activity-detail-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openActivityModal(student);
    });

    return tr;
  }

  initEvents() {
    this.btnShowMore.addEventListener('click', () => this.loadMore());

    this.selectAllCb.addEventListener('change', () => {
      const cbs = this.tbody.querySelectorAll('.training-row-checkbox');
      cbs.forEach(cb => cb.checked = this.selectAllCb.checked);
    });

    this.btnExportExcel.addEventListener('click', () => {
      const selectedCount = this.tbody.querySelectorAll('.training-row-checkbox:checked').length;
      const count = selectedCount > 0 ? selectedCount : this.filteredData.length;
      alert(`Đã xuất thành công file Excel bảng điểm rèn luyện (${count} sinh viên)!`);
    });

    this.selYear.addEventListener('change', () => this.applyFilter());
    this.selSemester.addEventListener('change', () => this.applyFilter());
    this.selRank.addEventListener('change', () => this.applyFilter());
    this.searchInputs.forEach(input => input.addEventListener('input', () => this.applyFilter()));

    this.btnResetFilter.addEventListener('click', () => {
      this.selYear.value = '2023-2024';
      this.selSemester.value = 'Học kỳ 1';
      this.searchInputs.forEach(input => input.value = '');
      this.selRank.value = '';
      this.applyFilter();
    });
  }

  applyFilter() {
    const yearVal = this.selYear.value;
    const semVal = this.selSemester.value;
    const idQuery = normalizeSearchText(this.inputStudentId.value);
    const nameQuery = normalizeSearchText(this.inputStudentName.value);
    const facultyQuery = normalizeSearchText(this.inputFaculty.value);
    const classQuery = normalizeSearchText(this.inputClass.value);
    const rankVal = this.selRank.value;

    this.filteredData = ALL_TRAINING_DATA.filter(item => {
      const matchYear = !yearVal || item.schoolYear === yearVal;
      const matchSem = !semVal || item.semester === semVal;
      const matchId = !idQuery || normalizeSearchText(item.id).includes(idQuery);
      const matchName = !nameQuery || normalizeSearchText(item.name).includes(nameQuery);
      const matchFaculty = !facultyQuery || matchesFaculty(item.faculty, facultyQuery);
      const matchClass = !classQuery || normalizeSearchText(item.class).includes(classQuery);
      const matchRank = !rankVal || item.rank === rankVal;
      return matchYear && matchSem && matchId && matchName && matchFaculty && matchClass && matchRank;
    });

    // Update KPI numbers
    const total = this.filteredData.length;
    const eligibleCount = this.filteredData.filter(s => s.eligible).length;
    const notEligibleCount = total - eligibleCount;

    this.kpiTotal.textContent = total;
    this.kpiEligible.textContent = eligibleCount;
    this.kpiNotEligible.textContent = notEligibleCount;
    document.getElementById('trainingResultSummary').textContent =
      `Tìm thấy ${total} sinh viên phù hợp.`;

    // Reset table cleanly and load first batch without jerkiness
    this.tbody.innerHTML = '';
    this.renderedCount = 0;
    this.selectAllCb.checked = false;
    this.selectAllCb.indeterminate = false;
    if (total === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 32px; color: #6B7280;">
            Không tìm thấy sinh viên phù hợp với điều kiện tìm kiếm.
          </td>
        </tr>
      `;
    }
    this.loadMore();
  }

  loadMore() {
    const nextBatch = this.filteredData.slice(this.renderedCount, this.renderedCount + this.step);
    nextBatch.forEach(student => {
      this.tbody.appendChild(this.createRowElement(student));
    });
    this.renderedCount += nextBatch.length;

    if (this.filteredData.length === 0) {
      this.btnShowMore.textContent = 'Không có kết quả';
      this.btnShowMore.disabled = true;
      this.btnShowMore.style.opacity = '0.7';
    } else if (this.renderedCount >= this.filteredData.length) {
      this.btnShowMore.textContent = `Đã hiển thị tất cả (${this.filteredData.length}/${this.filteredData.length})`;
      this.btnShowMore.disabled = true;
      this.btnShowMore.style.opacity = '0.7';
    } else {
      this.btnShowMore.textContent = 'Xem thêm';
      this.btnShowMore.disabled = false;
      this.btnShowMore.style.opacity = '1';
    }

    // Row checkbox listeners
    const rowCbs = this.tbody.querySelectorAll('.training-row-checkbox');
    rowCbs.forEach(cb => {
      cb.addEventListener('change', () => {
        const allChecked = Array.from(rowCbs).every(c => c.checked);
        const someChecked = Array.from(rowCbs).some(c => c.checked);
        this.selectAllCb.checked = allChecked;
        this.selectAllCb.indeterminate = someChecked && !allChecked;
      });
    });
  }

  openActivityModal(student) {
    document.getElementById('activityModalTitle').textContent = `Chi tiết hoạt động tham gia - ${student.name} (${student.id})`;
    document.getElementById('activityStudentSummary').innerHTML = `
      Sinh viên: <strong>${student.name} (${student.id})</strong> &bull; Khoa: <strong>${student.faculty}</strong> &bull; Lớp: <strong>${student.class}</strong> &bull; Điểm: <strong>${student.score}</strong> (${student.rank})
    `;

    const tbody = document.getElementById('activityDetailsTableBody');
    tbody.innerHTML = '';

    student.activities.forEach((act, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${act.name}</td>
        <td>${act.date}</td>
        <td>${act.organizer}</td>
        <td style="color: #16A34A; font-weight: 600;">${act.points}</td>
      `;
      tbody.appendChild(row);
    });

    openModal('modalActivityDetails');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TrainingScoreManager();
});
