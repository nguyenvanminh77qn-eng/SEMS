/**
 * SEMS CUSTOM SVG CHARTS ENGINE (WITH SMOOTH & MEASURED ANIMATIONS)
 * Pure JavaScript & SVG for pixel-perfect fidelity to reference wireframes
 */

const SEMSCharts = {
  /**
   * Render Vertical Bar Chart (e.g. MH-26, MH-27)
   */
  renderMonthlyBarChart(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      data = [],
      yMax = 100,
      yStep = 25,
      yPrefix = '',
      barColor = '#1E70EB',
      height = 260
    } = options;

    const padding = { top: 30, right: 20, bottom: 40, left: 45 };
    const svgWidth = 850;
    const svgHeight = height;
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // Y ticks
    let yLinesHtml = '';
    for (let v = 0; v <= yMax; v += yStep) {
      const y = padding.top + chartHeight - (v / yMax) * chartHeight;
      yLinesHtml += `
        <line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}" stroke="#E5E7EB" stroke-width="1" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="#4B5563" font-size="12" text-anchor="end">${yPrefix}${v}</text>
      `;
    }

    // Bars
    const barWidth = 36;
    const count = data.length;
    const step = chartWidth / count;

    let barsHtml = '';
    data.forEach((item, index) => {
      const x = padding.left + index * step + (step - barWidth) / 2;
      const bHeight = Math.max((item.value / yMax) * chartHeight, 2);
      const y = padding.top + chartHeight - bHeight;
      const delay = (index * 0.08).toFixed(2);

      barsHtml += `
        <g class="chart-bar-group">
          <rect class="chart-bar-rect" 
                x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" 
                fill="${barColor}" rx="1" ry="1" 
                style="animation-delay: ${delay}s;">
            <title>${item.label}: ${item.value} sự kiện/lượt</title>
          </rect>
          <text x="${x + barWidth / 2}" y="${svgHeight - 12}" fill="#374151" font-size="12" text-anchor="middle">${item.label}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <div style="width: 100%; overflow-x: auto;">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; min-width: 600px; height: auto; display: block;">
          <!-- Grid & Axes -->
          ${yLinesHtml}
          <!-- Baseline -->
          <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${svgWidth - padding.right}" y2="${padding.top + chartHeight}" stroke="#9CA3AF" stroke-width="1.5" />
          <!-- Left Axis -->
          <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="#9CA3AF" stroke-width="1.5" />
          <!-- Bars -->
          ${barsHtml}
        </svg>
      </div>
    `;
  },

  /**
   * Render Double / Grouped Bar Chart (MH-29 Left)
   */
  renderGroupedBarChart(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      data = [],
      yMax = 400,
      yStep = 50,
      height = 280
    } = options;

    const padding = { top: 35, right: 20, bottom: 40, left: 45 };
    const svgWidth = 460;
    const svgHeight = height;
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // Y grid
    let yLinesHtml = '';
    for (let v = 0; v <= yMax; v += yStep) {
      const y = padding.top + chartHeight - (v / yMax) * chartHeight;
      yLinesHtml += `
        <line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}" stroke="#E5E7EB" stroke-width="1" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="#4B5563" font-size="12" text-anchor="end">${v}</text>
      `;
    }

    const groupCount = data.length;
    const groupStep = chartWidth / groupCount;
    const barWidth = 28;
    const gap = 0;

    let barsHtml = '';
    data.forEach((group, index) => {
      const groupX = padding.left + index * groupStep + (groupStep - (barWidth * 2 + gap)) / 2;

      // Primary Bar (Số đăng ký)
      const h1 = (group.val1 / yMax) * chartHeight;
      const y1 = padding.top + chartHeight - h1;

      // Secondary Bar (Thực tế)
      const h2 = (group.val2 / yMax) * chartHeight;
      const y2 = padding.top + chartHeight - h2;

      const delay1 = (index * 0.16).toFixed(2);
      const delay2 = (index * 0.16 + 0.08).toFixed(2);

      barsHtml += `
        <g class="chart-group">
          <!-- Value 1 -->
          <text class="chart-val-text" x="${groupX + barWidth / 2}" y="${y1 - 6}" fill="#1E70EB" font-size="12" font-weight="600" text-anchor="middle">${group.val1}</text>
          <rect class="chart-bar-rect" x="${groupX}" y="${y1}" width="${barWidth}" height="${h1}" fill="#1E70EB" stroke="#1E70EB" style="animation-delay: ${delay1}s;">
            <title>${group.label} - Đăng ký: ${group.val1}</title>
          </rect>

          <!-- Value 2 -->
          <text class="chart-val-text" x="${groupX + barWidth + gap + barWidth / 2}" y="${y2 - 6}" fill="#1F2937" font-size="12" font-weight="600" text-anchor="middle">${group.val2}</text>
          <rect class="chart-bar-rect" x="${groupX + barWidth + gap}" y="${y2}" width="${barWidth}" height="${h2}" fill="#DCE8FA" stroke="#1F2937" stroke-width="1.2" style="animation-delay: ${delay2}s;">
            <title>${group.label} - Thực tế: ${group.val2}</title>
          </rect>

          <!-- Label -->
          <text x="${groupX + barWidth + gap / 2}" y="${svgHeight - 12}" fill="#1F2937" font-size="13" font-weight="500" text-anchor="middle">${group.label}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <div style="width: 100%;">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: auto; display: block;">
          ${yLinesHtml}
          <!-- Axes -->
          <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="#1F2937" stroke-width="1.2" />
          <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${svgWidth - padding.right}" y2="${padding.top + chartHeight}" stroke="#1F2937" stroke-width="1.2" />
          ${barsHtml}
        </svg>
      </div>
    `;
  },

  /**
   * Render Rating Bar Chart (MH-29 Right - Scale of 5)
   */
  renderScoreBarChart(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      data = [],
      yMax = 5,
      height = 280
    } = options;

    const padding = { top: 35, right: 20, bottom: 40, left: 35 };
    const svgWidth = 460;
    const svgHeight = height;
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // Y ticks 0 to 5
    let yLinesHtml = '';
    for (let v = 0; v <= yMax; v++) {
      const y = padding.top + chartHeight - (v / yMax) * chartHeight;
      yLinesHtml += `
        <line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}" stroke="#E5E7EB" stroke-width="1" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="#4B5563" font-size="12" text-anchor="end">${v}</text>
      `;
    }

    const count = data.length;
    const step = chartWidth / count;
    const barWidth = 44;

    let barsHtml = '';
    data.forEach((item, index) => {
      const x = padding.left + index * step + (step - barWidth) / 2;
      const bHeight = (item.score / yMax) * chartHeight;
      const y = padding.top + chartHeight - bHeight;
      const delay = (index * 0.15).toFixed(2);

      barsHtml += `
        <g class="score-bar">
          <text class="chart-val-text" x="${x + barWidth / 2}" y="${y - 6}" fill="#1E70EB" font-size="12" font-weight="600" text-anchor="middle">${item.score.toFixed(1)}</text>
          <rect class="chart-bar-rect" x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="#1E70EB" stroke="#1F2937" stroke-width="1" style="animation-delay: ${delay}s;">
            <title>${item.label}: ${item.score} sao</title>
          </rect>
          <text x="${x + barWidth / 2}" y="${svgHeight - 12}" fill="#1F2937" font-size="13" font-weight="500" text-anchor="middle">${item.label}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <div style="width: 100%;">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: auto; display: block;">
          ${yLinesHtml}
          <!-- Axes -->
          <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="#1F2937" stroke-width="1.2" />
          <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${svgWidth - padding.right}" y2="${padding.top + chartHeight}" stroke="#1F2937" stroke-width="1.2" />
          ${barsHtml}
        </svg>
      </div>
    `;
  },

  /**
   * Render Horizontal Bar Chart (MH-28 Bottom - Top 5 Clubs) with smooth growth animation
   */
  renderHorizontalBarChart(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      data = [],
      maxVal = 1300
    } = options;

    let barsHtml = '';
    data.forEach((item, index) => {
      const pct = (item.value / maxVal) * 100;
      barsHtml += `
        <div class="h-bar-row" style="display: flex; align-items: center; margin-bottom: 12px; gap: 16px;">
          <div style="width: 170px; min-width: 170px; font-size: 14px; color: #1F2937; font-weight: 500;">${item.label}</div>
          <div style="flex: 1; background-color: #F3F4F6; border-radius: 2px; height: 26px; position: relative; overflow: hidden;">
            <div class="h-bar-animated"
                 style="width: ${pct}%; background-color: #1E70EB; height: 100%; border-radius: 2px; display: flex; align-items: center; padding-left: 10px; color: #FFFFFF; font-size: 13px; font-weight: 600; animation-delay: ${index * 0.08}s;">
              ${item.value}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="horizontal-bars-wrapper" style="padding-top: 10px;">
        ${barsHtml}
      </div>
    `;

  }
};
