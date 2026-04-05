import React, { Component } from "react";
import "../style/TrangKhachHang.css";
import heroImage from "../img/pexels-apasaric-618079.jpg";
import amenityImage from "../img/park-hyatt-saigon.webp";

const whyChooseItems = [
  {
    icon: "fa-solid fa-location-dot",
    title: "Vị trí đắc địa",
    description:
      "Nằm ngay trung tâm thành phố, thuận tiện di chuyển đến các điểm tham quan.",
  },
  {
    icon: "fa-regular fa-clock",
    title: "Dịch vụ 24/7",
    description:
      "Đội ngũ nhân viên tận tâm sẵn sàng hỗ trợ bạn bất cứ lúc nào.",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "An toàn tuyệt đối",
    description:
      "Hệ thống an ninh hiện đại và quy trình vệ sinh nghiêm ngặt.",
  },
  {
    icon: "fa-regular fa-star",
    title: "Tiện nghi đẳng cấp",
    description:
      "Trang thiết bị hiện đại, sang trọng mang lại sự thoải mái nhất.",
  },
];

const amenities = [
  { icon: "fa-solid fa-water", label: "Hồ bơi vô cực" },
  { icon: "fa-solid fa-mug-hot", label: "Bữa sáng buffet" },
  { icon: "fa-solid fa-wifi", label: "Wi-Fi tốc độ cao" },
  { icon: "fa-solid fa-dumbbell", label: "Phòng gym hiện đại" },
];

class TrangKhachHang extends Component {
  state = {
    fullname: "",
  };

  componentDidMount() {
    const fullname = localStorage.getItem("fullname");
    this.setState({
      fullname: fullname || "Nguyễn Văn An",
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
      window.location.href = "/login";
    }
  };

  scrollToAmenities = () => {
    const section = document.getElementById("tien-ich");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  render() {
    const { fullname } = this.state;

    return (
      <div className="customer-page">
        <header className="customer-header">
          <div className="customer-topbar">
            <span>QAS Hotel Booking</span>
          </div>
          <div className="customer-header__inner">
            <a href="/trangkhachhang" className="customer-brand">
              <span className="customer-brand__icon">
                <i className="fa-regular fa-building" />
              </span>
              <span className="customer-brand__text">QAS-Hotel</span>
            </a>

            <nav className="customer-nav">
              <a href="#hero" className="customer-nav__link active">
                <i className="fa-solid fa-house" />
                <span>Trang chủ</span>
              </a>
              <a href="#ly-do" className="customer-nav__link">
                <i className="fa-solid fa-bed" />
                <span>Phòng nghỉ</span>
              </a>
              <a href="#tien-ich" className="customer-nav__link">
                <i className="fa-regular fa-calendar" />
                <span>Đặt phòng</span>
              </a>
            </nav>

            <div className="customer-user">
              <div className="customer-user__chip">
                <span className="customer-user__avatar"><i class="fa-solid fa-user-tie"></i></span>
                <span className="customer-user__name">{fullname}</span>
              </div>
              <button
                type="button"
                className="customer-user__logout"
                onClick={this.handleLogout}
                aria-label="Đăng xuất"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" />
              </button>
            </div>
          </div>
        </header>

        <main className="customer-main">
          <section className="customer-hero" id="hero">
            <div className="customer-hero__media">
              <img src={heroImage} alt="Khách sạn LuxeStay" />
              <div className="customer-hero__overlay" />
            </div>

            <div className="customer-hero__content">
              <p className="customer-hero__eyebrow">LUXURY HOTEL EXPERIENCE</p>
              <h1>
                Chào mừng bạn đến với
                <span> QAS-Hotel </span>
              </h1>
              <p className="customer-hero__description">
                Nơi sự sang trọng gặp gỡ sự thoải mái. Trải nghiệm kỳ nghỉ tuyệt
                vời nhất với dịch vụ đẳng cấp 5 sao và không gian tinh tế.
              </p>
              <button
                type="button"
                className="customer-hero__button"
                onClick={this.scrollToAmenities}
              >
                Khám phá phòng nghỉ
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </section>

          <section className="why-choose" id="ly-do">
            <div className="section-heading section-heading--center">
              <h2>Tại sao chọn QAS-Hotel?</h2>
              <p>
                Chúng tôi cam kết mang đến cho bạn những trải nghiệm đáng nhớ
                nhất trong suốt kỳ nghỉ của mình.
              </p>
            </div>

            <div className="why-choose__grid">
              {whyChooseItems.map((item) => (
                <article className="why-card" key={item.title}>
                  <div className="why-card__icon">
                    <i className={item.icon} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="amenities" id="tien-ich">
            <div className="amenities__content">
              <div className="section-heading">
                <h2>Tiện ích đẳng cấp dành cho bạn</h2>
                <p>
                  Tận hưởng những dịch vụ cao cấp nhất ngay tại khách sạn của
                  chúng tôi. Từ hồ bơi vô cực đến không gian thư giãn hiện đại,
                  mọi thứ đều được chuẩn bị chu đáo.
                </p>
              </div>

              <div className="amenities__list">
                {amenities.map((item) => (
                  <div className="amenity-item" key={item.label}>
                    <span className="amenity-item__icon">
                      <i className={item.icon} />
                    </span>
                    <span className="amenity-item__label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="amenities__image">
              <img src={amenityImage} alt="Tiện ích cao cấp tại LuxeStay" />
            </div>
          </section>
        </main>

        <footer className="customer-footer">
          <h3>QAS-Hotel</h3>
          <p>© 2026 QAS-Hotel. Tất cả quyền được bảo lưu.</p>
          <div className="customer-footer__links">
            <a href="#hero">Chính sách bảo mật</a>
            <a href="#ly-do">Điều khoản dịch vụ</a>
            <a href="#tien-ich">Liên hệ</a>
          </div>
        </footer>
      </div>
    );
  }
}

export default TrangKhachHang;
