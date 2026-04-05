import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../style/TrangKhachHang.css";
import heroImage from "../img/SlideShow.jpg";
import amenityImage from "../img/Introduce_tt.jpg";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";

const whyChooseItems = [
  {
    icon: "fa-solid fa-location-dot",
    title: "Vị trí đắc địa",
    description:
      "Nằm ngay trung tâm thành phố, thuận tiện di chuyển đến các điểm tham quan và khu mua sắm.",
  },
  {
    icon: "fa-regular fa-clock",
    title: "Dịch vụ 24/7",
    description:
      "Đội ngũ nhân viên luôn sẵn sàng hỗ trợ bạn mọi lúc để chuyến đi diễn ra thật trọn vẹn.",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "An toàn tuyệt đối",
    description:
      "Hệ thống an ninh hiện đại cùng quy trình vệ sinh nghiêm ngặt giúp bạn luôn an tâm nghỉ dưỡng.",
  },
  {
    icon: "fa-regular fa-star",
    title: "Tiện nghi đẳng cấp",
    description:
      "Không gian sang trọng, nội thất hiện đại và nhiều dịch vụ cao cấp được chuẩn bị chu đáo.",
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
      fullname: fullname,
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

  render() {
    const { fullname } = this.state;

    return (
      <div className="customer-page">
        
        <TrangKhachHang_Header fullname={fullname} onLogout={this.handleLogout} />

        <main className="customer-main">
          <section className="customer-hero" id="hero">
            <div className="customer-hero__media">
              <img src={heroImage} alt="Khách sạn QAS-Hotel" />
              <div className="customer-hero__overlay" />
            </div>

            <div className="customer-hero__content">
              <p className="customer-hero__eyebrow">LUXURY HOTEL EXPERIENCE</p>
              <h1>
                {"Chào mừng bạn đến với"}
                <span> QAS-Hotel </span>
              </h1>
              <p className="customer-hero__description">
                {
                  "Nơi sự sang trọng gặp gỡ sự thoải mái. Trải nghiệm kỳ nghỉ tuyệt vời với dịch vụ đẳng cấp 5 sao và không gian nghỉ dưỡng tinh tế."
                }
              </p>
              <Link to="/trangkhachhang/phongnghi" className="customer-hero__button">
                {"Khám phá phòng nghỉ"}
                <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
          </section>

          <section className="why-choose" id="ly-do">
            <div className="section-heading section-heading--center">
              <h2>{"Tại sao chọn QAS-Hotel?"}</h2>
              <p>
                {
                  "Chúng tôi cam kết mang đến cho bạn những trải nghiệm đáng nhớ nhất trong suốt kỳ nghỉ của mình."
                }
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
                <h2>{"Tiện ích đẳng cấp dành cho bạn"}</h2>
                <p>
                  {
                    "Tận hưởng những dịch vụ cao cấp ngay tại khách sạn của chúng tôi. Từ hồ bơi vô cực đến không gian thư giãn hiện đại, mọi thứ đều được chuẩn bị chu đáo cho kỳ nghỉ hoàn hảo."
                  }
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
              <img src={amenityImage} alt="Tiện ích cao cấp tại khách sạn" />
            </div>
          </section>
        </main>

        <TrangKhachHang_Footer />
        
      </div>
    );
  }
}

export default TrangKhachHang;

