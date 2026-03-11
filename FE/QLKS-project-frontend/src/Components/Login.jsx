import React, { Component } from "react";
import "../style/Login.css";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      message: "",
      role: ""
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = this.state;

    try {
      const response = await fetch(
        `https://localhost:7297/api-common/Login/login?username=${email}&pass=${password}`,
        {
          method: "POST"
        }
      );

      const result = await response.json();

      if (result.success) {
        // Lưu token
        localStorage.setItem("token", result.token);

        this.setState({
          message: "Đăng nhập thành công!",
          role: result.data.role
        });

        alert("Đăng nhập thành công!");
      } else {
        this.setState({
          message: "Sai tài khoản hoặc mật khẩu"
        });
      }
    } catch (error) {
      console.error(error);
      this.setState({
        message: "Lỗi kết nối API"
      });
    }
  };

  render() {
    return (
      <div className="dangnhap">
        <div className="dangnhap-container">
          <i className="fa-regular fa-building logo-hotel-login"></i>

          <div className="dangnhap-top">
            <h3>Hệ thống Quản lý Khách sạn</h3>
            <p>Đăng nhập vào hệ thống</p>
          </div>

          <form className="dangnhap-form" onSubmit={this.handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập email"
              onChange={this.handleChange}
            />

            <label>Mật khẩu</label>
            <input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              onChange={this.handleChange}
            />

            <button className="dangnhap-button" type="submit">
              Đăng nhập
            </button>
          </form>

          {/* Hiển thị thông báo */}
          <p>{this.state.message}</p>

          {/* Hiển thị quyền */}
          {this.state.role && (
            <p>Quyền tài khoản: <b>{this.state.role}</b></p>
          )}
        </div>
      </div>
    );
  }
}

export default Login;