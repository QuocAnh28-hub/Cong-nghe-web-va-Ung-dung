﻿import React, { Component } from "react";
import "../style/NhanTraphong.css";
import { FeatureHeader } from "./Common";

const RESERVATIONS_API_URL = "http://localhost:3000/api/reservations";
const WAITING_CHECKIN_CUSTOMERS_API_URL = `${RESERVATIONS_API_URL}/waiting-checkin-customers`;
const CURRENT_STAYING_CUSTOMERS_API_URL = `${RESERVATIONS_API_URL}/current-staying-customers`;
const CHECKIN_BY_RESERVATION_API_URL = `${RESERVATIONS_API_URL}/checkin/by-reservation`;
const CHECKIN_WALKIN_API_URL = `${RESERVATIONS_API_URL}/checkin/walkin`;
const ROOMS_API_URL = "http://localhost:3000/api/rooms";
const ROOM_TYPES_API_URL = "http://localhost:3000/api/get-room-types";

class NhanTraphong extends Component {
  serviceOptions = [
    { name: "Giặt ủi", label: "Giặt ủi - 50.000đ", price: 50000 },
    { name: "Dọn phòng", label: "Dọn phòng - 30.000đ", price: 30000 },
    {
      name: "Đưa đón sân bay",
      label: "Đưa đón sân bay - 250.000đ",
      price: 250000,
    },
    { name: "Bữa sáng", label: "Bữa sáng - 80.000đ", price: 80000 },
  ];

  createId = () => Date.now() + Math.floor(Math.random() * 1000);

  getDefaultServiceItems = () => [
    { id: this.createId(), name: "", qty: 1, price: 0 },
  ];

  getDefaultMinibarItems = () => [
    { id: 1, name: "Pepsi - 30.000đ", qty: 2, price: 30000 },
    { id: 2, name: "Nước suối - 10.000đ", qty: 1, price: 10000 },
  ];

  extractInputDateFromPlan = (plan) => {
    if (!plan) return "";
    const parts = plan.trim().split(" ");
    const datePart = parts[parts.length - 1];
    const [day, month, year] = datePart.split("/");
    if (!day || !month || !year) return "";
    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  formatInputDate = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    if (!day || !month || !year) return "";
    return `${Number(day)}/${Number(month)}/${year}`;
  };

  buildCheckOutPlan = (oldPlan, newDate) => {
    const timePart = oldPlan?.split(" ")?.[0] || "12:00:00";
    return `${timePart} ${this.formatInputDate(newDate)}`;
  };

  componentDidMount() {
    this.loadInitialData();
  }

  readResponseBody = async (response) => {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  buildErrorMessage = (body, statusCode) => {
    if (typeof body === "string" && body.trim()) return body;

    if (body && typeof body === "object") {
      const detail =
        (typeof body.detail === "string" && body.detail.trim()) ||
        (typeof body.Detail === "string" && body.Detail.trim());

      if (detail) return detail;
      return body.message || body.error || `API error: ${statusCode}`;
    }

    return `API error: ${statusCode}`;
  };

  request = async (url, options = {}) => {
    const response = await fetch(url, options);
    const body = await this.readResponseBody(response);

    if (!response.ok) {
      throw new Error(this.buildErrorMessage(body, response.status));
    }

    return body;
  };

  formatDateForInput = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  formatDateForTable = (value) => {
    const normalized = this.formatDateForInput(value);
    if (!normalized) return "-";

    const [year, month, day] = normalized.split("-");
    return `${day}/${month}/${year}`;
  };

  formatDateTimeForTable = (value) => {
    if (!value) return "-";

    if (typeof value === "string") {
      const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        return `11:00:00 ${day}/${month}/${year}`;
      }

      const midnightUtcMatch = value.match(
        /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.000)?Z$/,
      );
      if (midnightUtcMatch) {
        const [, year, month, day] = midnightUtcMatch;
        return `11:00:00 ${day}/${month}/${year}`;
      }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  };

  loadInitialData = async () => {
    await this.fetchRoomTypes();
    await Promise.all([
      this.fetchWaitingCheckinCustomers(),
      this.fetchCurrentStayingCustomers(),
    ]);
  };

  fetchRoomTypes = async () => {
    try {
      const payload = await this.request(ROOM_TYPES_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const roomTypeMap = rawItems.reduce((acc, item) => {
        const id = item?.RoomTypeID ?? item?.id;
        const name = item?.Name ?? item?.name;

        if (id !== null && id !== undefined && name) {
          acc[String(id)] = String(name);
        }

        return acc;
      }, {});

      this.setState({ roomTypeMap });
    } catch {
      this.setState({ roomTypeMap: {} });
    }
  };

  resolveRoomTypeName = (item) => {
    if (item?.RoomTypeName) return item.RoomTypeName;
    if (item?.RoomType) return item.RoomType;

    const roomTypeId = item?.RoomTypeID;
    if (roomTypeId !== null && roomTypeId !== undefined) {
      const roomTypeName = this.state.roomTypeMap[String(roomTypeId)];
      if (roomTypeName) return roomTypeName;
      return `Loại #${roomTypeId}`;
    }

    return "-";
  };

  mapBookingFromApi = (item) => ({
    id: item?.ReservationID ?? this.createId(),
    reservationId: item?.ReservationID ?? null,
    guest: item?.FullName ?? "",
    roomType: this.resolveRoomTypeName(item),
    checkIn: this.formatDateForTable(item?.CheckInDate),
    checkOut: this.formatDateForTable(item?.CheckOutDate),
  });

  mapRoomFromApi = (item) => ({
    roomId: item?.RoomID ?? item?.id ?? null,
    roomNumber: item?.RoomNumber ?? "",
    roomType: item?.RoomType ?? item?.RoomTypeName ?? "",
  });

  normalizeRoomStatus = (status) =>
    String(status || "")
      .trim()
      .toUpperCase();

  isWalkinAvailableRoom = (status) => {
    const normalized = this.normalizeRoomStatus(status);
    return ["AVAILABLE", "OCCUPIED", "DIRTY", "MAINTENANCE"].includes(
      normalized,
    );
  };

  mapStayingFromApi = (item) => {
    const roomNumber = item?.RoomNumber ? String(item.RoomNumber).trim() : "";
    const roomType = this.resolveRoomTypeName(item);
    const room = roomNumber
      ? `${roomNumber}${roomType && roomType !== "-" ? ` (${roomType})` : ""}`
      : item?.RoomID
        ? `Phòng #${item.RoomID}`
        : "-";

    return {
      id: item?.ReservationID ?? item?.RoomID ?? this.createId(),
      reservationId: item?.ReservationID ?? null,
      guest: item?.FullName ?? "",
      room,
      checkInTime: this.formatDateTimeForTable(item?.CheckInDate),
      checkOutPlan: this.formatDateTimeForTable(item?.CheckOutDate),
    };
  };

  fetchWaitingCheckinCustomers = async () => {
    try {
      this.setState({ bookingLoading: true });
      const payload = await this.request(WAITING_CHECKIN_CUSTOMERS_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      this.setState({ bookingData: rawItems.map(this.mapBookingFromApi) });
    } catch (err) {
      this.setState({ bookingData: [] });
      window.alert(
        err.message || "Không thể tải danh sách khách chờ check-in.",
      );
    } finally {
      this.setState({ bookingLoading: false });
    }
  };

  fetchCurrentStayingCustomers = async () => {
    try {
      this.setState({ stayLoading: true });
      const payload = await this.request(CURRENT_STAYING_CUSTOMERS_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      this.setState({ stayData: rawItems.map(this.mapStayingFromApi) });
    } catch (err) {
      this.setState({ stayData: [] });
      window.alert(
        err.message || "Không thể tải danh sách khách đang lưu trú.",
      );
    } finally {
      this.setState({ stayLoading: false });
    }
  };

  fetchAvailableRoomsForCheckin = async (reservationId) => {
    if (!reservationId) return;

    try {
      this.setState({
        availableRoomsLoading: true,
        availableRooms: [],
        selectedCheckinRoomId: "",
      });

      const payload = await this.request(
        `${RESERVATIONS_API_URL}/${reservationId}/available-rooms-for-checkin`,
      );
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const availableRooms = rawItems
        .map(this.mapRoomFromApi)
        .filter((room) => room.roomId !== null);

      this.setState((prev) => {
        const stillInCheckinModal =
          prev.modalType === "checkin" &&
          String(prev.currentItem?.reservationId) === String(reservationId);

        if (!stillInCheckinModal) return null;

        return {
          availableRooms,
          selectedCheckinRoomId: availableRooms[0]
            ? String(availableRooms[0].roomId)
            : "",
        };
      });
    } catch (err) {
      this.setState({ availableRooms: [], selectedCheckinRoomId: "" });
      window.alert(err.message || "Không thể tải danh sách phòng khả dụng.");
    } finally {
      this.setState({ availableRoomsLoading: false });
    }
  };

  fetchWalkinAvailableRooms = async () => {
    try {
      this.setState({
        walkinRoomsLoading: true,
        walkinAvailableRooms: [],
      });

      const payload = await this.request(ROOMS_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const walkinAvailableRooms = rawItems
        .filter((item) => this.isWalkinAvailableRoom(item?.Status))
        .map(this.mapRoomFromApi)
        .filter((room) => room.roomId !== null)
        .sort((a, b) =>
          String(a.roomNumber || "").localeCompare(
            String(b.roomNumber || ""),
            "vi",
            {
              numeric: true,
            },
          ),
        );

      this.setState((prev) => {
        if (prev.modalType !== "walkin") return null;

        const stillHasSelectedRoom = walkinAvailableRooms.some(
          (room) => String(room.roomId) === String(prev.walkInForm.roomId),
        );

        return {
          walkinAvailableRooms,
          walkInForm: {
            ...prev.walkInForm,
            roomId:
              stillHasSelectedRoom && prev.walkInForm.roomId
                ? prev.walkInForm.roomId
                : walkinAvailableRooms[0]
                  ? String(walkinAvailableRooms[0].roomId)
                  : "",
          },
        };
      });
    } catch (err) {
      this.setState((prev) => ({
        walkinAvailableRooms: [],
        walkInForm: { ...prev.walkInForm, roomId: "" },
      }));
      window.alert(err.message || "Không thể tải danh sách phòng trống.");
    } finally {
      this.setState({ walkinRoomsLoading: false });
    }
  };

  confirmWalkin = async () => {
    const { walkInForm } = this.state;
    const fullName = walkInForm.name.trim();
    const cccd = walkInForm.identity.trim();
    const roomId = Number(walkInForm.roomId);
    const expectedCheckOut = walkInForm.checkOut;

    if (!fullName || !cccd || !walkInForm.roomId || !expectedCheckOut) {
      window.alert("Vui lòng nhập đầy đủ thông tin walk-in.");
      return;
    }

    if (!Number.isInteger(roomId) || roomId < 1) {
      window.alert("RoomID không hợp lệ.");
      return;
    }

    try {
      this.setState({ walkinSubmitting: true });
      const response = await this.request(CHECKIN_WALKIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FullName: fullName,
          CCCD: cccd,
          RoomID: roomId,
          ExpectedCheckOut: expectedCheckOut,
        }),
      });

      window.alert(
        response?.Message ||
          response?.message ||
          "Check-in walk-in thành công.",
      );

      this.closeModal();
      await this.fetchCurrentStayingCustomers();
    } catch (err) {
      window.alert(err.message || "Check-in walk-in thất bại.");
    } finally {
      this.setState({ walkinSubmitting: false });
    }
  };

  confirmCheckin = async () => {
    const { currentItem, selectedCheckinRoomId } = this.state;
    const reservationId = currentItem?.reservationId;

    if (!reservationId) {
      window.alert("Không tìm thấy ReservationID.");
      return;
    }

    if (!selectedCheckinRoomId) {
      window.alert("Vui lòng chọn phòng để check-in.");
      return;
    }

    try {
      this.setState({ checkinSubmitting: true });
      const response = await this.request(CHECKIN_BY_RESERVATION_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ReservationID: Number(reservationId),
          RoomID: Number(selectedCheckinRoomId),
        }),
      });

      window.alert(
        response?.Message || response?.message || "Check-in thành công.",
      );

      this.closeModal();
      await Promise.all([
        this.fetchWaitingCheckinCustomers(),
        this.fetchCurrentStayingCustomers(),
      ]);
    } catch (err) {
      window.alert(err.message || "Check-in thất bại.");
    } finally {
      this.setState({ checkinSubmitting: false });
    }
  };

  state = {
    activeTab: "stay",
    showModal: false,
    modalType: null,
    currentItem: null,
    stayData: [],
    stayLoading: false,
    bookingData: [],
    bookingLoading: false,
    availableRooms: [],
    availableRoomsLoading: false,
    walkinAvailableRooms: [],
    walkinRoomsLoading: false,
    selectedCheckinRoomId: "",
    checkinSubmitting: false,
    walkinSubmitting: false,
    roomTypeMap: {},
    walkInForm: {
      name: "",
      identity: "",
      roomId: "",
      checkOut: "",
    },
    transferRoom: "",
    transferNote: "",
    extendForm: { info: "", newCheckOut: "" },
    minibarItems: [
      { id: 1, name: "Pepsi - 30.000đ", qty: 2, price: 30000 },
      { id: 2, name: "Nước suối - 10.000đ", qty: 1, price: 10000 },
    ],
    serviceItems: [{ id: Date.now(), name: "", qty: 1, price: 0 }],
    newPenalty: { reason: "", amount: "" },
    penalties: [],
  };

  openModal = (type, item = null) => {
    const nextState = {
      showModal: true,
      modalType: type,
      currentItem: item,
    };

    if (type === "extend") {
      nextState.extendForm = {
        info: "",
        newCheckOut: this.extractInputDateFromPlan(item?.checkOutPlan),
      };
    }

    if (type === "service") {
      nextState.serviceItems = this.getDefaultServiceItems();
    }

    if (type === "walkin") {
      nextState.walkinAvailableRooms = [];
      nextState.walkinRoomsLoading = true;
      nextState.walkInForm = { ...this.state.walkInForm, roomId: "" };
    }

    if (type === "checkin") {
      nextState.availableRooms = [];
      nextState.availableRoomsLoading = true;
      nextState.selectedCheckinRoomId = "";
    }

    this.setState(nextState);

    if (type === "checkin" && item?.reservationId) {
      this.fetchAvailableRoomsForCheckin(item.reservationId);
    }

    if (type === "walkin") {
      this.fetchWalkinAvailableRooms();
    }
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      modalType: null,
      currentItem: null,
      walkInForm: { name: "", identity: "", roomId: "", checkOut: "" },
      transferRoom: "",
      transferNote: "",
      extendForm: { info: "", newCheckOut: "" },
      minibarItems: this.getDefaultMinibarItems(),
      serviceItems: this.getDefaultServiceItems(),
      newPenalty: { reason: "", amount: "" },
      penalties: [],
      availableRooms: [],
      availableRoomsLoading: false,
      walkinAvailableRooms: [],
      walkinRoomsLoading: false,
      selectedCheckinRoomId: "",
      checkinSubmitting: false,
      walkinSubmitting: false,
    });
  };

  handleWalkInInput = (field) => (e) => {
    this.setState({
      walkInForm: { ...this.state.walkInForm, [field]: e.target.value },
    });
  };

  handleTransferInput = (field) => (e) => {
    this.setState({ [field]: e.target.value });
  };

  handleExtendInput = (field) => (e) => {
    this.setState({
      extendForm: { ...this.state.extendForm, [field]: e.target.value },
    });
  };

  handleCheckinRoomInput = (event) => {
    this.setState({ selectedCheckinRoomId: event.target.value });
  };

  addMinibarItem = () => {
    this.setState((prev) => ({
      minibarItems: [
        ...prev.minibarItems,
        { id: Date.now(), name: "", qty: 1, price: 0 },
      ],
    }));
  };

  updateMinibarItem = (id, field, value) => {
    this.setState((prev) => ({
      minibarItems: prev.minibarItems.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "qty" ? Number(value) : value }
          : item,
      ),
    }));
  };

  removeMinibarItem = (id) => {
    this.setState((prev) => ({
      minibarItems: prev.minibarItems.filter((item) => item.id !== id),
    }));
  };

  addServiceItem = () => {
    this.setState((prev) => ({
      serviceItems: [
        ...prev.serviceItems,
        { id: this.createId(), name: "", qty: 1, price: 0 },
      ],
    }));
  };

  updateServiceItem = (id, field, value) => {
    this.setState((prev) => ({
      serviceItems: prev.serviceItems.map((item) => {
        if (item.id !== id) return item;

        if (field === "name") {
          const selected = this.serviceOptions.find(
            (service) => service.name === value,
          );
          return { ...item, name: value, price: selected ? selected.price : 0 };
        }

        if (field === "qty") {
          return { ...item, qty: Math.max(1, Number(value) || 1) };
        }

        return { ...item, [field]: value };
      }),
    }));
  };

  removeServiceItem = (id) => {
    this.setState((prev) => {
      const nextItems = prev.serviceItems.filter((item) => item.id !== id);
      return {
        serviceItems: nextItems.length
          ? nextItems
          : [{ id: this.createId(), name: "", qty: 1, price: 0 }],
      };
    });
  };

  addPenalty = () => {
    const { newPenalty, penalties } = this.state;
    if (!newPenalty.reason || !newPenalty.amount) return;
    this.setState({
      penalties: [...penalties, { ...newPenalty, id: Date.now() }],
      newPenalty: { reason: "", amount: "" },
    });
  };

  removePenalty = (id) => {
    this.setState((prev) => ({
      penalties: prev.penalties.filter((p) => p.id !== id),
    }));
  };

  changeTab = (tab) => this.setState({ activeTab: tab });

  handleConfirmModal = () => {
    const { modalType, currentItem, extendForm } = this.state;

    if (modalType === "walkin") {
      this.confirmWalkin();
      return;
    }

    if (modalType === "checkin") {
      this.confirmCheckin();
      return;
    }

    if (modalType === "extend") {
      if (!extendForm.newCheckOut) {
        alert("Vui lòng chọn ngày Check-out mới.");
        return;
      }

      const currentDate = this.extractInputDateFromPlan(
        currentItem?.checkOutPlan,
      );
      if (currentDate && extendForm.newCheckOut <= currentDate) {
        alert("Ngày Check-out mới phải lớn hơn ngày dự kiến hiện tại.");
        return;
      }

      this.setState(
        (prev) => ({
          stayData: prev.stayData.map((item) =>
            item.id === currentItem?.id
              ? {
                  ...item,
                  checkOutPlan: this.buildCheckOutPlan(
                    item.checkOutPlan,
                    extendForm.newCheckOut,
                  ),
                }
              : item,
          ),
        }),
        this.closeModal,
      );
      return;
    }

    this.closeModal();
  };

  renderModal() {
    const {
      modalType,
      currentItem,
      walkInForm,
      transferRoom,
      transferNote,
      extendForm,
      minibarItems,
      serviceItems,
      newPenalty,
      penalties,
      availableRooms,
      availableRoomsLoading,
      walkinAvailableRooms,
      walkinRoomsLoading,
      selectedCheckinRoomId,
      checkinSubmitting,
      walkinSubmitting,
    } = this.state;

    if (!modalType) return null;

    const overlayClick = (e) => {
      if (e.target.classList.contains("nhan-modal-overlay")) this.closeModal();
    };

    const subtotal = minibarItems.reduce((sum, i) => sum + i.qty * i.price, 0);
    const penaltyTotal = penalties.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const serviceTotal = serviceItems.reduce(
      (sum, i) => sum + i.qty * i.price,
      0,
    );
    const disableCheckinConfirm =
      modalType === "checkin" &&
      (availableRoomsLoading || checkinSubmitting || !selectedCheckinRoomId);
    const disableWalkinConfirm =
      modalType === "walkin" &&
      (walkinSubmitting ||
        walkinRoomsLoading ||
        !walkInForm.name.trim() ||
        !walkInForm.identity.trim() ||
        !walkInForm.roomId ||
        !walkInForm.checkOut);
    const disableModalConfirm = disableCheckinConfirm || disableWalkinConfirm;

    return (
      <div className="nhan-modal-overlay" onClick={overlayClick}>
        <div className="nhan-modal" onClick={(e) => e.stopPropagation()}>
          <div className="nhan-modal-title-row">
            <h2>
              {modalType === "walkin" && "Check-in Walk-in"}
              {modalType === "checkin" && "Check-in khách hàng"}
              {modalType === "transfer" && "Chuyển phòng"}
              {modalType === "extend" && "Gia hạn lưu trú"}
              {modalType === "service" && "Gọi dịch vụ"}
              {modalType === "checkout" && "Check-out khách hàng"}
            </h2>
            <button className="nhan-close-btn" onClick={this.closeModal}>
              ×
            </button>
          </div>

          {modalType === "walkin" && (
            <>
              <div className="ntp-field">
                <label>Họ tên *</label>
                <input
                  placeholder="Họ tên *"
                  value={walkInForm.name}
                  onChange={this.handleWalkInInput("name")}
                />
              </div>
              <div className="ntp-field">
                <label>CMND/CCCD *</label>
                <input
                  placeholder="CMND/CCCD *"
                  value={walkInForm.identity}
                  onChange={this.handleWalkInInput("identity")}
                />
              </div>
              <div className="ntp-field">
                <label>Chọn phòng *</label>
                <select
                  value={walkInForm.roomId}
                  onChange={this.handleWalkInInput("roomId")}
                  disabled={walkinRoomsLoading || walkinSubmitting}
                >
                  <option value="">
                    {walkinRoomsLoading
                      ? "Đang tải phòng trống..."
                      : "Chọn phòng trống"}
                  </option>
                  {walkinAvailableRooms.map((room) => (
                    <option key={room.roomId} value={room.roomId}>
                      {room.roomNumber
                        ? `${room.roomNumber}${room.roomType ? ` (${room.roomType})` : ""}`
                        : `Phòng #${room.roomId}`}
                    </option>
                  ))}
                </select>
                {!walkinRoomsLoading && walkinAvailableRooms.length === 0 && (
                  <small>Hiện không có phòng trống để walk-in.</small>
                )}
              </div>
              <div className="ntp-field">
                <label>Ngày trả phòng dự kiến *</label>
                <input
                  type="date"
                  value={walkInForm.checkOut}
                  onChange={this.handleWalkInInput("checkOut")}
                />
              </div>
            </>
          )}

          {modalType === "checkin" && (
            <>
              <div className="ntp-field">
                <label>Khách hàng</label>
                <div className="ntp-readonly">{currentItem?.guest || "-"}</div>
              </div>
              <div className="ntp-field">
                <label>Loại phòng</label>
                <div className="ntp-readonly">
                  {currentItem?.roomType || "-"}
                </div>
              </div>
              <div className="ntp-field">
                <label>Chọn phòng *</label>
                <select
                  value={selectedCheckinRoomId}
                  onChange={this.handleCheckinRoomInput}
                  disabled={availableRoomsLoading || checkinSubmitting}
                >
                  <option value="">
                    {availableRoomsLoading
                      ? "Đang tải phòng khả dụng..."
                      : "Chọn phòng"}
                  </option>
                  {availableRooms.map((room) => (
                    <option key={room.roomId} value={room.roomId}>
                      {room.roomNumber
                        ? `${room.roomNumber}${room.roomType ? ` (${room.roomType})` : ""}`
                        : `Phòng #${room.roomId}`}
                    </option>
                  ))}
                </select>
                {!availableRoomsLoading && availableRooms.length === 0 && (
                  <small>Không có phòng trống phù hợp để check-in.</small>
                )}
              </div>
            </>
          )}

          {modalType === "transfer" && (
            <>
              <div className="ntp-field">
                <label>Phòng hiện tại</label>
                <div className="ntp-readonly">
                  {currentItem?.room || "406 - Suite"}
                </div>
              </div>
              <div className="ntp-field">
                <label>Phòng mới *</label>
                <select
                  value={transferRoom}
                  onChange={this.handleTransferInput("transferRoom")}
                >
                  <option value="">Chọn phòng mới</option>
                  <option value="502 - Deluxe">502 - Deluxe</option>
                  <option value="503 - Premium">503 - Premium</option>
                </select>
              </div>
              <div className="ntp-field">
                <label>Lý do chuyển phòng</label>
                <textarea
                  rows={3}
                  placeholder="VD: Khách yêu cầu, nâng hạng phòng, sự cố kỹ thuật..."
                  value={transferNote}
                  onChange={this.handleTransferInput("transferNote")}
                />
              </div>
              <div className="ntp-note-box">
                Lưu ý: Tiền phòng sẽ được tính riêng theo từng phòng khách ở.
                Phòng cũ sẽ chuyển sang trạng thái "Dọn dẹp".
              </div>
            </>
          )}

          {modalType === "extend" && (
            <>
              <div className="ntp-field">
                <label>Khách hàng</label>
                <div className="ntp-readonly">{currentItem?.guest}</div>
              </div>
              <div className="ntp-field">
                <label>Phòng</label>
                <div className="ntp-readonly">{currentItem?.room}</div>
              </div>
              <div className="ntp-field">
                <label>Thông tin gia hạn</label>
                <textarea
                  rows={3}
                  placeholder="Nhập thông tin gia hạn (lý do, yêu cầu đặc biệt...)"
                  value={extendForm.info}
                  onChange={this.handleExtendInput("info")}
                />
              </div>
              <div className="ntp-field">
                <label>Ngày Check-out mới *</label>
                <input
                  type="date"
                  value={extendForm.newCheckOut}
                  onChange={this.handleExtendInput("newCheckOut")}
                />
              </div>
            </>
          )}

          {modalType === "service" && (
            <>
              <div className="ntp-field">
                <label>Khách hàng</label>
                <div className="ntp-readonly">{currentItem?.guest}</div>
              </div>
              <div className="ntp-field">
                <label>Phòng</label>
                <div className="ntp-readonly">{currentItem?.room}</div>
              </div>
              <div className="ntp-sub-title">Dịch vụ sử dụng</div>
              {serviceItems.map((item) => (
                <div key={item.id} className="ntp-minibar-row">
                  <select
                    value={item.name}
                    onChange={(e) =>
                      this.updateServiceItem(item.id, "name", e.target.value)
                    }
                  >
                    <option value="">Chọn dịch vụ</option>
                    {this.serviceOptions.map((service) => (
                      <option key={service.name} value={service.name}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      this.updateServiceItem(item.id, "qty", e.target.value)
                    }
                  />
                  <button
                    className="ntp-btn-danger"
                    onClick={() => this.removeServiceItem(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                className="ntp-btn ntp-btn-secondary ntp-btn-add"
                onClick={this.addServiceItem}
              >
                Thêm dịch vụ
              </button>
              <div className="ntp-total-row">
                <span>Tổng dịch vụ:</span>
                <strong>{serviceTotal.toLocaleString()}đ</strong>
              </div>
            </>
          )}

          {modalType === "checkout" && (
            <>
              <div className="ntp-field">
                <label>Khách hàng</label>
                <div className="ntp-readonly">{currentItem?.guest}</div>
              </div>
              <div className="ntp-sub-title">Minibar</div>
              {minibarItems.map((item) => (
                <div key={item.id} className="ntp-minibar-row">
                  <select
                    value={item.name}
                    onChange={(e) =>
                      this.updateMinibarItem(item.id, "name", e.target.value)
                    }
                  >
                    <option value="Pepsi - 30.000đ">Pepsi - 30.000đ</option>
                    <option value="Nước suối - 10.000đ">
                      Nước suối - 10.000đ
                    </option>
                    <option value="Snack - 20.000đ">Snack - 20.000đ</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      this.updateMinibarItem(item.id, "qty", e.target.value)
                    }
                  />
                  <button
                    className="ntp-btn-danger"
                    onClick={() => this.removeMinibarItem(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                className="ntp-btn ntp-btn-secondary ntp-btn-add"
                onClick={this.addMinibarItem}
              >
                Thêm minibar
              </button>
              <div className="ntp-sub-title">Phí phạt</div>
              <div className="ntp-penalty-row">
                <input
                  placeholder="Lý do phạt"
                  value={newPenalty.reason}
                  onChange={(e) =>
                    this.setState({
                      newPenalty: { ...newPenalty, reason: e.target.value },
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Số tiền"
                  value={newPenalty.amount}
                  onChange={(e) =>
                    this.setState({
                      newPenalty: { ...newPenalty, amount: e.target.value },
                    })
                  }
                />
                <button
                  className="ntp-btn ntp-btn-secondary"
                  onClick={this.addPenalty}
                >
                  Thêm
                </button>
              </div>
              {penalties.length > 0 && (
                <div className="ntp-penalty-list">
                  {penalties.map((p) => (
                    <div key={p.id} className="ntp-penalty-item">
                      <span>{p.reason}</span>
                      <div className="ntp-penalty-actions">
                        <strong>{Number(p.amount).toLocaleString()}đ</strong>
                        <button
                          className="ntp-btn ntp-btn-danger"
                          onClick={() => this.removePenalty(p.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="ntp-total-row">
                <span>Tổng:</span>
                <strong>{(subtotal + penaltyTotal).toLocaleString()}đ</strong>
              </div>
            </>
          )}

          <div className="nhan-modal-actions">
            <button
              className="ntp-btn ntp-btn-secondary"
              onClick={this.closeModal}
            >
              {modalType === "service" ? "Đóng" : "Hủy"}
            </button>
            {modalType !== "service" && (
              <button
                className="ntp-btn ntp-btn-primary"
                onClick={this.handleConfirmModal}
                disabled={disableModalConfirm}
              >
                {modalType === "checkout"
                  ? "Xác nhận Check-out"
                  : modalType === "transfer"
                    ? "Xác nhận chuyển"
                    : modalType === "extend"
                      ? "Xác nhận gia hạn"
                      : walkinSubmitting || checkinSubmitting
                        ? "Đang Check-in..."
                        : "Check-in"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      activeTab,
      showModal,
      stayData,
      stayLoading,
      bookingData,
      bookingLoading,
    } = this.state;

    return (
      <div className="nhantraphong">
        <div className="ntp-page-header">
          <FeatureHeader
            title="Nhận/Trả phòng"
            description="Quản lý check-in và check-out khách hàng"
          />
          <button
            className="ntp-btn ntp-btn-primary"
            onClick={() => this.openModal("walkin")}
          >
            Walk-in
          </button>
        </div>

        <div className="ntp-tab-panel">
          <button
            className={activeTab === "stay" ? "active" : ""}
            onClick={() => this.changeTab("stay")}
          >
            Đang lưu trú ({stayData.length})
          </button>
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => this.changeTab("pending")}
          >
            Đặt phòng chờ nhận ({bookingData.length})
          </button>
        </div>

        <div className="ntp-section-card">
          <h2>
            {activeTab === "stay" ? "Khách đang lưu trú" : "Đặt phòng chờ nhận"}
          </h2>
          <div className="ntp-table-wrap">
            <table className="ntp-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>{activeTab === "stay" ? "Phòng" : "Loại phòng"}</th>
                  <th>{activeTab === "stay" ? "Check-in" : "Ngày nhận"}</th>
                  <th>
                    {activeTab === "stay" ? "Dự kiến check-out" : "Ngày trả"}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === "stay" && stayLoading && (
                  <tr>
                    <td colSpan="5">
                      Đang tải danh sách khách đang lưu trú...
                    </td>
                  </tr>
                )}

                {activeTab === "stay" &&
                  !stayLoading &&
                  stayData.length === 0 && (
                    <tr>
                      <td colSpan="5">Không có khách đang lưu trú.</td>
                    </tr>
                  )}

                {activeTab === "stay" &&
                  !stayLoading &&
                  stayData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.guest}</td>
                      <td>{item.room}</td>
                      <td>{item.checkInTime}</td>
                      <td>{item.checkOutPlan}</td>
                      <td>
                        <div className="ntp-action-group">
                          <button
                            className="ntp-icon-action"
                            onClick={() => this.openModal("transfer", item)}
                          >
                            Chuyển phòng
                          </button>
                          <button
                            className="ntp-icon-action"
                            onClick={() => this.openModal("extend", item)}
                          >
                            Gia hạn
                          </button>
                          <button
                            className="ntp-icon-action"
                            onClick={() => this.openModal("service", item)}
                          >
                            Gọi dịch vụ
                          </button>
                          <button
                            className="ntp-btn ntp-btn-primary"
                            onClick={() => this.openModal("checkout", item)}
                          >
                            Check-out
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {activeTab === "pending" && bookingLoading && (
                  <tr>
                    <td colSpan="5">
                      Đang tải danh sách đặt phòng chờ nhận...
                    </td>
                  </tr>
                )}

                {activeTab === "pending" &&
                  !bookingLoading &&
                  bookingData.length === 0 && (
                    <tr>
                      <td colSpan="5">Không có khách đang chờ check-in.</td>
                    </tr>
                  )}

                {activeTab === "pending" &&
                  !bookingLoading &&
                  bookingData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.guest}</td>
                      <td>{item.roomType}</td>
                      <td>{item.checkIn}</td>
                      <td>{item.checkOut}</td>
                      <td>
                        <button
                          className="ntp-btn ntp-btn-primary"
                          onClick={() => this.openModal("checkin", item)}
                        >
                          Check-in
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && this.renderModal()}
      </div>
    );
  }
}

export default NhanTraphong;