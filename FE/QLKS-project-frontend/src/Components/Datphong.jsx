import React, { Component } from "react";
import "../style/Datphong.css";
import { FeatureHeader } from "./Common";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "booked", label: "Đã đặt" },
  { value: "checkedin", label: "Đã nhận" },
  { value: "completed", label: "Hoàn thành" },
  { value: "canceled", label: "Đã hủy" },
  { value: "noshow", label: "Không đến" },
];

const ROOM_TYPES = ["Suite", "Standard", "Deluxe", "Premium"];

class Datphong extends Component {
  state = {
    showModal: false,
    editingId: null,
    customerTab: "old",
    search: "",
    filterStatus: "all",
    bookings: [
      {
        id: 1,
        customer: "Phạm Văn An",
        roomType: "Suite",
        checkIn: "20/03/2026",
        checkOut: "12/10/2026",
        guests: 20,
        rooms: 1,
        status: "Đã đặt",
        note: "",
      },
      {
        id: 2,
        customer: "Nguyễn Thị B",
        roomType: "Standard",
        checkIn: "22/03/2026",
        checkOut: "26/03/2026",
        guests: 3,
        rooms: 1,
        status: "Đã nhận",
        note: "Yêu cầu: phòng có ban công",
      },
    ],
    form: {
      customerId: "",
      newCustomer: {
        name: "",
        phone: "",
        identity: "",
        email: "",
      },
      roomType: "",
      checkIn: "",
      checkOut: "",
      guests: 1,
      rooms: 1,
      note: "",
      status: "Đã đặt",
    },
  };

  openModal = (booking = null) => {
    if (booking) {
      this.setState({
        showModal: true,
        editingId: booking.id,
        customerTab: "old",
        form: {
          customerId: booking.customer,
          newCustomer: { name: "", phone: "", identity: "", email: "" },
          roomType: booking.roomType,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          rooms: booking.rooms,
          note: booking.note || "",
          status: booking.status,
        },
      });
    } else {
      this.setState({
        showModal: true,
        editingId: null,
        customerTab: "old",
        form: {
          customerId: "",
          newCustomer: { name: "", phone: "", identity: "", email: "" },
          roomType: "",
          checkIn: "",
          checkOut: "",
          guests: 1,
          rooms: 1,
          note: "",
          status: "Đã đặt",
        },
      });
    }
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      editingId: null,
      customerTab: "old",
      form: {
        customerId: "",
        newCustomer: { name: "", phone: "", identity: "", email: "" },
        roomType: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
        rooms: 1,
        note: "",
        status: "Đã đặt",
      },
    });
  };

  handleInput = (field) => (event) => {
    const { form } = this.state;
    this.setState({ form: { ...form, [field]: event.target.value } });
  };

  handleNewCustomerInput = (field) => (event) => {
    const { form } = this.state;
    this.setState({
      form: {
        ...form,
        newCustomer: { ...form.newCustomer, [field]: event.target.value },
      },
    });
  };

  saveBooking = () => {
    const { customerTab, form, bookings } = this.state;

    let customerName = "";
    if (customerTab === "old") {
      if (!form.customerId) {
        alert("Vui lòng chọn khách hàng.");
        return;
      }
      customerName = form.customerId;
    } else {
      const { name, phone, identity } = form.newCustomer;
      if (!name || !phone || !identity) {
        alert("Vui lòng điền đầy đủ thông tin khách mới.");
        return;
      }
      customerName = name;
    }

    if (!form.roomType || !form.checkIn || !form.checkOut || !form.guests) {
      alert("Vui lòng điền đầy đủ thông tin đặt phòng.");
      return;
    }

    const bookingToSave = {
      id: this.state.editingId || bookings.length + 1,
      customer: customerName,
      roomType: form.roomType,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      guests: form.guests,
      rooms: form.rooms,
      status: form.status,
      note: form.note,
    };

    const updatedBookings = this.state.editingId
      ? bookings.map((b) => (b.id === this.state.editingId ? bookingToSave : b))
      : [bookingToSave, ...bookings];

    this.setState({
      bookings: updatedBookings,
      showModal: false,
      editingId: null,
      customerTab: "old",
      form: {
        customerId: "",
        newCustomer: { name: "", phone: "", identity: "", email: "" },
        roomType: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
        rooms: 1,
        note: "",
        status: "Đã đặt",
      },
    });
  };

  deleteBooking = (id) => {
    this.setState({ bookings: this.state.bookings.filter((b) => b.id !== id) });
  };

  setCustomerTab = (tab) => {
    this.setState({ customerTab: tab });
  };

  render() {
    const { showModal, customerTab, bookings, search, filterStatus, form } =
      this.state;

    const filteredBookings = bookings.filter((booking) => {
      const matchesSearch =
        booking.customer.toLowerCase().includes(search.toLowerCase()) ||
        booking.roomType.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "booked" && booking.status === "Đã đặt") ||
        (filterStatus === "checkedin" && booking.status === "Đã nhận") ||
        (filterStatus === "completed" && booking.status === "Hoàn thành") ||
        (filterStatus === "canceled" && booking.status === "Đã hủy") ||
        (filterStatus === "noshow" && booking.status === "Không đến");
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="datphong">
        <div className="datphong__header">
          <FeatureHeader
            title="Đặt phòng"
            description="Quản lý đặt phòng khách sạn"
          />
          <button className="btn btn-primary" onClick={this.openModal}>
            + Thêm đặt phòng
          </button>
        </div>
        <div className="datphong-main">
          <div className="datphong__filter">
            <div className="datphong-search-box">
              <i className="fa fa-search"></i>
              <input
                placeholder="Tìm theo tên khách, SĐT, loại phòng..."
                value={search}
                onChange={(e) => this.setState({ search: e.target.value })}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => this.setState({ filterStatus: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="datphong__table-wrap">
            <table className="datphong__table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Loại phòng</th>
                  <th>Nhận phòng</th>
                  <th>Trả phòng</th>
                  <th>Số người</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      Không tìm thấy kết quả.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.customer}</td>
                      <td>{booking.roomType}</td>
                      <td>{booking.checkIn}</td>
                      <td>{booking.checkOut}</td>
                      <td>{booking.guests}</td>
                      <td>
                        <span
                          className={`status status-${booking.status.replace(/\s+/g, "").toLowerCase()}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="icon-btn"
                          title="Sửa"
                          onClick={() => this.openModal(booking)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="icon-btn icon-btn-delete"
                          onClick={() => this.deleteBooking(booking.id)}
                          title="Xóa"
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

        {showModal && (
          <div className="modal-overlay" onClick={this.closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title-row">
                <h2>Thêm đặt phòng mới</h2>
                <button className="close-btn" onClick={this.closeModal}>
                  ×
                </button>
              </div>

              <div className="customer-tabs">
                <button
                  className={customerTab === "old" ? "active" : ""}
                  onClick={() => this.setCustomerTab("old")}
                >
                  Khách cũ
                </button>
                <button
                  className={customerTab === "new" ? "active" : ""}
                  onClick={() => this.setCustomerTab("new")}
                >
                  Khách mới
                </button>
              </div>

              {customerTab === "old" ? (
                <div className="field">
                  <label>Chọn khách hàng</label>
                  <select
                    value={form.customerId}
                    onChange={this.handleInput("customerId")}
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    <option value="Phạm Văn An">Phạm Văn An</option>
                    <option value="Nguyễn Thị B">Nguyễn Thị B</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label>Họ tên *</label>
                    <input
                      type="text"
                      value={form.newCustomer.name}
                      onChange={this.handleNewCustomerInput("name")}
                      placeholder="Họ tên *"
                    />
                  </div>
                  <div className="field">
                    <label>Số điện thoại *</label>
                    <input
                      type="text"
                      value={form.newCustomer.phone}
                      onChange={this.handleNewCustomerInput("phone")}
                      placeholder="Số điện thoại *"
                    />
                  </div>
                  <div className="field">
                    <label>CMND/CCCD *</label>
                    <input
                      type="text"
                      value={form.newCustomer.identity}
                      onChange={this.handleNewCustomerInput("identity")}
                      placeholder="CMND/CCCD *"
                    />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.newCustomer.email}
                      onChange={this.handleNewCustomerInput("email")}
                      placeholder="Email"
                    />
                  </div>
                </>
              )}

              <div className="field">
                <label>Loại phòng *</label>
                <select
                  value={form.roomType}
                  onChange={this.handleInput("roomType")}
                >
                  <option value="">Chọn loại phòng</option>
                  {ROOM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Ngày nhận phòng *</label>
                <input
                  type="date"
                  value={form.checkIn}
                  onChange={this.handleInput("checkIn")}
                />
              </div>

              <div className="field">
                <label>Ngày trả phòng *</label>
                <input
                  type="date"
                  value={form.checkOut}
                  onChange={this.handleInput("checkOut")}
                />
              </div>

              <div className="field">
                <label>Số người *</label>
                <input
                  type="number"
                  min="1"
                  value={form.guests}
                  onChange={this.handleInput("guests")}
                />
              </div>

              <div className="field">
                <label>Số phòng cần đặt</label>
                <input
                  type="number"
                  min="1"
                  value={form.rooms}
                  onChange={this.handleInput("rooms")}
                />
              </div>

              <div className="field">
                <label>Ghi chú</label>
                <textarea
                  rows="3"
                  value={form.note}
                  onChange={this.handleInput("note")}
                />
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={this.closeModal}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={this.saveBooking}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Datphong;