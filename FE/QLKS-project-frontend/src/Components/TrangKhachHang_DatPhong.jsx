import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../style/TrangKhachHang_DatPhong.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";

class TrangKhachHang_DatPhong extends Component {
  state = {
    fullname: "",
  };

  componentDidMount() {
    const fullname = localStorage.getItem("fullname");
    this.setState({ fullname: fullname || "Khách hàng" });
  }

  handleLogout = () => {
    const xacNhan = window.confirm("Bạn có chắc muốn đăng xuất không?");

    if (xacNhan) {
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
    const { fullname } = this.state;

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
        </main>

        <TrangKhachHang_Footer />
        
      </div>
    );
  }
}

export default TrangKhachHang_DatPhong;
