import React, { Component } from "react";
import "../style/Hoadon.css";
import { FeatureHeader } from "./Common";

class Hoadon extends Component {
  state = {
    pendingRooms: [
      {
        id: 1,
        roomNumber: "101",
        guestName: "Nguyễn Văn A",
        checkinDate: "2023-10-01",
        checkoutDate: "2023-10-05",
        roomCharge: 2000000,
        services: [
          { name: "Giặt ủi", price: 50000 },
          { name: "Ăn sáng", price: 100000 },
        ],
        minibar: [
          { name: "Nước suối", price: 20000 },
          { name: "Bia", price: 50000 },
        ],
        penalty: [],
      },
      {
        id: 2,
        roomNumber: "102",
        guestName: "Trần Thị B",
        checkinDate: "2023-10-02",
        checkoutDate: "2023-10-04",
        roomCharge: 1200000,
        services: [],
        minibar: [],
        penalty: [{ name: "Hủy phòng", price: 100000 }],
      },
    ],
    history: [
      {
        id: 1,
        roomNumber: "103",
        guestName: "Lê Văn C",
        date: "2023-09-30",
        total: 1500000,
        status: "PAID",
      },
    ],
    searchHistory: "",
    selectedRoom: null,
    isModalOpen: false,
    step: 1,
    invoiceData: {
      roomCharge: 0,
      services: [],
      minibar: [],
      penalty: [],
      total: 0,
      discount: 0,
      vat: 0,
      finalTotal: 0,
      paymentMethod: "",
      status: "PENDING",
    },
  };

  calculateTotal = (data) => {
    const roomCharge = data.roomCharge;
    const servicesTotal = data.services.reduce((sum, s) => sum + s.price, 0);
    const minibarTotal = data.minibar.reduce((sum, m) => sum + m.price, 0);
    const penaltyTotal = Array.isArray(data.penalty)
      ? data.penalty.reduce((sum, p) => sum + p.price, 0)
      : data.penalty;
    const subtotal = roomCharge + servicesTotal + minibarTotal + penaltyTotal;
    const discountAmount = (subtotal * data.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = (afterDiscount * data.vat) / 100;
    const finalTotal = afterDiscount + vatAmount;
    return { subtotal, discountAmount, vatAmount, finalTotal };
  };

  openInvoiceModal = (room) => {
    const invoiceData = {
      roomCharge: room.roomCharge,
      services: [...room.services],
      minibar: [...room.minibar],
      penalty: Array.isArray(room.penalty) ? [...room.penalty] : [],
      total: 0,
      discount: 0,
      vat: 10, // default VAT 10%
      finalTotal: 0,
      paymentMethod: "",
      status: "PENDING",
    };
    const totals = this.calculateTotal(invoiceData);
    invoiceData.total = totals.subtotal;
    invoiceData.finalTotal = totals.finalTotal;
    this.setState({
      selectedRoom: room,
      isModalOpen: true,
      step: 1,
      invoiceData,
    });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false, selectedRoom: null, step: 1 });
  };

  nextStep = () => {
    this.setState((prev) => ({ step: prev.step + 1 }));
  };

  prevStep = () => {
    this.setState((prev) => ({ step: prev.step - 1 }));
  };

  handleInvoiceChange = (field, value) => {
    this.setState((prev) => {
      const newData = { ...prev.invoiceData, [field]: value };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  handleServiceChange = (index, field, value) => {
    this.setState((prev) => {
      const services = [...prev.invoiceData.services];
      services[index] = {
        ...services[index],
        [field]: field === "name" ? value : parseFloat(value) || 0,
      };
      const newData = { ...prev.invoiceData, services };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  handleMinibarChange = (index, field, value) => {
    this.setState((prev) => {
      const minibar = [...prev.invoiceData.minibar];
      minibar[index] = {
        ...minibar[index],
        [field]: field === "name" ? value : parseFloat(value) || 0,
      };
      const newData = { ...prev.invoiceData, minibar };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  addService = () => {
    this.setState((prev) => {
      const services = [...prev.invoiceData.services, { name: "", price: 0 }];
      const newData = { ...prev.invoiceData, services };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  removeService = (index) => {
    this.setState((prev) => {
      const services = prev.invoiceData.services.filter((_, i) => i !== index);
      const newData = { ...prev.invoiceData, services };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  addMinibar = () => {
    this.setState((prev) => {
      const minibar = [...prev.invoiceData.minibar, { name: "", price: 0 }];
      const newData = { ...prev.invoiceData, minibar };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  removeMinibar = (index) => {
    this.setState((prev) => {
      const minibar = prev.invoiceData.minibar.filter((_, i) => i !== index);
      const newData = { ...prev.invoiceData, minibar };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  handlePenaltyChange = (index, field, value) => {
    this.setState((prev) => {
      const penalty = [...prev.invoiceData.penalty];
      penalty[index] = {
        ...penalty[index],
        [field]: field === "name" ? value : parseFloat(value) || 0,
      };
      const newData = { ...prev.invoiceData, penalty };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  addPenalty = () => {
    this.setState((prev) => {
      const penalty = [...prev.invoiceData.penalty, { name: "", price: 0 }];
      const newData = { ...prev.invoiceData, penalty };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  removePenalty = (index) => {
    this.setState((prev) => {
      const penalty = prev.invoiceData.penalty.filter((_, i) => i !== index);
      const newData = { ...prev.invoiceData, penalty };
      const totals = this.calculateTotal(newData);
      newData.total = totals.subtotal;
      newData.finalTotal = totals.finalTotal;
      return { invoiceData: newData };
    });
  };

  handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      this.closeModal();
    }
  };

  confirmPayment = () => {
    this.setState((prev) => ({
      invoiceData: { ...prev.invoiceData, status: "PAID" },
      step: 4,
    }));
  };

  printPDF = () => {
    alert("In PDF hoá đơn");
  };

  sendEmail = () => {
    alert("Gửi mail hoá đơn");
  };

  getFilteredHistory = () => {
    const { history, searchHistory } = this.state;
    return history.filter(
      (inv) =>
        inv.roomNumber.toLowerCase().includes(searchHistory.toLowerCase()) ||
        inv.guestName.toLowerCase().includes(searchHistory.toLowerCase()),
    );
  };

  renderModal = () => {
    const { step, invoiceData, selectedRoom } = this.state;
    if (!this.state.isModalOpen) return null;

    return (
      <div className="modal-overlay" onClick={this.handleOverlayClick}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Hoá Đơn - Phòng {selectedRoom.roomNumber}</h2>
            <button className="btn-close" onClick={this.closeModal}>
              X
            </button>
          </div>
          {step === 1 && (
            <div>
              <h3>Tạo Hoá Đơn</h3>
              <p>
                <strong>Room Charge:</strong>{" "}
                {invoiceData.roomCharge.toLocaleString()} VND
              </p>
              <p>
                <strong>Services:</strong>
              </p>
              {invoiceData.services.map((s, i) => (
                <div key={i} className="line-item">
                  <input
                    type="text"
                    placeholder="Tên dịch vụ"
                    value={s.name}
                    onChange={(e) =>
                      this.handleServiceChange(i, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Giá"
                    value={s.price}
                    onChange={(e) =>
                      this.handleServiceChange(i, "price", e.target.value)
                    }
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => this.removeService(i)}
                  >
                    X
                  </button>
                </div>
              ))}
              <button className="btn-secondary" onClick={this.addService}>
                Thêm dịch vụ
              </button>

              <p>
                <strong>Minibar:</strong>
              </p>
              {invoiceData.minibar.map((m, i) => (
                <div key={i} className="line-item">
                  <input
                    type="text"
                    placeholder="Tên minibar"
                    value={m.name}
                    onChange={(e) =>
                      this.handleMinibarChange(i, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Giá"
                    value={m.price}
                    onChange={(e) =>
                      this.handleMinibarChange(i, "price", e.target.value)
                    }
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => this.removeMinibar(i)}
                  >
                    X
                  </button>
                </div>
              ))}
              <button className="btn-secondary" onClick={this.addMinibar}>
                Thêm minibar
              </button>

              <p>
                <strong>Penalties:</strong>
              </p>
              {invoiceData.penalty.map((p, i) => (
                <div key={i} className="line-item">
                  <input
                    type="text"
                    placeholder="Tên phạt"
                    value={p.name}
                    onChange={(e) =>
                      this.handlePenaltyChange(i, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Giá"
                    value={p.price}
                    onChange={(e) =>
                      this.handlePenaltyChange(i, "price", e.target.value)
                    }
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => this.removePenalty(i)}
                  >
                    X
                  </button>
                </div>
              ))}
              <button className="btn-secondary" onClick={this.addPenalty}>
                Thêm phạt
              </button>

              <p>
                <strong>Tổng tiền:</strong> {invoiceData.total.toLocaleString()}{" "}
                VND
              </p>
              <button className="btn-primary" onClick={this.nextStep}>
                Tiếp tục
              </button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3>Xác Nhận</h3>
              <label>
                Discount (%):{" "}
                <input
                  type="number"
                  value={invoiceData.discount}
                  onChange={(e) =>
                    this.handleInvoiceChange(
                      "discount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </label>
              <label>
                VAT (%):{" "}
                <input
                  type="number"
                  value={invoiceData.vat}
                  onChange={(e) =>
                    this.handleInvoiceChange(
                      "vat",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </label>
              <p>
                Tổng sau discount:{" "}
                {(
                  invoiceData.total -
                  (invoiceData.total * invoiceData.discount) / 100
                ).toLocaleString()}{" "}
                VND
              </p>
              <p>
                VAT:{" "}
                {(
                  ((invoiceData.total -
                    (invoiceData.total * invoiceData.discount) / 100) *
                    invoiceData.vat) /
                  100
                ).toLocaleString()}{" "}
                VND
              </p>
              <p>
                <strong>Tổng cuối:</strong>{" "}
                {invoiceData.finalTotal.toLocaleString()} VND
              </p>
              <button className="btn-secondary" onClick={this.prevStep}>
                Quay lại
              </button>
              <button className="btn-primary" onClick={this.nextStep}>
                Xác nhận
              </button>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3>Xác nhận Thanh Toán</h3>
              <p>Tổng tiền: {invoiceData.finalTotal.toLocaleString()} VND</p>
              <div className="payment-group">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    onChange={(e) =>
                      this.handleInvoiceChange("paymentMethod", e.target.value)
                    }
                  />
                  <span>Tiền mặt</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    onChange={(e) =>
                      this.handleInvoiceChange("paymentMethod", e.target.value)
                    }
                  />
                  <span>Chuyển khoản</span>
                </label>
              </div>
              <button className="btn-secondary" onClick={this.prevStep}>
                Quay lại
              </button>
              <button className="btn-primary" onClick={this.confirmPayment}>
                Thanh toán
              </button>
            </div>
          )}
          {step === 4 && (
            <div>
              <h3>Hoàn Tất</h3>
              <p>Trạng thái: {invoiceData.status}</p>
              <p>Phương thức thanh toán: {invoiceData.paymentMethod}</p>
              <button className="btn-secondary" onClick={this.printPDF}>
                In PDF
              </button>
              <button className="btn-secondary" onClick={this.sendEmail}>
                Gửi Mail
              </button>
              <button className="btn-primary" onClick={this.closeModal}>
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { pendingRooms, searchHistory } = this.state;
    const filteredHistory = this.getFilteredHistory();

    return (
      <div className="hoadon">
        <FeatureHeader
          title="Hoá Đơn"
          description="Quản lý hoá đơn thanh toán"
        />
        <div className="hoadon-main">
          <h3>Phòng Chưa Thanh Toán</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Số Phòng</th>
                <th>Tên Khách</th>
                <th>Ngày Check-in</th>
                <th>Ngày Check-out</th>
                <th>Tổng Tiền Dự Kiến</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {pendingRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.guestName}</td>
                  <td>{room.checkinDate}</td>
                  <td>{room.checkoutDate}</td>
                  <td>
                    {(
                      room.roomCharge +
                      room.services.reduce((s, svc) => s + svc.price, 0) +
                      room.minibar.reduce((s, mb) => s + mb.price, 0) +
                      (Array.isArray(room.penalty)
                        ? room.penalty.reduce((s, p) => s + p.price, 0)
                        : room.penalty)
                    ).toLocaleString()}{" "}
                    VND
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => this.openInvoiceModal(room)}
                    >
                      Tạo Hoá Đơn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hoadon-history">
          <h3>Lịch Sử Hoá Đơn</h3>
          <div className="search-box">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm hoá đơn..."
              value={searchHistory}
              onChange={(e) => this.setState({ searchHistory: e.target.value })}
            />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Số Phòng</th>
                <th>Tên Khách</th>
                <th>Ngày</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.roomNumber}</td>
                  <td>{inv.guestName}</td>
                  <td>{inv.date}</td>
                  <td>{inv.total.toLocaleString()} VND</td>
                  <td>{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {this.renderModal()}
      </div>
    );
  }
}

export default Hoadon;