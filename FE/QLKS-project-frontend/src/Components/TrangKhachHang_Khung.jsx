import React, { Component } from "react";
import { Outlet } from "react-router-dom";
import "../style/TrangKhachHang.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";

class TrangKhachHang_Khung extends Component {
  state = {
    fullname: "",
  };

  componentDidMount() {
    const fullname = localStorage.getItem("fullname");
    this.setState({ fullname: fullname || "" });
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
      <div className="customer-page">
        <TrangKhachHang_Header fullname={fullname} onLogout={this.handleLogout} />
        
        <main className="customer-main">
          <Outlet />
        </main>

        <TrangKhachHang_Footer />
      </div>
    );
  }
}

export default TrangKhachHang_Khung;