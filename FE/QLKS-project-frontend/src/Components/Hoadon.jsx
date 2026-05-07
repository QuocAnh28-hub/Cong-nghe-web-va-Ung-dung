import React, { Component } from "react";
import "../style/Hoadon.css";
import { FeatureHeader } from "./Common";

const RESERVATIONS_API_URL = "http://localhost:3000/api/reservations";
const PENDING_INVOICES_API_URL = "http://localhost:3000/api/invoices/pending";
const INVOICE_HISTORY_API_URL = "http://localhost:3000/api/invoices/history";
const CREATE_AND_PAY_INVOICE_API_URL =
  "http://localhost:3000/api/invoices/create-and-pay";
const INVOICE_FULL_API_URL = (stayId) =>
  `http://localhost:3000/api/invoices/full/${stayId}`;

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
  ITEMS_PER_PAGE = 6;

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
    isHistoryModal: false,
    currentPagePending: 1,
    currentPageHistory: 1,
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

  formatCurrency = (value) =>
    `${this.getNumber(value).toLocaleString("vi-VN")} VND`;

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
    const guestName = String(
      item?.GuesName ??
        item?.GuestName ??
        item?.guestName ??
        item?.CustomerName ??
        item?.customerName ??
        "-",
    );
    const checkinRaw =
      item?.ActualCheckIn ??
      item?.actualCheckIn ??
      item?.FirstCheckIn ??
      item?.firstCheckIn;
    const checkoutRaw =
      item?.ActualCheckOut ??
      item?.actualCheckOut ??
      item?.LastCheckOut ??
      item?.lastCheckOut;
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
      id: stayId ?? `${guestName}-${checkinRaw}-${checkoutRaw}`,
      stayId: stayId ?? null,
      roomNumber: String(
        item?.RoomNumber ?? item?.roomNumber ?? item?.SoPhong ?? "-",
      ),
      guestName,
      identityNumber: String(
        item?.IdentityNumber ?? item?.identityNumber ?? "-",
      ),
      checkinDate: this.formatDateForTable(checkinRaw),
      checkoutDate: this.formatDateForTable(checkoutRaw),
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
      item?.Amount ??
        item?.amount ??
        item?.RateAtThatTime ??
        item?.rateAtThatTime,
    ),
  });

  mapServiceUsageFromApi = (item) => {
    const qty = this.getNumber(item?.Quantity ?? item?.quantity);
    const price = this.getNumber(item?.Price ?? item?.price);
    const total = this.getNumber(item?.Total ?? item?.total) || qty * price;

    return {
      id:
        item?.UsageID ??
        item?.usageId ??
        item?.id ??
        Date.now() + Math.random(),
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
      id:
        item?.ID ??
        item?.UsageID ??
        item?.usageId ??
        Date.now() + Math.random(),
      name: item?.ItemName ?? item?.itemName ?? "Minibar",
      quantity: qty,
      price,
      total,
    };
  };

  mapPenaltyFromApi = (item) => ({
    id:
      item?.PenaltyID ??
      item?.penaltyId ??
      item?.id ??
      Date.now() + Math.random(),
    reason: item?.Reason ?? item?.reason ?? "Phí phạt",
    amount: this.getNumber(item?.Amount ?? item?.amount),
    createdAt: this.formatDateTimeForTable(item?.CreatedAt ?? item?.createdAt),
  });

  mapInvoiceHistoryFromApi = (item) => {
    const stayId = Number(item?.StayID ?? item?.stayId ?? item?.InvoiceID ?? item?.invoiceId ?? null);
    const stayCode = String(item?.StayID ?? item?.stayId ?? item?.InvoiceID ?? item?.invoiceId ?? "-");
    const fullName = String(item?.FullName ?? item?.fullName ?? "-");
    const dateRaw =
      item?.LatestDate ?? item?.Date ?? item?.date ?? item?.CreatedAt ?? item?.createdAt;
    const totalAmount = this.getNumber(item?.TotalAmount ?? item?.totalAmount);

    return {
      id:
        item?.StayID ??
        item?.stayId ??
        item?.InvoiceID ??
        item?.invoiceId ??
        item?.ID ??
        item?.id ??
        `${fullName}-${dateRaw}-${totalAmount}`,
      stayId,
      stayCode,
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

  loadInvoiceDetailsByStay = async (stayId, fromHistory = false) => {
    if (!stayId) {
      this.setState({
        modalLoading: false,
        modalError: "Mã lưu trú không hợp lệ.",
      });
      return;
    }

    if (fromHistory) {
      return this.loadInvoiceDetailsFromFullInvoiceApi(stayId);
    }

    try {
      this.setState({ modalLoading: true, modalError: "" });

      const [
        roomStaysPayload,
        servicesPayload,
        minibarPayload,
        penaltiesPayload,
      ] = await Promise.all([
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
      const penalties = this.extractList(penaltiesPayload).map(
        this.mapPenaltyFromApi,
      );

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

  loadInvoiceDetailsFromFullInvoiceApi = async (stayId) => {
    try {
      this.setState({ modalLoading: true, modalError: "" });

      const payload = await this.request(INVOICE_FULL_API_URL(stayId));
      const invoice = payload?.invoice ?? payload;
      const details = Array.isArray(payload?.details) ? payload.details : [];

      const roomStays = details
        .filter((item) => String(item?.ItemType ?? item?.itemType).toUpperCase() === "ROOM")
        .map((item) => ({
          id: item?.DetailID ?? item?.detailId ?? item?.id ?? Date.now() + Math.random(),
          roomId: null,
          roomNumber: String(item?.ItemName ?? item?.itemName ?? "-"),
          roomType: String(item?.ItemType ?? item?.itemType ?? "ROOM"),
          checkInTime: this.formatDateTimeForTable(
            invoice?.ActualCheckIn ?? invoice?.actualCheckIn,
          ),
          checkOutTime: this.formatDateTimeForTable(
            invoice?.ActualCheckOut ?? invoice?.actualCheckOut,
          ),
          amount: this.getNumber(item?.Amount ?? item?.amount),
        }));

      const services = details
        .filter((item) => String(item?.ItemType ?? item?.itemType).toUpperCase() === "SERVICE")
        .map((item) => {
          const qty = this.getNumber(item?.Quantity ?? item?.quantity);
          const price = this.getNumber(item?.UnitPrice ?? item?.unitPrice ?? item?.Price ?? item?.price);
          const total = this.getNumber(item?.Amount ?? item?.amount) || qty * price;
          return {
            id: item?.DetailID ?? item?.detailId ?? item?.id ?? Date.now() + Math.random(),
            name: String(item?.ItemName ?? item?.itemName ?? "Dịch vụ"),
            quantity: qty,
            price,
            total,
            usedDate: this.formatDateTimeForTable(invoice?.Date ?? invoice?.date),
          };
        });

      const minibar = details
        .filter((item) => String(item?.ItemType ?? item?.itemType).toUpperCase() === "MINIBAR")
        .map((item) => {
          const qty = this.getNumber(item?.Quantity ?? item?.quantity);
          const price = this.getNumber(item?.UnitPrice ?? item?.unitPrice ?? item?.Price ?? item?.price);
          const total = this.getNumber(item?.Amount ?? item?.amount) || qty * price;
          return {
            id: item?.DetailID ?? item?.detailId ?? item?.id ?? Date.now() + Math.random(),
            name: String(item?.ItemName ?? item?.itemName ?? "Minibar"),
            quantity: qty,
            price,
            total,
          };
        });

      const penalties = details
        .filter((item) => String(item?.ItemType ?? item?.itemType).toUpperCase() === "PENALTY")
        .map((item) => ({
          id: item?.DetailID ?? item?.detailId ?? item?.id ?? Date.now() + Math.random(),
          reason: String(item?.ItemName ?? item?.itemName ?? "Phí phạt"),
          amount: this.getNumber(item?.Amount ?? item?.amount),
          createdAt: this.formatDateTimeForTable(invoice?.Date ?? invoice?.date),
        }));

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

  openInvoiceModal = (room, fromHistory = false) => {
    const stayId = Number(room?.stayId ?? room?.stayCode);
    if (!Number.isInteger(stayId) || stayId < 1) {
      window.alert("Không tìm thấy mã lưu trú để hiển thị hóa đơn.");
      return;
    }

    this.setState(
      {
        selectedRoom: room,
        isModalOpen: true,
        modalLoading: true,
        modalError: "",
        paySubmitting: false,
        isHistoryModal: fromHistory,
        invoiceData: this.buildInvoiceData({
          ...getDefaultInvoiceData(),
          stayId,
        }),
      },
      () => {
        this.loadInvoiceDetailsByStay(stayId, fromHistory);
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
        response?.Message ||
          response?.message ||
          "Thanh toán hóa đơn thành công.",
      );

      this.closeModal();
      await Promise.all([
        this.fetchPendingInvoices(),
        this.fetchInvoiceHistory(),
      ]);
    } catch (err) {
      window.alert(err.message || "Thanh toán hóa đơn thất bại.");
    } finally {
      this.setState({ paySubmitting: false });
    }
  };

  getFilteredHistory = () => {
    const { history, searchHistory } = this.state;
    const keyword = String(searchHistory || "")
      .trim()
      .toLowerCase();

    if (!keyword) return history;

    return history.filter((inv) => {
      const roomNumber = String(inv.roomNumber || "").toLowerCase();
      const guestName = String(inv.guestName || "").toLowerCase();
      const stayCode = String(inv.stayCode || "").toLowerCase();
      return (
        roomNumber.includes(keyword) ||
        guestName.includes(keyword) ||
        stayCode.includes(keyword)
      );
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

    return (
      <div className="modal-overlay" onClick={this.handleOverlayClick}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Hóa Đơn - {selectedRoom?.guestName}</h2>
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
                onClick={() =>
                  this.loadInvoiceDetailsByStay(
                    invoiceData.stayId,
                    this.state.isHistoryModal,
                  )
                }
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
              <p>
                <strong>VAT (%):</strong> {invoiceData.vat}
              </p>
              <p>
                <strong>Tiền phòng:</strong>{" "}
                {this.formatCurrency(invoiceData.roomTotal)}
              </p>
              <p>
                <strong>Tiền dịch vụ:</strong>{" "}
                {this.formatCurrency(invoiceData.serviceTotal)}
              </p>
              <p>
                <strong>Tiền minibar:</strong>{" "}
                {this.formatCurrency(invoiceData.minibarTotal)}
              </p>
              <p>
                <strong>Tiền phạt:</strong>{" "}
                {this.formatCurrency(invoiceData.penaltyTotal)}
              </p>
              <p>
                <strong>Tạm tính:</strong>{" "}
                {this.formatCurrency(invoiceData.subtotal)}
              </p>
              <p>
                <strong>VAT:</strong>{" "}
                {this.formatCurrency(invoiceData.vatAmount)}
              </p>
              <p>
                <strong>Tổng thanh toán:</strong>{" "}
                {this.formatCurrency(invoiceData.total)}
              </p>

              <div style={{ marginTop: 16 }}>
                <button className="btn-secondary" onClick={this.closeModal}>
                  Đóng
                </button>
                <button
                  className="btn-primary"
                  onClick={() => window.print()}
                >
                  In hóa đơn
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  handlePageChangePending = (page) => {
    const { pendingRooms } = this.state;
    const totalPages = Math.ceil(pendingRooms.length / this.ITEMS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
      this.setState({ currentPagePending: page });
    }
  };

  handlePageChangeHistory = (page) => {
    const filteredHistory = this.getFilteredHistory();
    const totalPages = Math.ceil(filteredHistory.length / this.ITEMS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
      this.setState({ currentPageHistory: page });
    }
  };

  render() {
    const {
      pendingRooms,
      pendingLoading,
      pendingError,
      historyLoading,
      historyError,
      searchHistory,
      currentPagePending,
      currentPageHistory,
    } = this.state;
    const filteredHistory = this.getFilteredHistory();

    // Pagination for pending rooms
    const totalPagesPending = Math.ceil(pendingRooms.length / this.ITEMS_PER_PAGE);
    const startIndexPending = (currentPagePending - 1) * this.ITEMS_PER_PAGE;
    const endIndexPending = startIndexPending + this.ITEMS_PER_PAGE;
    const paginatedPendingRooms = pendingRooms.slice(startIndexPending, endIndexPending);

    // Pagination for history
    const totalPagesHistory = Math.ceil(filteredHistory.length / this.ITEMS_PER_PAGE);
    const startIndexHistory = (currentPageHistory - 1) * this.ITEMS_PER_PAGE;
    const endIndexHistory = startIndexHistory + this.ITEMS_PER_PAGE;
    const paginatedHistory = filteredHistory.slice(startIndexHistory, endIndexHistory);

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
                    <td colSpan="5">Đang tải danh sách chưa thanh toán...</td>
                  </tr>
                )}

                {!pendingLoading && pendingError && (
                  <tr>
                    <td colSpan="5">{pendingError}</td>
                  </tr>
                )}

                {!pendingLoading &&
                  !pendingError &&
                  pendingRooms.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        Không có khách check-out chưa thanh toán.
                      </td>
                    </tr>
                  )}

                {!pendingLoading &&
                  !pendingError &&
                  paginatedPendingRooms.map((room) => (
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
            {pendingRooms.length > 0 && (
              <div className="hoadon-pagination">
                <button
                  type="button"
                  className="hoadon-page-btn"
                  onClick={() => this.handlePageChangePending(currentPagePending - 1)}
                  disabled={currentPagePending === 1}
                  aria-label="Trang trước"
                >
                  ‹
                </button>

                {Array.from({ length: totalPagesPending }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`hoadon-page-btn ${page === currentPagePending ? "active" : ""}`}
                    onClick={() => this.handlePageChangePending(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="hoadon-page-btn"
                  onClick={() =>
                    this.handlePageChangePending(
                      Math.min(currentPagePending + 1, totalPagesPending)
                    )
                  }
                  disabled={currentPagePending === totalPagesPending}
                  aria-label="Trang sau"
                >
                  ›
                </button>
              </div>
            )}
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
                  <th>Mã lưu trú</th>
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
                {!historyLoading &&
                  !historyError &&
                  filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="5">Chưa có lịch sử hóa đơn.</td>
                    </tr>
                  )}
                {!historyLoading &&
                  !historyError &&
                  paginatedHistory.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => this.openInvoiceModal(inv, true)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{inv.stayCode}</td>
                      <td>{inv.guestName}</td>
                      <td>{inv.date}</td>
                      <td>{this.formatCurrency(inv.total)}</td>
                      <td>{inv.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {filteredHistory.length > 0 && (
              <div className="hoadon-pagination">
                <button
                  type="button"
                  className="hoadon-page-btn"
                  onClick={() => this.handlePageChangeHistory(currentPageHistory - 1)}
                  disabled={currentPageHistory === 1}
                  aria-label="Trang trước"
                >
                  ‹
                </button>

                {Array.from({ length: totalPagesHistory }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`hoadon-page-btn ${page === currentPageHistory ? "active" : ""}`}
                    onClick={() => this.handlePageChangeHistory(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="hoadon-page-btn"
                  onClick={() =>
                    this.handlePageChangeHistory(
                      Math.min(currentPageHistory + 1, totalPagesHistory)
                    )
                  }
                  disabled={currentPageHistory === totalPagesHistory}
                  aria-label="Trang sau"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>

        {this.renderModal()}
      </div>
    );
  }
}

export default Hoadon;