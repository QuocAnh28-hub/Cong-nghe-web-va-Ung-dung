import React, { Component } from "react";
import "../style/TrangKhachHang_ThongTin.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";

const accountMenu = [
  {
    icon: "fa-solid fa-shield-halved",
    title: "Bảo mật",
    description: "Thay đổi mật khẩu và cài đặt bảo mật.",
  },
  {
    icon: "fa-regular fa-bell",
    title: "Thông báo",
    description: "Quản lý cách chúng tôi liên lạc với bạn.",
  },
  {
    icon: "fa-regular fa-credit-card",
    title: "Thanh toán",
    description: "Quản lý phương thức thanh toán của bạn.",
  },
];

class TrangKhachHang_ThongTin extends Component {
  state = {
    fullname: "Khách hàng",
    email: "customer@example.com",
    phone: "Chưa cập nhật",
    isEditing: false,
    formData: {
      fullname: "Khách hàng",
      email: "customer@example.com",
      phone: "Chưa cập nhật",
    },
  };

  componentDidMount() {
    const profileData = {
      fullname: localStorage.getItem("fullname") || "Khách hàng",
      email: localStorage.getItem("email") || "customer@example.com",
      phone: localStorage.getItem("phone") || "Chưa cập nhật",
    };

    this.setState({
      ...profileData,
      formData: profileData,
    });
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

  handleStartEdit = () => {
    const { fullname, email, phone } = this.state;

    this.setState({
      isEditing: true,
      formData: { fullname, email, phone },
    });
  };

  handleCancelEdit = () => {
    const { fullname, email, phone } = this.state;

    this.setState({
      isEditing: false,
      formData: { fullname, email, phone },
    });
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;

    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  handleSave = () => {
    const cleanedData = {
      fullname: this.state.formData.fullname.trim() || "Khách hàng",
      email: this.state.formData.email.trim() || "customer@example.com",
      phone: this.state.formData.phone.trim() || "Chưa cập nhật",
    };

    localStorage.setItem("fullname", cleanedData.fullname);
    localStorage.setItem("email", cleanedData.email);
    localStorage.setItem("phone", cleanedData.phone);

    this.setState({
      ...cleanedData,
      isEditing: false,
      formData: cleanedData,
    });
  };

  renderField = (name, label, icon, isFullWidth = false) => {
    const { isEditing, formData, fullname, email, phone } = this.state;
    const displayData = { fullname, email, phone };

    return (
      <div className={`profile-field${isFullWidth ? " profile-field--full" : ""}`}>
        <label htmlFor={name}>
          <i className={icon} />
          {label}
        </label>
        {isEditing ? (
          <input
            id={name}
            name={name}
            type={name === "email" ? "email" : "text"}
            className="profile-input profile-input--editing"
            value={formData[name]}
            onChange={this.handleInputChange}
          />
        ) : (
          <div className="profile-input">{displayData[name]}</div>
        )}
      </div>
    );
  };

  render() {
    const { fullname, email, isEditing } = this.state;

    return (
      <div className="profile-page">
        <TrangKhachHang_Header fullname={fullname} onLogout={this.handleLogout} />

        <main className="profile-main">
          <section className="profile-layout">
            <div className="profile-sidebar">
              <article className="profile-card">
                <div className="profile-card__avatar-wrap">
                  <div className="profile-card__avatar">
                    <i className="fa-solid fa-user-astronaut" />
                  </div>
                  <button type="button" className="profile-card__camera" aria-label="Đổi ảnh đại diện">
                    <i className="fa-solid fa-camera" />
                  </button>
                </div>

                <h1>{fullname}</h1>
                <p>{email}</p>

                <button type="button" className="profile-card__logout" onClick={this.handleLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket" />
                  Đăng xuất
                </button>
              </article>

              <div className="profile-shortcuts">
                {accountMenu.map((item) => (
                  <article className="profile-shortcut" key={item.title}>
                    <span className="profile-shortcut__icon">
                      <i className={item.icon} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <section className="profile-details">
              <div className="profile-details__header">
                <h2>Thông tin cá nhân</h2>
                {!isEditing && (
                  <button
                    type="button"
                    className="profile-details__edit"
                    onClick={this.handleStartEdit}
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="profile-form">
                {this.renderField("fullname", "Họ và tên", "fa-regular fa-user")}
                {this.renderField("email", "Email", "fa-regular fa-envelope")}
                {this.renderField("phone", "Số điện thoại", "fa-solid fa-phone", true)}
              </div>

              {isEditing && (
                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-actions__button profile-actions__button--secondary"
                    onClick={this.handleCancelEdit}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    className="profile-actions__button profile-actions__button--primary"
                    onClick={this.handleSave}
                  >
                    <i className="fa-regular fa-floppy-disk" />
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </section>
          </section>
        </main>

        <TrangKhachHang_Footer />
      </div>
    );
  }
}

export default TrangKhachHang_ThongTin;
