import React, { Component } from "react";
import "../style/Login.css";
class Login extends Component {
  render() {
    return (
      <>
        <div className="dangnhap">
          <div className="dangnhap-container">
            <i className="fa-regular fa-building logo-hotel-login"></i>
            <div className="dangnhap-top">
              <h3>Hệ thống Quản lý Khách sạn</h3>
              <p>Đăng nhập vào hệ thống</p>
            </div>
            <form className="dangnhap-form" id="loginForm">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="Nhập email"></input>
              <label for="matkhau">Mật khẩu</label>
              <input
                type="password"
                id="matkhau"
                placeholder="Nhập mật khẩu"
              ></input>
              <label for="vaitro">Vai trò</label>
              <div className="select-wrapper">
                <select id="vaitro">
                  <option value="admin">Quản trị viên</option>
                  <option value="receptionist">Lễ tân</option>
                </select>
              </div>
              <button className="dangnhap-button" type="submit">
                Đăng nhập
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }
}
export default Login;
