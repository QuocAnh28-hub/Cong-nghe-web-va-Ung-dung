import React, { Component } from "react";
import "../style/Login.css";

const LOGIN_API_URL = "http://localhost:3000/api/login";
const REGISTER_API_URL = "http://localhost:3000/api/auth/register";

const readResponseMessage = async (response, fallbackMessage) => {
  try {
    const text = await response.text();
    if (!text) return fallbackMessage;

    try {
      const data = JSON.parse(text);
      return data.message || data.error || fallbackMessage;
    } catch {
      return text;
    }
  } catch {
    return fallbackMessage;
  }
};

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
      forgotMessage: "",
      registerLoading: false,
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  openRegisterPopup = () => {
    this.setState({ isRegisterPopupOpen: true, registerMessage: "" });
  };

  closeRegisterPopup = () => {
    this.setState({
      isRegisterPopupOpen: false,
      registerMessage: "",
      registerLoading: false,
    });
  };

  openForgotPasswordPopup = () => {
    this.setState({ isForgotPasswordPopupOpen: true });
  };

  closeForgotPasswordPopup = () => {
    this.setState({ isForgotPasswordPopupOpen: false, forgotMessage: "" });
  };

  handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    this.setState({ forgotMessage: "Đã gửi mật khẩu đến email của bạn" });
  };

  handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const { hoTen, sdt, registerEmail, registerPassword, confirmPassword } = this.state;

    if (!hoTen.trim() || !sdt.trim() || !registerEmail.trim() || !registerPassword) {
      this.setState({ registerMessage: "Vui lòng điền đầy đủ thông tin đăng ký." });
      return;
    }

    if (registerPassword !== confirmPassword) {
      this.setState({ registerMessage: "Mật khẩu xác nhận không khớp." });
      return;
    }

    try {
      this.setState({ registerLoading: true, registerMessage: "" });

      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FullName: hoTen.trim(),
          Phone: sdt.trim(),
          Email: registerEmail.trim(),
          Password: registerPassword,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readResponseMessage(
          response,
          `Đăng ký thất bại (${response.status}).`,
        );
        throw new Error(errorMessage);
      }

      const result = await response.json();

      this.setState({
        registerLoading: false,
        registerMessage: result.message || "Đăng ký tài khoản thành công.",
        hoTen: "",
        sdt: "",
        registerEmail: "",
        registerPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        this.closeRegisterPopup();
      }, 800);
    } catch (error) {
      console.error(error);
      this.setState({
        registerLoading: false,
        registerMessage: error.message || "Không kết nối được API đăng ký.",
      });
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = this.state;

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          PasswordHash: password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.account) {
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("role", result.account.Role);
        localStorage.setItem("fullname", result.account.FullName);
        localStorage.setItem("phone", result.account.Phone);
        localStorage.setItem("email", result.account.Email);

        const role = result.account.Role.trim().toLowerCase();
        if (role === "customer") {
          window.location.href = "/trangkhachhang";
        } else if (role === "admin" || role === "receptionist") {
          window.location.href = "/quantri";
        } else {
          this.setState({ message: "Role không hợp lệ" });
        }
      } else {
        this.setState({
          message: result.message || "Sai tài khoản hoặc mật khẩu",
        });
      }
    } catch (error) {
      this.setState({
        message: "Không kết nối được API",
      });
    }
  };

  render() {
    return (
      <div className="dangnhap">
        <div className="dangnhap-container">
          <i className="fa-regular fa-building logo-hotel-login"></i>

          <div className="dangnhap-top">
            <h3>Khách sạn QAS</h3>
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

            <button
              type="button"
              className="quenmatkhau-button"
              onClick={this.openForgotPasswordPopup}
            >
              Quên mật khẩu?
            </button>

            <button
              type="button"
              className="dangky-button"
              onClick={this.openRegisterPopup}
            >
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
                  value={this.state.hoTen}
                  onChange={this.handleChange}
                  required
                />

                <label htmlFor="sdt">Số điện thoại</label>
                <input
                  type="tel"
                  id="sdt"
                  placeholder="Nhập số điện thoại"
                  value={this.state.sdt}
                  onChange={this.handleChange}
                  required
                />

                <label htmlFor="registerEmail">Email</label>
                <input
                  type="email"
                  id="registerEmail"
                  placeholder="Nhập email"
                  value={this.state.registerEmail}
                  onChange={this.handleChange}
                  required
                />

                <label htmlFor="registerPassword">Mật khẩu</label>
                <input
                  type="password"
                  id="registerPassword"
                  placeholder="Nhập mật khẩu"
                  value={this.state.registerPassword}
                  onChange={this.handleChange}
                  required
                />

                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={this.state.confirmPassword}
                  onChange={this.handleChange}
                  required
                />

                <button
                  type="submit"
                  className="register-submit-button"
                  disabled={this.state.registerLoading}
                >
                  {this.state.registerLoading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
                <button
                  type="button"
                  onClick={this.closeRegisterPopup}
                  className="register-close-button"
                >
                  Đóng
                </button>
              </form>
              <p
                style={{
                  color: this.state.registerMessage.includes("thành công") ? "green" : "red",
                }}
              >
                {this.state.registerMessage}
              </p>
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
                <button
                  type="button"
                  onClick={this.closeForgotPasswordPopup}
                  className="forgot-close-button"
                >
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
