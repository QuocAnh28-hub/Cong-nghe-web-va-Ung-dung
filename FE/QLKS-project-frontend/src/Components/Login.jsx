import React, { Component } from "react";
import "../style/Login.css";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      message: "",
      isRegisterPopupOpen: false,
      hoTen: "",
      sdt: "",
      registerEmail: "",
      registerPassword: "",
      confirmPassword: "",
      registerMessage: "",
      isForgotPasswordPopupOpen: false,
      forgotEmail: "",
      forgotMessage: ""
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  openRegisterPopup = () => {
    this.setState({ isRegisterPopupOpen: true });
  };

  closeRegisterPopup = () => {
    this.setState({ isRegisterPopupOpen: false, registerMessage: "" });
  };

  openForgotPasswordPopup = () => {
    this.setState({ isForgotPasswordPopupOpen: true });
  };

  closeForgotPasswordPopup = () => {
    this.setState({ isForgotPasswordPopupOpen: false, forgotMessage: "" });
  };

  handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    const { forgotEmail } = this.state;

    this.setState({ forgotMessage: "Đã gửi mật khẩu đến email của bạn" });
  };

  handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const { hoTen, sdt, registerEmail, registerPassword, confirmPassword } = this.state;

    if (registerPassword !== confirmPassword) {
      this.setState({ registerMessage: "Mật khẩu xác nhận không khớp" });
      return;
    }

    try {
      const response = await fetch("/api-khachdat/KhachDat/Register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullname: hoTen,
          phone: sdt,
          email: registerEmail,
          passwordhash: registerPassword
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi từ server: ${response.status} ${text}`);
      }

      const result = await response.json();

      if (result.success) {
        alert("Đăng ký thành công!");
        this.closeRegisterPopup();
      } else {
        this.setState({ registerMessage: result.message || "Đăng ký thất bại" });
      }
    } catch (error) {
      console.error(error);
      this.setState({ registerMessage: "Không kết nối được API" });
    }
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

            <button type="button" className="quenmatkhau-button" onClick={this.openForgotPasswordPopup}>
              Quên mật khẩu?
            </button>

            <button type="button" className="dangky-button" onClick={this.openRegisterPopup}>
              Đăng ký
            </button>

            <button className="dangnhap-button" type="submit">
              Đăng nhập
            </button>

          </form>

          <p style={{ color: "red" }}>{this.state.message}</p>

        </div>

        {this.state.isRegisterPopupOpen && (
          <div className="register-popup-overlay">
            <div className="register-popup">
              <h3>Đăng ký tài khoản</h3>
              <form onSubmit={this.handleRegisterSubmit}>
                <label htmlFor="hoTen">Họ tên</label>
                <input
                  type="text"
                  id="hoTen"
                  placeholder="Nhập họ tên"
                  onChange={this.handleChange}
                  required
                />

                <label htmlFor="sdt">Số điện thoại</label>
                <input
                  type="tel"
                  id="sdt"
                  placeholder="Nhập số điện thoại"
                  onChange={this.handleChange}
                  required
                />

                <label htmlFor="registerEmail">Email</label>
                <input
                  type="email"
                  id="registerEmail"
                  placeholder="Nhập email"
                  onChange={this.handleChange}
                  required
                />

                <label htmlFor="registerPassword">Mật khẩu</label>
                <input
                  type="password"
                  id="registerPassword"
                  placeholder="Nhập mật khẩu"
                  onChange={this.handleChange}
                  required
                />

                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  onChange={this.handleChange}
                  required
                />

                <button type="submit" className="register-submit-button">
                  Đăng ký
                </button>
                <button type="button" onClick={this.closeRegisterPopup} className="register-close-button">
                  Đóng
                </button>
              </form>
              <p style={{ color: "red" }}>{this.state.registerMessage}</p>
            </div>
          </div>
        )}

        {this.state.isForgotPasswordPopupOpen && (
          <div className="forgot-password-popup-overlay">
            <div className="forgot-password-popup">
              <h3>Quên mật khẩu</h3>
              <form onSubmit={this.handleForgotPasswordSubmit}>
                <label htmlFor="forgotEmail">Email</label>
                <input
                  type="email"
                  id="forgotEmail"
                  placeholder="Nhập email"
                  onChange={this.handleChange}
                  required
                />

                <button type="submit" className="forgot-submit-button">
                  Gửi mật khẩu
                </button>
                <button type="button" onClick={this.closeForgotPasswordPopup} className="forgot-close-button">
                  Đóng
                </button>
              </form>
              <p style={{ color: "green" }}>{this.state.forgotMessage}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Login;