import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../style/TrangKhachHang_GioiThieuPhongNghi.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";

const roomImages = [1, 2, 3, 4, 6, 7, 8].map(
  (number) => new URL(`../img/AnhPhong_${number}.jpg`, import.meta.url).href
);

const formatPrice = (value) => {
  if (value == null) return "";
  return Number(value).toLocaleString("vi-VN") + " đ";
};

class TrangKhachHang_PhongNghi extends Component {
  state = {
    fullname: "",
    roomTypes: [],
    loading: true,
    error: null,
  };

  componentDidMount() {
    const fullname = localStorage.getItem("fullname");
    this.setState({ fullname });
    this.loadRoomTypes();
  }

  loadRoomTypes = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/pages-for-customer");
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu loại phòng");
      }
      const roomTypes = await response.json();
      this.setState({ roomTypes, loading: false });
    } catch (error) {
      this.setState({ error: error.message || "Lỗi tải dữ liệu", loading: false });
    }
  };

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
    const { fullname, roomTypes, loading, error } = this.state;

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
            {loading && <p>Đang tải danh sách phòng...</p>}
            {error && <p className="room-error">{error}</p>}

            {!loading && !error && roomTypes.length === 0 && (
              <p>Không có loại phòng nào để hiển thị.</p>
            )}

            {roomTypes.map((room, index) => {
              const image = roomImages[index % roomImages.length];
              const defaultPrice = formatPrice(room.GiaMacDinh);
              const salePrice = room.GiaTheoMua != null ? formatPrice(room.GiaTheoMua) : null;

              return (
                <article className="room-card" key={room.RoomTypeID || room.TenLoaiPhong || index}>
                  <div className="room-card__media">
                    <img src={image} alt={room.TenLoaiPhong} className="room-card__image" />
                    <div className="room-card__price">
                      {salePrice ? (
                        <>
                          <span className="room-card__price--sale">{salePrice}</span>
                          <span
                            className="room-card__price--original"
                            style={{ textDecoration: "line-through", marginLeft: "0.75rem", color: "#999" }}
                          >
                            {defaultPrice}
                          </span>
                        </>
                      ) : (
                        <span>{defaultPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="room-card__content">
                    <div className="room-card__title-row">
                      <h2>{room.TenLoaiPhong}</h2>
                      <span className="room-card__capacity">
                        <i className="fa-solid fa-user-group" />
                        {room.SucChua} khách
                      </span>
                    </div>

                    <p className="room-card__description">{room.MoTa}</p>

                    {room.MuaApDung && (
                      <p className="room-card__promotion">Mùa: {room.MuaApDung}</p>
                    )}

                    <Link to="/trangkhachhang/datphong" className="room-card__button">
                      Đặt phòng ngay
                      <i className="fa-solid fa-arrow-right" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        </main>

        <TrangKhachHang_Footer />
      </div>
    );
  }
}

export default TrangKhachHang_PhongNghi;
