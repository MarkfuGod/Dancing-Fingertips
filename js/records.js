// ─────────────────────────────────────────────
//  Records screen
//  Reads / writes localStorage  df_records
//  Draws a bar chart on canvas  (replaces matplotlib)
// ─────────────────────────────────────────────

class RecordsScreen {
  constructor() {
    this._bg = new Background('blurred');
  }

  _loadRecords() {
    try {
      return JSON.parse(localStorage.getItem('df_records') || '[]');
    } catch(e) { return []; }
  }

  /** Aggregate by date, sum scores */
  _aggregate(records) {
    const map = {};
    for (const r of records) {
      map[r.date] = (map[r.date] || 0) + r.score;
    }
    // Last 10 dates
    const entries = Object.entries(map);
    entries.sort((a,b) => a[0].localeCompare(b[0]));
    return entries.slice(-10);
  }

  _drawChart(ctx, entries) {
    if (entries.length === 0) {
      drawText(ctx, 'No records yet!', SCREEN_W/2, SCREEN_H/2, {
        font: FONT_MD, color: 'rgba(255,255,255,0.5)',
      });
      return;
    }

    const chartX = 200, chartY = 150;
    const chartW = 800, chartH = 380;
    const maxScore = Math.max(...entries.map(e=>e[1]), 100);

    // Background panel
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,20,0.6)';
    ctx.beginPath();
    ctx.roundRect(chartX - 20, chartY - 30, chartW + 40, chartH + 80, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
      const y = chartY + chartH - (i / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(chartX, y); ctx.lineTo(chartX + chartW, y); ctx.stroke();
      drawText(ctx, String(Math.round(maxScore * i / 4)), chartX - 10, y, {
        font: '16px Cinzel', color: 'rgba(255,255,255,0.5)', align: 'right', baseline: 'middle',
      });
    }

    // Bars
    const barW  = Math.min(60, chartW / entries.length - 10);
    const gap   = (chartW - barW * entries.length) / (entries.length + 1);

    const gradient = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
    gradient.addColorStop(0, '#00e676');
    gradient.addColorStop(1, '#00bcd4');

    entries.forEach(([date, score], i) => {
      const x = chartX + gap + i * (barW + gap);
      const h = (score / maxScore) * chartH;
      const y = chartY + chartH - h;

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, [4, 4, 0, 0]);
      ctx.fill();

      // Score label
      drawText(ctx, String(score), x + barW/2, y - 12, {
        font: '16px Cinzel', color: '#00e676', shadow: true,
      });
      // Date label
      drawText(ctx, date, x + barW/2, chartY + chartH + 20, {
        font: '14px Cinzel', color: 'rgba(255,255,255,0.7)',
      });
    });

    ctx.restore();
  }

  /**
   * @returns {string} 'records'|'menu'
   */
  update(ctx, now, mouse) {
    this._bg.drawCover(ctx, now);
    drawOverlay(ctx, 0.35);

    drawText(ctx, 'RECORDS', SCREEN_W/2, 80, {
      font: FONT_MD, color: C.title, shadow: true,
    });

    const records = this._loadRecords();
    const entries = this._aggregate(records);
    this._drawChart(ctx, entries);

    if (drawButton(ctx, 'BACK', 120, SCREEN_H - 50, mouse, { w:160, h:55 })) {
      return 'menu';
    }
    return 'records';
  }
}
