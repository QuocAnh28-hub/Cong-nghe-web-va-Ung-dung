import React, { Component } from "react";
import "../style/Lichphong.css";
import { FeatureHeader } from "./Common";

const CALENDAR_API_URL = "http://localhost:3000/api/rooms/calendar";
const ALL_ROOM_TYPES = "all";

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

const STATUS_META = {
  available: { label: "Trống", color: "#d4f8d4" },
  booked: { label: "Đã đặt", color: "#cfe9ff" },
  occupied: { label: "Đang ở", color: "#ffc6c6" },
  cleaned: { label: "Cần dọn", color: "#fff1a8" },
  maintenance: { label: "Bảo trì", color: "#f0f0f0" },
  unknown: { label: "Không rõ", color: "#eceff4" },
};

const STATUS_ORDER = ["available", "booked", "occupied", "cleaned", "maintenance"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function makeMonthDates(year, month) {
  const days = getDaysInMonth(year, month);
  const dates = [];
  for (let d = 1; d <= days; d += 1) {
    dates.push(new Date(year, month, d));
  }
  return dates;
}

function normalizeApiStatus(rawStatus) {
  const normalized = String(rawStatus || "").trim().toUpperCase();

  if (["AVAILABLE", "EMPTY", "VACANT"].includes(normalized)) return "available";
  if (["BOOKED", "RESERVED", "HOLD"].includes(normalized)) return "booked";
  if (["OCCUPIED", "CHECKED_IN", "IN_USE"].includes(normalized)) return "occupied";
  if (["DIRTY", "CLEANING", "CLEANED"].includes(normalized)) return "cleaned";
  if (["MAINTENANCE", "OUT_OF_SERVICE"].includes(normalized)) return "maintenance";

  return "unknown";
}

function mapCalendarDataToRooms(items) {
  const roomMap = new Map();

  (Array.isArray(items) ? items : []).forEach((item, index) => {
    const roomKey = String(item?.RoomID ?? item?.RoomNumber ?? `unknown-${index}`);
    const roomNumber = String(item?.RoomNumber ?? roomKey);
    const roomType = String(item?.RoomType ?? "Khác");

    if (!roomMap.has(roomKey)) {
      roomMap.set(roomKey, {
        id: roomKey,
        name: roomNumber,
        type: roomType,
        schedule: {},
      });
    }

    if (!item?.Date) return;

    const dateObj = new Date(item.Date);
    if (Number.isNaN(dateObj.getTime())) return;

    const day = dateObj.getDate();
    roomMap.get(roomKey).schedule[String(day)] = normalizeApiStatus(item?.Status);
  });

  return Array.from(roomMap.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name), "vi", { numeric: true }),
  );
}

class Lichphong extends Component {
  state = {
    selectedType: ALL_ROOM_TYPES,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    roomTypes: [],
    rooms: [],
    loading: true,
    error: "",
  };

  componentDidMount() {
    this.fetchCalendar();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentMonth !== this.state.currentMonth ||
      prevState.currentYear !== this.state.currentYear
    ) {
      this.fetchCalendar();
    }
  }

  fetchCalendar = async () => {
    const { currentMonth, currentYear } = this.state;

    this.setState({ loading: true, error: "" });

    try {
      const response = await fetch(
        `${CALENDAR_API_URL}?month=${currentMonth + 1}&year=${currentYear}`,
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const payload = await response.json();
      const items = Array.isArray(payload?.data) ? payload.data : [];
      const rooms = mapCalendarDataToRooms(items);
      const roomTypes = Array.from(
        new Set(rooms.map((room) => room.type).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "vi"));

      this.setState((prev) => ({
        rooms,
        roomTypes,
        selectedType: roomTypes.includes(prev.selectedType)
          ? prev.selectedType
          : ALL_ROOM_TYPES,
        loading: false,
      }));
    } catch (err) {
      this.setState({
        rooms: [],
        roomTypes: [],
        loading: false,
        error: err.message || "Không thể tải lịch phòng.",
      });
    }
  };

  getFilteredRooms() {
    const { selectedType, rooms } = this.state;
    if (selectedType === ALL_ROOM_TYPES) return rooms;
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
    const { currentMonth, currentYear, selectedType, roomTypes, loading, error } =
      this.state;
    const dates = makeMonthDates(currentYear, currentMonth);
    const filteredRooms = this.getFilteredRooms();

    const monthText = `${MONTHS[currentMonth]} ${currentYear}`;
    const tableWidth = Math.max(2200, dates.length * 90 + 180);

    return (
      <div className="lichphong">
        <div className="lichphong-header-wrap">
          <FeatureHeader
            title="Lịch phòng"
            description="Xem tình trạng phòng theo lịch"
          />
          <div className="lichphong-filter">
            <select value={selectedType} onChange={this.handleRoomTypeChange}>
              <option value={ALL_ROOM_TYPES}>Tất cả loại phòng</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lichphong-main">
          <div className="lichphong-range">
            <button type="button" onClick={this.prevMonth} className="nav-btn">
              {"‹"}
            </button>
            <span className="month-label">
              <i className="fa-regular fa-calendar-check"></i> {monthText}
            </span>
            <button type="button" onClick={this.nextMonth} className="nav-btn">
              {"›"}
            </button>
          </div>

          <div className="lichphong-legend">
            {STATUS_ORDER.map((statusKey) => (
              <span key={statusKey} className="legend-item">
                <i style={{ background: STATUS_META[statusKey].color }} />
                {STATUS_META[statusKey].label}
              </span>
            ))}
          </div>

          {error && <div className="lichphong-empty">{error}</div>}

          {loading ? (
            <div className="lichphong-empty">Đang tải dữ liệu lịch phòng...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="lichphong-empty">Không có phòng cho bộ lọc hiện tại.</div>
          ) : (
            <div className="lichphong-table-wrapper">
              <table className="lichphong-table" style={{ minWidth: tableWidth }}>
                <thead>
                  <tr>
                    <th>Phòng</th>
                    {dates.map((date) => (
                      <th key={date.toISOString()}>
                        {date.getDate()}/{date.getMonth() + 1}
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
                      {dates.map((date) => {
                        const dayKey = String(date.getDate());
                        const status = room.schedule[dayKey] || "unknown";
                        const meta = STATUS_META[status] || STATUS_META.unknown;

                        return (
                          <td
                            key={`${room.id}-${date.toISOString()}`}
                            className={`status-${status}`}
                            style={{ backgroundColor: meta.color }}
                          >
                            {meta.label}
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