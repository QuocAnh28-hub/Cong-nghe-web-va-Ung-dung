import React, { Component } from "react";
import "../style/Hoadon.css";
import { FeatureHeader } from "./Common";

const RESERVATIONS_API_URL = "http://localhost:3000/api/reservations";
const PENDING_INVOICES_API_URL = "http://localhost:3000/api/invoices/pending";
const INVOICE_HISTORY_API_URL = "http://localhost:3000/api/invoices/history";
const CREATE_AND_PAY_INVOICE_API_URL =
  "http://localhost:3000/api/invoices/create-and-pay";

const ROOM_STAY_HISTORY_CHECKEDOUT_API_URL = (stayId) =>
  `${RESERVATIONS_API_URL}/stays/${stayId}/room-stay-history-checkedout`;
const SERVICE_USAGES_BY_STAY_API_URL = (stayId) =>
  `${RESERVATIONS_API_URL}/stays/${stayId}/service-usages`;
const MINIBAR_USAGES_BY_STAY_API_URL = (stayId) =>
  `${RESERVATIONS_API_URL}/stays/${stayId}/minibar-usages`;
const PENALTIES_BY_STAY_API_URL = (stayId) =>
  `${RESERVATIONS_API_URL}/stays/${stayId}/penalties`;

const getDefaultInvoiceData = () => ({
  stayId: null,
  roomStays: [],
  services: [],
  minibar: [],
  penalties: [],
  roomTotal: 0,
  serviceTotal: 0,
  minibarTotal: 0,
  penaltyTotal: 0,
  subtotal: 0,
  vat: 8,
  vatAmount: 0,
  total: 0,
  method: "CASH",
  status: "PENDING",
});

class Hoadon extends Component {
  state = {
    pendingRooms: [],
    pendingLoading: true,
    pendingError: "",
    history: [],
    historyLoading: true,
    historyError: "",
    searchHistory: "",
    selectedRoom: null,
    isModalOpen: false,
    modalLoading: false,
    modalError: "",
    paySubmitting: false,
    invoiceData: getDefaultInvoiceData(),
  };

  componentDidMount() {
    this.fetchPendingInvoices();
    this.fetchInvoiceHistory();
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

  extractList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  getNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  formatCurrency = (value) => `${this.getNumber(value).toLocaleString("vi-VN")} VND`;

  formatDateForTable = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("vi-VN");
  };

  formatDateTimeForTable = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("vi-VN");
  };

  mapPendingInvoiceFromApi = (item) => {
    const stayId = item?.StayID ?? item?.stayId ?? item?.id ?? null;
    const roomCharge = this.getNumber(item?.RoomCharge ?? item?.roomCharge);
    const serviceCharge = this.getNumber(
      item?.ServiceCharge ?? item?.serviceCharge,
    );
    const minibarCharge = this.getNumber(
      item?.MinibarCharge ?? item?.minibarCharge,
    );
    const penaltyCharge = this.getNumber(
      item?.PenaltyCharge ?? item?.penaltyCharge,
    );
    const totalAmount = this.getNumber(item?.TotalAmount ?? item?.totalAmount);

    return {
      id: stayId ?? Date.now() + Math.floor(Math.random() * 1000),
      stayId: stayId ?? null,
      roomNumber: String(
        item?.RoomNumber ?? item?.roomNumber ?? item?.SoPhong ?? "-",
      ),
      guestName: String(item?.CustomerName ?? item?.customerName ?? "-"),
      checkinDate: this.formatDateForTable(
        item?.FirstCheckIn ?? item?.firstCheckIn,
      ),
      checkoutDate: this.formatDateForTable(
        item?.LastCheckOut ?? item?.lastCheckOut,
      ),
      roomCharge,
      serviceCharge,
      minibarCharge,
      penaltyCharge,
      totalAmount:
        totalAmount > 0
          ? totalAmount
          : roomCharge + serviceCharge + minibarCharge + penaltyCharge,
    };
  };

  mapRoomStayFromApi = (item) => ({
    id: item?.ID ?? item?.id ?? item?.STT ?? Date.now() + Math.random(),
    roomId: item?.RoomID ?? item?.roomId ?? null,
    roomNumber: item?.SoPhong ?? item?.RoomNumber ?? item?.roomNumber ?? "-",
    roomType: item?.RoomType ?? item?.roomType ?? "-",
    checkInTime: this.formatDateTimeForTable(
      item?.CheckInTime ?? item?.checkInTime,
    ),
    checkOutTime: this.formatDateTimeForTable(
      item?.CheckOutTime ?? item?.checkOutTime,
    ),
    amount: this.getNumber(
      item?.Amount ?? item?.amount ?? item?.RateAtThatTime ?? item?.rateAtThatTime,
    ),
  });

  mapServiceUsageFromApi = (item) => {
    const qty = this.getNumber(item?.Quantity ?? item?.quantity);
    const price = this.getNumber(item?.Price ?? item?.price);
    const total = this.getNumber(item?.Total ?? item?.total) || qty * price;

    return {
      id: item?.UsageID ?? item?.usageId ?? item?.id ?? Date.now() + Math.random(),
      name: item?.ServiceName ?? item?.serviceName ?? "Dịch vụ",
      quantity: qty,
      price,
      total,
      usedDate: this.formatDateTimeForTable(item?.UsedDate ?? item?.usedDate),
    };
  };

  mapMinibarUsageFromApi = (item) => {
    const qty = this.getNumber(item?.Quantity ?? item?.quantity);
    const price = this.getNumber(item?.Price ?? item?.price);
    const total = this.getNumber(item?.Total ?? item?.total) || qty * price;

    return {
      id: item?.ID ?? item?.UsageID ?? item?.usageId ?? Date.now() + Math.random(),
      name: item?.ItemName ?? item?.itemName ?? "Minibar",
      quantity: qty,
      price,
      total,
    };
  };

  mapPenaltyFromApi = (item) => ({
    id: item?.PenaltyID ?? item?.penaltyId ?? item?.id ?? Date.now() + Math.random(),
    reason: item?.Reason ?? item?.reason ?? "Phí phạt",
    amount: this.getNumber(item?.Amount ?? item?.amount),
    createdAt: this.formatDateTimeForTable(item?.CreatedAt ?? item?.createdAt),
  });

  mapInvoiceHistoryFromApi = (item) => {
    const fullName = String(item?.FullName ?? item?.fullName ?? "-");
    const dateRaw = item?.Date ?? item?.date ?? item?.CreatedAt ?? item?.createdAt;
    const totalAmount = this.getNumber(item?.TotalAmount ?? item?.totalAmount);

    return {
      id:
        item?.InvoiceID ??
        item?.invoiceId ??
        item?.ID ??
        item?.id ??
        `${fullName}-${dateRaw}-${totalAmount}`,
      roomNumber: String(
        item?.RoomNumber ?? item?.roomNumber ?? item?.SoPhong ?? "-",
      ),
      guestName: fullName,
      date: this.formatDateTimeForTable(dateRaw),
      total: totalAmount,
      status: String(item?.Status ?? item?.status ?? "PAID"),
    };
  };

  buildInvoiceData = (invoiceData) => {
    const roomTotal = invoiceData.roomStays.reduce(
      (sum, item) => sum + this.getNumber(item.amount),
      0,
    );
    const serviceTotal = invoiceData.services.reduce(
      (sum, item) => sum + this.getNumber(item.total),
      0,
    );
    const minibarTotal = invoiceData.minibar.reduce(
      (sum, item) => sum + this.getNumber(item.total),
      0,
    );
    const penaltyTotal = invoiceData.penalties.reduce(
      (sum, item) => sum + this.getNumber(item.amount),
      0,
    );

    const subtotal = roomTotal + serviceTotal + minibarTotal + penaltyTotal;
    const vat = this.getNumber(invoiceData.vat);
    const vatAmount = (subtotal * vat) / 100;
    const total = subtotal + vatAmount;

    return {
      ...invoiceData,
      roomTotal,
      serviceTotal,
      minibarTotal,
      penaltyTotal,
      subtotal,
      vat,
      vatAmount,
      total,
    };
  };

  fetchPendingInvoices = async () => {
    try {
      this.setState({ pendingLoading: true, pendingError: "" });

      const payload = await this.request(PENDING_INVOICES_API_URL);
      const rawItems = this.extractList(payload);

      this.setState({
        pendingRooms: rawItems.map(this.mapPendingInvoiceFromApi),
      });
    } catch (err) {
      this.setState({
        pendingRooms: [],
        pendingError:
          err.message ||
          "Không thể tải danh sách khách check-out chưa thanh toán.",
      });
    } finally {
      this.setState({ pendingLoading: false });
    }
  };

  fetchInvoiceHistory = async () => {
    try {
      this.setState({ historyLoading: true, historyError: "" });

      const payload = await this.request(INVOICE_HISTORY_API_URL);
      const rawItems = this.extractList(payload);

      this.setState({
        history: rawItems.map(this.mapInvoiceHistoryFromApi),
      });
    } catch (err) {
      this.setState({
        history: [],
        historyError: err.message || "Không thể tải lịch sử hóa đơn.",
      });
    } finally {
      this.setState({ historyLoading: false });
    }
  };

  loadInvoiceDetailsByStay = async (stayId) => {
    if (!stayId) {
      this.setState({ modalLoading: false, modalError: "StayID không hợp lệ." });
      return;
    }

    try {
      this.setState({ modalLoading: true, modalError: "" });

      const [roomStaysPayload, servicesPayload, minibarPayload, penaltiesPayload] =
        await Promise.all([
          this.request(ROOM_STAY_HISTORY_CHECKEDOUT_API_URL(stayId)),
          this.request(SERVICE_USAGES_BY_STAY_API_URL(stayId)),
          this.request(MINIBAR_USAGES_BY_STAY_API_URL(stayId)),
          this.request(PENALTIES_BY_STAY_API_URL(stayId)),
        ]);

      const roomStays = this.extractList(roomStaysPayload).map(
        this.mapRoomStayFromApi,
      );
      const services = this.extractList(servicesPayload).map(
        this.mapServiceUsageFromApi,
      );
      const minibar = this.extractList(minibarPayload).map(
        this.mapMinibarUsageFromApi,
      );
      const penalties = this.extractList(penaltiesPayload).map(this.mapPenaltyFromApi);

      this.setState((prev) => ({
        invoiceData: this.buildInvoiceData({
          ...prev.invoiceData,
          stayId,
          roomStays,
          services,
          minibar,
          penalties,
        }),
      }));
    } catch (err) {
      this.setState({
        modalError: err.message || "Không thể tải chi tiết hóa đơn.",
      });
    } finally {
      this.setState({ modalLoading: false });
    }
  };

  openInvoiceModal = (room) => {
    const stayId = Number(room?.stayId);
    if (!Number.isInteger(stayId) || stayId < 1) {
      window.alert("Không tìm thấy StayID để tạo hóa đơn.");
      return;
    }

    this.setState(
      {
        selectedRoom: room,
        isModalOpen: true,
        modalLoading: true,
        modalError: "",
        paySubmitting: false,
        invoiceData: this.buildInvoiceData({
          ...getDefaultInvoiceData(),
          stayId,
        }),
      },
      () => {
        this.loadInvoiceDetailsByStay(stayId);
      },
    );
  };

  closeModal = () => {
    this.setState({
      selectedRoom: null,
      isModalOpen: false,
      modalLoading: false,
      modalError: "",
      paySubmitting: false,
      invoiceData: getDefaultInvoiceData(),
    });
  };

  handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      this.closeModal();
    }
  };

  handleVatChange = (value) => {
    const vat = Math.max(0, this.getNumber(value));

    this.setState((prev) => ({
      invoiceData: this.buildInvoiceData({ ...prev.invoiceData, vat }),
    }));
  };

  handleMethodChange = (value) => {
    const method = String(value || "").toUpperCase();
    if (!["CASH", "TRANSFER"].includes(method)) return;

    this.setState((prev) => ({
      invoiceData: { ...prev.invoiceData, method },
    }));
  };

  confirmPayment = async () => {
    const {
      invoiceData: { stayId, method, vat },
      paySubmitting,
    } = this.state;

    if (paySubmitting) return;

    if (!Number.isInteger(Number(stayId)) || Number(stayId) < 1) {
      window.alert("StayID không hợp lệ.");
      return;
    }

    if (!["CASH", "TRANSFER"].includes(method)) {
      window.alert("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    try {
      this.setState({ paySubmitting: true });

      const response = await this.request(CREATE_AND_PAY_INVOICE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          StayID: Number(stayId),
          Method: method,
          VAT: this.getNumber(vat),
        }),
      });

      window.alert(
        response?.Message || response?.message || "Thanh toán hóa đơn thành công.",
      );

      this.closeModal();
      await Promise.all([this.fetchPendingInvoices(), this.fetchInvoiceHistory()]);
    } catch (err) {
      window.alert(err.message || "Thanh toán hóa đơn thất bại.");
    } finally {
      this.setState({ paySubmitting: false });
    }
  };

  getFilteredHistory = () => {
    const { history, searchHistory } = this.state;
    const keyword = String(searchHistory || "").trim().toLowerCase();

    if (!keyword) return history;

    return history.filter((inv) => {
      const roomNumber = String(inv.roomNumber || "").toLowerCase();
      const guestName = String(inv.guestName || "").toLowerCase();
      return roomNumber.includes(keyword) || guestName.includes(keyword);
    });
  };

  renderModalSectionHeader = (title) => (
    <h3 style={{ marginTop: 20, marginBottom: 10 }}>{title}</h3>
  );

  renderModal = () => {
    const {
      isModalOpen,
      selectedRoom,
      modalLoading,
      modalError,
      paySubmitting,
      invoiceData,
    } = this.state;

    if (!isModalOpen) return null;

    const disableConfirm =
      modalLoading ||
      paySubmitting ||
      !Number.isInteger(Number(invoiceData.stayId)) ||
      !["CASH", "TRANSFER"].includes(invoiceData.method);

    return (
      <div className="modal-overlay" onClick={this.handleOverlayClick}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              Hóa Đơn - {selectedRoom?.guestName || "-"}
              {selectedRoom?.roomNumber ? ` (Phòng ${selectedRoom.roomNumber})` : ""}
            </h2>
            <button className="btn-close" onClick={this.closeModal}>
              X
            </button>
          </div>

          {modalLoading && <p>Đang tải chi tiết hóa đơn...</p>}

          {!modalLoading && modalError && (
            <div>
              <p>{modalError}</p>
              <button
                className="btn-secondary"
                onClick={() => this.loadInvoiceDetailsByStay(invoiceData.stayId)}
              >
                Tải lại
              </button>
            </div>
          )}

          {!modalLoading && !modalError && (
            <>
              {this.renderModalSectionHeader("Danh sách phòng đã ở")}
              <div className="hoadon-table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Phòng</th>
                      <th>Loại phòng</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Tiền phòng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.roomStays.length === 0 && (
                      <tr>
                        <td colSpan="5">Không có lịch sử phòng.</td>
                      </tr>
                    )}
                    {invoiceData.roomStays.map((item) => (
                      <tr key={item.id}>
                        <td>{item.roomNumber}</td>
                        <td>{item.roomType}</td>
                        <td>{item.checkInTime}</td>
                        <td>{item.checkOutTime}</td>
                        <td>{this.formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {this.renderModalSectionHeader("Danh sách dịch vụ")}
              <div className="hoadon-table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên dịch vụ</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.services.length === 0 && (
                      <tr>
                        <td colSpan="4">Không có dịch vụ.</td>
                      </tr>
                    )}
                    {invoiceData.services.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{this.formatCurrency(item.price)}</td>
                        <td>{this.formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {this.renderModalSectionHeader("Danh sách minibar")}
              <div className="hoadon-table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên minibar</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.minibar.length === 0 && (
                      <tr>
                        <td colSpan="4">Không có minibar.</td>
                      </tr>
                    )}
                    {invoiceData.minibar.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{this.formatCurrency(item.price)}</td>
                        <td>{this.formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {this.renderModalSectionHeader("Danh sách phí phạt")}
              <div className="hoadon-table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Lý do</th>
                      <th>Ngày tạo</th>
                      <th>Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.penalties.length === 0 && (
                      <tr>
                        <td colSpan="3">Không có phí phạt.</td>
                      </tr>
                    )}
                    {invoiceData.penalties.map((item) => (
                      <tr key={item.id}>
                        <td>{item.reason}</td>
                        <td>{item.createdAt}</td>
                        <td>{this.formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {this.renderModalSectionHeader("Thông tin thanh toán")}
              <label>
                VAT (%)
                <input
                  type="number"
                  min="0"
                  value={invoiceData.vat}
                  onChange={(e) => this.handleVatChange(e.target.value)}
                />
              </label>

              <div className="payment-group">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="CASH"
                    checked={invoiceData.method === "CASH"}
                    onChange={(e) => this.handleMethodChange(e.target.value)}
                  />
                  <span>CASH</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="TRANSFER"
                    checked={invoiceData.method === "TRANSFER"}
                    onChange={(e) => this.handleMethodChange(e.target.value)}
                  />
                  <span>TRANSFER</span>
                </label>
              </div>

              <p>
                <strong>Tiền phòng:</strong> {this.formatCurrency(invoiceData.roomTotal)}
              </p>
              <p>
                <strong>Tiền dịch vụ:</strong> {this.formatCurrency(invoiceData.serviceTotal)}
              </p>
              <p>
                <strong>Tiền minibar:</strong> {this.formatCurrency(invoiceData.minibarTotal)}
              </p>
              <p>
                <strong>Tiền phạt:</strong> {this.formatCurrency(invoiceData.penaltyTotal)}
              </p>
              <p>
                <strong>Tạm tính:</strong> {this.formatCurrency(invoiceData.subtotal)}
              </p>
              <p>
                <strong>VAT:</strong> {this.formatCurrency(invoiceData.vatAmount)}
              </p>
              <p>
                <strong>Tổng thanh toán:</strong> {this.formatCurrency(invoiceData.total)}
              </p>

              <div style={{ marginTop: 16 }}>
                <button className="btn-secondary" onClick={this.closeModal}>
                  Đóng
                </button>
                <button
                  className="btn-primary"
                  onClick={this.confirmPayment}
                  disabled={disableConfirm}
                >
                  {paySubmitting ? "Đang thanh toán..." : "Xác nhận thanh toán"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  render() {
    const {
      pendingRooms,
      pendingLoading,
      pendingError,
      historyLoading,
      historyError,
      searchHistory,
    } = this.state;
    const filteredHistory = this.getFilteredHistory();

    return (
      <div className="hoadon">
        <FeatureHeader
          title="Hoá Đơn"
          description="Quản lý hoá đơn thanh toán"
        />

        <div className="hoadon-main">
          <h3>Phòng Chưa Thanh Toán</h3>
          <div className="hoadon-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên khách</th>
                  <th>Ngày check-in</th>
                  <th>Ngày check-out</th>
                  <th>Tổng dự kiến</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingLoading && (
                  <tr>
                    <td colSpan="6">Đang tải danh sách chưa thanh toán...</td>
                  </tr>
                )}

                {!pendingLoading && pendingError && (
                  <tr>
                    <td colSpan="6">{pendingError}</td>
                  </tr>
                )}

                {!pendingLoading && !pendingError && pendingRooms.length === 0 && (
                  <tr>
                    <td colSpan="6">Không có khách check-out chưa thanh toán.</td>
                  </tr>
                )}

                {!pendingLoading &&
                  !pendingError &&
                  pendingRooms.map((room) => (
                    <tr key={room.id}>
                      <td>{room.guestName}</td>
                      <td>{room.checkinDate}</td>
                      <td>{room.checkoutDate}</td>
                      <td>{this.formatCurrency(room.totalAmount)}</td>
                      <td>
                        <button
                          className="btn-primary"
                          onClick={() => this.openInvoiceModal(room)}
                        >
                          Tạo hóa đơn
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hoadon-history">
          <h3>Lịch Sử Hóa Đơn</h3>
          <div className="search-box">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm hóa đơn..."
              value={searchHistory}
              onChange={(e) => this.setState({ searchHistory: e.target.value })}
            />
          </div>
          <div className="hoadon-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên khách</th>
                  <th>Ngày</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading && (
                  <tr>
                    <td colSpan="5">Đang tải lịch sử hóa đơn...</td>
                  </tr>
                )}
                {!historyLoading && historyError && (
                  <tr>
                    <td colSpan="5">{historyError}</td>
                  </tr>
                )}
                {!historyLoading && !historyError && filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="5">Chưa có lịch sử hóa đơn.</td>
                  </tr>
                )}
                {!historyLoading &&
                  !historyError &&
                  filteredHistory.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.guestName}</td>
                    <td>{inv.date}</td>
                    <td>{this.formatCurrency(inv.total)}</td>
                    <td>{inv.status}</td>
                  </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {this.renderModal()}
      </div>
    );
  }
}

export default Hoadon;