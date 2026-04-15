import React, { Component } from "react";
import "../style/Datphong.css";
import { FeatureHeader } from "./Common";
import { toast } from "react-toastify";

const RESERVATIONS_API_URL = "http://localhost:3000/api/reservations";
const CUSTOMERS_API_URL = "http://localhost:3000/api/customers";
const ROOM_TYPES_API_URL = "http://localhost:3000/api/room-types";
const PAGE_SIZE = 5;

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "booked", label: "Đã đặt" },
  { value: "checkedin", label: "Đã nhận" },
  { value: "completed", label: "Hoàn thành" },
  { value: "canceled", label: "Đã hủy" },
];

const STATUS_LABELS = {
  booked: "Đã đặt",
  checkedin: "Đã nhận",
  completed: "Hoàn thành",
  canceled: "Đã hủy",
  unknown: "Không xác định",
};

const getDefaultForm = () => ({
  customerId: "",
  newCustomer: {
    fullName: "",
    phone: "",
    cccd: "",
    email: "",
  },
  roomTypeId: "",
  checkInDate: "",
  checkOutDate: "",
  quantity: "1",
});

const normalizeStatus = (status) => {
  const normalized = String(status || "")
    .trim()
    .toUpperCase();

  if (normalized === "BOOKED") return "booked";
  if (normalized === "CHECKED_IN") return "checkedin";
  if (normalized === "COMPLETED") return "completed";
  if (normalized === "CANCELLED" || normalized === "CANCELED")
    return "canceled";

  return "unknown";
};

const pad2 = (value) => String(value).padStart(2, "0");

const formatDateForInput = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const formatDateForTable = (value) => {
  const normalized = formatDateForInput(value);
  if (!normalized) return "-";

  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return `${amount.toLocaleString("vi-VN")} đ`;
};

const mapReservationFromApi = (item) => ({
  id: item?.ReservationID,
  userId: item?.UserID ?? null,
  fullName: item?.FullName ?? "",
  phone: item?.Phone ?? "",
  roomTypeName: item?.RoomTypeName ?? "",
  roomTypeId: item?.RoomTypeID ?? null,
  quantity: Number(item?.Quantity ?? 0),
  checkInDate: formatDateForInput(item?.CheckInDate),
  checkOutDate: formatDateForInput(item?.CheckOutDate),
  statusRaw: item?.Status ?? "",
  totalPrice: item?.TotalPrice ?? null,
});

class Datphong extends Component {
  state = {
    loading: true,
    lookupLoading: true,
    submitLoading: false,
    actionLoadingId: null,
    error: "",
    notice: "",
    showModal: false,
    modalMode: "create",
    editingId: null,
    customerTab: "old",
    search: "",
    filterStatus: "all",
    currentPage: 1,
    reservations: [],
    customers: [],
    roomTypes: [],
    form: getDefaultForm(),
  };

  componentDidMount() {
    this.loadInitialData();
  }

  componentDidUpdate(prevProps, prevState) {
    const updates = {};

    if (this.state.error && this.state.error !== prevState.error) {
      toast.error(this.state.error);
      updates.error = "";
    }

    if (this.state.notice && this.state.notice !== prevState.notice) {
      toast.info(this.state.notice);
      updates.notice = "";
    }

    if (Object.keys(updates).length > 0) {
      this.setState(updates);
    }
  }

  loadInitialData = async () => {
    await Promise.all([
      this.fetchReservations(),
      this.fetchCustomers(),
      this.fetchRoomTypes(),
    ]);
  };

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

  fetchReservations = async () => {
    try {
      this.setState({ loading: true, error: "" });
      const payload = await this.request(RESERVATIONS_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const reservations = rawItems
        .map(mapReservationFromApi)
        .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      this.setState({ reservations, currentPage: 1 });
    } catch (err) {
      this.setState({
        error: err.message || "Không thể tải danh sách lịch đặt.",
        reservations: [],
      });
      toast.error(this.state.error);
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchCustomers = async () => {
    try {
      this.setState({ lookupLoading: true, error: "" });
      const payload = await this.request(CUSTOMERS_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const customers = rawItems
        .map((item) => ({
          userId: item?.UserID ?? null,
          customerId: item?.CustomerID ?? null,
          fullName: item?.FullName ?? "",
          phone: item?.Phone ?? "",
          cccd: item?.CCCD ?? "",
          email: item?.Email ?? "",
        }))
        .filter((item) => item.userId !== null)
        .sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"));

      this.setState({ customers });
    } catch (err) {
      this.setState({
        error: err.message || "Không thể tải danh sách khách hàng.",
        customers: [],
      });
      toast.error(this.state.error);
    } finally {
      this.setState({ lookupLoading: false });
    }
  };

  fetchRoomTypes = async () => {
    try {
      this.setState({ lookupLoading: true, error: "" });
      const payload = await this.request(ROOM_TYPES_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const roomTypes = rawItems
        .map((item) => ({
          id: item?.RoomTypeID ?? item?.id ?? null,
          name: item?.Name ?? item?.name ?? "",
          defaultPrice: item?.DefaultPrice ?? item?.price ?? null,
        }))
        .filter((item) => item.id !== null)
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

      this.setState({ roomTypes });
    } catch (err) {
      this.setState({
        error: err.message || "Không thể tải danh sách loại phòng.",
        roomTypes: [],
      });
      toast.error(this.state.error);
    } finally {
      this.setState({ lookupLoading: false });
    }
  };

  openCreateModal = () => {
    this.setState({
      showModal: true,
      modalMode: "create",
      editingId: null,
      customerTab: "old",
      form: getDefaultForm(),
      error: "",
    });
  };

  openEditModal = (reservation) => {
    const { roomTypes } = this.state;
    const matchedRoomType = roomTypes.find(
      (type) =>
        String(type.id) === String(reservation.roomTypeId) ||
        type.name === reservation.roomTypeName,
    );

    this.setState({
      showModal: true,
      modalMode: "edit",
      editingId: reservation.id,
      customerTab: "old",
      error: "",
      form: {
        customerId: reservation.userId ? String(reservation.userId) : "",
        newCustomer: {
          fullName: "",
          phone: "",
          cccd: "",
          email: "",
        },
        roomTypeId: matchedRoomType
          ? String(matchedRoomType.id)
          : reservation.roomTypeId
            ? String(reservation.roomTypeId)
            : "",
        checkInDate: reservation.checkInDate || "",
        checkOutDate: reservation.checkOutDate || "",
        quantity: reservation.quantity > 0 ? String(reservation.quantity) : "1",
      },
    });
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      modalMode: "create",
      editingId: null,
      customerTab: "old",
      form: getDefaultForm(),
    });
  };

  handleInput = (field) => (event) => {
    const { form } = this.state;
    this.setState({ form: { ...form, [field]: event.target.value } });
  };

  handleNewCustomerInput = (field) => (event) => {
    const { form } = this.state;
    this.setState({
      form: {
        ...form,
        newCustomer: { ...form.newCustomer, [field]: event.target.value },
      },
    });
  };

  handleSearchChange = (event) => {
    this.setState({ search: event.target.value, currentPage: 1 });
  };

  handleStatusChange = (event) => {
    this.setState({ filterStatus: event.target.value, currentPage: 1 });
  };

  validateForm = () => {
    const { modalMode, customerTab, form } = this.state;
    const quantityNumber = Number(form.quantity);

    if (!form.roomTypeId || !form.checkInDate || !form.checkOutDate) {
      return "Vui lòng nhập đầy đủ thông tin đặt phòng.";
    }

    if (!Number.isInteger(quantityNumber) || quantityNumber < 1) {
      return "Số lượng phòng phải là số nguyên dương.";
    }

    if (new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      return "Ngày trả phòng phải sau ngày nhận phòng.";
    }

    if (modalMode === "create" && customerTab === "old" && !form.customerId) {
      return "Vui lòng chọn khách hàng cũ.";
    }

    if (modalMode === "create" && customerTab === "new") {
      if (
        !form.newCustomer.fullName.trim() ||
        !form.newCustomer.phone.trim() ||
        !form.newCustomer.cccd.trim()
      ) {
        return "Vui lòng nhập họ tên, số điện thoại và CCCD cho khách mới.";
      }
    }

    return "";
  };

  saveBooking = async () => {
    const { modalMode, customerTab, editingId, form } = this.state;
    const validationError = this.validateForm();

    if (validationError) {
      this.setState({ error: validationError, notice: "" });
      return;
    }

    const commonPayload = {
      RoomTypeID: Number(form.roomTypeId),
      Quantity: Number(form.quantity),
      CheckInDate: form.checkInDate,
      CheckOutDate: form.checkOutDate,
    };

    try {
      this.setState({ submitLoading: true, error: "", notice: "" });
      let successMessage = "Lưu lịch đặt thành công.";

      if (modalMode === "edit" && editingId) {
        await this.request(`${RESERVATIONS_API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(commonPayload),
        });
        successMessage = "Cập nhật lịch đặt thành công.";
      } else if (customerTab === "old") {
        const selectedCustomer = this.state.customers.find(
          (customer) => String(customer.userId) === String(form.customerId),
        );

        if (!selectedCustomer || selectedCustomer.userId === null) {
          throw new Error(
            "Khách hàng đã chọn không có UserID hợp lệ.",
          );
        }

        await this.request(RESERVATIONS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...commonPayload,
            UserID: Number(selectedCustomer.userId),
          }),
        });
        successMessage = "Thêm lịch đặt cho khách cũ thành công.";
      } else {
        await this.request(`${RESERVATIONS_API_URL}/new-customer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...commonPayload,
            FullName: form.newCustomer.fullName.trim(),
            Phone: form.newCustomer.phone.trim(),
            CCCD: form.newCustomer.cccd.trim(),
            Email: form.newCustomer.email.trim() || null,
          }),
        });
        successMessage = "Thêm lịch đặt cho khách mới thành công.";
        toast.success(successMessage);
      }

      await this.fetchReservations();
      this.setState({
        notice: successMessage,
        showModal: false,
        modalMode: "create",
        editingId: null,
        customerTab: "old",
        form: getDefaultForm(),
      });
    } catch (err) {
      this.setState({
        error: err.message || "Không thể lưu lịch đặt.",
        notice: "",
      });
      toast.error(this.state.error);
    } finally {
      this.setState({ submitLoading: false });
    }
  };

  setCustomerTab = (tab) => {
    this.setState((prev) => ({
      customerTab: tab,
      form: {
        ...prev.form,
        customerId: "",
        newCustomer: {
          fullName: "",
          phone: "",
          cccd: "",
          email: "",
        },
      },
    }));
  };

  cancelBooking = async (reservationId) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy lịch đặt này?")) {
      return;
    }

    try {
      this.setState({ actionLoadingId: reservationId, error: "", notice: "" });
      const response = await this.request(
        `${RESERVATIONS_API_URL}/${reservationId}/cancel`,
        {
          method: "PATCH",
        },
      );

      await this.fetchReservations();
      this.setState({
        notice:
          response?.Message ||
          response?.message ||
          "Đã hủy đặt phòng thành công.",
      });
      toast.info(this.state.notice);
    } catch (err) {
      this.setState({
        error: err.message || "Không thể hủy lịch đặt.",
        notice: "",
      });
      toast.error(this.state.error);
    } finally {
      this.setState({ actionLoadingId: null });
    }
  };

  getFilteredReservations = () => {
    const { reservations, search, filterStatus } = this.state;
    const keyword = search.trim().toLowerCase();

    return reservations.filter((item) => {
      const normalizedStatus = normalizeStatus(item.statusRaw);
      const matchesStatus =
        filterStatus === "all" || filterStatus === normalizedStatus;

      const matchesSearch =
        !keyword ||
        String(item.id || "").includes(keyword) ||
        item.fullName.toLowerCase().includes(keyword) ||
        item.phone.toLowerCase().includes(keyword) ||
        item.roomTypeName.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  };

  render() {
    const {
      loading,
      lookupLoading,
      submitLoading,
      actionLoadingId,
      showModal,
      modalMode,
      customerTab,
      customers,
      roomTypes,
      search,
      filterStatus,
      currentPage,
      form,
    } = this.state;

    const filteredReservations = this.getFilteredReservations();
    const totalPages = Math.max(
      1,
      Math.ceil(filteredReservations.length / PAGE_SIZE),
    );
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const paginatedReservations = filteredReservations.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );

    const isEditMode = modalMode === "edit";

    return (
      <div className="datphong">
        <div className="datphong__header">
          <FeatureHeader
            title="Đặt phòng"
            description="Quản lý lịch đặt phòng khách sạn"
          />
          <button
            className="dp-btn dp-btn-primary"
            onClick={this.openCreateModal}
          >
            + Thêm lịch đặt
          </button>
        </div>

        <div className="datphong-main">
          <div className="datphong__filter">
            <div className="datphong-search-box">
              <i className="fa fa-search"></i>
              <input
                placeholder="Tìm theo mã đặt, tên khách, SDT, loại phòng..."
                value={search}
                onChange={this.handleSearchChange}
              />
            </div>
            <select value={filterStatus} onChange={this.handleStatusChange}>
              {STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="datphong__table-wrap">
            <table className="datphong__table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Loại phòng</th>
                  <th>Ngày nhận</th>
                  <th>Ngày trả</th>
                  <th>Số phòng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="empty-row">
                      Đang tải dữ liệu lịch đặt...
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-row">
                      Không có lịch đặt phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedReservations.map((reservation) => {
                    const statusKey = normalizeStatus(reservation.statusRaw);
                    const statusLabel =
                      STATUS_LABELS[statusKey] || STATUS_LABELS.unknown;
                    const isCanceled = statusKey === "canceled";

                    return (
                      <tr key={reservation.id}>
                        <td>
                          {reservation.fullName ||
                            `Khách #${reservation.userId || "-"}`}
                        </td>
                        <td>{reservation.phone || "-"}</td>
                        <td>{reservation.roomTypeName || "-"}</td>
                        <td>{formatDateForTable(reservation.checkInDate)}</td>
                        <td>{formatDateForTable(reservation.checkOutDate)}</td>
                        <td>{reservation.quantity || "-"}</td>
                        <td>
                          <span className={`status status-${statusKey}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="datphong-actions">
                          <button
                            className="dp-icon-btn"
                            title="Sửa"
                            onClick={() => this.openEditModal(reservation)}
                            disabled={isCanceled || submitLoading}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                          <button
                            className="dp-icon-btn dp-icon-btn-delete"
                            title="Hủy đặt phòng"
                            onClick={() => this.cancelBooking(reservation.id)}
                            disabled={
                              isCanceled || actionLoadingId === reservation.id
                            }
                          >
                            <i className="fa fa-ban"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredReservations.length > 0 && (
            <div className="datphong-pagination">
              <button
                type="button"
                className="datphong-page-btn"
                onClick={() =>
                  this.setState((prev) => ({
                    currentPage: Math.max(prev.currentPage - 1, 1),
                  }))
                }
                disabled={safeCurrentPage === 1}
                aria-label="Trang trước"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={`datphong-page-btn ${page === safeCurrentPage ? "active" : ""}`}
                    onClick={() => this.setState({ currentPage: page })}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                className="datphong-page-btn"
                onClick={() =>
                  this.setState((prev) => ({
                    currentPage: Math.min(prev.currentPage + 1, totalPages),
                  }))
                }
                disabled={safeCurrentPage === totalPages}
                aria-label="Trang sau"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={this.closeModal}>
            <div
              className="modal modalDatPhong"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-title-row">
                <h2>
                  {isEditMode ? "Cập nhật lịch đặt" : "Thêm lịch đặt mới"}
                </h2>
                <button className="close-btn" onClick={this.closeModal}>
                  ×
                </button>
              </div>

              {!isEditMode && (
                <div className="customer-tabs">
                  <button
                    className={customerTab === "old" ? "active" : ""}
                    onClick={() => this.setCustomerTab("old")}
                  >
                    Khách cũ
                  </button>
                  <button
                    className={customerTab === "new" ? "active" : ""}
                    onClick={() => this.setCustomerTab("new")}
                  >
                    Khách mới
                  </button>
                </div>
              )}

              <div className="datphong-form-grid">
                {!isEditMode && customerTab === "old" && (
                  <div className="dp-field dp-field-full">
                    <label>Chọn khách hàng *</label>
                    <select
                      value={form.customerId}
                      onChange={this.handleInput("customerId")}
                      disabled={lookupLoading}
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers.map((customer) => (
                        <option key={customer.userId} value={customer.userId}>
                          {customer.fullName} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!isEditMode && customerTab === "new" && (
                  <>
                    <div className="dp-field dp-field-full">
                      <label>Họ tên *</label>
                      <input
                        type="text"
                        value={form.newCustomer.fullName}
                        onChange={this.handleNewCustomerInput("fullName")}
                        placeholder="Nhập họ tên khách"
                      />
                    </div>
                    <div className="dp-field">
                      <label>Số điện thoại *</label>
                      <input
                        type="text"
                        value={form.newCustomer.phone}
                        onChange={this.handleNewCustomerInput("phone")}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="dp-field">
                      <label>CMND/CCCD *</label>
                      <input
                        type="text"
                        value={form.newCustomer.cccd}
                        onChange={this.handleNewCustomerInput("cccd")}
                        placeholder="Nhập CMND/CCCD"
                      />
                    </div>
                    <div className="dp-field dp-field-full">
                      <label>Email</label>
                      <input
                        type="email"
                        value={form.newCustomer.email}
                        onChange={this.handleNewCustomerInput("email")}
                        placeholder="Nhập email (nếu có)"
                      />
                    </div>
                  </>
                )}

                <div className="dp-field dp-field-full">
                  <label>Loại phòng *</label>
                  <select
                    value={form.roomTypeId}
                    onChange={this.handleInput("roomTypeId")}
                    disabled={lookupLoading}
                  >
                    <option value="">-- Chọn loại phòng --</option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({formatCurrency(type.defaultPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dp-field">
                  <label>Ngày nhận phòng *</label>
                  <input
                    type="date"
                    value={form.checkInDate}
                    onChange={this.handleInput("checkInDate")}
                  />
                </div>

                <div className="dp-field">
                  <label>Ngày trả phòng *</label>
                  <input
                    type="date"
                    value={form.checkOutDate}
                    onChange={this.handleInput("checkOutDate")}
                  />
                </div>

                <div className="dp-field dp-field-full">
                  <label>Số phòng cần đặt *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={this.handleInput("quantity")}
                  />
                </div>
              </div>

              <div className="dp-modal-actions">
                <button
                  className="dp-btn dp-btn-secondary"
                  onClick={this.closeModal}
                >
                  Hủy
                </button>
                <button
                  className="dp-btn dp-btn-primary"
                  onClick={this.saveBooking}
                  disabled={submitLoading}
                >
                  {submitLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Datphong;