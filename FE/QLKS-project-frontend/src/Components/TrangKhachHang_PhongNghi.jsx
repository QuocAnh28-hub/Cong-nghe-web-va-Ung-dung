import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../style/TrangKhachHang_GioiThieuPhongNghi.css";
import { TrangKhachHang_Header, TrangKhachHang_Footer } from "./TrangKhachHang_Common";
import { toast } from "react-toastify";

const LOCAL_IMAGE_BASE_URL = "http://localhost:3000/local-images/";
const ROOM_TYPES_API_URL = "http://localhost:3000/api/pages-for-customer";
const AVAILABLE_ROOM_TYPES_API_URL =
  "http://localhost:3000/api/pages-for-customer/available-room-types";

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
    filterForm: {
      checkInDate: "",
      checkOutDate: "",
    },
    isAvailabilityFilterActive: false,
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

  getNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  normalizeRoomType = (room) => ({
    ...room,
    RoomTypeID: room.RoomTypeID ?? room.roomTypeId ?? room.id,
    TenLoaiPhong: room.TenLoaiPhong ?? room.Name ?? room.name ?? "",
    SucChua: room.SucChua ?? room.Capacity ?? room.capacity ?? 0,
    MoTa: room.MoTa ?? room.Description ?? room.description ?? "",
    ImageUrl: room.ImageUrl ?? room.ImageUri ?? room.imageUrl ?? "",
    GiaMacDinh: room.GiaMacDinh ?? room.DefaultPrice ?? room.defaultPrice,
    GiaTheoMua: room.GiaTheoMua ?? room.SeasonalPrice ?? room.seasonalPrice,
    MuaApDung: room.MuaApDung ?? room.SeasonName ?? room.seasonName,
    TotalRooms: this.getNumber(room.TotalRooms ?? room.totalRooms),
    ReservedRooms: this.getNumber(room.ReservedRooms ?? room.reservedRooms),
    OccupiedRooms: this.getNumber(room.OccupiedRooms ?? room.occupiedRooms),
    AvailableRooms:
      room.AvailableRooms ?? room.availableRooms ?? room.SoPhongTrong ?? null,
  });

  extractRoomTypes = (payload) => {
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    return items.map(this.normalizeRoomType);
  };

  loadRoomTypes = async ({ checkInDate = "", checkOutDate = "" } = {}) => {
    try {
      this.setState({ loading: true, error: null });

      const params = new URLSearchParams();
      if (checkInDate && checkOutDate) {
        params.set("CheckInDate", checkInDate);
        params.set("CheckOutDate", checkOutDate);
      }

      const url =
        checkInDate && checkOutDate
          ? `${AVAILABLE_ROOM_TYPES_API_URL}?${params.toString()}`
          : ROOM_TYPES_API_URL;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu loại phòng");
      }
      const payload = await response.json();
      this.setState({
        roomTypes: this.extractRoomTypes(payload),
        loading: false,
        isAvailabilityFilterActive: Boolean(checkInDate && checkOutDate),
      });
    } catch (error) {
      this.setState({ error: error.message || "Lỗi tải dữ liệu", loading: false });
    }
  };

  handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      filterForm: {
        ...prevState.filterForm,
        [name]: value,
      },
    }));
  };

  handleFilterSubmit = (e) => {
    e.preventDefault();
    const { checkInDate, checkOutDate } = this.state.filterForm;

    if (!checkInDate || !checkOutDate) {
      toast.error("Vui lòng chọn ngày nhận và ngày trả phòng.");
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toast.error("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    this.loadRoomTypes({ checkInDate, checkOutDate });
  };

  handleClearFilter = () => {
    this.setState(
      {
        filterForm: {
          checkInDate: "",
          checkOutDate: "",
        },
        isAvailabilityFilterActive: false,
      },
      () => this.loadRoomTypes(),
    );
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
    const { filterForm } = this.state;

    this.setState({
      showModal: true,
      selectedRoom: room,
      bookingForm: {
        ngayNhan: filterForm.checkInDate || "",
        ngayTra: filterForm.checkOutDate || "",
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

    const availableRooms = Number(selectedRoom.AvailableRooms);
    if (
      Number.isFinite(availableRooms) &&
      availableRooms >= 0 &&
      bookingForm.soPhong > availableRooms
    ) {
      alert(`Chỉ còn ${availableRooms} phòng trống cho loại phòng này.`);
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

      toast.success("Đặt phòng thành công!");
      this.closeModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  render() {
    const {
      fullname,
      roomTypes,
      loading,
      error,
      filterForm,
      isAvailabilityFilterActive,
      showModal,
      selectedRoom,
      bookingForm,
    } = this.state;

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

          <section className="room-filter-panel">
            <form className="room-filter-form" onSubmit={this.handleFilterSubmit}>
              <div className="room-filter-field">
                <label htmlFor="checkInDate">Ngày nhận phòng</label>
                <input
                  type="date"
                  id="checkInDate"
                  name="checkInDate"
                  value={filterForm.checkInDate}
                  onChange={this.handleFilterInputChange}
                />
              </div>
              <div className="room-filter-field">
                <label htmlFor="checkOutDate">Ngày trả phòng</label>
                <input
                  type="date"
                  id="checkOutDate"
                  name="checkOutDate"
                  value={filterForm.checkOutDate}
                  onChange={this.handleFilterInputChange}
                />
              </div>
              <div className="room-filter-actions">
                <button type="submit" className="room-filter-submit" disabled={loading}>
                  {loading ? "Đang lọc..." : "Lọc phòng trống"}
                </button>
                {isAvailabilityFilterActive && (
                  <button
                    type="button"
                    className="room-filter-reset"
                    onClick={this.handleClearFilter}
                    disabled={loading}
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="room-list" id="dat-phong">
            {loading && <p>Đang tải danh sách phòng...</p>}
            {error && <p className="room-error">{error}</p>}

            {!loading && !error && roomTypes.length === 0 && (
              <p>Không có loại phòng nào để hiển thị.</p>
            )}

            {roomTypes.map((room, index) => {
              // Lấy ảnh từ API - kiểm tra cả ImageUri và ImageUrl
              const imageUrl = room.ImageUrl || room.ImageUri || "";
              const defaultPrice = formatPrice(room.GiaMacDinh);
              const defaultPriceValue = Number(room.GiaMacDinh);
              const seasonPriceValue = Number(room.GiaTheoMua);
              const hasSeasonPrice =
                room.GiaTheoMua !== null &&
                room.GiaTheoMua !== undefined &&
                Number.isFinite(defaultPriceValue) &&
                Number.isFinite(seasonPriceValue) &&
                seasonPriceValue !== defaultPriceValue;
              const salePrice = hasSeasonPrice
                ? formatPrice(room.GiaTheoMua)
                : null;
              const availableRooms = Number(room.AvailableRooms);
              const hasAvailabilityInfo =
                isAvailabilityFilterActive && Number.isFinite(availableRooms);

              return (
                <article className="room-card" key={room.RoomTypeID || room.TenLoaiPhong || index}>
                  <div className="room-card__media">
                    <img 
                      src={imageUrl} 
                      alt={room.TenLoaiPhong} 
                      className="room-card__image"
                      onError={(e) => {
                        e.target.src = `${LOCAL_IMAGE_BASE_URL}AnhPhong_${(index % 7) + 1}.jpg`;
                      }}
                    />
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
                      <h2>
                        <Link to={`/trangkhachhang/phongnghi/${room.RoomTypeID}`}>
                          {room.TenLoaiPhong}
                        </Link>
                      </h2>
                      <span className="room-card__capacity">
                        <i className="fa-solid fa-user-group" />
                        {room.SucChua} khách
                      </span>
                    </div>

                    {hasAvailabilityInfo && (
                      <p
                        className={`room-card__availability ${
                          availableRooms > 0
                            ? "room-card__availability--available"
                            : "room-card__availability--empty"
                        }`}
                      >
                        <i className="fa-solid fa-door-open" />
                        Còn {availableRooms} phòng trống
                      </p>
                    )}

                    <p className="room-card__description">{room.MoTa}</p>

                    {room.MuaApDung && (
                      <p className="room-card__promotion">Mùa: {room.MuaApDung}</p>
                    )}

                    <button 
                      className="room-card__button"
                      onClick={() => this.openBookingModal(room)}
                      disabled={hasAvailabilityInfo && availableRooms < 1}
                    >
                      {hasAvailabilityInfo && availableRooms < 1
                        ? "Hết phòng"
                        : "Đặt phòng ngay"}
                      <i className="fa-solid fa-arrow-right" />
                    </button>
                    <Link
                      to={`/trangkhachhang/phongnghi/${room.RoomTypeID}`}
                      className="room-card__detail-link"
                    >
                      Xem chi tiết
                    </Link>
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
                    max={
                      Number.isFinite(Number(selectedRoom.AvailableRooms))
                        ? Math.max(1, Number(selectedRoom.AvailableRooms))
                        : 10
                    }
                    required
                  />
                  {Number.isFinite(Number(selectedRoom.AvailableRooms)) && (
                    <small>Còn {selectedRoom.AvailableRooms} phòng trống.</small>
                  )}
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
