import React, { Component } from "react";
import "../style/Tongquan.css";
import Header from "./Header";
import { FeatureHeader } from "./Common";

const OVERVIEW_API_URL = "http://localhost:3000/api/overview";
const ROOM_STATISTICS_API_URL = `${OVERVIEW_API_URL}/room-statistics`;
const OCCUPANCY_RATE_API_URL = `${OVERVIEW_API_URL}/occupancy-rate`;
const ROOM_STATUS_SUMMARY_API_URL = `${OVERVIEW_API_URL}/room-status-summary`;
const CUSTOMER_SUMMARY_API_URL = `${OVERVIEW_API_URL}/customer-summary`;

class Tongquan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      role: "",
      name: "",
      overview: {
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        occupancyRate: 0,
        dirtyRooms: 0,
        totalCustomers: 0,
        stayingGuests: 0,
      },
    };
  }

  componentDidMount() {
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin !== "true") {
      window.location.href = "/login";
      return;
    }

    const role = localStorage.getItem("role");
    const name = localStorage.getItem("email");

    this.setState({
      role,
      name,
    });

    this.fetchOverviewData();
  }

  readResponseBody = async (response) => {
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

  request = async (url) => {
    const response = await fetch(url);
    const body = await this.readResponseBody(response);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return body || {};
  };

  fetchOverviewData = async () => {
    try {
      const [roomStatistics, occupancyRate, roomStatusSummary, customerSummary] = await Promise.all([
        this.request(ROOM_STATISTICS_API_URL),
        this.request(OCCUPANCY_RATE_API_URL),
        this.request(ROOM_STATUS_SUMMARY_API_URL),
        this.request(CUSTOMER_SUMMARY_API_URL),
      ]);

      this.setState({
        overview: {
          totalRooms: Number(roomStatistics?.TotalRooms) || 0,
          availableRooms: Number(roomStatistics?.AvailableRooms) || 0,
          occupiedRooms: Number(roomStatistics?.OccupiedRooms) || 0,
          occupancyRate: Number(occupancyRate?.OccupancyRate) || 0,
          dirtyRooms: Number(roomStatusSummary?.DirtyRooms) || 0,
          totalCustomers: Number(customerSummary?.TotalCustomers) || 0,
          stayingGuests: Number(customerSummary?.StayingGuests) || 0,
        },
      });
    } catch (error) {
      console.error("Khong the tai du lieu tong quan:", error);
    }
  };

  render() {
    const { role, name, overview } = this.state;

    return (
      <div className="tongquan">
        <Header Name={name} Role={role} />

        <FeatureHeader
          title="Tổng quan"
          description="Chào mừng đến với hệ thống quản lý khách sạn"
        />

        <div className="tongquan-mid">
          <Cards
            title="Tổng số phòng"
            logo="fa-solid fa-building"
            number={overview.totalRooms}
            desc={`Trống: ${overview.availableRooms} | Đang dùng: ${overview.occupiedRooms}`}
          />

          <Cards
            title="Công suất phòng"
            logo="fa-solid fa-bed"
            number={`${overview.occupancyRate}%`}
            desc=""
          />

          <Cards
            title="Check-in/out hôm nay"
            logo="fa-solid fa-calendar-check"
            number="0"
            desc="Nhận / Trả phòng"
          />

          <Cards
            title="Doanh thu tháng này"
            logo="fa-solid fa-money-bill"
            number="0"
            desc="Từ 0 lượt lưu trú"
          />
        </div>

        <div className="tongquan-low">
          <Activity
            title="Trạng thái phòng"
            items={[
              {
                label: "Phòng trống",
                value: overview.availableRooms,
                color: "green",
                className: "phongtrong",
              },
              {
                label: "Đang sử dụng",
                value: overview.occupiedRooms,
                color: "blue",
                className: "dangsudung",
              },
              {
                label: "Cần dọn dẹp",
                value: overview.dirtyRooms,
                color: "orange",
                className: "candondep",
              },
            ]}
          />

          <Activity
            title="Thông tin khách"
            items={[
              {
                label: "Tổng khách hàng",
                logo: "fa-solid fa-user",
                value: overview.totalCustomers,
              },
              {
                label: "Đang lưu trú",
                logo: "fa-solid fa-user-check",
                value: overview.stayingGuests,
              },
            ]}
          />
        </div>
      </div>
    );
  }
}

function Cards({ title, logo, number, desc }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <i className={logo}></i>
      <p className="number">{number}</p>
      <span>{desc}</span>
    </div>
  );
}

function Activity({ title, items }) {
  return (
    <div className="activity">
      <h3>{title}</h3>

      {items.map((item, index) => (
        <div className={`act ${item.className || ""}`} key={index}>
          <div className="act-left">
            {item.logo && <i className={item.logo}></i>}
            <p className={item.color}>{item.label}</p>
          </div>

          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default Tongquan;
