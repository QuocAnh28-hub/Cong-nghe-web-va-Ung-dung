import React, { Component } from "react";
import "../style/TrangKhachHang_ThongTin.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";
import { toast } from "react-toastify";

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
    showChangePassword: false,
    passwordForm: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    passwordLoading: false,
  };
  handleOpenChangePassword = () => {
    this.setState({
      showChangePassword: true,
      passwordForm: { oldPassword: "", newPassword: "", confirmPassword: "" },
    });
  };

  handleCloseChangePassword = () => {
    this.setState({ showChangePassword: false });
  };

  handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      passwordForm: {
        ...prevState.passwordForm,
        [name]: value,
      },
    }));
  };

  handleChangePassword = () => {
    const { oldPassword, newPassword, confirmPassword } = this.state.passwordForm;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    const userId = localStorage.getItem("userID") || localStorage.getItem("id");
    if (!userId) {
      toast.error("Không tìm thấy UserID. Vui lòng đăng nhập lại.");
      return;
    }
    this.setState({ passwordLoading: true });
    fetch(`http://localhost:3000/api/pages-for-customer/user/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Đổi mật khẩu thất bại");
        return res.json();
      })
      .then(() => {
        toast.success("Đổi mật khẩu thành công!");
        this.setState({ showChangePassword: false });
      })
      .catch((err) => {
        toast.error("Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
      })
      .finally(() => {
        this.setState({ passwordLoading: false });
      });
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

    // Lấy UserID từ localStorage
    const userId = localStorage.getItem("userID") || localStorage.getItem("id");

    if (!userId) {
      toast.error("Không tìm thấy UserID. Vui lòng đăng nhập lại.");
      return;
    }

    // Gọi API để cập nhật thông tin
    const apiUrl = `http://localhost:3000/api/pages-for-customer/user/${userId}`;
    const payload = {
      FullName: cleanedData.fullname,
      Email: cleanedData.email,
      Phone: cleanedData.phone,
    };

    fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Cập nhật thành công:", data);
        // Cập nhật localStorage
        localStorage.setItem("fullname", cleanedData.fullname);
        localStorage.setItem("email", cleanedData.email);
        localStorage.setItem("phone", cleanedData.phone);

        this.setState({
          ...cleanedData,
          isEditing: false,
          formData: cleanedData,
        });

        toast.success("Cập nhật thông tin thành công!");
      })
      .catch((error) => {
        console.error("Lỗi:", error);
        toast.error("Có lỗi khi cập nhật thông tin. Vui lòng thử lại.");
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
    const { fullname, email, isEditing, showChangePassword, passwordForm, passwordLoading } = this.state;

    return (
      <div className="profile-page">
        <TrangKhachHang_Header fullname={fullname} onLogout={this.handleLogout} />

        <main className="profile-main">
          <section className="profile-layout">
            <div className="profile-sidebar">
              <article className="profile-card">
                <div className="profile-card__avatar-wrap">
                  <div className="profile-card__avatar">
                    <i className="fa-solid fa-user-tie"></i>
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
                  <article
                    className="profile-shortcut"
                    key={item.title}
                    onClick={item.title === "Bảo mật" ? this.handleOpenChangePassword : undefined}
                    style={item.title === "Bảo mật" ? { cursor: "pointer" } : {}}
                  >
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

        {/* Popup đổi mật khẩu */}
        {showChangePassword && (
          <div className="change-password-modal-overlay">
            <div className="change-password-modal">
              <h2 className="change-password-title">Đổi mật khẩu</h2>
              <div className="change-password-form">
                <div>
                  <label>Mật khẩu cũ</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={this.handlePasswordInputChange}
                    className="change-password-input"
                    autoFocus
                  />
                </div>
                <div>
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={this.handlePasswordInputChange}
                    className="change-password-input"
                  />
                </div>
                <div>
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={this.handlePasswordInputChange}
                    className="change-password-input"
                  />
                </div>
              </div>
              <div className="change-password-actions">
                <button
                  onClick={this.handleCloseChangePassword}
                  className="change-password-btn change-password-btn--cancel"
                  disabled={passwordLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={this.handleChangePassword}
                  className="change-password-btn change-password-btn--save"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}

        <TrangKhachHang_Footer />
      </div>
    );
  }
}

export default TrangKhachHang_ThongTin;
