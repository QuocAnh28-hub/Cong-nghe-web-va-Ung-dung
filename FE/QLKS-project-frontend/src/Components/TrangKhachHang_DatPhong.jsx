import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../style/TrangKhachHang_DatPhong.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";
import { toast } from "react-toastify";

const INVOICE_FULL_API_URL = (stayId) =>
  `http://localhost:3000/api/invoices/full/${stayId}`;

class TrangKhachHang_DatPhong extends Component {
  state = {
    fullname: "",
    reservations: [],
    loading: true,
    error: null,
    selectedStatus: "ALL",
    statusOptions: [
      { value: "ALL", label: "Tất cả" },
      { value: "BOOKED", label: "Đã đặt" },
      { value: "CANCELLED", label: "Đã hủy" },
      { value: "CHECKED_IN", label: "Đã nhận phòng" },
      { value: "COMPLETED", label: "Hoàn thành" },
    ],
    showEditPopup: false,
    editData: {
      ReservationID: null,
      StayID: null,
      RoomTypeName: "",
      RoomTypeID: null,
      CheckInDate: "",
      CheckOutDate: "",
      Quantity: 1,
    },
    editLoading: false,
    editError: null,
    showInvoicePopup: false,
    invoiceLoading: false,
    invoiceError: null,
    invoiceData: {
      invoice: null,
      details: [],
    },
  };
  // Mở popup sửa với dữ liệu đơn đặt phòng
  handleEditClick = (reservation) => {
    this.setState({
      showEditPopup: true,
      editData: {
        ReservationID: reservation.ReservationID,
        StayID: reservation.StayID ?? reservation.stayID ?? null,
        RoomTypeName: reservation.RoomTypeName,
        RoomTypeID: reservation.RoomTypeID,
        CheckInDate: reservation.CheckInDate ? reservation.CheckInDate.slice(0, 10) : "",
        CheckOutDate: reservation.CheckOutDate ? reservation.CheckOutDate.slice(0, 10) : "",
        Quantity: reservation.Quantity,
      },
      editError: null,
    });
  };

  // Đóng popup sửa
  handleCloseEditPopup = () => {
    this.setState({ showEditPopup: false, editError: null });
  };

  // Xử lý thay đổi input trong popup
  handleEditInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      editData: {
        ...prevState.editData,
        [name]: value,
      },
    }));
  };

  formatCurrency = (value) => {
    const amount = Number(value);
    if (Number.isNaN(amount)) return "0 đ";
    return amount.toLocaleString("vi-VN") + " đ";
  };

  handleViewInvoiceClick = async (reservation) => {
    const stayId = Number(reservation.StayID ?? reservation.stayID ?? reservation.stayId);
    if (!Number.isInteger(stayId) || stayId < 1) {
      this.setState({ invoiceError: "Mã lưu trú không hợp lệ." });
      return;
    }

    this.setState({
      showInvoicePopup: true,
      invoiceLoading: true,
      invoiceError: null,
      invoiceData: { invoice: null, details: [] },
    });

    try {
      const res = await fetch(INVOICE_FULL_API_URL(stayId));
      if (!res.ok) throw new Error("Không thể tải chi tiết hóa đơn");
      const data = await res.json();
      this.setState({
        invoiceData: {
          invoice: data.invoice ?? data,
          details: Array.isArray(data.details) ? data.details : [],
        },
      });
    } catch (error) {
      this.setState({ invoiceError: error.message || "Lỗi tải chi tiết hóa đơn" });
    } finally {
      this.setState({ invoiceLoading: false });
    }
  };

  handleCloseInvoicePopup = () => {
    this.setState({ showInvoicePopup: false, invoiceError: null, invoiceData: { invoice: null, details: [] } });
  };

  // Gửi API cập nhật đơn đặt phòng
  handleEditSubmit = async (e) => {
    e.preventDefault();
    const { ReservationID, RoomTypeID, Quantity, CheckInDate, CheckOutDate } = this.state.editData;
    this.setState({ editLoading: true, editError: null });
    try {
      const res = await fetch(`http://localhost:3000/api/reservations/${ReservationID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RoomTypeID,
          Quantity: Number(Quantity),
          CheckInDate,
          CheckOutDate,
        }),
      });
      if (!res.ok) throw new Error("Cập nhật đơn đặt phòng thất bại");
      // Sau khi cập nhật thành công, reload lại danh sách
      const userID = localStorage.getItem("userID");
      if (userID) await this.fetchReservations(userID);
      this.setState({ showEditPopup: false, editLoading: false });
      toast.success("Cập nhật đơn đặt phòng thành công!");
    } catch (error) {
      this.setState({ editError: error.message || "Lỗi cập nhật", editLoading: false });
    }
  };

  // Xử lý hủy đặt phòng
  handleCancelReservation = async (reservationID) => {
    const confirmCancel = window.confirm("Bạn có chắc muốn hủy đơn đặt phòng này không?");
    if (!confirmCancel) return;
    this.setState({ loading: true, error: null });
    try {
      const res = await fetch(`http://localhost:3000/api/reservations/${reservationID}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Hủy đặt phòng thất bại");
      // Sau khi hủy thành công, reload lại danh sách
      const userID = localStorage.getItem("userID");
      if (userID) await this.fetchReservations(userID);
      toast.success("Đã hủy đặt phòng thành công!");
    } catch (error) {
      this.setState({ error: error.message || "Lỗi hủy đặt phòng" });
    } finally {
      this.setState({ loading: false });
    }
  };

  componentDidMount() {
    const fullname = localStorage.getItem("fullname");
    const userID = localStorage.getItem("userID");
    this.setState({ fullname: fullname || "Khách hàng" });
    if (userID) {
      this.fetchReservations(userID);
    } else {
      this.setState({ loading: false, error: "Không tìm thấy thông tin người dùng." });
    }
  }

  fetchReservations = async (userID) => {
    try {
      const res = await fetch(`http://localhost:3000/api/reservations/user/${userID}/history`);
      if (!res.ok) throw new Error("Không thể tải lịch sử đặt phòng");
      const data = await res.json();
      this.setState({ reservations: data, loading: false });
    } catch (error) {
      this.setState({ error: error.message || "Lỗi tải dữ liệu", loading: false });
    }
  };

  handleStatusFilterChange = (status) => {
    this.setState({ selectedStatus: status });
  };

  handleLogout = () => {
    const xacNhan = window.confirm("Bạn có chắc muốn đăng xuất không?");

    if (xacNhan) {
      localStorage.removeItem("userID");
      localStorage.removeItem("token");
      localStorage.removeItem("isLogin");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      localStorage.removeItem("fullname");
      localStorage.removeItem("phone");
      localStorage.removeItem("hotelBookings");
      window.location.href = "/login";
    }
  };

  render() {
    const {
      fullname,
      reservations,
      loading,
      error,
      showEditPopup,
      editData,
      editLoading,
      editError,
      selectedStatus,
      statusOptions,
    } = this.state;
    const filteredReservations =
      selectedStatus === "ALL"
        ? reservations
        : reservations.filter((r) => r.Status === selectedStatus);

    return (
      <div className="booking-page">
        
        <TrangKhachHang_Header fullname={fullname} onLogout={this.handleLogout} />

        <main className="booking-main">
          <section className="booking-headline">
            <div>
              <h1>Đơn đặt phòng của bạn</h1>
              <p>Quản lý các kỳ nghỉ và lịch trình của bạn tại QAS Hotel.</p>
            </div>

            <Link to="/trangkhachhang/phongnghi" className="booking-new-btn">
              <i className="fa-solid fa-plus" />
              Đặt phòng mới
            </Link>
          </section>

          <section className="booking-filter-bar">
            <select
              className="booking-filter-select"
              value={selectedStatus}
              onChange={(e) => this.handleStatusFilterChange(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </section>

          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <p className="booking-error">{error}</p>}

          {!loading && !error && reservations.length === 0 && (
            <section className="booking-empty-state">
              <div className="booking-empty-state__icon">
                <i className="fa-regular fa-calendar"></i>
              </div>
              <h2>Chưa có đơn đặt phòng nào</h2>
              <p>Hãy bắt đầu kỳ nghỉ của bạn bằng cách đặt phòng ngay hôm nay.</p>

              <Link to="/trangkhachhang/phongnghi" className="booking-cta-btn">
                Đặt phòng ngay
                <i className="fa-solid fa-arrow-right" />
              </Link>
            </section>
          )}

          {!loading && !error && reservations.length > 0 && filteredReservations.length === 0 && (
            <section className="booking-empty-state">
              <div className="booking-empty-state__icon">
                <i className="fa-regular fa-calendar"></i>
              </div>
              <h2>Không có đơn đặt phòng phù hợp</h2>
              <p>Thử thay đổi bộ lọc.</p>
            </section>
          )}

          {!loading && !error && filteredReservations.length > 0 && (
            <section className="booking-list">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Mã Đơn Đặt</th>
                    <th>Loại phòng</th>
                    <th>Ngày nhận</th>
                    <th>Ngày trả</th>
                    <th>Số lượng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r) => (
                    <tr key={r.ReservationID}>
                      <td>{r.ReservationID}</td>
                      <td>{r.RoomTypeName}</td>
                      <td>{r.CheckInDate ? new Date(r.CheckInDate).toLocaleDateString() : ''}</td>
                      <td>{r.CheckOutDate ? new Date(r.CheckOutDate).toLocaleDateString() : ''}</td>
                      <td>{r.Quantity}</td>
                      <td>{r.TotalPrice?.toLocaleString('vi-VN')} đ</td>
                      <td>{r.Status}</td>
                      <td>
                        {r.Status === 'BOOKED' ? (
                          <>
                            <button className="btn-edit" onClick={() => this.handleEditClick(r)}>Sửa</button>
                            <button className="btn-cancel" onClick={() => this.handleCancelReservation(r.ReservationID)}>Hủy</button>
                          </>
                        ) : r.Status === 'COMPLETED' ? (
                          <button className="btn-view" onClick={() => this.handleViewInvoiceClick(r)}>
                            Xem hóa đơn
                          </button>
                        ) : (
                          <>
                            <button className="btn-edit" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                              Sửa
                            </button>
                            <button className="btn-cancel" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                              Hủy
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Popup sửa đơn đặt phòng */}
          {showEditPopup && (
            <div className="edit-popup-overlay">
              <form className="edit-popup-form" onSubmit={this.handleEditSubmit}>
                <h2>Chỉnh sửa đơn đặt phòng</h2>
                <div>
                  <label>Mã Đơn Đặt:</label>
                  <input type="text" value={editData.ReservationID} disabled />
                </div>
                <div>
                  <label>Loại phòng:</label>
                  <input type="text" value={editData.RoomTypeName} disabled />
                </div>
                <div>
                  <label>Ngày nhận:</label>
                  <input type="date" name="CheckInDate" value={editData.CheckInDate} onChange={this.handleEditInputChange} required />
                </div>
                <div>
                  <label>Ngày trả:</label>
                  <input type="date" name="CheckOutDate" value={editData.CheckOutDate} onChange={this.handleEditInputChange} required />
                </div>
                <div>
                  <label>Số lượng:</label>
                  <input type="number" name="Quantity" min="1" value={editData.Quantity} onChange={this.handleEditInputChange} required />
                </div>
                {editError && <div className="edit-popup-error">{editError}</div>}
                <div className="edit-popup-actions">
                  <button type="button" className="edit-popup-cancel" onClick={this.handleCloseEditPopup}>Hủy</button>
                  <button type="submit" className="edit-popup-save" disabled={editLoading}>
                    {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {this.state.showInvoicePopup && (
            <div className="edit-popup-overlay" onClick={this.handleCloseInvoicePopup}>
              <div className="invoice-popup-form" onClick={(e) => e.stopPropagation()}>
                <div className="invoice-popup-header">
                  <h2>Chi tiết hóa đơn</h2>
                  <button className="invoice-popup-close" onClick={this.handleCloseInvoicePopup}>
                    ×
                  </button>
                </div>
                {this.state.invoiceLoading && <p>Đang tải chi tiết hóa đơn...</p>}
                {!this.state.invoiceLoading && this.state.invoiceError && (
                  <div>
                    <p>{this.state.invoiceError}</p>
                    <button className="edit-popup-cancel" onClick={this.handleCloseInvoicePopup}>
                      Đóng
                    </button>
                  </div>
                )}
                {!this.state.invoiceLoading && !this.state.invoiceError && this.state.invoiceData.invoice && (
                  <>
                    <div>
                      <p><strong>Mã lưu trú:</strong> {this.state.invoiceData.invoice.StayID}</p>
                      <p><strong>Ngày tạo:</strong> {new Date(this.state.invoiceData.invoice.Date).toLocaleString('vi-VN')}</p>
                      <p><strong>Khách hàng:</strong> {this.state.invoiceData.invoice.FullName}</p>
                      <p><strong>Số điện thoại:</strong> {this.state.invoiceData.invoice.Phone}</p>
                      <p><strong>Email:</strong> {this.state.invoiceData.invoice.Email}</p>
                      <p><strong>Ngày nhận:</strong> {new Date(this.state.invoiceData.invoice.ActualCheckIn).toLocaleString('vi-VN')}</p>
                      <p><strong>Ngày trả:</strong> {new Date(this.state.invoiceData.invoice.ActualCheckOut).toLocaleString('vi-VN')}</p>
                    </div>

                    <div>
                      <h3>Phòng</h3>
                      <table className="booking-table" style={{ width: '100%', marginBottom: 16 }}>
                        <thead>
                          <tr>
                            <th>Phòng</th>
                            <th>Đơn giá</th>
                            <th>Số lượng ngày ở</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.invoiceData.details.filter((item) => String(item.ItemType).toUpperCase() === 'ROOM').map((item) => (
                            <tr key={item.DetailID}>
                              <td>{item.ItemName}</td>
                              <td>{this.formatCurrency(item.UnitPrice)}</td>
                              <td>{item.Quantity}</td>
                              <td>{this.formatCurrency(item.Amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h3>Dịch vụ</h3>
                      <table className="booking-table" style={{ width: '100%', marginBottom: 16 }}>
                        <thead>
                          <tr>
                            <th>Dịch vụ</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.invoiceData.details.filter((item) => String(item.ItemType).toUpperCase() === 'SERVICE').map((item) => (
                            <tr key={item.DetailID}>
                              <td>{item.ItemName}</td>
                              <td>{item.Quantity}</td>
                              <td>{this.formatCurrency(item.UnitPrice)}</td>
                              <td>{this.formatCurrency(item.Amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h3>Minibar</h3>
                      <table className="booking-table" style={{ width: '100%', marginBottom: 16 }}>
                        <thead>
                          <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.invoiceData.details.filter((item) => String(item.ItemType).toUpperCase() === 'MINIBAR').map((item) => (
                            <tr key={item.DetailID}>
                              <td>{item.ItemName}</td>
                              <td>{item.Quantity}</td>
                              <td>{this.formatCurrency(item.UnitPrice)}</td>
                              <td>{this.formatCurrency(item.Amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h3>Phí phạt</h3>
                      <table className="booking-table" style={{ width: '100%', marginBottom: 16 }}>
                        <thead>
                          <tr>
                            <th>Lý do</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.invoiceData.details.filter((item) => String(item.ItemType).toUpperCase() === 'PENALTY').map((item) => (
                            <tr key={item.DetailID}>
                              <td>{item.ItemName}</td>
                              <td>{item.Quantity}</td>
                              <td>{this.formatCurrency(item.UnitPrice)}</td>
                              <td>{this.formatCurrency(item.Amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <p><strong>VAT:</strong> {this.state.invoiceData.invoice.VAT}%</p>
                      <p><strong>Tổng tiền:</strong> {this.formatCurrency(this.state.invoiceData.invoice.TotalAmount)}</p>
                    </div>

                    <div className="edit-popup-actions">
                      <button type="button" className="edit-popup-cancel" onClick={this.handleCloseInvoicePopup}>Đóng</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>

        <TrangKhachHang_Footer />
        
      </div>
    );
  }
}

export default TrangKhachHang_DatPhong;
