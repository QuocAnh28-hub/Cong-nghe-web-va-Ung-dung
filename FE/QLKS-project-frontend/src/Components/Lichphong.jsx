import React, { Component } from "react";
import "../style/Lichphong.css";

const ROOM_TYPES = [
  "Tất cả loại phòng",
  "Standard",
  "Deluxe",
  "Suite",
  "Family",
];
const STATUS_LABEL = {
  empty: "Trống",
  booked: "Đã đặt",
  occupied: "Đang ở",
  cleaned: "Dọn dẹp",
  maintenance: "Bảo trì",
};

const STATUS_COLOR = {
  empty: "#d4f8d4",
  booked: "#cfe9ff",
  occupied: "#ffc6c6",
  cleaned: "#fff1a8",
  maintenance: "#f0f0f0",
};

const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function makeMonthDates(year, month) {
  const days = getDaysInMonth(year, month);
  const dates = [];
  for (let d = 1; d <= days; d++) {
    dates.push(new Date(year, month, d));
  }
  return dates;
}

class Lichphong extends Component {
  state = {
    selectedType: "Tất cả loại phòng",
    currentMonth: 2,
    currentYear: 2026,
    rooms: [
      {
        id: 101,
        name: "101",
        type: "Suite",
        schedule: {
          16: "empty",
          17: "booked",
          18: "occupied",
          19: "cleaned",
          20: "empty",
          21: "empty",
          22: "maintenance",
          23: "empty",
          24: "booked",
          25: "booked",
          26: "occupied",
          27: "cleaned",
          28: "empty",
          29: "empty",
        },
      },
      {
        id: 102,
        name: "102",
        type: "Family",
        schedule: {
          16: "occupied",
          17: "occupied",
          18: "occupied",
          19: "cleaned",
          20: "booked",
          21: "booked",
          22: "empty",
          23: "empty",
          24: "empty",
          25: "maintenance",
          26: "maintenance",
          27: "empty",
          28: "empty",
          29: "booked",
        },
      },
      {
        id: 103,
        name: "103",
        type: "Standard",
        schedule: {
          16: "empty",
          17: "empty",
          18: "empty",
          19: "booked",
          20: "booked",
          21: "occupied",
          22: "occupied",
          23: "cleaned",
          24: "empty",
          25: "empty",
          26: "empty",
          27: "booked",
          28: "booked",
          29: "empty",
        },
      },
    ],
  };

  getFilteredRooms() {
    const { selectedType, rooms } = this.state;
    if (selectedType === "Tất cả loại phòng") return rooms;
    return rooms.filter((room) => room.type === selectedType);
  }

  handleRoomTypeChange = (event) => {
    this.setState({ selectedType: event.target.value });
  };

  prevMonth = () => {
    this.setState((prev) => {
      const month = prev.currentMonth === 0 ? 11 : prev.currentMonth - 1;
      const year =
        prev.currentMonth === 0 ? prev.currentYear - 1 : prev.currentYear;
      return { currentMonth: month, currentYear: year };
    });
  };

  nextMonth = () => {
    this.setState((prev) => {
      const month = prev.currentMonth === 11 ? 0 : prev.currentMonth + 1;
      const year =
        prev.currentMonth === 11 ? prev.currentYear + 1 : prev.currentYear;
      return { currentMonth: month, currentYear: year };
    });
  };

  render() {
    const { currentMonth, currentYear, selectedType } = this.state;
    const dates = makeMonthDates(currentYear, currentMonth);
    const filteredRooms = this.getFilteredRooms();

    const monthText = `${MONTHS[currentMonth]} ${currentYear}`;
    const tableWidth = Math.max(2200, dates.length * 90 + 180);

    return (
      <div className="lichphong">
        <div className="lichphong-header-wrap">
          <div className="lichphong-title">
            <h1>Lịch phòng</h1>
            <p>Xem tình trạng phòng theo lịch</p>
          </div>
          <div className="lichphong-filter">
            <select value={selectedType} onChange={this.handleRoomTypeChange}>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="lichphong-main">
          <div className="lichphong-range">
            <button type="button" onClick={this.prevMonth} className="nav-btn">
              ←
            </button>
            <span className="month-label">
              <i className="fa-regular fa-calendar-check"></i> {monthText}
            </span>
            <button type="button" onClick={this.nextMonth} className="nav-btn">
              →
            </button>
          </div>
          <div className="lichphong-legend">
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <span key={key} className="legend-item">
                <i style={{ background: STATUS_COLOR[key] }} /> {label}
              </span>
            ))}
          </div>
          {filteredRooms.length === 0 ? (
            <div className="lichphong-empty">Không có phòng cho loại này</div>
          ) : (
            <div className="lichphong-table-wrapper">
              <table
                className="lichphong-table"
                style={{ minWidth: tableWidth }}
              >
                <thead>
                  <tr>
                    <th>Phòng</th>
                    {dates.map((d) => (
                      <th key={d.toISOString()}>
                        {d.getDate()}/{d.getMonth() + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr key={room.id}>
                      <td className="room-cell">
                        <div>{room.name}</div>
                        <div className="room-type">{room.type}</div>
                      </td>
                      {dates.map((d) => {
                        const dayKey = `${d.getDate()}`;
                        const status = room.schedule[dayKey] || "empty";
                        return (
                          <td
                            key={`${room.id}-${d.toISOString()}`}
                            className={`status-${status}`}
                            style={{ backgroundColor: STATUS_COLOR[status] }}
                          >
                            {STATUS_LABEL[status]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Lichphong;