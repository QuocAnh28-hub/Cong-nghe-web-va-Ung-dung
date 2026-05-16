import React, { Component } from "react";
import "../style/Navigation.css";
import Tongquan from "./Tongquan";
import Lichphong from "./Lichphong";
import Quanlyphong from "./Quanlyphong";
import Loaiphong from "./Loaiphong";
import Quanlygia from "./Quanlygia";
import Datphong from "./Datphong";
import NhanTraphong from "./NhanTraphong";
import Khachhang from "./Khachhang";
import Dichvu from "./Dichvu";
import Hoadon from "./Hoadon";
import Baocao from "./Baocao";
import Nhanvien from "./Nhanvien";

class Navigation extends Component {
  render() {
    const { changePage, currentPage } = this.props;
    const role = (localStorage.getItem("role") || "").trim();
    const isAdmin = role === "ADMIN";

    return (
      <>
        <div className="Navigations">
          <button
            className={`navigations-btn ${currentPage === Tongquan ? "active" : ""}`}
            onClick={() => changePage(Tongquan)}
          >
            <i class="fa-solid fa-magnifying-glass-chart"></i>Tổng quan
          </button>
          <button
            className={`navigations-btn ${currentPage === NhanTraphong ? "active" : ""}`}
            onClick={() => changePage(NhanTraphong)}
          >
            <i class="fa-solid fa-right-from-bracket"></i>Nhận/Trả phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === Lichphong ? "active" : ""}`}
            onClick={() => changePage(Lichphong)}
          >
            <i className="fa-regular fa-calendar-days"></i>
            Lịch phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === Datphong ? "active" : ""}`}
            onClick={() => changePage(Datphong)}
          >
            <i class="fa-solid fa-calendar-check"></i>Đặt phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === Dichvu ? "active" : ""}`}
            onClick={() => changePage(Dichvu)}
          >
            <i class="fa-solid fa-utensils"></i>Dịch vụ
          </button>
          <button
            className={`navigations-btn ${currentPage === Hoadon ? "active" : ""}`}
            onClick={() => changePage(Hoadon)}
          >
            <i class="fa-solid fa-file-invoice-dollar"></i>Hoá đơn
          </button>
          <button
            className={`navigations-btn ${currentPage === Khachhang ? "active" : ""}`}
            onClick={() => changePage(Khachhang)}
          >
            <i class="fa-solid fa-user-tie"></i>Khách hàng
          </button>
          <button
            className={`navigations-btn ${currentPage === Quanlygia ? "active" : ""}`}
            onClick={() => changePage(Quanlygia)}
          >
            <i class="fa-solid fa-file-invoice-dollar"></i>Giá theo mùa
          </button>
          <button
            className={`navigations-btn ${currentPage === Quanlyphong ? "active" : ""}`}
            onClick={() => changePage(Quanlyphong)}
          >
            <i class="fa-solid fa-house"></i>Phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === Loaiphong ? "active" : ""}`}
            onClick={() => changePage(Loaiphong)}
          >
            <i class="fa-solid fa-couch"></i>Loại phòng
          </button>
          {isAdmin && (
            <button
              className={`navigations-btn ${currentPage === Baocao ? "active" : ""}`}
              onClick={() => changePage(Baocao)}
            >
              <i class="fa-solid fa-chart-simple"></i>Báo cáo
            </button>
          )}
          {isAdmin && (
            <button
              className={`navigations-btn ${currentPage === Nhanvien ? "active" : ""}`}
              onClick={() => changePage(Nhanvien)}
            >
            <i class="fa-solid fa-person-military-pointing"></i>Nhân viên
            </button>
          )}
        </div>
      </>
    );
  }
}
export default Navigation;
