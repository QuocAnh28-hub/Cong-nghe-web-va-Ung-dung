import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../style/TrangKhachHang_DatPhong.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";
import { toast } from "react-toastify";

class TrangKhachHang_DatPhong extends Component {
  state = {
    fullname: "",
    reservations: [],
    loading: true,
    error: null,
    showEditPopup: false,
    editData: {
      ReservationID: null,
      RoomTypeName: "",
      RoomTypeID: null,
      CheckInDate: "",
      CheckOutDate: "",
      Quantity: 1,
    },
    editLoading: false,
    editError: null,
  };
  // Mở popup sửa với dữ liệu đơn đặt phòng
  handleEditClick = (reservation) => {
    this.setState({
      showEditPopup: true,
      editData: {
        ReservationID: reservation.ReservationID,
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
    const { fullname, reservations, loading, error, showEditPopup, editData, editLoading, editError } = this.state;

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

          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <p style={{color: 'red'}}>{error}</p>}

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

          {!loading && !error && reservations.length > 0 && (
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
                  {reservations.map((r) => (
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
                          <button className="btn-edit" onClick={() => this.handleEditClick(r)}>Sửa</button>
                        ) : (
                          <button className="btn-edit" disabled style={{opacity:0.5, cursor:'not-allowed'}}>Sửa</button>
                        )}
                        {r.Status === 'BOOKED' ? (
                          <button className="btn-cancel" onClick={() => this.handleCancelReservation(r.ReservationID)}>Hủy</button>
                        ) : (
                          <button className="btn-cancel" disabled style={{opacity:0.5, cursor:'not-allowed'}}>Hủy</button>
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
        </main>

        <TrangKhachHang_Footer />
        
      </div>
    );
  }
}

export default TrangKhachHang_DatPhong;
