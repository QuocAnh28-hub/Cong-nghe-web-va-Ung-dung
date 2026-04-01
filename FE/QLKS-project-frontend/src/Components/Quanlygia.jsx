import React, { Component } from "react";
import "../style/Quanlygia.css";
import { FeatureHeader } from "./Common";

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family"];

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN").format(date);
};

class Quanlygia extends Component {
  state = {
    search: "",
    isModalOpen: false,
    modalMode: "add",
    currentPrice: {
      id: null,
      roomType: "",
      amount: "",
      seasonName: "",
      dateRange: "",
    },
    seasonalPrices: [],
    roomTypes: [],
    loading: false,
    error: null,
  };

  componentDidMount() {
    this.fetchRates();
  }

  fetchRates = async () => {
    this.setState({ loading: true, error: null });

    try {
      const response = await fetch("http://localhost:3000/api/rates");
      if (!response.ok) {
        throw new Error(`Lỗi tải dữ liệu: ${response.status}`);
      }

      const data = await response.json();
      const seasonalPrices = [];
      const roomTypes = new Set();

      data.forEach((item) => {
        if (item.RoomTypeName) {
          roomTypes.add(item.RoomTypeName);
        }

        seasonalPrices.push({
          id: item.RateID,
          roomType: item.RoomTypeName,
          seasonName: item.Season || "",
          dateRange: item.StartDate || item.EndDate
            ? `${formatDate(item.StartDate)} - ${formatDate(item.EndDate)}`
            : "",
          defaultPrice: item.DefaultPrice ?? 0,
          amount: item.Price ?? item.DefaultPrice ?? 0,
        });
      });

      this.setState({
        seasonalPrices,
        roomTypes: [...roomTypes],
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
        roomType: "",
        amount: "",
        seasonName: "",
        dateRange: "",
      },
    });
  };

  openEditPriceModal = (price) => {
    this.setState({
      isModalOpen: true,
      modalMode: "edit",
      currentPrice: { ...price },
    });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleInput = (field) => (e) => {
    const value = e.target.value;
    this.setState((prev) => ({
      currentPrice: { ...prev.currentPrice, [field]: value },
    }));
  };

  handleSave = (e) => {
    e.preventDefault();
    const { seasonalPrices, currentPrice, modalMode } = this.state;
    const { roomType, amount, seasonName, dateRange } = currentPrice;

    if (!roomType || !amount || !seasonName || !dateRange) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    const item = {
      ...currentPrice,
      id: modalMode === "add" ? Date.now() : currentPrice.id,
      amount: Number(amount),
    };

    this.setState({
      seasonalPrices:
        modalMode === "add"
          ? [...seasonalPrices, { ...item, seasonName, dateRange }]
          : seasonalPrices.map((p) =>
              p.id === item.id ? { ...item, seasonName, dateRange } : p,
            ),
      isModalOpen: false,
    });
  };

  handleDelete = (id) => {
    const { seasonalPrices } = this.state;
    if (!window.confirm("Xác nhận xóa?")) return;

    this.setState({
      seasonalPrices: seasonalPrices.filter((p) => p.id !== id),
    });
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
            className="qlgia-btn-primary"
            onClick={this.openAddPriceModal}
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
                      <td>{item.defaultPrice.toLocaleString()}đ</td>
                      <td>{item.amount.toLocaleString()}đ</td>
                      <td>
                        <button
                          className="qlgia-btn-edit"
                          onClick={() => this.openEditPriceModal(item)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
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
              <button className="qlgia-modal-close" onClick={this.closeModal}>
                ×
              </button>
              <h2>{modalMode === "add" ? "Thêm giá mới" : "Chỉnh sửa giá"}</h2>
              <form onSubmit={this.handleSave}>
                <label>
                  Loại phòng *
                  <select
                    className="qlgia-modal-input"
                    value={currentPrice.roomType}
                    onChange={this.handleInput("roomType")}
                  >
                    <option value="">Chọn loại phòng</option>
                    {typeOptions.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
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
                <label>
                  Thời gian *
                  <input
                    className="qlgia-modal-input"
                    value={currentPrice.dateRange}
                    onChange={this.handleInput("dateRange")}
                    placeholder="25/1/2026 - 5/2/2026"
                  />
                </label>

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
                  <button className="qlgia-btn-primary" type="submit">
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

export default Quanlygia;