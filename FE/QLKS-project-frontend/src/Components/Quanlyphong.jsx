import React, { Component } from "react";
import "../style/Quanlyphong.css";
import { FeatureHeader } from "./Common";

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Trống" },
  { value: "OCCUPIED", label: "Đang dùng" },
  { value: "DIRTY", label: "Cần dọn" },
  { value: "MAINTENANCE", label: "Bảo trì" },
];

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family"];

const getStatusLabel = (status) => {
  const item = STATUS_OPTIONS.find((option) => option.value === status);
  return item ? item.label : status;
};

const getStatusClass = (status) => status.toLowerCase();

class Quanlyphong extends Component {
  state = {
    rooms: [],
    search: "",
    statusFilter: "Tất cả trạng thái",
    isModalOpen: false,
    modalMode: "add",
    currentRoom: {
      RoomID: null,
      RoomNumber: "",
      RoomTypeName: "",
      Status: "AVAILABLE",
      Description: "",
      Capacity: 1,
      DefaultPrice: 0,
    },
    loading: false,
    error: null,
  };

  componentDidMount() {
    this.fetchRooms();
  }

  fetchRooms = async () => {
    this.setState({ loading: true, error: null });

    try {
      const response = await fetch("http://localhost:3000/api/rooms");
      if (!response.ok) {
        throw new Error(`Lỗi tải dữ liệu: ${response.status}`);
      }
      const data = await response.json();
      const rooms = data.map((item) => ({
        RoomID: item.RoomID,
        RoomNumber: item.RoomNumber,
        RoomTypeName: item.RoomTypeName,
        Status: item.Status,
        Description: item.Description || "",
        Capacity: item.Capacity || 1,
        DefaultPrice: item.DefaultPrice || 0,
      }));
      this.setState({ rooms, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  getFilteredRooms() {
    const { rooms, search, statusFilter } = this.state;
    return rooms.filter((room) => {
      const matchNumber = room.RoomNumber
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Tất cả trạng thái" ||
        getStatusLabel(room.Status) === statusFilter;
      return matchNumber && matchStatus;
    });
  }

  openAddModal = () => {
    this.setState({
      isModalOpen: true,
      modalMode: "add",
      currentRoom: {
        RoomID: null,
        RoomNumber: "",
        RoomTypeName: "",
        Status: "AVAILABLE",
        Description: "",
        Capacity: 1,
        DefaultPrice: 0,
      },
    });
  };

  openEditModal = (room) => {
    this.setState({
      isModalOpen: true,
      modalMode: "edit",
      currentRoom: { ...room },
    });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleChange = (field) => (event) => {
    const value = event.target.type === "number" ? Number(event.target.value) : event.target.value;
    this.setState((prev) => ({
      currentRoom: { ...prev.currentRoom, [field]: value },
    }));
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { rooms, modalMode, currentRoom } = this.state;

    if (!currentRoom.RoomNumber || !currentRoom.RoomTypeName) {
      alert("Vui lòng điền đầy đủ Số phòng và Loại phòng.");
      return;
    }

    if (modalMode === "add") {
      const nextId = rooms.reduce((max, room) => Math.max(max, room.RoomID || 0), 0) + 1;
      this.setState({
        rooms: [...rooms, { ...currentRoom, RoomID: nextId }],
        isModalOpen: false,
      });
    } else {
      this.setState({
        rooms: rooms.map((room) =>
          room.RoomID === currentRoom.RoomID ? { ...currentRoom } : room,
        ),
        isModalOpen: false,
      });
    }
  };

  render() {
    const {
      search,
      statusFilter,
      isModalOpen,
      modalMode,
      currentRoom,
      loading,
      error,
    } = this.state;
    const rooms = this.getFilteredRooms();

    return (
      <div className="quanlyphong">
        <div className="qp-top">
          <FeatureHeader
            title="Quản lý Phòng"
            description="Quản lý thông tin các phòng trong khách sạn"
          />
          <button className="btn-primary" onClick={this.openAddModal}>
            + Thêm phòng
          </button>
        </div>

        <div className="qp-main">
          <div className="qp-actions">
            <div className="qp-search-box">
              <i className="fa fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm theo số phòng..."
                value={search}
                onChange={(e) => this.setState({ search: e.target.value })}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => this.setState({ statusFilter: e.target.value })}
            >
              <option>Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="qp-table-wrapper">
            <table className="qp-table">
              <thead>
                <tr>
                  <th>Số phòng</th>
                  <th>Loại phòng</th>
                  <th>Trạng thái</th>
                  <th>Sức chứa</th>
                  <th>Giá</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">Đang tải dữ liệu phòng...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7">{error}</td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      Không có phòng phù hợp
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.RoomID}>
                      <td>{room.RoomNumber}</td>
                      <td>{room.RoomTypeName}</td>
                      <td>
                        <span
                          className={`status-pill status-${getStatusClass(room.Status)}`}
                        >
                          {getStatusLabel(room.Status)}
                        </span>
                      </td>
                      <td>{room.Capacity}</td>
                      <td>{room.DefaultPrice.toLocaleString("vi-VN")} đ</td>
                      <td>{room.Description || "-"}</td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => this.openEditModal(room)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={this.closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                type="button"
                onClick={this.closeModal}
              >
                ×
              </button>
              <h2>
                {modalMode === "add" ? "Thêm phòng mới" : "Chỉnh sửa phòng"}
              </h2>
              <form onSubmit={this.handleSubmit}>
                <label>
                  Số phòng *
                  <input
                    className="modal-input"
                    type="text"
                    value={currentRoom.RoomNumber}
                    onChange={this.handleChange("RoomNumber")}
                  />
                </label>
                <label>
                  Loại phòng *
                  <select
                    value={currentRoom.RoomTypeName}
                    onChange={this.handleChange("RoomTypeName")}
                  >
                    <option value="">Chọn loại phòng</option>
                    {ROOM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Trạng thái
                  <select
                    value={currentRoom.Status}
                    onChange={this.handleChange("Status")}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Sức chứa
                  <input
                    type="number"
                    min="1"
                    value={currentRoom.Capacity}
                    onChange={this.handleChange("Capacity")}
                  />
                </label>
                <label>
                  Giá phòng
                  <input
                    type="number"
                    min="0"
                    value={currentRoom.DefaultPrice}
                    onChange={this.handleChange("DefaultPrice")}
                  />
                </label>
                <label>
                  Mô tả
                  <textarea
                    value={currentRoom.Description}
                    onChange={this.handleChange("Description")}
                  />
                </label>
                <div className="modal-buttons">
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={this.closeModal}
                  >
                    Hủy
                  </button>
                  <button className="btn-primary" type="submit">
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Quanlyphong;
