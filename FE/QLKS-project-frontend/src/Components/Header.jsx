import React, { Component } from "react";
import "../style/Header.css";

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
    const { isPopupOpen, isEditing, profile, formData } = this.state;

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
