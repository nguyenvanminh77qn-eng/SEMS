/**
 * LOGIC GỬI THÔNG BÁO (MH-25, MH-25__Confirm)
 */

function normalizeNotificationSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .trim();
}

document.addEventListener('DOMContentLoaded', () => {
  const formNotification = document.getElementById('formNotification');
  const btnSubmitNotification = document.getElementById('btnSubmitNotification');
  const btnCancelNotification = document.getElementById('btnCancelNotification');
  const btnConfirmSend = document.getElementById('btnConfirmSend');
  const historyBody = document.getElementById('notificationHistoryBody');
  const historyTitleFilter = document.getElementById('historyTitleFilter');
  const historyTargetFilter = document.getElementById('historyTargetFilter');
  const historySenderFilter = document.getElementById('historySenderFilter');
  const historyStatusFilter = document.getElementById('historyStatusFilter');

  function applyHistoryFilters() {
    const titleQuery = normalizeNotificationSearch(historyTitleFilter.value);
    const targetQuery = normalizeNotificationSearch(historyTargetFilter.value);
    const senderQuery = normalizeNotificationSearch(historySenderFilter.value);
    const statusQuery = normalizeNotificationSearch(historyStatusFilter.value);
    const rows = Array.from(historyBody.querySelectorAll('tr:not([data-empty-state])'));
    let visibleCount = 0;

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const matchesTitle = normalizeNotificationSearch(cells[0].textContent).includes(titleQuery);
      const matchesTarget = normalizeNotificationSearch(cells[1].textContent).includes(targetQuery);
      const matchesSender = normalizeNotificationSearch(cells[2].textContent).includes(senderQuery);
      const matchesStatus = normalizeNotificationSearch(cells[4].textContent).includes(statusQuery);
      row.hidden = !(matchesTitle && matchesTarget && matchesSender && matchesStatus);
      if (!row.hidden) visibleCount++;
    });

    const emptyRow = historyBody.querySelector('[data-empty-state]');
    if (visibleCount === 0 && !emptyRow) {
      const row = document.createElement('tr');
      row.dataset.emptyState = 'true';
      row.innerHTML = '<td colspan="5" style="text-align: center; padding: 32px; color: #6B7280;">Không tìm thấy thông báo phù hợp.</td>';
      historyBody.appendChild(row);
    } else if (visibleCount > 0 && emptyRow) {
      emptyRow.remove();
    }
  }

  [historyTitleFilter, historyTargetFilter, historySenderFilter].forEach(input =>
    input.addEventListener('input', applyHistoryFilters)
  );
  historyStatusFilter.addEventListener('change', applyHistoryFilters);

  if (btnSubmitNotification) {
    btnSubmitNotification.addEventListener('click', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('notifyTitle');
      const contentInput = document.getElementById('notifyContent');

      if (!titleInput.value.trim() || !contentInput.value.trim()) {
        alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!');
        return;
      }
      const target = document.getElementById('notifyTarget').value;
      document.getElementById('notificationConfirmText').textContent =
        `Bạn có chắc chắn muốn gửi thông báo này cho ${target}?`;
      openModal('modalConfirmSend');
    });
  }

  if (btnCancelNotification) {
    btnCancelNotification.addEventListener('click', () => {
      if (formNotification) formNotification.reset();
    });
  }

  if (btnConfirmSend) {
    btnConfirmSend.addEventListener('click', () => {
      const title = document.getElementById('notifyTitle').value.trim();
      const target = document.getElementById('notifyTarget').value;
      const now = new Date();
      const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-') + ' ' + [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0')
      ].join(':');

      const row = document.createElement('tr');
      [title, target, 'Admin', timestamp, 'Đã gửi'].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });
      historyBody.prepend(row);
      applyHistoryFilters();

      closeModal('modalConfirmSend');
      alert(`Đã gửi thông báo thành công cho ${target}!`);
      if (formNotification) formNotification.reset();
    });
  }

  applyHistoryFilters();
});

