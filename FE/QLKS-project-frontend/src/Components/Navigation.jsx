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
    return (
      <>
        <div className="Navigations">
          <button
            className={`navigations-btn ${currentPage === Tongquan ? "active" : ""}`}
            onClick={() => changePage(Tongquan)}
          >
            <i className="fa-solid fa-table-cells-large"></i>Tổng quan
          </button>
          <button
            className={`navigations-btn ${currentPage === Lichphong ? "active" : ""}`}
            onClick={() => changePage(Lichphong)}
          >
            <i className="fa-regular fa-calendar-days"></i>
            Lịch phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === Quanlyphong ? "active" : ""}`}
            onClick={() => changePage(Quanlyphong)}
          >
            <i className="fa-regular fa-building"></i>Quản lý phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === Loaiphong ? "active" : ""}`}
            onClick={() => changePage(Loaiphong)}
          >
            <i className="fa-solid fa-bed"></i>Loại phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === Quanlygia ? "active" : ""}`}
            onClick={() => changePage(Quanlygia)}
          >
            <i className="fa-solid fa-dollar-sign"></i>Quản lý giá
          </button>
          <button
            className={`navigations-btn ${currentPage === Datphong ? "active" : ""}`}
            onClick={() => changePage(Datphong)}
          >
            <i className="fa-solid fa-clipboard-list"></i>Đặt phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === NhanTraphong ? "active" : ""}`}
            onClick={() => changePage(NhanTraphong)}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>Nhận/Trả
            phòng
          </button>
          <button
            className={`navigations-btn ${currentPage === Khachhang ? "active" : ""}`}
            onClick={() => changePage(Khachhang)}
          >
            <i className="fa-solid fa-users"></i>Khách hàng
          </button>
          <button
            className={`navigations-btn ${currentPage === Dichvu ? "active" : ""}`}
            onClick={() => changePage(Dichvu)}
          >
            <i className="fa-solid fa-gear"></i>Dịch vụ
          </button>
          <button
            className={`navigations-btn ${currentPage === Hoadon ? "active" : ""}`}
            onClick={() => changePage(Hoadon)}
          >
            <i className="fa-regular fa-file-lines"></i>Hoá đơn
          </button>
          <button
            className={`navigations-btn ${currentPage === Baocao ? "active" : ""}`}
            onClick={() => changePage(Baocao)}
          >
            <i className="fa-solid fa-chart-column"></i>Báo cáo
          </button>
          <button
            className={`navigations-btn ${currentPage === Nhanvien ? "active" : ""}`}
            onClick={() => changePage(Nhanvien)}
          >
            <i className="fa-solid fa-user"></i>Nhân viên
          </button>
        </div>
      </>
    );
  }
}
export default Navigation;
