import React, { useEffect, useState } from "react";
import "../style/Baocao.css";
import { FeatureHeader } from "./Common";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const REPORT_API_URL = "http://localhost:3000/api/report";
const ROOM_OCCUPANCY_API_URL = `${REPORT_API_URL}/room-occupancy-by-month`;
const NET_REVENUE_API_URL = `${REPORT_API_URL}/net-revenue-by-month`;
const GUEST_TYPE_API_URL = `${REPORT_API_URL}/guest-type-by-month`;
const RESERVATION_COUNT_API_URL = `${REPORT_API_URL}/reservation-count-by-month`;
const REVENUE_BY_DAY_API_URL = `${REPORT_API_URL}/revenue-by-day-in-month`;
const REVENUE_BY_ROOM_TYPE_API_URL = `${REPORT_API_URL}/revenue-by-room-type-in-month`;
const ROOM_TYPE_USAGE_PERCENT_API_URL = `${REPORT_API_URL}/room-type-usage-percent-in-month`;
const REVENUE_BY_CUSTOMER_TYPE_API_URL = `${REPORT_API_URL}/revenue-by-customer-type`;

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

const COLORS = ["#2563eb", "#22c55e", "#a855f7", "#f97316", "#ec4899", "#14b8a6"];

const formatCurrencyForChart = (value) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toFixed(0);
};

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
  const [revenueByDayData, setRevenueByDayData] = useState([]);
  const [revenueByRoomTypeData, setRevenueByRoomTypeData] = useState([]);
  const [roomTypeUsagePercentData, setRoomTypeUsagePercentData] = useState([]);
  const [revenueByCustomerTypeData, setRevenueByCustomerTypeData] = useState([]);
  const [totalRevenueByCustomer, setTotalRevenueByCustomer] = useState(0);

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
        const [occupancyData, revenueData, guestTypeData, reservationData, revenueByDay, revenueByRoomType, roomTypeUsagePercent, revenueByCustomerType] =
          await Promise.all([
            request(`${ROOM_OCCUPANCY_API_URL}${query}`),
            request(`${NET_REVENUE_API_URL}${query}`),
            request(`${GUEST_TYPE_API_URL}${query}`),
            request(`${RESERVATION_COUNT_API_URL}${query}`),
            request(`${REVENUE_BY_DAY_API_URL}${query}`),
            request(`${REVENUE_BY_ROOM_TYPE_API_URL}${query}`),
            request(`${ROOM_TYPE_USAGE_PERCENT_API_URL}${query}`),
            request(`${REVENUE_BY_CUSTOMER_TYPE_API_URL}${query}`),
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

        // Process revenue by day data
        if (Array.isArray(revenueByDay)) {
          setRevenueByDayData(
            revenueByDay.map((item, index) => ({
              name: `Ngày ${index + 1}`,
              revenue: Number(item["DoanhThu"]) || 0,
            }))
          );
        }

        // Process revenue by room type data
        if (Array.isArray(revenueByRoomType)) {
          setRevenueByRoomTypeData(
            revenueByRoomType.map((item) => ({
              name: item["TenLoaiPhong"],
              revenue: Number(item["DoanhThu"]) || 0,
            }))
          );
        }

        // Process room type usage percent data
        if (Array.isArray(roomTypeUsagePercent)) {
          setRoomTypeUsagePercentData(
            roomTypeUsagePercent.map((item) => ({
              name: item["TenLoaiPhong"],
              value: Number(item["PhanTramSuDung"]) || 0,
            }))
          );
        }

        // Process revenue by customer type data
        if (Array.isArray(revenueByCustomerType)) {
          const processedData = revenueByCustomerType.map((item) => ({
            name: item["CustomerType"],
            value: Number(item["Percentage"]) || 0,
            revenue: Number(item["TotalRevenue"]) || 0,
          }));
          setRevenueByCustomerTypeData(processedData);
          const total = processedData.reduce((sum, item) => sum + item.revenue, 0);
          setTotalRevenueByCustomer(total);
        }
      } catch (fetchError) {
        console.error("Khong the tai du lieu bao cao:", fetchError);
        setError("Không thể tải dữ liệu báo cáo.");
        setReportStats(createEmptyReportStats());
        setRevenueByDayData([]);
        setRevenueByRoomTypeData([]);
        setRoomTypeUsagePercentData([]);
        setRevenueByCustomerTypeData([]);
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
          {loading ? (
            <div className="baocao-chart-placeholder">Đang tải dữ liệu...</div>
          ) : revenueByDayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={revenueByDayData} margin={{ bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  interval={Math.ceil(revenueByDayData.length / 10) - 1}
                  angle={-45} 
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickFormatter={formatCurrencyForChart} width={50} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="baocao-chart-placeholder">Không có dữ liệu</div>
          )}
        </div>
        <div className="baocao-chart-card">
          <div className="baocao-chart-title">Doanh thu theo kênh</div>
          {loading ? (
            <div className="baocao-chart-placeholder">Đang tải dữ liệu...</div>
          ) : revenueByCustomerTypeData.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "50px", marginBottom: "0px", gap: "30px", flex: 1 }}>
                <div style={{ flex: "0 0 300px", display: "flex", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={revenueByCustomerTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueByCustomerTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>Tổng:</div>
                  <div style={{ color: "#22c55e", fontSize: "22px", marginBottom: "12px", fontWeight: "bold" }}>
                    {formatCurrency(totalRevenueByCustomer)}
                  </div>
                  <div style={{ fontSize: "11px" }}>
                    {revenueByCustomerTypeData.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: "8px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: COLORS[idx % COLORS.length], borderRadius: "2px", flexShrink: 0, marginTop: "1px" }}></span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", color: "#333" }}>{item.name}</div>
                          <div style={{ color: "#666", fontSize: "10px", marginTop: "1px" }}>
                            {item.value.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="baocao-chart-placeholder">Không có dữ liệu</div>
          )}
        </div>
      </div>
      <div className="baocao-charts-row">
        <div className="baocao-chart-card">
          <div className="baocao-chart-title">Doanh thu theo loại phòng</div>
          {loading ? (
            <div className="baocao-chart-placeholder">Đang tải dữ liệu...</div>
          ) : revenueByRoomTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueByRoomTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrencyForChart} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="baocao-chart-placeholder">Không có dữ liệu</div>
          )}
        </div>
        <div className="baocao-chart-card">
          <div className="baocao-chart-title">Công suất theo loại phòng</div>
          {loading ? (
            <div className="baocao-chart-placeholder">Đang tải dữ liệu...</div>
          ) : roomTypeUsagePercentData.length > 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "30px", height: "100%", padding: "0px 15px 0 15px" }}>
              <div style={{ flex: "0 0 300px", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roomTypeUsagePercentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roomTypeUsagePercentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: "180px", fontSize: "11px" }}>
                {roomTypeUsagePercentData.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: COLORS[idx % COLORS.length], borderRadius: "3px", flexShrink: 0 }}></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#333" }}>{item.name}</div>
                      <div style={{ color: "#666", fontSize: "10px", marginTop: "1px" }}>
                        {item.value.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="baocao-chart-placeholder">Không có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Baocao;
