import React, { Component } from "react";
import "../style/Header.css";
import { toast } from "react-toastify";

class Header extends Component {
  state = {
    isPopupOpen: false,
    isEditing: false,
    profile: {
      fullname: "",
      email: "",
      phone: "",
    },
    formData: {
      fullname: "",
      email: "",
      phone: "",
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
          this.setState({          
            showChangePassword: false,          
            passwordForm: { oldPassword: "", newPassword: "", confirmPassword: "" },        
          });      
      })
      .catch(() => {
        toast.error("Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
      })
      .finally(() => {
        this.setState({ passwordLoading: false });
      });
  };

  popupRef = React.createRef();

  componentDidMount() {
    this.syncProfileFromStorage();
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.Name !== this.props.Name || prevProps.Role !== this.props.Role) {
      this.syncProfileFromStorage();
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  syncProfileFromStorage = () => {
    const profile = {
      fullname: localStorage.getItem("fullname") || this.props.Name || "Người dùng",
      email: localStorage.getItem("email") || "Chưa cập nhật",
      phone: localStorage.getItem("phone") || "Chưa cập nhật",
    };

    this.setState((prevState) => ({
      profile,
      formData: prevState.isEditing ? prevState.formData : profile,
    }));
  };

  handleClickOutside = (event) => {
    if (this.popupRef.current && !this.popupRef.current.contains(event.target)) {
      this.setState({
        isPopupOpen: false,
        isEditing: false,
        formData: this.state.profile,
      });
    }
  };

  togglePopup = () => {
    this.setState((prevState) => ({
      isPopupOpen: !prevState.isPopupOpen,
      isEditing: prevState.isPopupOpen ? false : prevState.isEditing,
      formData: prevState.isPopupOpen ? prevState.profile : prevState.formData,
    }));
  };

  startEdit = () => {
    this.setState((prevState) => ({
      isEditing: true,
      formData: prevState.profile,
    }));
  };

  cancelEdit = () => {
    this.setState((prevState) => ({
      isEditing: false,
      formData: prevState.profile,
    }));
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

  saveProfile = () => {
    const profile = {
      fullname: this.state.formData.fullname.trim() || "Người dùng",
      email: this.state.formData.email.trim() || "Chưa cập nhật",
      phone: this.state.formData.phone.trim() || "Chưa cập nhật",
    };

    localStorage.setItem("fullname", profile.fullname);
    localStorage.setItem("email", profile.email);
    localStorage.setItem("phone", profile.phone);

    this.setState({
      profile,
      formData: profile,
      isEditing: false,
    });
  };

  logout = () => {
    const xacNhan = window.confirm("Bạn có chắc muốn đăng xuất không?");

    if (xacNhan) {
      localStorage.removeItem("token");
      localStorage.removeItem("isLogin");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      localStorage.removeItem("fullname");
      localStorage.removeItem("phone");

      window.location.href = "/login";
    }
  };

  render() {
    const { Name, Role } = this.props;
    const { isPopupOpen, isEditing, profile, formData, showChangePassword, passwordForm, passwordLoading } = this.state;

    return (
      <div className="header">
        <button className="btn-navigation">
          <i className="fa-solid fa-list"></i>
        </button>

        <i className="fa-solid fa-hotel logo-hotel"></i>

        <h2>HOTEL MANAGERMENT</h2>

        <div className="header-profile" ref={this.popupRef}>
          <button type="button" className="header-right-text" onClick={this.togglePopup}>
            <h5>{Name}</h5>
            <p>{Role}</p>
          </button>

          {isPopupOpen && (
            <div className="header-profile-popup">
              <div className="header-profile-popup__header">
                <h4>Thông tin người dùng</h4>
                {!isEditing && (
                  <button
                    type="button"
                    className="header-profile-popup__edit"
                    onClick={this.startEdit}
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="header-profile-popup__body">
                <div className="header-profile-popup__field">
                  <span>Tên</span>
                  {isEditing ? (
                    <input name="fullname" value={formData.fullname} onChange={this.handleInputChange} />
                  ) : (
                    <strong>{profile.fullname}</strong>
                  )}
                </div>

                <div className="header-profile-popup__field">
                  <span>SDT</span>
                  {isEditing ? (
                    <input name="phone" value={formData.phone} onChange={this.handleInputChange} />
                  ) : (
                    <strong>{profile.phone}</strong>
                  )}
                </div>

                <div className="header-profile-popup__field">
                  <span>Email</span>
                  {isEditing ? (
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={this.handleInputChange}
                    />
                  ) : (
                    <strong>{profile.email}</strong>
                  )}
                </div>
              </div>

              {/* Đổi mật khẩu tích hợp vào popup chỉnh sửa */}
              {isEditing && (
                <div className="header-profile-popup__changepw" style={{ marginTop: 18 }}>
                  <h5 style={{ color: "#2563eb", margin: 0, marginBottom: 10 }}>Đổi mật khẩu</h5>
                  <div style={{ display: "grid", gap: 12 }}>
                    <input
                      type="password"
                      name="oldPassword"
                      placeholder="Mật khẩu cũ"
                      value={passwordForm.oldPassword}
                      onChange={this.handlePasswordInputChange}
                      className="header-profile-popup__changepw-input"
                    />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Mật khẩu mới"
                      value={passwordForm.newPassword}
                      onChange={this.handlePasswordInputChange}
                      className="header-profile-popup__changepw-input"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu mới"
                      value={passwordForm.confirmPassword}
                      onChange={this.handlePasswordInputChange}
                      className="header-profile-popup__changepw-input"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={this.handleChangePassword}
                      className="header-profile-popup__changepw-btn"
                      style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: 6, padding: "7px 16px", fontWeight: 600, cursor: "pointer" }}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Đang lưu..." : "Đổi mật khẩu"}
                    </button>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="header-profile-popup__actions">
                  <button
                    type="button"
                    className="header-profile-popup__cancel"
                    onClick={this.cancelEdit}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="header-profile-popup__save"
                    onClick={this.saveProfile}
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="btn-logout" onClick={this.logout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    );
  }
}

export default Header;
