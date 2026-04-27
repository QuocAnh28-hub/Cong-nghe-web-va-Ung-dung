import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../style/TrangKhachHang_DatPhong.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";

class TrangKhachHang_DatPhong extends Component {
  state = {
    fullname: "",
    reservations: [],
    loading: true,
    error: null,
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
    const { fullname, reservations, loading, error } = this.state;

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
                    <th>Mã Đơn</th>
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
                        <button className="btn-edit" onClick={() => alert('Chức năng sửa sẽ được cập nhật sau!')}>Sửa</button>
                        <button className="btn-cancel" onClick={() => alert('Chức năng hủy sẽ được cập nhật sau!')}>Hủy</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </main>

        <TrangKhachHang_Footer />
        
      </div>
    );
  }
}

export default TrangKhachHang_DatPhong;
