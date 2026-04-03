import React, { Component } from "react";
import "../style/Quanlyphong.css";
import { FeatureHeader } from "./Common";

const ROOMS_API_URL = "http://localhost:3000/api/rooms";
const ROOM_TYPES_API_URL = "http://localhost:3000/api/get-room-types";
const PAGE_SIZE = 4;
const ALL_STATUS_VALUE = "all";
const DEFAULT_STATUS = "AVAILABLE";
const DEFAULT_STATUS_OPTIONS = [
  "AVAILABLE",
  "OCCUPIED",
  "DIRTY",
  "MAINTENANCE",
];

const getDefaultRoomForm = () => ({
  RoomID: null,
  RoomNumber: "",
  Status: DEFAULT_STATUS,
  RoomTypeID: "",
  RoomTypeName: "",
});

const mapRoomFromApi = (item) => ({
  RoomID: item?.RoomID ?? null,
  RoomNumber: String(item?.RoomNumber ?? ""),
  Status: item?.Status ?? DEFAULT_STATUS,
  RoomTypeID: item?.RoomTypeID ?? "",
  RoomTypeName: item?.RoomTypeName ?? "",
  Description: item?.Description ?? "",
  Capacity: item?.Capacity ?? null,
  DefaultPrice: item?.DefaultPrice ?? null,
});

const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0111\u0110]/g, "d")
    .replace(/\s+/g, "-");

const statusClassMap = {
  available: "qp-status-available",
  occupied: "qp-status-occupied",
  dirty: "qp-status-cleaning",
  maintenance: "qp-status-maintenance",
  trong: "qp-status-available",
  "dang-dung": "qp-status-occupied",
  "can-don": "qp-status-cleaning",
  "bao-tri": "qp-status-maintenance",
};

const getStatusClassName = (status) =>
  statusClassMap[normalizeText(status)] || "qp-status-default";
const statusLabelMap = {
  Available: "AVAILABLE",
  Occupied: "OCCUPIED",
  Dirty: "DIRTY",
  Maintenance: "MAINTENANCE",
};
const getStatusLabel = (status) => statusLabelMap[status] || status || "-";

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return `${amount.toLocaleString("vi-VN")} VND`;
};

class Quanlyphong extends Component {
  state = {
    rooms: [],
    roomTypes: [],
    search: "",
    statusFilter: ALL_STATUS_VALUE,
    currentPage: 1,
    isModalOpen: false,
    modalMode: "add",
    currentRoom: getDefaultRoomForm(),
    loading: false,
    submitLoading: false,
    error: "",
  };

  componentDidMount() {
    this.fetchRoomTypes();
    this.fetchRooms();
  }

  fetchRoomTypes = async () => {
    try {
      const response = await fetch(ROOM_TYPES_API_URL);
      if (!response.ok) {
        throw new Error(`Lỗi tải loại phòng: ${response.status}`);
      }

      const data = await response.json();
      const roomTypes = (Array.isArray(data) ? data : [])
        .map((item) => ({
          id: String(item?.RoomTypeID ?? item?.id ?? ""),
          name: item?.Name || item?.RoomTypeName || item?.name || "",
        }))
        .filter((item) => item.id && item.name);

      if (roomTypes.length > 0) {
        this.setState({ roomTypes });
      }
    } catch (error) {
      console.error("Không thể tải danh sách loại phòng:", error);
    }
  };

  fetchRooms = async () => {
    this.setState({ loading: true, error: "" });

    try {
      const response = await fetch(ROOMS_API_URL);
      if (!response.ok) {
        throw new Error(`Lỗi tải dữ liệu phòng: ${response.status}`);
      }

      const data = await response.json();
      const rooms = (Array.isArray(data) ? data : []).map(mapRoomFromApi);
      const roomTypesFromRooms = this.buildRoomTypesFromRooms(rooms);

      this.setState((prev) => ({
        rooms,
        roomTypes:
          prev.roomTypes.length > 0 ? prev.roomTypes : roomTypesFromRooms,
        currentPage: 1,
        loading: false,
      }));
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || "Không thể tải danh sách phòng.",
      });
    }
  };

  buildRoomTypesFromRooms = (rooms) => {
    const map = new Map();
    rooms.forEach((room) => {
      if (!room.RoomTypeID) return;
      const id = String(room.RoomTypeID);
      const name = room.RoomTypeName || `Loại phòng ${id}`;
      if (!map.has(id)) {
        map.set(id, { id, name });
      }
    });
    return Array.from(map.values());
  };

  getStatusOptions = () => {
    const roomStatuses = this.state.rooms
      .map((room) => room.Status)
      .filter(Boolean);
    return Array.from(new Set([...DEFAULT_STATUS_OPTIONS, ...roomStatuses]));
  };

  getFilteredRooms = () => {
    const { rooms, search, statusFilter } = this.state;
    const keyword = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const roomText = [
        room.RoomID,
        room.RoomNumber,
        room.RoomTypeName,
        room.Description,
      ]
        .join(" ")
        .toLowerCase();
      const matchSearch = !keyword || roomText.includes(keyword);
      const matchStatus =
        statusFilter === ALL_STATUS_VALUE || room.Status === statusFilter;
      return matchSearch && matchStatus;
    });
  };

  openAddModal = () => {
    this.setState({
      isModalOpen: true,
      modalMode: "add",
      currentRoom: getDefaultRoomForm(),
    });
  };

  openEditModal = (room) => {
    this.setState({
      isModalOpen: true,
      modalMode: "edit",
      currentRoom: {
        RoomID: room.RoomID,
        RoomNumber: room.RoomNumber || "",
        Status: room.Status || DEFAULT_STATUS,
        RoomTypeID: String(room.RoomTypeID || ""),
        RoomTypeName: room.RoomTypeName || "",
      },
    });
  };

  closeModal = () => {
    this.setState({
      isModalOpen: false,
      currentRoom: getDefaultRoomForm(),
    });
  };

  handleChange = (field) => (event) => {
    const value = event.target.value;

    this.setState((prev) => {
      if (field !== "RoomTypeID") {
        return { currentRoom: { ...prev.currentRoom, [field]: value } };
      }

      const selected = prev.roomTypes.find((item) => item.id === value);
      return {
        currentRoom: {
          ...prev.currentRoom,
          RoomTypeID: value,
          RoomTypeName: selected?.name || "",
        },
      };
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { currentRoom, modalMode } = this.state;

    if (!currentRoom.RoomNumber.trim()) {
      alert("Vui lòng nhập số phòng.");
      return;
    }

    if (!currentRoom.RoomTypeID) {
      alert("Vui lòng chọn loại phòng.");
      return;
    }

    const roomTypeIdNum = Number(currentRoom.RoomTypeID);
    if (Number.isNaN(roomTypeIdNum)) {
      alert("Loại phòng không hợp lệ.");
      return;
    }

    const payload = {
      RoomNumber: currentRoom.RoomNumber.trim(),
      Status: currentRoom.Status?.trim() || DEFAULT_STATUS,
      RoomTypeID: roomTypeIdNum,
    };

    try {
      this.setState({ submitLoading: true, error: "" });

      const isEdit = modalMode === "edit" && currentRoom.RoomID !== null;
      const url = isEdit
        ? `${ROOMS_API_URL}/${currentRoom.RoomID}`
        : ROOMS_API_URL;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `API error: ${response.status}`);
      }

      await this.fetchRooms();
      this.closeModal();
      alert(isEdit ? "Cập nhật phòng thành công." : "Thêm phòng thành công.");
    } catch (error) {
      this.setState({
        error: error.message || "Không thể lưu thông tin phòng.",
      });
    } finally {
      this.setState({ submitLoading: false });
    }
  };

  render() {
    const {
      search,
      statusFilter,
      currentPage,
      isModalOpen,
      modalMode,
      currentRoom,
      roomTypes,
      loading,
      error,
      submitLoading,
    } = this.state;

    const filteredRooms = this.getFilteredRooms();
    const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
    const currentDisplayPage = Math.min(currentPage, totalPages);
    const startIndex = (currentDisplayPage - 1) * PAGE_SIZE;
    const paginatedRooms = filteredRooms.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
    const statusOptions = this.getStatusOptions();

    return (
      <div className="quanlyphong">
        <div className="qp-top">
          <FeatureHeader
            title="Quản lý Phòng"
            description="Quản lý thông tin phòng trong khách sạn"
          />
          <button
            className="qp-add-btn"
            type="button"
            onClick={this.openAddModal}
          >
            + Thêm phòng
          </button>
        </div>

        {error && <div className="qp-error-banner">{error}</div>}

        <div className="qp-main">
          <div className="qp-actions">
            <div className="qp-search-box">
              <i className="fa fa-search"></i>
              <input
                type="text"
                placeholder="Tìm theo mã phòng, số phòng, loại phòng..."
                value={search}
                onChange={(e) =>
                  this.setState({ search: e.target.value, currentPage: 1 })
                }
              />
            </div>

            <select
              className="qp-filter-select"
              value={statusFilter}
              onChange={(e) =>
                this.setState({ statusFilter: e.target.value, currentPage: 1 })
              }
            >
              <option value={ALL_STATUS_VALUE}>Tất cả trạng thái</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="qp-table-wrapper">
            <table className="qp-table">
              <thead>
                <tr>
                  <th>Mã phòng</th>
                  <th>Số phòng</th>
                  <th>Loại phòng</th>
                  <th>Trạng thái</th>
                  <th>Sức chứa</th>
                  <th>Giá mặc định</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="qp-empty-row">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="qp-empty-row">
                      Không có dữ liệu phòng.
                    </td>
                  </tr>
                ) : (
                  paginatedRooms.map((room) => (
                    <tr key={room.RoomID || room.RoomNumber}>
                      <td>{room.RoomID ?? "-"}</td>
                      <td>{room.RoomNumber || "-"}</td>
                      <td>
                        {room.RoomTypeName ||
                          roomTypes.find(
                            (item) => item.id === String(room.RoomTypeID || ""),
                          )?.name ||
                          "-"}
                      </td>
                      <td>
                        <span
                          className={`qp-status-pill ${getStatusClassName(room.Status)}`}
                        >
                          {getStatusLabel(room.Status)}
                        </span>
                      </td>
                      <td>{room.Capacity ?? "-"}</td>
                      <td>{formatCurrency(room.DefaultPrice)}</td>
                      <td>
                        <button
                          type="button"
                          className="qp-icon-btn edit"
                          title="Sửa phòng"
                          onClick={() => this.openEditModal(room)}
                          disabled={submitLoading}
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredRooms.length > 0 && (
            <div className="qp-pagination">
              <button
                type="button"
                className="qp-page-btn"
                onClick={() =>
                  this.setState({
                    currentPage: Math.max(currentDisplayPage - 1, 1),
                  })
                }
                disabled={currentDisplayPage === 1}
                aria-label="Trang trước"
              >
                {"‹"}
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={`qp-page-btn ${page === currentDisplayPage ? "active" : ""}`}
                    onClick={() => this.setState({ currentPage: page })}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                className="qp-page-btn"
                onClick={() =>
                  this.setState({
                    currentPage: Math.min(currentDisplayPage + 1, totalPages),
                  })
                }
                disabled={currentDisplayPage === totalPages}
                aria-label="Trang sau"
              >
                {"›"}
              </button>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={this.closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                type="button"
                onClick={this.closeModal}
                title="Đóng"
              >
                &times;
              </button>

              <h2>
                {modalMode === "add" ? "Thêm phòng mới" : "Chỉnh sửa phòng"}
              </h2>

              <form className="qp-room-form" onSubmit={this.handleSubmit}>
                <label>
                  Số phòng *
                  <input
                    type="text"
                    value={currentRoom.RoomNumber}
                    onChange={this.handleChange("RoomNumber")}
                    required
                    autoFocus
                  />
                </label>

                <label>
                  Loại phòng *
                  <select
                    value={currentRoom.RoomTypeID}
                    onChange={this.handleChange("RoomTypeID")}
                    required
                  >
                    <option value="">
                      {roomTypes.length > 0
                        ? "Chọn loại phòng"
                        : "Không có loại phòng"}
                    </option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
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
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="qp-modal-actions">
                  <button
                    type="button"
                    className="qp-cancel-btn"
                    onClick={this.closeModal}
                    disabled={submitLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="qp-save-btn"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Đang lưu..." : "Lưu"}
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