import React, { useEffect, useState } from "react";
import "../style/Baocao.css";
import { FeatureHeader } from "./Common";

const REPORT_API_URL = "http://localhost:3000/api/report";
const ROOM_OCCUPANCY_API_URL = `${REPORT_API_URL}/room-occupancy-by-month`;
const NET_REVENUE_API_URL = `${REPORT_API_URL}/net-revenue-by-month`;
const GUEST_TYPE_API_URL = `${REPORT_API_URL}/guest-type-by-month`;
const RESERVATION_COUNT_API_URL = `${REPORT_API_URL}/reservation-count-by-month`;

const getCurrentMonthValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const readResponseBody = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const request = async (url) => {
  const response = await fetch(url);
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return body || {};
};

const createEmptyReportStats = () => ({
  occupancyRate: 0,
  usedRooms: 0,
  totalRooms: 0,
  netRevenue: 0,
  totalGuests: 0,
  bookedGuests: 0,
  walkInGuests: 0,
  reservationCount: 0,
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const Baocao = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportStats, setReportStats] = useState(createEmptyReportStats);

  useEffect(() => {
    const fetchReportData = async () => {
      const [year, month] = selectedMonth.split("-").map(Number);

      if (!year || !month) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const query = `?year=${year}&month=${month}`;
        const [occupancyData, revenueData, guestTypeData, reservationData] =
          await Promise.all([
            request(`${ROOM_OCCUPANCY_API_URL}${query}`),
            request(`${NET_REVENUE_API_URL}${query}`),
            request(`${GUEST_TYPE_API_URL}${query}`),
            request(`${RESERVATION_COUNT_API_URL}${query}`),
          ]);

        setReportStats({
          occupancyRate: Number(occupancyData?.["Công suất (%)"]) || 0,
          usedRooms: Number(occupancyData?.["Số phòng đã sử dụng"]) || 0,
          totalRooms: Number(occupancyData?.["Tổng số phòng"]) || 0,
          netRevenue: Number(revenueData?.["Thu nhập sau thuế"]) || 0,
          totalGuests: Number(guestTypeData?.["Tổng lượt khách"]) || 0,
          bookedGuests: Number(guestTypeData?.["Khách đặt trước"]) || 0,
          walkInGuests: Number(guestTypeData?.["Khách walk-in"]) || 0,
          reservationCount: Number(reservationData?.["Số lượng đặt phòng"]) || 0,
        });
      } catch (fetchError) {
        console.error("Khong the tai du lieu bao cao:", fetchError);
        setError("Không thể tải dữ liệu báo cáo.");
        setReportStats(createEmptyReportStats());
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedMonth]);

  const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);
  const occupancyValue = loading ? "..." : `${reportStats.occupancyRate.toFixed(2)}%`;
  const revenueValue = loading ? "..." : formatCurrency(reportStats.netRevenue);
  const stayValue = loading ? "..." : reportStats.totalGuests;
  const reservationValue = loading ? "..." : reportStats.reservationCount;
  const defaultDesc = loading ? "Đang tải dữ liệu..." : error || "";

  return (
    <div className="baocao-page">
      <div className="baocao-header-row">
        <FeatureHeader
          title="Báo cáo thống kê"
          description="Xem báo cáo công suất phòng và doanh thu"
        />
        <div className="baocao-month-picker">
          <label htmlFor="baocao-month">Chọn tháng</label>
          <input
            id="baocao-month"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
        </div>
      </div>

      <div className="baocao-stats-row">
        <div className="baocao-stat-card">
          <div className="baocao-stat-label">
            Công suất phòng <span className="baocao-stat-icon" style={{ color: "#2563eb" }}>%</span>
          </div>
          <div className="baocao-stat-value">{occupancyValue}</div>
          <div className="baocao-stat-desc">
            {defaultDesc || `${reportStats.usedRooms}/${reportStats.totalRooms} phòng được sử dụng`}
          </div>
        </div>
        <div className="baocao-stat-card">
          <div className="baocao-stat-label">
            Doanh thu <span className="baocao-stat-icon" style={{ color: "#22c55e" }}>$</span>
          </div>
          <div className="baocao-stat-value">{revenueValue}</div>
          <div className="baocao-stat-desc">
            {defaultDesc || `Tháng ${selectedMonthNumber} năm ${selectedYear}`}
          </div>
        </div>
        <div className="baocao-stat-card">
          <div className="baocao-stat-label">
            Lưu trú{" "}
            <span className="baocao-stat-icon" style={{ color: "#a855f7" }}>
              <i className="fa-solid fa-users"></i>
            </span>
          </div>
          <div className="baocao-stat-value">{stayValue}</div>
          <div className="baocao-stat-desc">
            {defaultDesc ||
              `${reportStats.bookedGuests} đặt trước, ${reportStats.walkInGuests} walk-in`}
          </div>
        </div>
        <div className="baocao-stat-card">
          <div className="baocao-stat-label">
            Đặt phòng{" "}
            <span className="baocao-stat-icon" style={{ color: "#f97316" }}>
              <i className="fa-solid fa-calendar-days"></i>
            </span>
          </div>
          <div className="baocao-stat-value">{reservationValue}</div>
          <div className="baocao-stat-desc">
            {defaultDesc || "Đặt phòng trong tháng"}
          </div>
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
