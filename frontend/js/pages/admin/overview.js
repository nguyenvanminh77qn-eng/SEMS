/**
 * LOGIC TRANG TỔNG QUAN (Admin) - phần sự kiện, sắp diễn ra, biểu đồ
 * (đi cùng css/pages/admin/overview.css; dùng dữ liệu và hàm chung của event-shared.js)
 *
 * Gồm: 4 sự kiện đầu, danh sách sắp diễn ra, biểu đồ tròn điểm danh (Chart.js).
 * Bấm tên sự kiện sẽ mở events.html?open=<id> để xem và quản lý chi tiết.
 */
document.addEventListener('DOMContentLoaded', () => {

  const {
    qs, esc, fmt, infoRows, badge, getStatus, liveEvents, store,
    FALLBACK_IMAGE, IMG_ONERROR
  } = SEMSEvents;

  let chart = null;

  function renderDashboard() {
    const events = liveEvents();

    // --- Danh sách sự kiện (4 sự kiện đầu) ---
    qs('#dashboardEvents').innerHTML = events.slice(0, 4).map(e => `
      <div class="dash-event">
        <img class="ev-img dash-event-thumb" src="${e.image || FALLBACK_IMAGE}" alt="" ${IMG_ONERROR}>
        <div>
          <h3><a href="events.html?open=${e.id}">${esc(e.title)}</a></h3>
          ${infoRows(e)}
        </div>
        ${badge(e)}
      </div>`).join('') || '<div class="ev-empty">Chưa có sự kiện nào</div>';

    // --- Sắp diễn ra ---
    const upcoming = events.filter(e => getStatus(e) === 'Sắp diễn ra');
    qs('#upcomingCount').textContent = String(upcoming.length).padStart(2, '0');

    qs('#upcomingList').innerHTML = upcoming.slice(0, 5).map(e =>
      `<li><div>${esc(e.title)}<small>${fmt(e.start)}</small></div></li>`
    ).join('') || '<li>Chưa có sự kiện sắp diễn ra</li>';

    // --- Biểu đồ điểm danh ---
    const present = events.reduce((sum, e) => sum + (e.attendance || 0), 0);
    const absent = events.reduce((sum, e) => sum + (e.absent || 0), 0);

    if (window.Chart) {
      if (!chart) {
        chart = new Chart(qs('#attendanceChart'), {
          type: 'doughnut',
          data: {
            labels: ['Số lượng đi', 'Số lượng vắng'],
            datasets: [{
              data: [present, absent],
              backgroundColor: ['#1E70EB', '#9CA3AF'],
              borderColor: '#ffffff',
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '55%',
            plugins: { legend: { display: false } }
          }
        });
      } else {
        chart.data.datasets[0].data = [present, absent];
        chart.update();
      }
    }
  }

  qs('#todayLabel').textContent = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  renderDashboard();

  // Tự cập nhật trạng thái theo mốc thời gian (mỗi 30 giây)
  setInterval(renderDashboard, 30000);
});
