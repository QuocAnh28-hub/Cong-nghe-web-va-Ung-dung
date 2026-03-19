import React, { Component } from "react";
import "../style/Quanlygia.css";

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family"];

class Quanlygia extends Component {
  state = {
    tab: "daily",
    search: "",
    isModalOpen: false,
    modalMode: "add",
    currentPrice: {
      id: null,
      roomType: "",
      amount: "",
      period: "",
      seasonName: "",
    },
    dailyPrices: [
      { id: 1, roomType: "Standard", amount: 800000 },
      { id: 2, roomType: "Deluxe", amount: 1200000 },
      { id: 3, roomType: "Suite", amount: 2000000 },
      { id: 4, roomType: "Family", amount: 1800000 },
    ],
    seasonalPrices: [
      {
        id: 1,
        roomType: "Standard",
        seasonName: "Tết Nguyên Đán 2026",
        dateRange: "25/1/2026 - 5/2/2026",
        amount: 1200000,
      },
      {
        id: 2,
        roomType: "Deluxe",
        seasonName: "Tết Nguyên Đán 2026",
        dateRange: "25/1/2026 - 5/2/2026",
        amount: 1800000,
      },
      {
        id: 3,
        roomType: "Suite",
        seasonName: "Tết Nguyên Đán 2026",
        dateRange: "25/1/2026 - 5/2/2026",
        amount: 3000000,
      },
      {
        id: 4,
        roomType: "Family",
        seasonName: "Tết Nguyên Đán 2026",
        dateRange: "25/1/2026 - 5/2/2026",
        amount: 2700000,
      },
    ],
  };

  switchTab = (tab) => {
    this.setState({ tab });
  };

  openAddPriceModal = () => {
    this.setState({
      isModalOpen: true,
      modalMode: "add",
      currentPrice: {
        id: null,
        roomType: "",
        amount: "",
        period: "",
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
    const { tab, dailyPrices, seasonalPrices, currentPrice, modalMode } =
      this.state;
    const { roomType, amount, seasonName, dateRange } = currentPrice;

    if (
      !roomType ||
      !amount ||
      (tab === "seasonal" && (!seasonName || !dateRange))
    ) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    const item = {
      ...currentPrice,
      id: modalMode === "add" ? Date.now() : currentPrice.id,
      amount: Number(amount),
    };

    if (tab === "daily") {
      this.setState({
        dailyPrices:
          modalMode === "add"
            ? [...dailyPrices, item]
            : dailyPrices.map((p) => (p.id === item.id ? item : p)),
        isModalOpen: false,
      });
    } else {
      this.setState({
        seasonalPrices:
          modalMode === "add"
            ? [...seasonalPrices, { ...item, seasonName, dateRange }]
            : seasonalPrices.map((p) =>
                p.id === item.id ? { ...item, seasonName, dateRange } : p,
              ),
        isModalOpen: false,
      });
    }
  };

  handleDelete = (id) => {
    const { tab, dailyPrices, seasonalPrices } = this.state;
    if (!window.confirm("Xác nhận xóa?")) return;

    if (tab === "daily") {
      this.setState({ dailyPrices: dailyPrices.filter((p) => p.id !== id) });
    } else {
      this.setState({
        seasonalPrices: seasonalPrices.filter((p) => p.id !== id),
      });
    }
  };

  filterPrices = () => {
    const { tab, search, dailyPrices, seasonalPrices } = this.state;
    const q = search.trim().toLowerCase();

    const list = tab === "daily" ? dailyPrices : seasonalPrices;
    if (!q) return list;

    return list.filter(
      (item) =>
        item.roomType.toLowerCase().includes(q) ||
        (item.seasonName && item.seasonName.toLowerCase().includes(q)) ||
        String(item.amount).toLowerCase().includes(q) ||
        (item.dateRange && item.dateRange.toLowerCase().includes(q)),
    );
  };

  render() {
    const { tab, isModalOpen, modalMode, currentPrice, search } = this.state;
    const list = this.filterPrices();

    return (
      <div className="qlgia-page">
        <div className="qlgia-top">
          <div>
            <h1>Quản lý Giá phòng</h1>
            <p>Quản lý giá theo ngày và theo mùa</p>
          </div>
          <button
            className="qlgia-btn-primary"
            onClick={this.openAddPriceModal}
          >
            + Thêm giá
          </button>
        </div>

        <div className="qlgia-tabs">
          <button
            className={tab === "daily" ? "qlgia-tab active" : "qlgia-tab"}
            onClick={() => this.switchTab("daily")}
          >
            <i class="fa-solid fa-dollar-sign"></i> Giá theo ngày
          </button>
          <button
            className={tab === "seasonal" ? "qlgia-tab active" : "qlgia-tab"}
            onClick={() => this.switchTab("seasonal")}
          >
            <i class="fa-regular fa-calendar"></i> Giá theo mùa
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
                  {tab === "seasonal" && <th>Tên mùa</th>}
                  {tab === "seasonal" && <th>Thời gian</th>}
                  <th>Giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tab === "seasonal" ? 5 : 3}
                      className="qlgia-empty"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  list.map((item) => (
                    <tr key={item.id}>
                      <td>{item.roomType}</td>
                      {tab === "seasonal" && <td>{item.seasonName}</td>}
                      {tab === "seasonal" && <td>{item.dateRange}</td>}
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
                    {ROOM_TYPES.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                </label>

                {tab === "seasonal" && (
                  <>
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
                  </>
                )}

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