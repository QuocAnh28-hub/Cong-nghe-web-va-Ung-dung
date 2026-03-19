import React, { Component } from "react";
import "../style/Quanlyphong.css";

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family"];
const ROOM_STATUS = ["Trống", "Đang dùng", "Cần dọn", "Bảo trì"];

class Quanlyphong extends Component {
  state = {
    rooms: [
      {
        id: 101,
        number: "101",
        type: "Suite",
        floor: "Tầng 1",
        status: "Trống",
        note: "",
      },
      {
        id: 102,
        number: "102",
        type: "Family",
        floor: "Tầng 1",
        status: "Trống",
        note: "",
      },
      {
        id: 103,
        number: "103",
        type: "Standard",
        floor: "Tầng 1",
        status: "Trống",
        note: "",
      },
      {
        id: 104,
        number: "104",
        type: "Deluxe",
        floor: "Tầng 1",
        status: "Trống",
        note: "",
      },
    ],
    search: "",
    statusFilter: "Tất cả trạng thái",
    isModalOpen: false,
    modalMode: "add",
    currentRoom: {
      id: null,
      number: "",
      type: "",
      floor: "",
      status: "Trống",
      note: "",
    },
  };

  getFilteredRooms() {
    const { rooms, search, statusFilter } = this.state;
    return rooms.filter((room) => {
      const matchName = room.number
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Tất cả trạng thái" || room.status === statusFilter;
      return matchName && matchStatus;
    });
  }

  openAddModal = () => {
    this.setState({
      isModalOpen: true,
      modalMode: "add",
      currentRoom: {
        id: null,
        number: "",
        type: "",
        floor: "",
        status: "Trống",
        note: "",
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
    const value = event.target.value;
    this.setState((prev) => ({
      currentRoom: { ...prev.currentRoom, [field]: value },
    }));
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { rooms, modalMode, currentRoom } = this.state;

    if (!currentRoom.number || !currentRoom.type || !currentRoom.floor) {
      alert("Vui lòng điền đủ Số phòng, Loại phòng, Tầng!");
      return;
    }

    if (modalMode === "add") {
      const nextId = rooms.reduce((max, room) => Math.max(max, room.id), 0) + 1;
      this.setState({
        rooms: [...rooms, { ...currentRoom, id: nextId }],
        isModalOpen: false,
      });
    } else {
      this.setState({
        rooms: rooms.map((room) =>
          room.id === currentRoom.id ? { ...currentRoom } : room,
        ),
        isModalOpen: false,
      });
    }
  };

  render() {
    const { search, statusFilter, isModalOpen, modalMode, currentRoom } =
      this.state;
    const rooms = this.getFilteredRooms();

    return (
      <div className="quanlyphong">
        <div className="qp-top">
          <div>
            <h1>Quản lý Phòng</h1>
            <p>Quản lý thông tin các phòng trong khách sạn</p>
          </div>
          <button className="btn-primary" onClick={this.openAddModal}>
            + Thêm phòng
          </button>
        </div>

        <div className="qp-main">
          <div className="qp-actions">
            <div className="search-box">
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
              {ROOM_STATUS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="qp-table-wrapper">
            <table className="qp-table">
              <thead>
                <tr>
                  <th>Số phòng</th>
                  <th>Loại phòng</th>
                  <th>Tầng</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.number}</td>
                    <td>{room.type}</td>
                    <td>{room.floor}</td>
                    <td>
                      <span
                        className={`status-pill status-${room.status.replace(/\s/g, "").toLowerCase()}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td>{room.note || "-"}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => this.openEditModal(room)}
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      Không có phòng phù hợp
                    </td>
                  </tr>
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
                    value={currentRoom.number}
                    onChange={this.handleChange("number")}
                  />
                </label>
                <label>
                  Loại phòng *
                  <select
                    value={currentRoom.type}
                    onChange={this.handleChange("type")}
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
                  Tầng *
                  <input
                    type="text"
                    value={currentRoom.floor}
                    onChange={this.handleChange("floor")}
                  />
                </label>
                <label>
                  Trạng thái
                  <select
                    value={currentRoom.status}
                    onChange={this.handleChange("status")}
                  >
                    {ROOM_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Ghi chú
                  <textarea
                    value={currentRoom.note}
                    onChange={this.handleChange("note")}
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