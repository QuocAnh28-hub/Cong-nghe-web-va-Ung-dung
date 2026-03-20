import React, { Component } from "react";
import "../style/NhanTraphong.css";

class NhanTraphong extends Component {
  state = {
    activeTab: "stay",
    showModal: false,
    modalType: null,
    currentItem: null,
    walkInForm: {
      name: "",
      phone: "",
      identity: "",
      room: "",
      checkOut: "",
    },
    transferRoom: "",
    transferNote: "",
    minibarItems: [
      { id: 1, name: "Pepsi - 30.000đ", qty: 2, price: 30000 },
      { id: 2, name: "Nước suối - 10.000đ", qty: 1, price: 10000 },
    ],
    newPenalty: { reason: "", amount: "" },
    penalties: [],
  };

  stayData = [
    {
      id: 1,
      guest: "Phạm Văn An",
      room: "406 (Suite)",
      checkInTime: "08:47:05 20/3/2026",
      checkOutPlan: "07:00:00 12/10/2026",
    },
  ];

  bookingData = [
    {
      id: 2,
      guest: "Phạm Văn An",
      roomType: "Suite",
      checkIn: "20/3/2026",
      checkOut: "12/10/2026",
    },
  ];

  openModal = (type, item = null) => {
    this.setState({ showModal: true, modalType: type, currentItem: item });
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      modalType: null,
      currentItem: null,
      walkInForm: { name: "", phone: "", identity: "", room: "", checkOut: "" },
      transferRoom: "",
      transferNote: "",
      minibarItems: [
        { id: 1, name: "Pepsi - 30.000đ", qty: 2, price: 30000 },
        { id: 2, name: "Nước suối - 10.000đ", qty: 1, price: 10000 },
      ],
      newPenalty: { reason: "", amount: "" },
      penalties: [],
    });
  };

  handleWalkInInput = (field) => (e) => {
    this.setState({
      walkInForm: { ...this.state.walkInForm, [field]: e.target.value },
    });
  };

  handleTransferInput = (field) => (e) => {
    this.setState({ [field]: e.target.value });
  };

  addMinibarItem = () => {
    this.setState((prev) => ({
      minibarItems: [
        ...prev.minibarItems,
        { id: Date.now(), name: "", qty: 1, price: 0 },
      ],
    }));
  };

  updateMinibarItem = (id, field, value) => {
    this.setState((prev) => ({
      minibarItems: prev.minibarItems.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "qty" ? Number(value) : value }
          : item,
      ),
    }));
  };

  removeMinibarItem = (id) => {
    this.setState((prev) => ({
      minibarItems: prev.minibarItems.filter((item) => item.id !== id),
    }));
  };

  addPenalty = () => {
    const { newPenalty, penalties } = this.state;
    if (!newPenalty.reason || !newPenalty.amount) return;
    this.setState({
      penalties: [...penalties, { ...newPenalty, id: Date.now() }],
      newPenalty: { reason: "", amount: "" },
    });
  };

  removePenalty = (id) => {
    this.setState((prev) => ({
      penalties: prev.penalties.filter((p) => p.id !== id),
    }));
  };

  changeTab = (tab) => this.setState({ activeTab: tab });

  renderModal() {
    const {
      modalType,
      currentItem,
      walkInForm,
      transferRoom,
      transferNote,
      minibarItems,
      newPenalty,
      penalties,
    } = this.state;

    if (!modalType) return null;

    const overlayClick = (e) => {
      if (e.target.classList.contains("nhan-modal-overlay")) this.closeModal();
    };

    const subtotal = minibarItems.reduce((sum, i) => sum + i.qty * i.price, 0);
    const penaltyTotal = penalties.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );

    return (
      <div className="nhan-modal-overlay" onClick={overlayClick}>
        <div className="nhan-modal" onClick={(e) => e.stopPropagation()}>
          <div className="nhan-modal-title-row">
            <h2>
              {modalType === "walkin" && "Check-in Walk-in"}
              {modalType === "checkin" && "Check-in khách hàng"}
              {modalType === "transfer" && "Chuyển phòng"}
              {modalType === "checkout" && "Check-out khách hàng"}
            </h2>
            <button className="nhan-close-btn" onClick={this.closeModal}>
              ×
            </button>
          </div>

          {modalType === "walkin" && (
            <>
              <div className="field">
                <label>Họ tên *</label>
                <input
                  placeholder="Họ tên *"
                  value={walkInForm.name}
                  onChange={this.handleWalkInInput("name")}
                />
              </div>
              <div className="field">
                <label>Số điện thoại *</label>
                <input
                  placeholder="Số điện thoại *"
                  value={walkInForm.phone}
                  onChange={this.handleWalkInInput("phone")}
                />
              </div>
              <div className="field">
                <label>CMND/CCCD *</label>
                <input
                  placeholder="CMND/CCCD *"
                  value={walkInForm.identity}
                  onChange={this.handleWalkInInput("identity")}
                />
              </div>
              <div className="field">
                <label>Chọn phòng *</label>
                <select
                  value={walkInForm.room}
                  onChange={this.handleWalkInInput("room")}
                >
                  <option value="">Chọn phòng</option>
                  <option value="406 (Suite)">406 (Suite)</option>
                  <option value="407 (Standard)">407 (Standard)</option>
                </select>
              </div>
              <div className="field">
                <label>Ngày trả phòng dự kiến *</label>
                <input
                  type="date"
                  value={walkInForm.checkOut}
                  onChange={this.handleWalkInInput("checkOut")}
                />
              </div>
            </>
          )}

          {modalType === "checkin" && (
            <>
              <div className="field">
                <label>Khách hàng</label>
                <div className="readonly">{currentItem?.guest}</div>
              </div>
              <div className="field">
                <label>Chọn phòng *</label>
                <select>
                  <option>406 (Suite)</option>
                  <option>407 (Standard)</option>
                </select>
              </div>
            </>
          )}

          {modalType === "transfer" && (
            <>
              <div className="field">
                <label>Phòng hiện tại</label>
                <div className="readonly">
                  {currentItem?.room || "406 - Suite"}
                </div>
              </div>
              <div className="field">
                <label>Phòng mới *</label>
                <select
                  value={transferRoom}
                  onChange={this.handleTransferInput("transferRoom")}
                >
                  <option value="">Chọn phòng mới</option>
                  <option value="502 - Deluxe">502 - Deluxe</option>
                  <option value="503 - Premium">503 - Premium</option>
                </select>
              </div>
              <div className="field">
                <label>Lý do chuyển phòng</label>
                <textarea
                  rows={3}
                  placeholder="VD: Khách yêu cầu, nâng hạng phòng, sự cố kỹ thuật..."
                  value={transferNote}
                  onChange={this.handleTransferInput("transferNote")}
                />
              </div>
              <div className="note-box">
                Lưu ý: Tiền phòng sẽ được tính riêng theo từng phòng khách ở.
                Phòng cũ sẽ chuyển sang trạng thái "Dọn dẹp".
              </div>
            </>
          )}

          {modalType === "checkout" && (
            <>
              <div className="field">
                <label>Khách hàng</label>
                <div className="readonly">{currentItem?.guest}</div>
              </div>
              <div className="sub-title">Minibar</div>
              {minibarItems.map((item) => (
                <div key={item.id} className="minibar-row">
                  <select
                    value={item.name}
                    onChange={(e) =>
                      this.updateMinibarItem(item.id, "name", e.target.value)
                    }
                  >
                    <option value="Pepsi - 30.000đ">Pepsi - 30.000đ</option>
                    <option value="Nước suối - 10.000đ">
                      Nước suối - 10.000đ
                    </option>
                    <option value="Snack - 20.000đ">Snack - 20.000đ</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      this.updateMinibarItem(item.id, "qty", e.target.value)
                    }
                  />
                  <button
                    className="btn-danger"
                    onClick={() => this.removeMinibarItem(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                className="btn btn-secondary btn-add"
                onClick={this.addMinibarItem}
              >
                Thêm minibar
              </button>
              <div className="sub-title">Phí phạt</div>
              <div className="penalty-row">
                <input
                  placeholder="Lý do phạt"
                  value={newPenalty.reason}
                  onChange={(e) =>
                    this.setState({
                      newPenalty: { ...newPenalty, reason: e.target.value },
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Số tiền"
                  value={newPenalty.amount}
                  onChange={(e) =>
                    this.setState({
                      newPenalty: { ...newPenalty, amount: e.target.value },
                    })
                  }
                />
                <button className="btn btn-secondary" onClick={this.addPenalty}>
                  Thêm
                </button>
              </div>
              {penalties.length > 0 && (
                <div className="penalty-list">
                  {penalties.map((p) => (
                    <div key={p.id} className="penalty-item">
                      <span>{p.reason}</span>
                      <div className="penalty-actions">
                        <strong>{Number(p.amount).toLocaleString()}đ</strong>
                        <button
                          className="btn btn-danger"
                          onClick={() => this.removePenalty(p.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="total-row">
                <span>Tổng:</span>
                <strong>{(subtotal + penaltyTotal).toLocaleString()}đ</strong>
              </div>
            </>
          )}

          <div className="nhan-modal-actions">
            <button className="btn btn-secondary" onClick={this.closeModal}>
              Hủy
            </button>
            <button className="btn btn-primary" onClick={this.closeModal}>
              {modalType === "checkout"
                ? "Xác nhận Check-out"
                : modalType === "transfer"
                  ? "Xác nhận chuyển"
                  : "Check-in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { activeTab, showModal } = this.state;

    return (
      <div className="nhantraphong">
        <div className="page-header">
          <div>
            <h1>Nhận/Trả phòng</h1>
            <p>Quản lý check-in và check-out khách hàng</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => this.openModal("walkin")}
          >
            Walk-in
          </button>
        </div>

        <div className="tab-panel">
          <button
            className={activeTab === "stay" ? "active" : ""}
            onClick={() => this.changeTab("stay")}
          >
            Đang lưu trú (1)
          </button>
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => this.changeTab("pending")}
          >
            Đặt phòng chờ nhận (1)
          </button>
        </div>

        <div className="section-card">
          <h2>
            {activeTab === "stay" ? "Khách đang lưu trú" : "Đặt phòng chờ nhận"}
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>{activeTab === "stay" ? "Phòng" : "Loại phòng"}</th>
                  <th>{activeTab === "stay" ? "Check-in" : "Ngày nhận"}</th>
                  <th>
                    {activeTab === "stay" ? "Dự kiến check-out" : "Ngày trả"}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === "stay" &&
                  this.stayData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.guest}</td>
                      <td>{item.room}</td>
                      <td>{item.checkInTime}</td>
                      <td>{item.checkOutPlan}</td>
                      <td>
                        <button
                          className="icon-action"
                          onClick={() => this.openModal("transfer", item)}
                        >
                          ↺ Chuyển phòng
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => this.openModal("checkout", item)}
                        >
                          ➜ Check-out
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === "pending" &&
                  this.bookingData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.guest}</td>
                      <td>{item.roomType}</td>
                      <td>{item.checkIn}</td>
                      <td>{item.checkOut}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => this.openModal("checkin", item)}
                        >
                          ➜ Check-in
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && this.renderModal()}
      </div>
    );
  }
}

export default NhanTraphong;