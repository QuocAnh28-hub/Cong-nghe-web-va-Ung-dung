import React, { Component } from "react";
import "../style/Quanlygia.css";
import { FeatureHeader } from "./Common";

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family"];

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN").format(date);
};

const toInputDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const parseDateRange = (dateRange) => {
  if (!dateRange) return {};
  const [start, end] = dateRange.split("-").map((value) => value.trim());
  const normalize = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parts = value.split("/").map((part) => part.trim());
    if (parts.length !== 3) return value;
    const [day, month, year] = parts;
    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };
  return {
    startDate: normalize(start),
    endDate: normalize(end),
  };
};

class Quanlygia extends Component {
  state = {
    search: "",
    isModalOpen: false,
    modalMode: "add",
    currentPrice: {
      id: null,
      roomTypeId: "",
      roomType: "",
      amount: "",
      seasonName: "",
      startDate: "",
      endDate: "",
      dateRange: "",
      defaultPrice: 0,
    },
    seasonalPrices: [],
    roomTypes: [],
    loading: false,
    error: null,
  };

  componentDidMount() {
    this.fetchRates();
    this.fetchRoomTypes();
  }

  fetchRoomTypes = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/room-types");
      if (!response.ok) {
        throw new Error(`Lỗi tải loại phòng: ${response.status}`);
      }
      const data = await response.json();
      const roomTypes = Array.isArray(data)
        ? data.map((item) => ({
            id: item.RoomTypeID,
            name: item.Name,
            defaultPrice: item.DefaultPrice ?? 0,
          }))
        : [];
      this.setState({ roomTypes });
    } catch (error) {
      console.error(error);
    }
  };

  fetchRates = async () => {
    this.setState({ loading: true, error: null });

    try {
      const response = await fetch("http://localhost:3000/api/rates");
      if (!response.ok) {
        throw new Error(`Lỗi tải dữ liệu: ${response.status}`);
      }

      const data = await response.json();
      const seasonalPrices = [];

      data.forEach((item) => {
        const startDate = toInputDate(item.StartDate);
        const endDate = toInputDate(item.EndDate);
        seasonalPrices.push({
          id: item.RateID,
          roomTypeId: item.RoomTypeID ?? "",
          roomType: item.RoomTypeName,
          seasonName: item.Season || "",
          startDate,
          endDate,
          dateRange: item.StartDate || item.EndDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : "",
          defaultPrice: item.DefaultPrice ?? 0,
          amount: item.Price ?? item.DefaultPrice ?? 0,
        });
      });

      this.setState({
        seasonalPrices,
        loading: false,
      });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  openAddPriceModal = () => {
    this.setState({
      isModalOpen: true,
      modalMode: "add",
      currentPrice: {
        id: null,
        roomTypeId: "",
        roomType: "",
        amount: "",
        seasonName: "",
        startDate: "",
        endDate: "",
        dateRange: "",
        defaultPrice: 0,
      },
    });
  };

  openEditPriceModal = (price) => {
    const roomTypeId = this.state.roomTypes.find((rt) => {
      if (rt && typeof rt === "object") {
        return rt.name === price.roomType;
      }
      return rt === price.roomType;
    })?.id;

    const parsedRange = parseDateRange(
      price.startDate && price.endDate
        ? `${price.startDate} - ${price.endDate}`
        : price.dateRange,
    );

    this.setState({
      isModalOpen: true,
      modalMode: "edit",
      currentPrice: {
        ...price,
        roomTypeId: roomTypeId || price.roomTypeId || "",
        roomType: price.roomType || price.roomTypeName || "",
        defaultPrice: price.defaultPrice ?? 0,
        startDate: price.startDate || parsedRange.startDate || "",
        endDate: price.endDate || parsedRange.endDate || "",
      },
    });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleInput = (field) => (e) => {
    const value = e.target.value;
    if (field === "roomTypeId") {
      const selectedRoomType = this.state.roomTypes.find(
        (rt) => String(rt.id) === value,
      );
      this.setState((prev) => ({
        currentPrice: {
          ...prev.currentPrice,
          roomTypeId: value,
          roomType: selectedRoomType ? selectedRoomType.name : prev.currentPrice.roomType,
          defaultPrice: selectedRoomType ? selectedRoomType.defaultPrice : prev.currentPrice.defaultPrice,
        },
      }));
      return;
    }

    this.setState((prev) => ({
      currentPrice: { ...prev.currentPrice, [field]: value },
    }));
  };

  handleSave = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    const { currentPrice, modalMode } = this.state;
    const { roomTypeId, roomType, amount, seasonName, startDate, endDate } = currentPrice;

    if ((!roomTypeId && !roomType) || !amount || !seasonName || !startDate || !endDate) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    const payload = {
      RoomTypeID: roomTypeId ? Number(roomTypeId) : roomType,
      Price: Number(amount),
      StartDate: startDate,
      EndDate: endDate,
      Season: seasonName,
    };

    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    if (modalMode === "add") {
      try {
        const response = await fetch("http://localhost:3000/api/rates", {
          ...requestOptions,
          method: "POST",
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Lỗi thêm giá: ${response.status} ${errorBody}`);
        }

        await response.json();
        await this.fetchRates();
        this.setState({ isModalOpen: false });
        return;
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:3000/api/rates/${currentPrice.id}`, {
        ...requestOptions,
        method: "PUT",
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Lỗi cập nhật giá: ${response.status} ${errorBody}`);
      }

      await response.json();
      await this.fetchRates();
      this.setState({ isModalOpen: false });
    } catch (error) {
      alert(error.message);
    }
  };

  handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/rates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Lỗi xóa giá: ${response.status} ${errorBody}`);
      }

      await response.json();
      await this.fetchRates();
    } catch (error) {
      alert(error.message);
    }
  };

  filterPrices = () => {
    const { search, seasonalPrices } = this.state;
    const q = search.trim().toLowerCase();
    if (!q) return seasonalPrices;

    return seasonalPrices.filter(
      (item) =>
        item.roomType.toLowerCase().includes(q) ||
        item.seasonName.toLowerCase().includes(q) ||
        String(item.amount).toLowerCase().includes(q) ||
        (item.dateRange && item.dateRange.toLowerCase().includes(q)),
    );
  };

  render() {
    const { isModalOpen, modalMode, currentPrice, search, loading, error, roomTypes } =
      this.state;
    const list = this.filterPrices();
    const typeOptions = roomTypes.length ? roomTypes : ROOM_TYPES;

    return (
      <div className="qlgia-page">
        <div className="qlgia-top">
          <FeatureHeader
            title="Quản lý Giá phòng theo mùa"
            description="Quản lý giá theo mùa"
          />
          <button
            type="button"
            className="qlgia-btn-primary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.openAddPriceModal();
            }}
          >
            + Thêm giá
          </button>
        </div>

        <div className="qlgia-main">
          <div className="qlgia-actions">
            <div className="qlgia-search-box">
              <i className="fa fa-search"></i>
              <input
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => this.setState({ search: e.target.value })}
              />
            </div>
          </div>

          <div className="qlgia-table-wrapper">
            <table className="qlgia-table">
              <thead>
                <tr>
                  <th>Loại phòng</th>
                  <th>Tên mùa</th>
                  <th>Thời gian</th>
                  <th>Giá mặc định</th>
                  <th>Giá hiện hành</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="qlgia-empty">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="qlgia-empty">
                      {error}
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="qlgia-empty">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  list.map((item) => (
                    <tr key={item.id}>
                      <td>{item.roomType}</td>
                      <td>{item.seasonName}</td>
                      <td>{item.dateRange}</td>
                      <td>{Number(item.defaultPrice).toLocaleString()}đ</td>
                      <td>{Number(item.amount).toLocaleString()}đ</td>
                      <td>
                        <button
                          type="button"
                          className="qlgia-btn-edit"
                          onClick={() => this.openEditPriceModal(item)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          className="qlgia-btn-delete"
                          onClick={() => this.handleDelete(item.id)}
                        >
                          <i className="fa fa-trash"></i>
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
          <div className="qlgia-modal-overlay" onClick={this.closeModal}>
            <div
              className="qlgia-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="qlgia-modal-close" onClick={this.closeModal}>
                ×
              </button>
              <h2>{modalMode === "add" ? "Thêm giá mới" : "Chỉnh sửa giá"}</h2>
              <div>
                <label>
                  Loại phòng *
                  <select
                    className="qlgia-modal-input"
                    value={currentPrice.roomTypeId || currentPrice.roomType}
                    onChange={this.handleInput(roomTypes.length ? "roomTypeId" : "roomType")}
                  >
                    <option value="">Chọn loại phòng</option>
                    {typeOptions.map((rt) =>
                      typeof rt === "string" ? (
                        <option key={rt} value={rt}>
                          {rt}
                        </option>
                      ) : (
                        <option key={rt.id} value={rt.id}>
                          {rt.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Tên mùa *
                  <input
                    className="qlgia-modal-input"
                    value={currentPrice.seasonName}
                    onChange={this.handleInput("seasonName")}
                  />
                </label>
                <div className="qlgia-date-row">
                  <label>
                    Ngày bắt đầu *
                    <input
                      className="qlgia-modal-input"
                      type="date"
                      value={currentPrice.startDate}
                      onChange={this.handleInput("startDate")}
                    />
                  </label>
                  <label>
                    Ngày kết thúc *
                    <input
                      className="qlgia-modal-input"
                      type="date"
                      value={currentPrice.endDate}
                      onChange={this.handleInput("endDate")}
                    />
                  </label>
                </div>

                <label>
                  Giá (VNĐ) *
                  <input
                    className="qlgia-modal-input"
                    type="number"
                    value={currentPrice.amount}
                    onChange={this.handleInput("amount")}
                  />
                </label>

                <div className="qlgia-modal-btns">
                  <button
                    className="qlgia-btn-secondary"
                    type="button"
                    onClick={this.closeModal}
                  >
                    Hủy
                  </button>
                  <button
                    className="qlgia-btn-primary"
                    type="button"
                    onClick={this.handleSave}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Quanlygia;