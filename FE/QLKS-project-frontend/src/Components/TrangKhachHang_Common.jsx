import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../style/TrangKhachHang.css";

export const TrangKhachHang_Header = ({ fullname, onLogout }) => {
  const isLogin = localStorage.getItem("isLogin") === "true";
  const displayName = isLogin ? fullname || "Khách hàng" : "Đăng nhập";
  const profileLink = isLogin ? "/trangkhachhang/thongtin" : "/login";

  return (
    <header className="customer-header">
      <div className="customer-topbar">
        <span>QAS Hotel Booking</span>
      </div>
      <div className="customer-header__inner">
        <Link to="/trangkhachhang" className="customer-brand">
          <span className="customer-brand__icon">
            <i className="fa-regular fa-building" />
          </span>
          <span className="customer-brand__text">QAS-Hotel</span>
        </Link>

        <nav className="customer-nav">
          <NavLink
            to="/trangkhachhang"
            end
            className={({ isActive }) =>
              `customer-nav__link${isActive ? " active" : ""}`
            }
          >
            <i className="fa-solid fa-house" />
            <span>{"Trang chủ"}</span>
          </NavLink>
          <NavLink
            to="/trangkhachhang/phongnghi"
            className={({ isActive }) =>
              `customer-nav__link${isActive ? " active" : ""}`
            }
          >
            <i className="fa-solid fa-bed" />
            <span>{"Phòng nghỉ"}</span>
          </NavLink>
          <NavLink
            to="/trangkhachhang/datphong"
            className={({ isActive }) =>
              `customer-nav__link${isActive ? " active" : ""}`
            }
          >
            <i className="fa-regular fa-calendar" />
            <span>{"Đặt phòng"}</span>
          </NavLink>
        </nav>

        <div className="customer-user">
          <Link to={profileLink} className="customer-user__chip">
            <span className="customer-user__avatar">
              <i className="fa-solid fa-user-tie"></i>
            </span>
            <span className="customer-user__name">{displayName}</span>
          </Link>
          {isLogin && (
            <button
              type="button"
              className="customer-user__logout"
              onClick={onLogout}
              aria-label={"Đăng xuất"}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const TrangKhachHang_Footer = () => {
  return (
    <footer className="customer-footer">
      <h3>QAS-Hotel</h3>
      <p>{"© 2026 QAS-Hotel. Tất cả quyền được bảo lưu."}</p>
      <div className="customer-footer__links">
        <a href="#hero">{"Chính sách bảo mật"}</a>
        <a href="#ly-do">{"Điều khoản dịch vụ"}</a>
        <a href="#tien-ich">{"Liên hệ"}</a>
      </div>
    </footer>
  );
};
