import React, { Component } from "react";
import "../style/Login.css";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      message: ""
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

        // lưu token
        localStorage.setItem("token", result.token);

        // lưu trạng thái login
        localStorage.setItem("isLogin", "true");

        // lưu role
        localStorage.setItem("role", result.data.role);

        alert("Đăng nhập thành công!");

        // chuyển trang
        window.location.href = "/";

      } else {
        this.setState({
          message: "Sai tài khoản hoặc mật khẩu"
        });
      }

    } catch (error) {
      this.setState({
        message: "Không kết nối được API"
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

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập email"
              onChange={this.handleChange}
              required
            />

            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              onChange={this.handleChange}
              required
            />

            <button className="dangnhap-button" type="submit">
              Đăng nhập
            </button>

          </form>

          <p style={{ color: "red" }}>{this.state.message}</p>

        </div>
      </div>
    );
  }
}

export default Login;