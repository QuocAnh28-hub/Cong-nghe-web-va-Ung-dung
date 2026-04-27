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
    showModal: false,
    selectedRoom: null,
    bookingForm: {
      ngayNhan: "",
      ngayTra: "",
      soPhong: 1,
    },
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
      localStorage.removeItem("userID");
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

  openBookingModal = (room) => {
    this.setState({
      showModal: true,
      selectedRoom: room,
      bookingForm: {
        ngayNhan: "",
        ngayTra: "",
        soPhong: 1,
      },
    });
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      selectedRoom: null,
    });
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      bookingForm: {
        ...prevState.bookingForm,
        [name]: name === "soPhong" ? parseInt(value) || 1 : value,
      },
    }));
  };

  handleSubmitBooking = async (e) => {
    e.preventDefault();
    const { selectedRoom, bookingForm } = this.state;

    // Validate dates
    if (!bookingForm.ngayNhan || !bookingForm.ngayTra) {
      alert("Vui lòng chọn ngày nhận và ngày trả phòng!");
      return;
    }

    const ngayNhan = new Date(bookingForm.ngayNhan);
    const ngayTra = new Date(bookingForm.ngayTra);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (ngayNhan < today) {
      alert("Ngày nhận phòng không được trước ngày hiện tại!");
      return;
    }

    if (ngayTra <= ngayNhan) {
      alert("Ngày trả phòng phải sau ngày nhận phòng!");
      return;
    }

    const userID = localStorage.getItem("userID");
    if (!userID) {
      alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    const payload = {
      UserID: parseInt(userID),
      RoomTypeID: selectedRoom.RoomTypeID,
      Quantity: bookingForm.soPhong,
      CheckInDate: bookingForm.ngayNhan,
      CheckOutDate: bookingForm.ngayTra,
    };

    try {
      const response = await fetch("http://localhost:3000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Đặt phòng thất bại. Vui lòng thử lại sau.");
      }

      const result = await response.json();
      alert(`Đặt phòng thành công! Mã đặt phòng: ${result.ReservationID}, Tổng tiền: ${result.TotalPrice.toLocaleString("vi-VN")} đ`);
      this.closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  render() {
    const { fullname, roomTypes, loading, error, showModal, selectedRoom, bookingForm } = this.state;

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

                    <button 
                      className="room-card__button"
                      onClick={() => this.openBookingModal(room)}
                    >
                      Đặt phòng ngay
                      <i className="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </main>

        <TrangKhachHang_Footer />

        {/* Booking Modal */}
        {showModal && selectedRoom && (
          <div className="modal-overlay" onClick={this.closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Đặt phòng {selectedRoom.TenLoaiPhong}</h2>
                <button className="modal-close" onClick={this.closeModal}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <form onSubmit={this.handleSubmitBooking} className="booking-form">
                <div className="form-group">
                  <label htmlFor="ngayNhan">Ngày nhận phòng</label>
                  <input
                    type="date"
                    id="ngayNhan"
                    name="ngayNhan"
                    value={bookingForm.ngayNhan}
                    onChange={this.handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ngayTra">Ngày trả phòng</label>
                  <input
                    type="date"
                    id="ngayTra"
                    name="ngayTra"
                    value={bookingForm.ngayTra}
                    onChange={this.handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="soPhong">Số phòng cần đặt</label>
                  <input
                    type="number"
                    id="soPhong"
                    name="soPhong"
                    value={bookingForm.soPhong}
                    onChange={this.handleInputChange}
                    min="1"
                    max="10"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={this.closeModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-confirm">
                    Đặt phòng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TrangKhachHang_PhongNghi;
