/**
 * LOGIC QUẢN LÝ SINH VIÊN (MH-31, MH-31__Confirm, image.png)
 * Tích hợp đầy đủ LocalStorage, Phân trang thực tế, Popup thao tác, Quyền hạn
 */

const STORAGE_KEY = 'sems_students_data';
const DEFAULT_FACULTY = 'Chưa cập nhật';

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

function addFacultyFallback(student) {
  const sample = INITIAL_STUDENTS.find(item => item.id === student.id);
  const sampleFaculty = sample && sample.faculty;
  const faculty = student.faculty && student.faculty !== DEFAULT_FACULTY
    ? student.faculty
    : sampleFaculty || DEFAULT_FACULTY;
  return { ...student, faculty };
}

// Dữ liệu mẫu chuẩn 27 sinh viên (3 trang)
const INITIAL_STUDENTS = [
  // TRANG 1 - Khớp 100% MH-31
  { id: 'SV001', name: 'Nguyễn Văn A', faculty: 'Khoa Công nghệ thông tin', email: 'vanA@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV002', name: 'Nguyễn Văn B', faculty: 'Khoa Công nghệ thông tin', email: 'vanB@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV003', name: 'Nguyễn Văn C', faculty: 'Khoa Công nghệ thông tin', email: 'vanC@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Khóa' },
  { id: 'SV004', name: 'Nguyễn Văn D', faculty: 'Khoa Công nghệ thông tin', email: 'vanD@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Khóa' },
  { id: 'SV005', name: 'Nguyễn Văn E', faculty: 'Khoa Công nghệ thông tin', email: 'vanE@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV006', name: 'Nguyễn Văn F', email: 'vanF@gmail.com', role: 'Admin', status: 'Hoạt động' },
  { id: 'SV007', name: 'Nguyễn Văn G', email: 'vanG@gmail.com', role: '', status: 'Hoạt động' },
  { id: 'SV008', name: 'Nguyễn Văn H', email: 'vanH@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Khóa' },
  { id: 'SV009', name: 'Nguyễn Văn K', email: 'vanK@gmail.com', role: 'Admin', status: 'Hoạt động' },

  // TRANG 2 - Dữ liệu mở rộng để phân trang hoạt động rõ rệt
  { id: 'SV010', name: 'Lê Thị Mai', faculty: 'Khoa Công nghệ thông tin', email: 'mai.le@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV011', name: 'Trần Đình Nam', email: 'nam.tran@st.qnu.edu.vn.com', role: 'Organizer', status: 'Hoạt động' },
  { id: 'SV012', name: 'Vũ Quốc Bảo', email: 'bao.vu@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Khóa' },
  { id: 'SV013', name: 'Đỗ Thùy Trang', faculty: 'Khoa Công nghệ thông tin', email: 'trang.do@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV014', name: 'Phan Minh Tuấn', email: 'tuan.phan@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV015', name: 'Bùi Thị Hà', email: 'ha.bui@st.qnu.edu.vn.com', role: 'Admin', status: 'Hoạt động' },
  { id: 'SV016', name: 'Ngô Thanh Sơn', email: 'son.ngo@st.qnu.edu.vn.com', role: 'Organizer', status: 'Hoạt động' },
  { id: 'SV017', name: 'Đặng Kim Ngân', faculty: 'Khoa Công nghệ thông tin', email: 'ngan.dang@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Khóa' },
  { id: 'SV018', name: 'Hồ Gia Huy', email: 'huy.ho@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },

  // TRANG 3
  { id: 'SV019', name: 'Dương Yến Nhi', email: 'nhi.duong@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV020', name: 'Lý Kiến Quốc', email: 'quoc.ly@st.qnu.edu.vn.com', role: 'Organizer', status: 'Hoạt động' },
  { id: 'SV021', name: 'Trương Ngọc Ánh', faculty: 'Khoa Công nghệ thông tin', email: 'anh.truong@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Khóa' },
  { id: 'SV022', name: 'Vương Quốc Đạt', email: 'dat.vuong@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV023', name: 'Chu Mỹ Linh', email: 'linh.chu@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV024', name: 'Tạ Quang Khải', email: 'khai.ta@st.qnu.edu.vn.com', role: 'Admin', status: 'Hoạt động' },
  { id: 'SV025', name: 'Lương Vĩnh Thụy', email: 'thuy.luong@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV026', name: 'Mai Khánh Huyền', email: 'huyen.mai@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Hoạt động' },
  { id: 'SV027', name: 'Đoàn Hữu Phước', email: 'phuoc.doan@st.qnu.edu.vn.com', role: 'Sinh viên', status: 'Khóa' }
];

class StudentManager {
  constructor() {
    this.students = this.loadData();
    this.currentPage = 1;
    this.itemsPerPage = 9;
    this.activeStudent = null;
    this.activeShieldBtn = null;
    this.filteredStudents = [...this.students];

    this.initElements();
    this.bindEvents();
    this.render();
  }

  loadData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data).map(addFacultyFallback);
      }
    } catch (e) {
      console.warn('Lỗi đọc LocalStorage, khôi phục dữ liệu ban đầu', e);
    }
    const students = INITIAL_STUDENTS.map(addFacultyFallback);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    return students;
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
    } catch (e) {
      console.error('Lỗi ghi LocalStorage', e);
    }
  }

  initElements() {
    this.tbody = document.getElementById('studentsTableBody');
    this.selectAllCb = document.getElementById('selectAll');
    this.dotsContainer = document.getElementById('paginationDotsContainer');
    this.prevBtn = document.getElementById('prevPageBtn');
    this.nextBtn = document.getElementById('nextPageBtn');

    // Filter controls
    this.searchStudentId = document.getElementById('searchStudentId');
    this.searchStudentName = document.getElementById('searchStudentName');
    this.searchFaculty = document.getElementById('searchFaculty');
    this.searchEmail = document.getElementById('searchEmail');
    this.searchFields = [
      this.searchStudentId,
      this.searchStudentName,
      this.searchFaculty,
      this.searchEmail
    ];
    this.roleFilter = document.getElementById('roleFilter');
    this.statusFilter = document.getElementById('statusFilter');
    this.btnReset = document.getElementById('btnReset');
    this.btnAddAccount = document.getElementById('btnAddAccount');
    this.btnDeleteSelected = document.getElementById('btnDeleteSelected');
  }

  bindEvents() {
    // Search & Filter
    this.searchFields.forEach(input => input.addEventListener('input', () => this.applyFilter()));
    this.roleFilter.addEventListener('change', () => this.applyFilter());
    this.statusFilter.addEventListener('change', () => this.applyFilter());

    this.btnReset.addEventListener('click', () => {
      this.searchFields.forEach(input => input.value = '');
      this.roleFilter.selectedIndex = 0;
      this.statusFilter.selectedIndex = 0;
      this.filteredStudents = [...this.students];
      this.currentPage = 1;
      this.render();
    });

    // Select All
    this.selectAllCb.addEventListener('change', () => {
      const cbs = this.tbody.querySelectorAll('.row-checkbox');
      cbs.forEach(cb => cb.checked = this.selectAllCb.checked);
    });

    // Delete selected button
    this.btnDeleteSelected.addEventListener('click', () => {
      this.activeDeleteIds = [];
      const selectedIds = Array.from(this.tbody.querySelectorAll('.row-checkbox:checked'))
        .map(cb => cb.dataset.id);
      this.activeProtectedDeleteCount = 0;
      if (selectedIds.length === 0) {
        alert('Vui lòng chọn ít nhất một tài khoản để xóa!');
        return;
      }
      const selectedAccounts = this.students.filter(student => selectedIds.includes(student.id));
      const deletableAccounts = selectedAccounts.filter(student =>
        student.role === 'Sinh viên' || student.role === 'Organizer'
      );
      this.activeProtectedDeleteCount = selectedAccounts.length - deletableAccounts.length;
      if (deletableAccounts.length === 0) {
        this.activeProtectedDeleteCount = 0;
        alert('Chỉ có thể xóa tài khoản Sinh viên hoặc Organizer. Tài khoản Admin được giữ nguyên.');
        return;
      }
      this.activeDeleteIds = deletableAccounts.map(student => student.id);
      document.getElementById('deleteConfirmMessage').textContent =
        `Bạn có chắc chắn muốn xóa ${this.activeDeleteIds.length} tài khoản đã chọn không?` +
        (this.activeProtectedDeleteCount
          ? ` ${this.activeProtectedDeleteCount} tài khoản không thuộc Sinh viên/Organizer sẽ được giữ nguyên.`
          : '');
      openModal('modalDeleteConfirm');
    });

    // Confirm Delete button
    document.getElementById('btnExecuteDelete').addEventListener('click', () => {
      if (this.activeDeleteIds && this.activeDeleteIds.length > 0) {
        this.students = this.students.filter(s =>
          !this.activeDeleteIds.includes(s.id) ||
          (s.role !== 'Sinh viên' && s.role !== 'Organizer')
        );
        this.activeDeleteIds = [];
      } else if (this.activeStudent &&
        (this.activeStudent.role === 'Sinh viên' || this.activeStudent.role === 'Organizer')) {
        this.students = this.students.filter(s => s.id !== this.activeStudent.id);
        this.activeStudent = null;
      } else {
        closeModal('modalDeleteConfirm');
        alert('Chỉ có thể xóa tài khoản Sinh viên hoặc Organizer. Tài khoản Admin được giữ nguyên.');
        return;
      }
      this.saveData();
      closeModal('modalDeleteConfirm');
      this.applyFilter();
      this.selectAllCb.checked = false;
      this.activeStudent = null;
      if (this.activeProtectedDeleteCount) {
        alert(`${this.activeProtectedDeleteCount} tài khoản không thuộc Sinh viên/Organizer đã được giữ nguyên.`);
        this.activeProtectedDeleteCount = 0;
      }
    });

    // Confirm Lock / Unlock button
    document.getElementById('btnExecuteToggleLock').addEventListener('click', () => {
      if (!this.activeStudent) return;
      const newStatus = this.activeStudent.status === 'Hoạt động' ? 'Khóa' : 'Hoạt động';
      this.activeStudent.status = newStatus;
      
      const idx = this.students.findIndex(s => s.id === this.activeStudent.id);
      if (idx !== -1) {
        this.students[idx].status = newStatus;
        this.saveData();
      }
      closeModal('modalLockConfirm');
      this.renderTable();
    });

    // Form Add Account
    document.getElementById('formAddAccount').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('addStudentId').value.trim();
      const name = document.getElementById('addFullName').value.trim();
      const faculty = document.getElementById('addFaculty').value.trim();
      const email = document.getElementById('addEmail').value.trim();
      const role = document.getElementById('addRole').value;
      if (role !== 'Sinh viên' && role !== 'Organizer') {
        alert('Chỉ có thể tạo tài khoản Sinh viên hoặc Organizer.');
        return;
      }

      if (!id || !name || !email) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      if (this.students.some(s => s.id.toLowerCase() === id.toLowerCase())) {
        alert(`Mã sinh viên ${id} đã tồn tại trong hệ thống!`);
        return;
      }

      const newStudent = { id, name, faculty: faculty || DEFAULT_FACULTY, email, role, status: 'Hoạt động' };
      this.students.unshift(newStudent);
      this.saveData();

      document.getElementById('formAddAccount').reset();
      closeModal('modalAddAccount');
      this.applyFilter();
      alert(`Đã thêm tài khoản ${name} (${id}) thành công!`);
    });

    // Form Edit Account
    document.getElementById('formEditAccount').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.activeStudent) return;

      const name = document.getElementById('editFullName').value.trim();
      const faculty = document.getElementById('editFaculty').value.trim();
      const email = document.getElementById('editEmail').value.trim();
      const role = document.getElementById('editRole').value;
      const status = document.getElementById('editStatus').value;

      const idx = this.students.findIndex(s => s.id === this.activeStudent.id);
      if (idx !== -1) {
        this.students[idx].name = name;
        this.students[idx].faculty = faculty || DEFAULT_FACULTY;
        this.students[idx].email = email;
        this.students[idx].role = role;
        this.students[idx].status = status;
        this.saveData();
      }

      closeModal('modalEditAccount');
      this.applyFilter();
      alert('Đã cập nhật thông tin tài khoản thành công!');
    });

    // Form Permissions
    document.getElementById('formPermissions').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.activeStudent) return;

      const newRole = document.querySelector('input[name="newRole"]:checked').value;
      const idx = this.students.findIndex(s => s.id === this.activeStudent.id);
      if (idx !== -1) {
        this.students[idx].role = newRole;
        this.saveData();
      }

      if (this.activeShieldBtn) {
        this.activeShieldBtn.classList.remove('active-permission');
        this.activeShieldBtn = null;
      }

      closeModal('modalPermissions');
      this.applyFilter();
      alert(`Đã phân quyền cho ${this.activeStudent.name} thành vai trò: ${newRole}!`);
    });

    // Add Account open modal button
    this.btnAddAccount.addEventListener('click', () => {
      openModal('modalAddAccount');
    });

    // Reset shield icon when permission modal is closed by backdrop or cancel
    document.querySelectorAll('#modalPermissions [data-close], #modalPermissions').forEach(el => {
      el.addEventListener('click', () => {
        if (this.activeShieldBtn) {
          this.activeShieldBtn.classList.remove('active-permission');
          this.activeShieldBtn = null;
        }
      });
    });

    // Pagination arrows
    this.prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.render();
      }
    });

    this.nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage) || 1;
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.render();
      }
    });
  }

  applyFilter() {
    const idQuery = normalizeSearchText(this.searchStudentId.value);
    const nameQuery = normalizeSearchText(this.searchStudentName.value);
    const facultyQuery = normalizeSearchText(this.searchFaculty.value);
    const emailQuery = normalizeSearchText(this.searchEmail.value);
    const roleVal = this.roleFilter.value;
    const statusVal = this.statusFilter.value;

    this.filteredStudents = this.students.filter(student => {
      const matchId = !idQuery || normalizeSearchText(student.id).includes(idQuery);
      const matchName = !nameQuery || normalizeSearchText(student.name).includes(nameQuery);
      const matchFaculty = !facultyQuery || matchesFaculty(student.faculty, facultyQuery);
      const matchEmail = !emailQuery || normalizeSearchText(student.email).includes(emailQuery);

      const matchRole = !roleVal || student.role === roleVal;
      const matchStatus = !statusVal || student.status === statusVal;

      return matchId && matchName && matchFaculty && matchEmail && matchRole && matchStatus;
    });

    this.currentPage = 1;
    this.render();
  }

  render() {
    this.renderTable();
    this.renderPagination();
  }

  renderTable() {
    this.tbody.innerHTML = '';
    const total = this.filteredStudents.length;
    document.getElementById('studentResultSummary').textContent =
      `Tìm thấy ${total} tài khoản phù hợp.`;

    if (total === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 32px; color: #6B7280;">
            Không tìm thấy tài khoản nào phù hợp với điều kiện lọc.
          </td>
        </tr>
      `;
      return;
    }

    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = Math.min(startIdx + this.itemsPerPage, total);
    const pageItems = this.filteredStudents.slice(startIdx, endIdx);

    pageItems.forEach(student => {
      const tr = document.createElement('tr');
      const isAdmin = student.role === 'Admin';
      const canDelete = student.role === 'Sinh viên' || student.role === 'Organizer';
      const isLocked = student.status === 'Khóa';

      // Checkbox
      const tdCb = document.createElement('td');
      tdCb.style.textAlign = 'center';
      tdCb.innerHTML = `<input type="checkbox" class="table-checkbox row-checkbox" data-id="${student.id}">`;
      tr.appendChild(tdCb);

      // Info columns
      tr.innerHTML += `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.faculty || DEFAULT_FACULTY}</td>
        <td>${student.email}</td>
        <td>${student.role}</td>
        <td>
          <span class="${isLocked ? 'status-text-locked' : 'status-text-active'}">
            ${student.status}
          </span>
        </td>
      `;

      // Actions Column
      const tdActions = document.createElement('td');
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'table-actions';

      if (isAdmin) {
        // Admin: Không có phần thao tác nên màu xám thể hiện disable
        actionsDiv.innerHTML = `
          <button class="action-icon-btn disabled" disabled title="Quản trị viên không thể chỉnh sửa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-icon-btn disabled" disabled title="Quản trị viên không thể xóa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <button class="action-icon-btn disabled" disabled title="Quản trị viên không thể khóa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </button>
        `;
      } else {
        // Edit button
        const btnEdit = document.createElement('button');
        btnEdit.className = 'action-icon-btn';
        btnEdit.title = 'Chỉnh sửa tài khoản';
        btnEdit.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        `;
        btnEdit.addEventListener('click', () => {
          this.activeStudent = student;
          document.getElementById('editOriginalId').value = student.id;
          document.getElementById('editStudentId').value = student.id;
          document.getElementById('editFullName').value = student.name;
          document.getElementById('editFaculty').value = student.faculty || '';
          document.getElementById('editEmail').value = student.email;
          document.getElementById('editRole').value = student.role || 'Sinh viên';
          document.getElementById('editStatus').value = student.status;
          openModal('modalEditAccount');
        });
        actionsDiv.appendChild(btnEdit);

        // Delete button
        const btnDelete = document.createElement('button');
        btnDelete.className = 'action-icon-btn';
        btnDelete.title = canDelete ? 'Xóa tài khoản' : 'Chỉ xóa được Sinh viên hoặc Organizer';
        btnDelete.disabled = !canDelete;
        if (!canDelete) btnDelete.classList.add('disabled');
        btnDelete.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        `;
        if (canDelete) {
          btnDelete.addEventListener('click', () => {
            this.activeStudent = student;
            this.activeDeleteIds = [];
            document.getElementById('deleteConfirmMessage').textContent =
              `Bạn có chắc chắn muốn xóa tài khoản ${student.name} (${student.id}) không?`;
            openModal('modalDeleteConfirm');
          });
        }
        actionsDiv.appendChild(btnDelete);

        // Lock / Unlock button
        const btnLock = document.createElement('button');
        btnLock.className = 'action-icon-btn';
        btnLock.title = isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
        btnLock.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="${isLocked ? 'M7 11V7a5 5 0 0 1 10 0v1' : 'M7 11V7a5 5 0 0 1 10 0v4'}"></path>
          </svg>
        `;
        btnLock.addEventListener('click', () => {
          this.activeStudent = student;
          const actionText = isLocked ? 'mở khóa' : 'khóa';
          document.getElementById('lockModalTitle').textContent = isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
          document.getElementById('lockConfirmMessage').textContent =
            `Bạn có chắc chắn muốn ${actionText} tài khoản của sinh viên ${student.name} (${student.id}) không?`;
          openModal('modalLockConfirm');
        });
        actionsDiv.appendChild(btnLock);

        // Permission Shield button: ban đầu màu đen, khi đang thao tác chuyển sang màu xanh
        const btnShield = document.createElement('button');
        btnShield.className = 'action-icon-btn icon-shield';
        btnShield.title = 'Phân quyền tài khoản';
        btnShield.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
        `;
        btnShield.addEventListener('click', () => {
          // Bỏ active của nút trước đó nếu có
          if (this.activeShieldBtn) {
            this.activeShieldBtn.classList.remove('active-permission');
          }
          // Icon chuyển sang màu xanh
          btnShield.classList.add('active-permission');
          this.activeShieldBtn = btnShield;
          this.activeStudent = student;

          // Cập nhật thông tin vào Modal Phân quyền
          document.getElementById('permStudentName').textContent = `${student.name} (${student.id})`;
          document.getElementById('permStudentEmail').textContent = `Email: ${student.email}`;
          document.getElementById('permCurrentRole').textContent = student.role || 'Chưa có';

          if (student.role === 'Organizer') {
            document.getElementById('radioRoleOrganizer').checked = true;
          } else {
            document.getElementById('radioRoleStudent').checked = true;
          }

          openModal('modalPermissions');
        });
        actionsDiv.appendChild(btnShield);
      }

      tdActions.appendChild(actionsDiv);
      tr.appendChild(tdActions);
      this.tbody.appendChild(tr);
    });

    // Update select all state
    this.updateSelectAllCheckbox();
  }

  updateSelectAllCheckbox() {
    const cbs = this.tbody.querySelectorAll('.row-checkbox');
    if (cbs.length === 0) {
      this.selectAllCb.checked = false;
      this.selectAllCb.indeterminate = false;
      return;
    }
    const allChecked = Array.from(cbs).every(c => c.checked);
    const someChecked = Array.from(cbs).some(c => c.checked);
    this.selectAllCb.checked = allChecked;
    this.selectAllCb.indeterminate = someChecked && !allChecked;

    cbs.forEach(cb => {
      cb.addEventListener('change', () => this.updateSelectAllCheckbox());
    });
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage) || 1;
    this.dotsContainer.innerHTML = '';

    // Update arrow buttons
    this.prevBtn.disabled = this.currentPage <= 1;
    this.nextBtn.disabled = this.currentPage >= totalPages;

    for (let p = 1; p <= totalPages; p++) {
      const dot = document.createElement('span');
      dot.className = `dot ${p === this.currentPage ? 'active' : ''}`;
      dot.title = `Trang ${p}`;
      dot.addEventListener('click', () => {
        this.currentPage = p;
        this.render();
      });
      this.dotsContainer.appendChild(dot);
    }
  }
}

// Khởi chạy khi tài liệu sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.semsStudentManager = new StudentManager();
});
