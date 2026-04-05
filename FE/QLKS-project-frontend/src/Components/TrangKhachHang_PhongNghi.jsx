import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../style/TrangKhachHang_GioiThieuPhongNghi.css";
import roomImage1 from "../img/AnhPhong_1.jpg";
import roomImage2 from "../img/AnhPhong_2.jpg";
import roomImage3 from "../img/AnhPhong_3.jpg";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";

const roomTypes = [
  {
    name: "Standard Room",
    price: "$120 / Đêm",
    capacity: "2 khách",
    description:
      "A comfortable and cozy room for a relaxing stay. Features a queen-size bed and modern amenities.",
    image: roomImage1,
    imageClass: "room-card__image room-card__image--standard",
    features: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Mini Bar"],
  },
  {
    name: "Deluxe Ocean View",
    price: "$250 / Đêm",
    capacity: "2 khách",
    description:
      "Experience luxury with a breathtaking view. Includes a king-size bed and a private balcony.",
    image: roomImage2,
    imageClass: "room-card__image room-card__image--deluxe",
    features: ["Ocean View", "Private Balcony", "King Bed", "Room Service"],
  },
  {
    name: "Executive Suite",
    price: "$500 / Đêm",
    capacity: "4 khách",
    description:
      "The ultimate luxury experience. Spacious living area, premium amenities, and exclusive access to the VIP lounge.",
    image: roomImage3,
    imageClass: "room-card__image room-card__image--suite",
    features: ["VIP Lounge Access", "Jacuzzi", "Separate Living Area", "Personal Butler"],
  },
];

class TrangKhachHang_PhongNghi extends Component {
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
      <div className="room-page">
        
        <TrangKhachHang_Header fullname={fullname} onLogout={this.handleLogout} />

        <main className="room-main">
          <section className="room-hero">
            <div className="room-section-heading">
              <h1>Các loại phòng nghỉ</h1>
              <p>
                Chọn không gian phù hợp nhất cho kỳ nghỉ của bạn. Mỗi phòng đều được
                thiết kế tinh tế và đầy đủ tiện nghi.
              </p>
            </div>
          </section>

          <section className="room-list" id="dat-phong">
            {roomTypes.map((room) => (
              <article className="room-card" key={room.name}>
                <div className="room-card__media">
                  <img src={room.image} alt={room.name} className={room.imageClass} />
                  <span className="room-card__price">{room.price}</span>
                </div>

                <div className="room-card__content">
                  <div className="room-card__title-row">
                    <h2>{room.name}</h2>
                    <span className="room-card__capacity">
                      <i className="fa-solid fa-user-group" />
                      {room.capacity}
                    </span>
                  </div>

                  <p className="room-card__description">{room.description}</p>

                  <div className="room-card__features">
                    {room.features.map((feature) => (
                      <span className="room-feature" key={feature}>
                        <i className="fa-solid fa-check" />
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Link to="/trangkhachhang/datphong" className="room-card__button">
                    Đặt phòng ngay
                    <i className="fa-solid fa-arrow-right" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </main>

        <TrangKhachHang_Footer />
        
      </div>
    );
  }
}

export default TrangKhachHang_PhongNghi;
