import React from "react";
import "../style/Baocao.css";

const Baocao = () => {
  return (
    <div className="baocao-page">
      <div className="baocao-header-row">
        <div>
          <h1 className="baocao-title">Báo cáo</h1>
          <p className="baocao-desc">Công suất phòng và doanh thu</p>
        </div>
        <div className="baocao-month-picker">
          <label>Chọn tháng</label>
          <input type="text" value="Tháng Ba 2026" readOnly />
        </div>
      </div>

      <div className="baocao-stats-row">
        <div className="baocao-stat-card">
          <div className="baocao-stat-label">Công suất phòng <span className="baocao-stat-icon" style={{color:'#2563eb'}}>%</span></div>
          <div className="baocao-stat-value">0.0%</div>
          <div className="baocao-stat-desc">0/32 phòng đang sử dụng</div>
        </div>
        <div className="baocao-stat-card">
          <div className="baocao-stat-label">Doanh thu <span className="baocao-stat-icon" style={{color:'#22c55e'}}>$</span></div>
          <div className="baocao-stat-value">0đ</div>
          <div className="baocao-stat-desc">Tháng tháng 3 năm 2026</div>
        </div>
        <div className="baocao-stat-card">
          <div className="baocao-stat-label">Lưu trú <span className="baocao-stat-icon" style={{color:'#a855f7'}}><i class="fa-solid fa-users"></i></span></div>
          <div className="baocao-stat-value">0</div>
          <div className="baocao-stat-desc">0 đặt trước, 0 walk-in</div>
        </div>
        <div className="baocao-stat-card">
          <div className="baocao-stat-label">Đặt phòng <span className="baocao-stat-icon" style={{color:'#f97316'}}><i class="fa-solid fa-calendar-days"></i></span></div>
          <div className="baocao-stat-value">0</div>
          <div className="baocao-stat-desc">Đặt phòng trong tháng</div>
        </div>
      </div>

      <div className="baocao-charts-row">
        <div className="baocao-chart-card">
          <div className="baocao-chart-title">Doanh thu theo ngày</div>
          <div className="baocao-chart-placeholder">[Biểu đồ doanh thu theo ngày]</div>
        </div>
        <div className="baocao-chart-card">
          <div className="baocao-chart-title">Doanh thu theo kênh</div>
          <div className="baocao-chart-placeholder">[Biểu đồ doanh thu theo kênh]</div>
        </div>
      </div>
      <div className="baocao-charts-row">
        <div className="baocao-chart-card">
          <div className="baocao-chart-title">Doanh thu theo loại phòng</div>
          <div className="baocao-chart-placeholder">[Biểu đồ doanh thu theo loại phòng]</div>
        </div>
        <div className="baocao-chart-card">
          <div className="baocao-chart-title">Công suất theo loại phòng</div>
          <div className="baocao-chart-placeholder">[Biểu đồ công suất theo loại phòng]</div>
        </div>
      </div>
    </div>
  );
};

export default Baocao;