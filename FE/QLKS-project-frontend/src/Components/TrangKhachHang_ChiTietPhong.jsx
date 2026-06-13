import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../style/TrangKhachHang_ChiTietPhong.css";
import fallbackRoomImage from "../img/SlideShow.jpg";
import {
  TrangKhachHang_Header,
  TrangKhachHang_Footer,
} from "./TrangKhachHang_Common";

const LOCAL_IMAGE_BASE_URL = "http://localhost:3000/local-images/";
const ROOM_TYPES_API_URL = "http://localhost:3000/api/pages-for-customer";
const AVAILABLE_ROOM_TYPES_API_URL =
  "http://localhost:3000/api/pages-for-customer/available-room-types";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextDay = new Date(today);
nextDay.setDate(today.getDate() + 2);

const formatInputDate = (date) => date.toISOString().slice(0, 10);

const formatPrice = (value) => {
  if (value == null || value === "") return "300.000 đ";
  return `${Number(value).toLocaleString("vi-VN")} đ`;
};

const sampleRoom = {
  RoomTypeID: 1,
  TenLoaiPhong: "Single Room",
  SucChua: 1,
  MoTa:
    "Không gian được thiết kế tối giản, hiện đại và ấm cúng, phù hợp cho khách đi công tác hoặc du lịch cá nhân. Phòng có cửa sổ lớn đón ánh sáng tự nhiên, giường êm ái, bàn làm việc tiện lợi cùng đầy đủ tiện nghi giúp bạn nghỉ ngơi thoải mái và thư giãn.",
  GiaMacDinh: 300000,
  AvailableRooms: null,
  DienTich: 25,
  ImageUrl: `${LOCAL_IMAGE_BASE_URL}AnhPhong_1.jpg`,
};

const roomAmenities = [
  { icon: "fa-solid fa-wifi", label: "Wifi miễn phí" },
  { icon: "fa-solid fa-wind", label: "Điều hòa" },
  { icon: "fa-solid fa-tv", label: "Smart TV" },
  { icon: "fa-solid fa-flask", label: "Mini Bar" },
  { icon: "fa-solid fa-fire-flame-simple", label: "Nước nóng" },
  { icon: "fa-solid fa-vault", label: "Két an toàn" },
  { icon: "fa-solid fa-mug-saucer", label: "Ăn sáng" },
];

const policies = [
  "Nhận phòng: từ 14:00",
  "Trả phòng: trước 12:00",
  "Hủy miễn phí trước 24h",
  "Không hút thuốc trong phòng",
  "Vật nuôi không được phép",
];

class TrangKhachHang_ChiTietPhong extends Component {
  state = {
    fullname: "",
    room: sampleRoom,
    loading: false,
    bookingForm: {
      checkInDate: formatInputDate(tomorrow),
      checkOutDate: formatInputDate(nextDay),
      quantity: 1,
    },
  };

  componentDidMount() {
    const fullname = localStorage.getItem("fullname");
    this.setState({ fullname });
    this.loadRoomFromApi();
  }

  getRoomTypeIdFromPath = () => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const maybeId = parts[parts.length - 1];
    return Number.isFinite(Number(maybeId)) ? Number(maybeId) : null;
  };

  normalizeRoomType = (room) => ({
    ...room,
    RoomTypeID: room.RoomTypeID ?? room.roomTypeId ?? room.id,
    TenLoaiPhong: room.TenLoaiPhong ?? room.Name ?? room.name ?? sampleRoom.TenLoaiPhong,
    SucChua: room.SucChua ?? room.Capacity ?? room.capacity ?? sampleRoom.SucChua,
    MoTa: room.MoTa ?? room.Description ?? room.description ?? sampleRoom.MoTa,
    ImageUrl: room.ImageUrl ?? room.ImageUri ?? room.imageUrl ?? sampleRoom.ImageUrl,
    GiaMacDinh: room.GiaMacDinh ?? room.DefaultPrice ?? room.defaultPrice,
    GiaTheoMua: room.GiaTheoMua ?? room.SeasonalPrice ?? room.seasonalPrice,
    AvailableRooms: room.AvailableRooms ?? room.availableRooms ?? room.SoPhongTrong ?? null,
    DienTich: room.DienTich ?? room.Area ?? room.area ?? sampleRoom.DienTich,
  });

  loadRoomFromApi = async () => {
    const roomTypeId = this.getRoomTypeIdFromPath();
    if (!roomTypeId) return;

    try {
      this.setState({ loading: true });
      const response = await fetch(ROOM_TYPES_API_URL);
      if (!response.ok) throw new Error("Không thể tải chi tiết phòng");

      const payload = await response.json();
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const foundRoom = items
        .map(this.normalizeRoomType)
        .find((room) => Number(room.RoomTypeID) === roomTypeId);

      if (foundRoom) {
        this.setState({ room: foundRoom, loading: false }, () => {
          this.loadRoomAvailability();
        });
      } else {
        this.setState({ loading: false }, () => {
          this.loadRoomAvailability();
        });
      }
    } catch (error) {
      this.setState({ loading: false });
      toast.error(error.message || "Không thể tải chi tiết phòng");
    }
  };

  loadRoomAvailability = async () => {
    const roomTypeId = this.getRoomTypeIdFromPath() || this.state.room.RoomTypeID;
    const { checkInDate, checkOutDate } = this.state.bookingForm;

    if (!roomTypeId || !checkInDate || !checkOutDate) return;
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      this.setState((prevState) => ({
        room: {
          ...prevState.room,
          AvailableRooms: null,
        },
      }));
      return;
    }

    try {
      this.setState({ loading: true });

      const params = new URLSearchParams();
      params.set("CheckInDate", checkInDate);
      params.set("CheckOutDate", checkOutDate);

      const response = await fetch(`${AVAILABLE_ROOM_TYPES_API_URL}?${params.toString()}`);
      if (!response.ok) throw new Error("Không thể kiểm tra phòng trống");

      const payload = await response.json();
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const availableRoom = items
        .map(this.normalizeRoomType)
        .find((room) => Number(room.RoomTypeID) === Number(roomTypeId));

      this.setState((prevState) => {
        const nextAvailableRooms = availableRoom?.AvailableRooms ?? 0;
        const parsedAvailableRooms = Number(nextAvailableRooms);
        const quantityLimit =
          Number.isFinite(parsedAvailableRooms) && parsedAvailableRooms > 0
            ? parsedAvailableRooms
            : 1;

        return {
          loading: false,
          room: {
            ...prevState.room,
            ...(availableRoom || {}),
            AvailableRooms: nextAvailableRooms,
          },
          bookingForm: {
            ...prevState.bookingForm,
            quantity: Math.min(prevState.bookingForm.quantity, quantityLimit),
          },
        };
      });
    } catch (error) {
      this.setState({ loading: false });
      toast.error(error.message || "Không thể kiểm tra phòng trống");
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

  handleBookingChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      bookingForm: {
        ...prevState.bookingForm,
        [name]: name === "quantity" ? Number(value) : value,
      },
    }), () => {
      if (name === "checkInDate" || name === "checkOutDate") {
        this.loadRoomAvailability();
      }
    });
  };

  handleBookingSubmit = async (e) => {
    e.preventDefault();
    const { room, bookingForm } = this.state;
    const userID = localStorage.getItem("userID");

    if (!userID) {
      toast.error("Vui lòng đăng nhập để đặt phòng.");
      return;
    }

    if (new Date(bookingForm.checkOutDate) <= new Date(bookingForm.checkInDate)) {
      toast.error("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    const availableRooms = Number(room.AvailableRooms);
    if (!Number.isFinite(availableRooms)) {
      toast.error("Vui lòng chọn ngày nhận và ngày trả phòng để kiểm tra phòng trống.");
      return;
    }

    if (availableRooms < 1) {
      toast.error("Loại phòng này đã hết phòng trong khoảng ngày đã chọn.");
      return;
    }

    if (bookingForm.quantity < 1) {
      toast.error("Số lượng phòng phải lớn hơn 0.");
      return;
    }

    if (
      bookingForm.quantity > availableRooms
    ) {
      toast.error(`Chỉ còn ${availableRooms} phòng trống cho loại phòng này.`);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserID: Number(userID),
          RoomTypeID: room.RoomTypeID,
          Quantity: bookingForm.quantity,
          CheckInDate: bookingForm.checkInDate,
          CheckOutDate: bookingForm.checkOutDate,
        }),
      });

      if (!response.ok) throw new Error("Đặt phòng thất bại. Vui lòng thử lại sau.");
      toast.success("Đặt phòng thành công!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  render() {
    const { fullname, room, loading, bookingForm } = this.state;
    const availableRooms = Number(room.AvailableRooms);
    const hasAvailabilityInfo = Number.isFinite(availableRooms);
    const hasAvailableRooms = hasAvailabilityInfo && availableRooms > 0;
    const roomImage = room.ImageUrl || sampleRoom.ImageUrl;

    return (
      <div className="room-detail-page">
        <TrangKhachHang_Header fullname={fullname} onLogout={this.handleLogout} />

        <main className="room-detail-main">
          <div className="room-detail-layout">
            <section className="room-detail-content">
              <div className="room-detail-gallery">
                <img
                  src={roomImage}
                  alt={room.TenLoaiPhong}
                  onError={(e) => {
                    e.currentTarget.src = fallbackRoomImage;
                  }}
                />

                <Link
                  to="/trangkhachhang/phongnghi"
                  className="room-detail-round-btn room-detail-back"
                  aria-label="Quay lại danh sách phòng"
                >
                  <i className="fa-solid fa-arrow-left" />
                </Link>

                <div className="room-detail-actions">
                  <button type="button" className="room-detail-round-btn" aria-label="Yêu thích">
                    <i className="fa-regular fa-heart" />
                  </button>
                  <button type="button" className="room-detail-round-btn" aria-label="Chia sẻ">
                    <i className="fa-solid fa-share-nodes" />
                  </button>
                </div>
              </div>

              <div className="room-detail-title-row">
                <div>
                  <h1>{room.TenLoaiPhong}</h1>
                  <div className="room-detail-meta">
                    <span>
                      <i className="fa-solid fa-user-group" />
                      {room.SucChua} khách
                    </span>
                  </div>
                </div>

                <span
                  className={`room-detail-stock ${
                    hasAvailableRooms ? "room-detail-stock--available" : "room-detail-stock--empty"
                  }`}
                >
                  <i className="fa-solid fa-door-open" />
                  {loading
                    ? "Đang kiểm tra phòng trống"
                    : hasAvailableRooms
                      ? `Còn ${availableRooms} phòng trống`
                      : hasAvailabilityInfo
                        ? "Hết phòng"
                        : "Chọn ngày để kiểm tra"}
                </span>
              </div>

              <section className="room-detail-section">
                <h2>Mô tả phòng</h2>
                <p>{room.MoTa}</p>
              </section>

              <section className="room-detail-section">
                <h2>Tiện nghi phòng</h2>
                <div className="room-detail-amenities">
                  {roomAmenities.map((item) => (
                    <div className="room-detail-amenity" key={item.label}>
                      <span>
                        <i className={item.icon} />
                      </span>
                      <p>{item.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="room-detail-section">
                <h2>Thông tin khác</h2>
                <div className="room-detail-info-grid">
                  <div>
                    <strong>Không gian</strong>
                    <span>Yên tĩnh, phù hợp nghỉ dưỡng và công tác</span>
                  </div>
                  <div>
                    <strong>Dịch vụ</strong>
                    <span>Dọn phòng hằng ngày, lễ tân hỗ trợ 24/7</span>
                  </div>
                  <div>
                    <strong>Thanh toán</strong>
                    <span>Thanh toán linh hoạt tại quầy hoặc trực tuyến</span>
                  </div>
                </div>
              </section>
            </section>

            <aside className="room-detail-sidebar">
              <form className="room-detail-booking-card" onSubmit={this.handleBookingSubmit}>
                <div className="room-detail-price">
                  <strong>{formatPrice(room.GiaTheoMua ?? room.GiaMacDinh)}</strong>
                  <span>/ đêm</span>
                </div>

                <label>
                  <span>Nhận phòng</span>
                  <div className="room-detail-field">
                    <i className="fa-regular fa-calendar-days" />
                    <input
                      type="date"
                      name="checkInDate"
                      value={bookingForm.checkInDate}
                      onChange={this.handleBookingChange}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Trả phòng</span>
                  <div className="room-detail-field">
                    <i className="fa-regular fa-calendar-days" />
                    <input
                      type="date"
                      name="checkOutDate"
                      value={bookingForm.checkOutDate}
                      onChange={this.handleBookingChange}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Số lượng phòng</span>
                  <div className="room-detail-field">
                    <i className="fa-solid fa-door-open" />
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      max={hasAvailableRooms ? availableRooms : 1}
                      value={bookingForm.quantity}
                      onChange={this.handleBookingChange}
                      required
                    />
                  </div>
                </label>

                <button type="submit" disabled={loading || !hasAvailableRooms}>
                  {loading
                    ? "Đang kiểm tra..."
                    : hasAvailableRooms
                      ? "Đặt phòng ngay"
                      : "Hết phòng"}
                </button>

                <p className="room-detail-instant">
                  <i className="fa-regular fa-circle-check" />
                  Xác nhận tức thì
                </p>
              </form>

              <section className="room-detail-side-card">
                <h2>Chính sách phòng</h2>
                <ul>
                  {policies.map((policy) => (
                    <li key={policy}>
                      <i className="fa-solid fa-circle-check" />
                      {policy}
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </main>

        <TrangKhachHang_Footer />
      </div>
    );
  }
}

export default TrangKhachHang_ChiTietPhong;
