﻿import React, { Component } from "react";
import "../style/NhanTraphong.css";
import { FeatureHeader } from "./Common";
import { toast } from "react-toastify";

const RESERVATIONS_API_URL = "http://localhost:3000/api/reservations";
const WAITING_CHECKIN_CUSTOMERS_API_URL = `${RESERVATIONS_API_URL}/waiting-checkin-customers`;
const CURRENT_STAYING_CUSTOMERS_API_URL = `${RESERVATIONS_API_URL}/current-staying-customers`;
const CHECKIN_BY_RESERVATION_API_URL = `${RESERVATIONS_API_URL}/checkin/by-reservation`;
const CHECKIN_WALKIN_API_URL = `${RESERVATIONS_API_URL}/checkin/walkin`;
const CHECKOUT_ROOM_API_URL = `${RESERVATIONS_API_URL}/checkout-room`;
const TRANSFER_ROOM_API_URL = `${RESERVATIONS_API_URL}/transfer-room`;
const EXTEND_STAY_API_URL = (stayId) =>
  `${RESERVATIONS_API_URL}/stays/${stayId}/extend`;
const SERVICE_USAGES_BY_STAY_API_URL = (stayId) =>
  `${RESERVATIONS_API_URL}/stays/${stayId}/service-usages`;
const SERVICE_USAGE_BY_ID_API_URL = (usageId) =>
  `${RESERVATIONS_API_URL}/service-usages/${usageId}`;
const MINIBAR_USAGES_BY_STAY_API_URL = (stayId) =>
  `${RESERVATIONS_API_URL}/stays/${stayId}/minibar-usages`;
const MINIBAR_USAGE_BY_ID_API_URL = (usageId) =>
  `${RESERVATIONS_API_URL}/minibar-usages/${usageId}`;
const MINIBAR_ITEMS_BY_ROOM_API_URL = (roomId) =>
  `${RESERVATIONS_API_URL}/rooms/${roomId}/minibar-items`;
const PENALTIES_BY_STAY_API_URL = (stayId) =>
  `${RESERVATIONS_API_URL}/stays/${stayId}/penalties`;
const PENALTY_BY_ID_API_URL = (penaltyId) =>
  `${RESERVATIONS_API_URL}/penalties/${penaltyId}`;
const SERVICES_API_URL = "http://localhost:3000/api/services";
const ROOMS_API_URL = "http://localhost:3000/api/rooms";
const AVAILABLE_ROOMS_API_URL = `${ROOMS_API_URL}/available`;
const ROOM_TYPES_API_URL = "http://localhost:3000/api/room-types";

class NhanTraphong extends Component {
  createId = () => Date.now() + Math.floor(Math.random() * 1000);

  getDefaultServiceItem = () => ({
    id: this.createId(),
    usageId: null,
    serviceId: "",
    name: "",
    qty: 1,
    price: 0,
    total: 0,
    isDraft: true,
    isCreating: false,
    isUpdatingQty: false,
    isDeleting: false,
  });

  getDefaultServiceItems = () => [this.getDefaultServiceItem()];

  getDefaultMinibarItem = () => ({
    id: this.createId(),
    usageId: null,
    minibarId: "",
    name: "",
    qty: 1,
    price: 0,
    total: 0,
    isDraft: true,
    isCreating: false,
    isUpdatingQty: false,
    isDeleting: false,
  });

  getDefaultMinibarItems = () => [this.getDefaultMinibarItem()];

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
    await this.fetchServiceOptions();
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
    status: item?.Status ?? "",
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

  buildExpectedCheckoutDateTime = (value) => {
    const normalizedDate = this.formatDateForInput(value);
    if (!normalizedDate) return "";
    return `${normalizedDate}T12:00:00`;
  };

  normalizeServiceStatus = (status) =>
    String(status ?? "")
      .trim()
      .toUpperCase();

  isActiveServiceStatus = (status) => {
    if (typeof status === "boolean") return status;
    const normalized = this.normalizeServiceStatus(status);
    return ["TRUE", "ACTIVE", "1"].includes(normalized);
  };

  mapServiceOptionFromApi = (item) => {
    const serviceId = item?.ServiceID ?? item?.serviceId ?? item?.id ?? null;
    const parsedServiceId = Number(serviceId);
    const name = item?.ServiceName ?? item?.serviceName ?? item?.name ?? "";
    const priceRaw = Number(item?.Price ?? item?.price ?? 0);
    const price = Number.isFinite(priceRaw) ? priceRaw : 0;
    const status = item?.Status ?? item?.status ?? "TRUE";

    return {
      serviceId: Number.isFinite(parsedServiceId) ? parsedServiceId : null,
      name: String(name || "").trim(),
      price,
      status: this.normalizeServiceStatus(status),
      label: `${String(name || "").trim()} - ${price.toLocaleString("vi-VN")}đ`,
    };
  };

  fetchServiceOptions = async (showError = false) => {
    try {
      this.setState({ serviceCatalogLoading: true });

      const payload = await this.request(SERVICES_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const serviceOptions = rawItems
        .map(this.mapServiceOptionFromApi)
        .filter(
          (item) =>
            item.serviceId !== null &&
            item.name &&
            this.isActiveServiceStatus(item.status),
        )
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

      this.setState({ serviceOptions });
    } catch (err) {
      this.setState((prev) => ({
        serviceOptions: prev.serviceOptions,
      }));

      if (showError) {
        window.alert(err.message || "Không thể tải danh mục dịch vụ.");
      }
    } finally {
      this.setState({ serviceCatalogLoading: false });
    }
  };

  isTransferAvailableRoom = (status) => {
    const normalized = this.normalizeRoomStatus(status);
    return ["AVAILABLE", "VACANT", "EMPTY"].includes(normalized);
  };

  getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  isValidCheckoutDateForWalkin = (checkoutDate) => {
    if (!checkoutDate) return false;
    const tomorrow = this.getTomorrowDate();
    return checkoutDate >= tomorrow;
  };

  mapStayingFromApi = (item) => {
    const resolvedStayId =
      item?.StayID ??
      item?.StayId ??
      item?.stayId ??
      item?.ID ??
      item?.Id ??
      item?.id ??
      null;
    const roomNumber = item?.RoomNumber ? String(item.RoomNumber).trim() : "";
    const roomType = this.resolveRoomTypeName(item);
    const room = roomNumber
      ? `${roomNumber}${roomType && roomType !== "-" ? ` (${roomType})` : ""}`
      : item?.RoomID
        ? `Phòng #${item.RoomID}`
        : "-";

    return {
      id:
        resolvedStayId ??
        item?.ReservationID ??
        item?.RoomID ??
        this.createId(),
      stayId: resolvedStayId,
      reservationId: item?.ReservationID ?? null,
      roomId: item?.RoomID ?? item?.roomId ?? item?.RoomId ?? null,
      roomNumber,
      guest: item?.FullName ?? "",
      room,
      checkInTime: this.formatDateTimeForTable(item?.CheckInDate),
      checkOutPlan: this.formatDateTimeForTable(item?.CheckOutDate),
    };
  };

  extractRoomNumberToken = (value) => {
    if (!value) return "";
    const normalized = String(value).trim();
    if (!normalized) return "";

    const hashMatch = normalized.match(/#\s*([A-Za-z0-9-]+)/);
    if (hashMatch?.[1]) return hashMatch[1].trim();

    const phongPrefixMatch = normalized.match(
      /^ph[oòóỏõọôồốổỗộơờớởỡợ]ng\s+([^\s(]+)/i,
    );
    if (phongPrefixMatch?.[1]) return phongPrefixMatch[1].trim();

    const tokenMatch = normalized.match(/^([^\s(]+)/);
    if (tokenMatch?.[1]) return tokenMatch[1].trim();

    const numberMatch = normalized.match(/\d+/);
    return numberMatch?.[0] ? numberMatch[0].trim() : "";
  };

  resolveCheckoutRoomId = async (checkoutItem) => {
    const directRoomId = Number(
      checkoutItem?.roomId ?? checkoutItem?.RoomID ?? checkoutItem?.roomID,
    );
    if (Number.isInteger(directRoomId) && directRoomId > 0) return directRoomId;

    const roomNumber = this.extractRoomNumberToken(
      checkoutItem?.roomNumber ??
        checkoutItem?.RoomNumber ??
        checkoutItem?.room,
    );
    if (!roomNumber) return null;

    const payload = await this.request(ROOMS_API_URL);
    const rawItems = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    const normalizedRoomNumber = String(roomNumber).trim();
    const roomNumberAsNumber = Number(normalizedRoomNumber);

    const matchedRoom = rawItems.find((item) => {
      const apiRoomNumber = String(item?.RoomNumber ?? "").trim();
      if (!apiRoomNumber) return false;
      if (apiRoomNumber === normalizedRoomNumber) return true;

      const apiRoomNumberAsNumber = Number(apiRoomNumber);
      if (
        Number.isFinite(roomNumberAsNumber) &&
        Number.isFinite(apiRoomNumberAsNumber)
      ) {
        return apiRoomNumberAsNumber === roomNumberAsNumber;
      }

      return false;
    });
    const fallbackById =
      !matchedRoom && Number.isFinite(roomNumberAsNumber)
        ? rawItems.find(
            (item) =>
              Number(item?.RoomID ?? item?.roomId ?? item?.id ?? null) ===
              roomNumberAsNumber,
          )
        : null;
    const matchedRoomId = Number(
      (matchedRoom || fallbackById)?.RoomID ??
        (matchedRoom || fallbackById)?.roomId ??
        (matchedRoom || fallbackById)?.id ??
        null,
    );
    return Number.isInteger(matchedRoomId) && matchedRoomId > 0
      ? matchedRoomId
      : null;
  };

  normalizeServiceName = (value = "") =>
    String(value)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\u0111\u0110]/g, "d");

  findServiceOptionByName = (name) => {
    const normalizedName = this.normalizeServiceName(name);
    return this.state.serviceOptions.find(
      (option) => this.normalizeServiceName(option.name) === normalizedName,
    );
  };

  mapServiceUsageFromApi = (item) => {
    const usageId = item?.UsageID ?? item?.usageId ?? item?.id ?? null;
    const quantityRaw = Number(item?.Quantity ?? item?.quantity ?? 1);
    const qty =
      Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;
    const priceRaw = Number(item?.Price ?? item?.price ?? 0);
    const serviceName = item?.ServiceName ?? item?.serviceName ?? "";
    const matchedOption = this.findServiceOptionByName(serviceName);
    const price = Number.isFinite(priceRaw)
      ? priceRaw
      : matchedOption?.price || 0;
    const totalRaw = Number(item?.Total ?? item?.total ?? qty * price);
    const total = Number.isFinite(totalRaw) ? totalRaw : qty * price;

    return {
      id: usageId ?? this.createId(),
      usageId,
      serviceId: matchedOption ? String(matchedOption.serviceId) : "",
      name: serviceName || matchedOption?.name || "",
      qty,
      price,
      total,
      isDraft: false,
      isCreating: false,
      isUpdatingQty: false,
      isDeleting: false,
    };
  };

  fetchServiceUsagesByStay = async (stayId) => {
    if (!stayId) {
      this.setState({ serviceItems: [], serviceUsageLoading: false });
      return;
    }

    try {
      this.setState({ serviceUsageLoading: true, serviceItems: [] });

      const payload = await this.request(
        SERVICE_USAGES_BY_STAY_API_URL(stayId),
      );
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const serviceItems = rawItems.map(this.mapServiceUsageFromApi);

      this.setState((prev) => {
        const stillInServiceModal =
          prev.modalType === "service" &&
          String(prev.currentItem?.stayId ?? "") === String(stayId);

        if (!stillInServiceModal) return null;
        return { serviceItems };
      });
    } catch (err) {
      this.setState({ serviceItems: [] });
      window.alert(
        err.message || "Không thể tải danh sách dịch vụ đã sử dụng.",
      );
    } finally {
      this.setState({ serviceUsageLoading: false });
    }
  };

  normalizeMinibarName = (value = "") =>
    String(value)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\u0111\u0110]/g, "d");

  findMinibarOptionByMinibarId = (minibarId) => {
    const normalizedId = String(minibarId);
    return this.state.minibarOptions.find(
      (option) => String(option.minibarId) === normalizedId,
    );
  };

  findMinibarOptionByName = (name) => {
    const normalizedName = this.normalizeMinibarName(name);
    return this.state.minibarOptions.find(
      (option) => this.normalizeMinibarName(option.name) === normalizedName,
    );
  };

  mapMinibarOptionFromApi = (item) => {
    const minibarIdRaw =
      item?.MiniBarID ?? item?.MinibarID ?? item?.minibarId ?? item?.id ?? null;
    const parsedMinibarId = Number(minibarIdRaw);
    const name =
      item?.ItemName ?? item?.itemName ?? item?.Name ?? item?.name ?? "";
    const priceRaw = Number(item?.Price ?? item?.price ?? 0);
    const price = Number.isFinite(priceRaw) ? priceRaw : 0;
    const displayName = String(name || "").trim();

    return {
      minibarId: Number.isFinite(parsedMinibarId) ? parsedMinibarId : null,
      name: displayName,
      price,
      label: `${displayName} - ${price.toLocaleString("vi-VN")}đ`,
    };
  };

  mapMinibarUsageFromApi = (item) => {
    const usageId =
      item?.ID ?? item?.UsageID ?? item?.usageId ?? item?.id ?? null;
    const quantityRaw = Number(item?.Quantity ?? item?.quantity ?? 1);
    const qty =
      Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;
    const itemName = item?.ItemName ?? item?.itemName ?? "";
    const priceRaw = Number(item?.Price ?? item?.price ?? 0);
    const minibarIdRaw =
      item?.MiniBarID ?? item?.MinibarID ?? item?.minibarId ?? null;
    const parsedMinibarId = Number(minibarIdRaw);
    const minibarIdFromApi = Number.isFinite(parsedMinibarId)
      ? parsedMinibarId
      : null;
    const matchedById =
      minibarIdFromApi !== null
        ? this.findMinibarOptionByMinibarId(minibarIdFromApi)
        : null;
    const matchedByName = this.findMinibarOptionByName(itemName);
    const matchedOption = matchedById || matchedByName;
    const price = Number.isFinite(priceRaw)
      ? priceRaw
      : matchedOption?.price || 0;
    const totalRaw = Number(item?.Total ?? item?.total ?? qty * price);
    const total = Number.isFinite(totalRaw) ? totalRaw : qty * price;
    const minibarId = matchedOption?.minibarId ?? minibarIdFromApi;

    return {
      id: usageId ?? this.createId(),
      usageId,
      minibarId:
        minibarId !== null && minibarId !== undefined ? String(minibarId) : "",
      name: itemName || matchedOption?.name || "",
      qty,
      price,
      total,
      isDraft: false,
      isCreating: false,
      isUpdatingQty: false,
      isDeleting: false,
    };
  };

  fetchMinibarOptionsByRoom = async (
    roomId,
    showError = false,
    stayId = null,
  ) => {
    if (!roomId) {
      this.setState({ minibarOptions: [], minibarCatalogLoading: false });
      if (showError) {
        window.alert("Không tìm thấy RoomID để tải danh mục minibar.");
      }
      return;
    }

    try {
      this.setState({ minibarCatalogLoading: true, minibarOptions: [] });

      const payload = await this.request(MINIBAR_ITEMS_BY_ROOM_API_URL(roomId));
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const minibarOptions = rawItems
        .map(this.mapMinibarOptionFromApi)
        .filter((item) => item.minibarId !== null && item.name)
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

      this.setState((prev) => {
        const stillInCheckoutModal =
          prev.modalType === "checkout" &&
          (stayId === null ||
            String(prev.currentItem?.stayId ?? "") === String(stayId));

        if (!stillInCheckoutModal) return null;
        return { minibarOptions };
      });
    } catch (err) {
      this.setState({ minibarOptions: [] });
      if (showError) {
        window.alert(
          err.message || "Không thể tải danh mục minibar theo phòng.",
        );
      }
    } finally {
      this.setState({ minibarCatalogLoading: false });
    }
  };

  loadCheckoutMinibarData = async (checkoutItem) => {
    const stayId = checkoutItem?.stayId ?? null;

    try {
      const roomId = await this.resolveCheckoutRoomId(checkoutItem);
      await this.fetchMinibarOptionsByRoom(roomId, true, stayId);
    } catch (err) {
      this.setState({
        minibarCatalogLoading: false,
        minibarOptions: [],
      });
      window.alert(err.message || "Không thể tải danh mục minibar theo phòng.");
    } finally {
      await this.fetchMinibarUsagesByStay(stayId);
    }
  };

  fetchMinibarUsagesByStay = async (stayId) => {
    if (!stayId) {
      this.setState({ minibarItems: [], minibarUsageLoading: false });
      return;
    }

    try {
      this.setState({ minibarUsageLoading: true, minibarItems: [] });

      const payload = await this.request(
        MINIBAR_USAGES_BY_STAY_API_URL(stayId),
      );
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const minibarItems = rawItems.map(this.mapMinibarUsageFromApi);

      this.setState((prev) => {
        const stillInCheckoutModal =
          prev.modalType === "checkout" &&
          String(prev.currentItem?.stayId ?? "") === String(stayId);

        if (!stillInCheckoutModal) return null;
        return { minibarItems };
      });
    } catch (err) {
      this.setState({ minibarItems: [] });
      window.alert(
        err.message || "Không thể tải danh sách minibar đã sử dụng.",
      );
    } finally {
      this.setState({ minibarUsageLoading: false });
    }
  };

  createMinibarUsage = async (stayId, minibarId, quantity) => {
    const requestBodies = [
      { MinibarID: minibarId, Quantity: quantity },
      { MiniBarID: minibarId, Quantity: quantity },
      { minibarId, quantity },
    ];

    let lastError = null;

    for (const body of requestBodies) {
      try {
        await this.request(MINIBAR_USAGES_BY_STAY_API_URL(stayId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("Thêm minibar thất bại.");
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

  fetchWalkinAvailableRooms = async (checkOutDate) => {
    const expectedCheckOut = this.buildExpectedCheckoutDateTime(checkOutDate);

    if (!expectedCheckOut) {
      this.setState((prev) => ({
        walkinRoomsLoading: false,
        walkinAvailableRooms: [],
        walkInForm: { ...prev.walkInForm, roomId: "" },
      }));
      return;
    }

    try {
      this.setState({
        walkinRoomsLoading: true,
        walkinAvailableRooms: [],
      });

      const payload = await this.request(
        `${AVAILABLE_ROOMS_API_URL}?ExpectedCheckOut=${encodeURIComponent(expectedCheckOut)}`,
      );
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const walkinAvailableRooms = rawItems
        .filter((item) =>
          item?.Status ? this.isWalkinAvailableRoom(item?.Status) : true,
        )
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
      window.alert(
        err.message ||
          "Không thể tải danh sách phòng trống theo ngày trả phòng dự kiến.",
      );
    } finally {
      this.setState({ walkinRoomsLoading: false });
    }
  };

  fetchTransferAvailableRooms = async (oldRoomId) => {
    try {
      this.setState({
        transferRoomsLoading: true,
        transferAvailableRooms: [],
        transferRoom: "",
      });

      const payload = await this.request(ROOMS_API_URL);
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const transferAvailableRooms = rawItems
        .filter((item) => this.isTransferAvailableRoom(item?.Status))
        .map(this.mapRoomFromApi)
        .filter(
          (room) =>
            room.roomId !== null && String(room.roomId) !== String(oldRoomId),
        )
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
        const stillInTransferModal =
          prev.modalType === "transfer" &&
          String(prev.currentItem?.roomId ?? "") === String(oldRoomId ?? "");

        if (!stillInTransferModal) return null;

        return {
          transferAvailableRooms,
          transferRoom: transferAvailableRooms[0]
            ? String(transferAvailableRooms[0].roomId)
            : "",
        };
      });
    } catch (err) {
      this.setState({
        transferAvailableRooms: [],
        transferRoom: "",
      });
      window.alert(
        err.message || "Không thể tải danh sách phòng khả dụng để chuyển.",
      );
    } finally {
      this.setState({ transferRoomsLoading: false });
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

    if (!this.isValidCheckoutDateForWalkin(expectedCheckOut)) {
      window.alert("Ngày checkout phải từ hôm sau trở đi.");
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

      toast.success(
        response?.Message ||
          response?.message ||
          "Check-in walk-in thành công.",
      );

      this.closeModal();
      await this.fetchCurrentStayingCustomers();
    } catch (err) {
      toast.error(err.message || "Check-in walk-in thất bại.");
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

      toast.success(
        response?.Message || response?.message || "Check-in thành công.",
      );

      this.closeModal();
      await Promise.all([
        this.fetchWaitingCheckinCustomers(),
        this.fetchCurrentStayingCustomers(),
      ]);
    } catch (err) {
      toast.error(err.message || "Check-in thất bại.");
    } finally {
      this.setState({ checkinSubmitting: false });
    }
  };

  confirmTransfer = async () => {
    const { currentItem, transferRoom } = this.state;

    if (!currentItem?.stayId) {
      toast.error("Không tìm thấy StayID để thực hiện chuyển phòng.");
      return;
    }

    if (!currentItem?.roomId) {
      window.alert("Không tìm thấy RoomID phòng hiện tại.");
      return;
    }

    if (!transferRoom) {
      window.alert("Vui lòng chọn phòng mới.");
      return;
    }

    const stayId = Number(currentItem.stayId);
    const oldRoomId = Number(currentItem.roomId);
    const newRoomId = Number(transferRoom);

    if (!Number.isInteger(stayId) || stayId < 1) {
      window.alert("StayID không hợp lệ.");
      return;
    }

    if (!Number.isInteger(oldRoomId) || oldRoomId < 1) {
      window.alert("OldRoomID không hợp lệ.");
      return;
    }

    if (!Number.isInteger(newRoomId) || newRoomId < 1) {
      window.alert("NewRoomID không hợp lệ.");
      return;
    }

    if (oldRoomId === newRoomId) {
      window.alert("Phòng mới phải khác phòng hiện tại.");
      return;
    }

    try {
      this.setState({ transferSubmitting: true });
      const response = await this.request(TRANSFER_ROOM_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          StayID: stayId,
          OldRoomID: oldRoomId,
          NewRoomID: newRoomId,
        }),
      });

      toast.success(
        response?.Message || response?.message || "Chuyển phòng thành công.",
      );

      this.closeModal();
      await this.fetchCurrentStayingCustomers();
    } catch (err) {
      toast.error(err.message || "Chuyển phòng thất bại.");
    } finally {
      this.setState({ transferSubmitting: false });
    }
  };

  confirmExtend = async () => {
    const { currentItem, extendForm } = this.state;

    if (!currentItem?.stayId) {
      window.alert("Không tìm thấy StayID để thực hiện gia hạn.");
      return;
    }

    if (!extendForm.newCheckOut) {
      window.alert("Vui lòng chọn ngày Check-out mới.");
      return;
    }

    const currentDate = this.extractInputDateFromPlan(
      currentItem?.checkOutPlan,
    );
    if (currentDate && extendForm.newCheckOut <= currentDate) {
      window.alert("Ngày Check-out mới phải lớn hơn ngày dự kiến hiện tại.");
      return;
    }

    const stayId = Number(currentItem.stayId);
    if (!Number.isInteger(stayId) || stayId < 1) {
      window.alert("StayID không hợp lệ.");
      return;
    }

    try {
      this.setState({ extendSubmitting: true });
      const response = await this.request(EXTEND_STAY_API_URL(stayId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NewCheckOut: extendForm.newCheckOut,
        }),
      });

      toast.success(
        response?.Message || response?.message || "Gia hạn lưu trú thành công.",
      );

      this.closeModal();
      await this.fetchCurrentStayingCustomers();
    } catch (err) {
      toast.error(err.message || "Gia hạn lưu trú thất bại.");
    } finally {
      this.setState({ extendSubmitting: false });
    }
  };

  confirmCheckout = async () => {
    const { currentItem, checkoutSubmitting } = this.state;

    if (checkoutSubmitting) return;

    const stayId = Number(
      currentItem?.stayId ??
        currentItem?.StayID ??
        currentItem?.stayID ??
        currentItem?.StayId,
    );

    if (!Number.isInteger(stayId) || stayId < 1) {
      window.alert("Không tìm thấy StayID hợp lệ để check-out.");
      return;
    }

    try {
      this.setState({ checkoutSubmitting: true });

      const roomId = await this.resolveCheckoutRoomId(currentItem);
      if (!Number.isInteger(roomId) || roomId < 1) {
        window.alert("Không tìm thấy RoomID hợp lệ để check-out.");
        return;
      }

      const response = await this.request(CHECKOUT_ROOM_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          StayID: stayId,
          RoomID: roomId,
        }),
      });

      toast.success(
        response?.Message || response?.message || "Check-out phòng thành công.",
      );

      this.closeModal();
      await this.fetchCurrentStayingCustomers();
    } catch (err) {
      toast.error(err.message || "Check-out phòng thất bại.");
    } finally {
      this.setState({ checkoutSubmitting: false });
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
    transferAvailableRooms: [],
    transferRoomsLoading: false,
    serviceUsageLoading: false,
    serviceCatalogLoading: false,
    serviceOptions: [],
    minibarUsageLoading: false,
    minibarCatalogLoading: false,
    minibarOptions: [],
    penaltyLoading: false,
    penaltyAdding: false,
    selectedCheckinRoomId: "",
    checkinSubmitting: false,
    walkinSubmitting: false,
    transferSubmitting: false,
    extendSubmitting: false,
    checkoutSubmitting: false,
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
    minibarItems: this.getDefaultMinibarItems(),
    serviceItems: this.getDefaultServiceItems(),
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
      nextState.serviceItems = [];
      nextState.serviceUsageLoading = true;
      nextState.serviceCatalogLoading = true;
    }

    if (type === "walkin") {
      nextState.walkinAvailableRooms = [];
      nextState.walkinRoomsLoading = false;
      nextState.walkInForm = { ...this.state.walkInForm, roomId: "" };
    }

    if (type === "checkin") {
      nextState.availableRooms = [];
      nextState.availableRoomsLoading = true;
      nextState.selectedCheckinRoomId = "";
    }

    if (type === "transfer") {
      nextState.transferAvailableRooms = [];
      nextState.transferRoomsLoading = true;
      nextState.transferRoom = "";
    }

    if (type === "checkout") {
      nextState.minibarItems = [];
      nextState.minibarUsageLoading = true;
      nextState.minibarCatalogLoading = true;
      nextState.minibarOptions = [];
      nextState.penalties = [];
      nextState.newPenalty = { reason: "", amount: "" };
      nextState.penaltyLoading = true;
      nextState.penaltyAdding = false;
    }

    this.setState(nextState);

    if (type === "checkin" && item?.reservationId) {
      this.fetchAvailableRoomsForCheckin(item.reservationId);
    }

    if (type === "transfer") {
      this.fetchTransferAvailableRooms(item?.roomId);
    }

    if (type === "service") {
      this.fetchServiceOptions(true);
      this.fetchServiceUsagesByStay(item?.stayId);
    }

    if (type === "checkout") {
      this.loadCheckoutMinibarData(item);
      this.fetchPenaltiesByStay(item?.stayId);
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
      transferAvailableRooms: [],
      transferRoomsLoading: false,
      serviceUsageLoading: false,
      serviceCatalogLoading: false,
      minibarUsageLoading: false,
      minibarCatalogLoading: false,
      minibarOptions: [],
      penaltyLoading: false,
      penaltyAdding: false,
      selectedCheckinRoomId: "",
      checkinSubmitting: false,
      walkinSubmitting: false,
      transferSubmitting: false,
      extendSubmitting: false,
      checkoutSubmitting: false,
    });
  };

  handleWalkInInput = (field) => (e) => {
    const value = e.target.value;

    if (field !== "checkOut") {
      this.setState((prev) => ({
        walkInForm: { ...prev.walkInForm, [field]: value },
      }));
      return;
    }

    // Validate checkout date must be at least tomorrow
    if (value && !this.isValidCheckoutDateForWalkin(value)) {
      window.alert("Ngày checkout phải từ hôm sau trở đi.");
      return;
    }

    this.setState(
      (prev) => ({
        walkInForm: { ...prev.walkInForm, checkOut: value, roomId: "" },
        walkinAvailableRooms: value ? prev.walkinAvailableRooms : [],
      }),
      () => {
        this.fetchWalkinAvailableRooms(value);
      },
    );
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
    const {
      modalType,
      minibarUsageLoading,
      minibarCatalogLoading,
      minibarOptions,
      minibarItems,
    } = this.state;

    if (modalType !== "checkout") return;

    if (minibarUsageLoading || minibarCatalogLoading) {
      window.alert(
        "Danh sách minibar đang tải, vui lòng thử lại sau vài giây.",
      );
      return;
    }

    if (!Array.isArray(minibarOptions) || minibarOptions.length === 0) {
      window.alert("Chưa có danh mục minibar cho phòng này nên chưa thể thêm.");
      return;
    }

    const hasPendingDraft = minibarItems.some(
      (item) =>
        item.isDraft && !item.minibarId && !item.isCreating && !item.isDeleting,
    );
    if (hasPendingDraft) {
      window.alert(
        "Vui lòng chọn minibar ở dòng hiện tại trước khi thêm dòng mới.",
      );
      return;
    }

    this.setState((prev) => ({
      minibarItems: [...prev.minibarItems, this.getDefaultMinibarItem()],
    }));
  };

  updateMinibarItem = async (id, field, value) => {
    const { currentItem, minibarItems, minibarOptions } = this.state;
    const targetItem = minibarItems.find((item) => item.id === id);
    const stayId = Number(currentItem?.stayId);

    if (!targetItem) return;

    if (field === "minibarId") {
      if (!targetItem.isDraft || targetItem.isCreating || targetItem.usageId) {
        return;
      }

      const selected = minibarOptions.find(
        (option) => String(option.minibarId) === String(value),
      );
      if (!selected) {
        window.alert("Minibar đã chọn không hợp lệ.");
        return;
      }

      const quantity = Math.max(1, Number(targetItem.qty) || 1);
      if (!Number.isInteger(stayId) || stayId < 1) {
        window.alert("Không tìm thấy StayID để thêm minibar.");
        return;
      }

      this.setState((prev) => ({
        minibarItems: prev.minibarItems.map((item) =>
          item.id === id
            ? {
                ...item,
                minibarId: String(selected.minibarId),
                name: selected.name,
                price: selected.price,
                total: quantity * selected.price,
                qty: quantity,
                isCreating: true,
              }
            : item,
        ),
      }));

      try {
        await this.createMinibarUsage(
          stayId,
          Number(selected.minibarId),
          quantity,
        );

        await this.fetchMinibarUsagesByStay(stayId);
      } catch (err) {
        this.setState((prev) => ({
          minibarItems: prev.minibarItems.map((item) =>
            item.id === id ? { ...item, isCreating: false } : item,
          ),
        }));
        window.alert(err.message || "Thêm minibar thất bại.");
      }
      return;
    }

    if (field === "qty") {
      const nextQty = Math.max(1, Number(value) || 1);
      const previousQty = Math.max(1, Number(targetItem.qty) || 1);

      this.setState((prev) => ({
        minibarItems: prev.minibarItems.map((item) =>
          item.id === id
            ? {
                ...item,
                qty: nextQty,
                total: Number(item.price || 0) * nextQty,
              }
            : item,
        ),
      }));

      if (targetItem.isDraft || !targetItem.usageId) return;

      if (!Number.isInteger(stayId) || stayId < 1) {
        this.setState((prev) => ({
          minibarItems: prev.minibarItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  qty: previousQty,
                  total: Number(item.price || 0) * previousQty,
                }
              : item,
          ),
        }));
        window.alert("Không tìm thấy StayID để cập nhật minibar.");
        return;
      }

      if (targetItem.isUpdatingQty || targetItem.isDeleting) return;

      this.setState((prev) => ({
        minibarItems: prev.minibarItems.map((item) =>
          item.id === id ? { ...item, isUpdatingQty: true } : item,
        ),
      }));

      try {
        await this.request(MINIBAR_USAGE_BY_ID_API_URL(targetItem.usageId), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Quantity: nextQty }),
        });

        await this.fetchMinibarUsagesByStay(stayId);
      } catch (err) {
        this.setState((prev) => ({
          minibarItems: prev.minibarItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  qty: previousQty,
                  total: Number(item.price || 0) * previousQty,
                }
              : item,
          ),
        }));
        window.alert(err.message || "Cập nhật số lượng minibar thất bại.");
      } finally {
        this.setState((prev) => ({
          minibarItems: prev.minibarItems.map((item) =>
            item.id === id ? { ...item, isUpdatingQty: false } : item,
          ),
        }));
      }
    }
  };

  removeMinibarItem = async (id) => {
    const { currentItem, minibarItems } = this.state;
    const targetItem = minibarItems.find((item) => item.id === id);
    const stayId = Number(currentItem?.stayId);

    if (!targetItem) return;

    if (!targetItem.usageId || targetItem.isDraft) {
      this.setState((prev) => ({
        minibarItems: prev.minibarItems.filter((item) => item.id !== id),
      }));
      return;
    }

    if (targetItem.isDeleting) return;

    this.setState((prev) => ({
      minibarItems: prev.minibarItems.map((item) =>
        item.id === id ? { ...item, isDeleting: true } : item,
      ),
    }));

    try {
      await this.request(MINIBAR_USAGE_BY_ID_API_URL(targetItem.usageId), {
        method: "DELETE",
      });

      if (Number.isInteger(stayId) && stayId > 0) {
        await this.fetchMinibarUsagesByStay(stayId);
      } else {
        this.setState((prev) => ({
          minibarItems: prev.minibarItems.filter((item) => item.id !== id),
        }));
      }
    } catch (err) {
      this.setState((prev) => ({
        minibarItems: prev.minibarItems.map((item) =>
          item.id === id ? { ...item, isDeleting: false } : item,
        ),
      }));
      window.alert(err.message || "Xóa minibar thất bại.");
    }
  };

  addServiceItem = () => {
    this.setState((prev) => ({
      serviceItems: [...prev.serviceItems, this.getDefaultServiceItem()],
    }));
  };

  updateServiceItem = async (id, field, value) => {
    const { currentItem, serviceItems } = this.state;
    const targetItem = serviceItems.find((item) => item.id === id);
    const stayId = Number(currentItem?.stayId);

    if (!targetItem) return;

    if (field === "name") {
      if (!targetItem.isDraft || targetItem.isCreating || targetItem.usageId) {
        return;
      }

      const selected = this.findServiceOptionByName(value);
      if (!selected) {
        window.alert("Dịch vụ đã chọn không hợp lệ.");
        return;
      }

      const quantity = Math.max(1, Number(targetItem.qty) || 1);
      if (!Number.isInteger(stayId) || stayId < 1) {
        window.alert("Không tìm thấy StayID để thêm dịch vụ.");
        return;
      }

      this.setState((prev) => ({
        serviceItems: prev.serviceItems.map((item) =>
          item.id === id
            ? {
                ...item,
                name: selected.name,
                serviceId: String(selected.serviceId),
                price: selected.price,
                total: quantity * selected.price,
                qty: quantity,
                isCreating: true,
              }
            : item,
        ),
      }));

      try {
        await this.request(SERVICE_USAGES_BY_STAY_API_URL(stayId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ServiceID: Number(selected.serviceId),
            Quantity: quantity,
          }),
        });

        await this.fetchServiceUsagesByStay(stayId);
      } catch (err) {
        this.setState((prev) => ({
          serviceItems: prev.serviceItems.map((item) =>
            item.id === id ? { ...item, isCreating: false } : item,
          ),
        }));
        window.alert(err.message || "Thêm dịch vụ thất bại.");
      }
      return;
    }

    if (field === "qty") {
      const nextQty = Math.max(1, Number(value) || 1);
      const previousQty = Math.max(1, Number(targetItem.qty) || 1);

      this.setState((prev) => ({
        serviceItems: prev.serviceItems.map((item) =>
          item.id === id
            ? {
                ...item,
                qty: nextQty,
                total: Number(item.price || 0) * nextQty,
              }
            : item,
        ),
      }));

      if (targetItem.isDraft || !targetItem.usageId) return;

      if (!Number.isInteger(stayId) || stayId < 1) {
        this.setState((prev) => ({
          serviceItems: prev.serviceItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  qty: previousQty,
                  total: Number(item.price || 0) * previousQty,
                }
              : item,
          ),
        }));
        window.alert("Không tìm thấy StayID để cập nhật dịch vụ.");
        return;
      }

      if (targetItem.isUpdatingQty || targetItem.isDeleting) return;

      this.setState((prev) => ({
        serviceItems: prev.serviceItems.map((item) =>
          item.id === id ? { ...item, isUpdatingQty: true } : item,
        ),
      }));

      try {
        await this.request(SERVICE_USAGE_BY_ID_API_URL(targetItem.usageId), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Quantity: nextQty }),
        });

        await this.fetchServiceUsagesByStay(stayId);
      } catch (err) {
        this.setState((prev) => ({
          serviceItems: prev.serviceItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  qty: previousQty,
                  total: Number(item.price || 0) * previousQty,
                }
              : item,
          ),
        }));
        window.alert(err.message || "Cập nhật số lượng dịch vụ thất bại.");
      } finally {
        this.setState((prev) => ({
          serviceItems: prev.serviceItems.map((item) =>
            item.id === id ? { ...item, isUpdatingQty: false } : item,
          ),
        }));
      }
    }
  };

  removeServiceItem = async (id) => {
    const { currentItem, serviceItems } = this.state;
    const targetItem = serviceItems.find((item) => item.id === id);
    const stayId = Number(currentItem?.stayId);

    if (!targetItem) return;

    if (!targetItem.usageId || targetItem.isDraft) {
      this.setState((prev) => ({
        serviceItems: prev.serviceItems.filter((item) => item.id !== id),
      }));
      return;
    }

    if (targetItem.isDeleting) return;

    this.setState((prev) => ({
      serviceItems: prev.serviceItems.map((item) =>
        item.id === id ? { ...item, isDeleting: true } : item,
      ),
    }));

    try {
      await this.request(SERVICE_USAGE_BY_ID_API_URL(targetItem.usageId), {
        method: "DELETE",
      });

      if (Number.isInteger(stayId) && stayId > 0) {
        await this.fetchServiceUsagesByStay(stayId);
      } else {
        this.setState((prev) => ({
          serviceItems: prev.serviceItems.filter((item) => item.id !== id),
        }));
      }
    } catch (err) {
      this.setState((prev) => ({
        serviceItems: prev.serviceItems.map((item) =>
          item.id === id ? { ...item, isDeleting: false } : item,
        ),
      }));
      window.alert(err.message || "Xóa dịch vụ thất bại.");
    }
  };

  mapPenaltyFromApi = (item) => {
    const penaltyIdRaw =
      item?.PenaltyID ??
      item?.PenaltyId ??
      item?.penaltyId ??
      item?.ID ??
      item?.id;
    const parsedPenaltyId = Number(penaltyIdRaw);
    const amountRaw = Number(item?.Amount ?? item?.amount ?? 0);
    const amount = Number.isFinite(amountRaw) ? amountRaw : 0;

    return {
      id: Number.isFinite(parsedPenaltyId) ? parsedPenaltyId : this.createId(),
      penaltyId: Number.isFinite(parsedPenaltyId) ? parsedPenaltyId : null,
      reason: item?.Reason ?? item?.reason ?? "",
      amount,
      createdAt: item?.CreatedAt ?? item?.createdAt ?? null,
      isDeleting: false,
    };
  };

  fetchPenaltiesByStay = async (stayId) => {
    if (!stayId) {
      this.setState({ penalties: [], penaltyLoading: false });
      return;
    }

    try {
      this.setState({ penaltyLoading: true, penalties: [] });

      const payload = await this.request(PENALTIES_BY_STAY_API_URL(stayId));
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const penalties = rawItems.map(this.mapPenaltyFromApi);

      this.setState((prev) => {
        const stillInCheckoutModal =
          prev.modalType === "checkout" &&
          String(prev.currentItem?.stayId ?? "") === String(stayId);

        if (!stillInCheckoutModal) return null;
        return { penalties };
      });
    } catch (err) {
      this.setState({ penalties: [] });
      window.alert(err.message || "Không thể tải danh sách phí phạt.");
    } finally {
      this.setState({ penaltyLoading: false });
    }
  };

  createPenalty = async (stayId, reason, amount) => {
    const requestBodies = [
      { Reason: reason, Amount: amount },
      { reason, amount },
    ];

    let lastError = null;
    for (const body of requestBodies) {
      try {
        await this.request(PENALTIES_BY_STAY_API_URL(stayId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("Thêm phí phạt thất bại.");
  };

  addPenalty = async () => {
    const { newPenalty, currentItem, penaltyAdding } = this.state;
    const reason = String(newPenalty.reason || "").trim();
    const amount = Number(newPenalty.amount);
    const stayId = Number(currentItem?.stayId);

    if (penaltyAdding) return;

    if (!reason) {
      window.alert("Vui lòng nhập lý do phạt.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Số tiền phạt không hợp lệ.");
      return;
    }

    if (!Number.isInteger(stayId) || stayId < 1) {
      window.alert("Không tìm thấy StayID để thêm phí phạt.");
      return;
    }

    try {
      this.setState({ penaltyAdding: true });
      await this.createPenalty(stayId, reason, amount);
      await this.fetchPenaltiesByStay(stayId);
      this.setState({ newPenalty: { reason: "", amount: "" } });
    } catch (err) {
      window.alert(err.message || "Thêm phí phạt thất bại.");
    } finally {
      this.setState({ penaltyAdding: false });
    }
  };

  removePenalty = async (id) => {
    const { penalties, currentItem } = this.state;
    const targetPenalty = penalties.find((item) => item.id === id);
    const stayId = Number(currentItem?.stayId);

    if (!targetPenalty) return;
    if (targetPenalty.isDeleting) return;

    if (!targetPenalty.penaltyId) {
      this.setState((prev) => ({
        penalties: prev.penalties.filter((p) => p.id !== id),
      }));
      return;
    }

    this.setState((prev) => ({
      penalties: prev.penalties.map((item) =>
        item.id === id ? { ...item, isDeleting: true } : item,
      ),
    }));

    try {
      await this.request(PENALTY_BY_ID_API_URL(targetPenalty.penaltyId), {
        method: "DELETE",
      });

      if (Number.isInteger(stayId) && stayId > 0) {
        await this.fetchPenaltiesByStay(stayId);
      } else {
        this.setState((prev) => ({
          penalties: prev.penalties.filter((item) => item.id !== id),
        }));
      }
    } catch (err) {
      this.setState((prev) => ({
        penalties: prev.penalties.map((item) =>
          item.id === id ? { ...item, isDeleting: false } : item,
        ),
      }));
      window.alert(err.message || "Xóa phí phạt thất bại.");
    }
  };

  changeTab = (tab) => this.setState({ activeTab: tab });

  handleConfirmModal = () => {
    const { modalType } = this.state;

    if (modalType === "walkin") {
      this.confirmWalkin();
      return;
    }

    if (modalType === "checkin") {
      this.confirmCheckin();
      return;
    }

    if (modalType === "transfer") {
      this.confirmTransfer();
      return;
    }

    if (modalType === "extend") {
      this.confirmExtend();
      return;
    }

    if (modalType === "checkout") {
      this.confirmCheckout();
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
      minibarUsageLoading,
      minibarCatalogLoading,
      minibarOptions,
      serviceItems,
      newPenalty,
      penalties,
      penaltyLoading,
      penaltyAdding,
      availableRooms,
      availableRoomsLoading,
      walkinAvailableRooms,
      walkinRoomsLoading,
      transferAvailableRooms,
      transferRoomsLoading,
      serviceUsageLoading,
      serviceCatalogLoading,
      serviceOptions,
      selectedCheckinRoomId,
      checkinSubmitting,
      walkinSubmitting,
      transferSubmitting,
      extendSubmitting,
      checkoutSubmitting,
    } = this.state;

    if (!modalType) return null;

    const overlayClick = (e) => {
      if (e.target.classList.contains("nhan-modal-overlay")) this.closeModal();
    };

    const subtotal = minibarItems.reduce((sum, i) => {
      const rowTotal = Number(i.total);
      if (Number.isFinite(rowTotal) && rowTotal >= 0) return sum + rowTotal;
      return sum + Number(i.qty || 0) * Number(i.price || 0);
    }, 0);
    const penaltyTotal = penalties.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const serviceTotal = serviceItems.reduce((sum, i) => {
      const rowTotal = Number(i.total);
      if (Number.isFinite(rowTotal) && rowTotal >= 0) return sum + rowTotal;
      return sum + Number(i.qty || 0) * Number(i.price || 0);
    }, 0);
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
    const disableTransferConfirm =
      modalType === "transfer" &&
      (transferSubmitting || transferRoomsLoading || !transferRoom);
    const disableExtendConfirm =
      modalType === "extend" && (extendSubmitting || !extendForm.newCheckOut);
    const disableCheckoutConfirm =
      modalType === "checkout" && checkoutSubmitting;
    const disableModalConfirm =
      disableCheckinConfirm ||
      disableWalkinConfirm ||
      disableTransferConfirm ||
      disableExtendConfirm ||
      disableCheckoutConfirm;

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
                  disabled={
                    walkinRoomsLoading ||
                    walkinSubmitting ||
                    !walkInForm.checkOut
                  }
                >
                  <option value="">
                    {!walkInForm.checkOut
                      ? "Chọn ngày trả phòng trước"
                      : walkinRoomsLoading
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
                {!walkInForm.checkOut && (
                  <small>
                    Vui lòng chọn ngày trả phòng dự kiến để tải phòng trống.
                  </small>
                )}
                {walkInForm.checkOut &&
                  !walkinRoomsLoading &&
                  walkinAvailableRooms.length === 0 && (
                    <small>Hiện không có phòng trống để walk-in.</small>
                  )}
              </div>
              <div className="ntp-field">
                <label>Ngày trả phòng dự kiến *</label>
                <input
                  type="date"
                  min={this.getTomorrowDate()}
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
                  disabled={transferRoomsLoading || transferSubmitting}
                >
                  <option value="">
                    {transferRoomsLoading
                      ? "Đang tải phòng khả dụng..."
                      : "Chọn phòng mới"}
                  </option>
                  {transferAvailableRooms.map((room) => (
                    <option key={room.roomId} value={room.roomId}>
                      {room.roomNumber
                        ? `${room.roomNumber}${room.roomType ? ` (${room.roomType})` : ""}`
                        : `Phòng #${room.roomId}`}
                    </option>
                  ))}
                </select>
                {!transferRoomsLoading &&
                  transferAvailableRooms.length === 0 && (
                    <small>Không có phòng trống để chuyển.</small>
                  )}
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
              {serviceCatalogLoading && (
                <div className="ntp-note-box">Đang tải danh mục dịch vụ...</div>
              )}
              {!serviceCatalogLoading && serviceOptions.length === 0 && (
                <div className="ntp-note-box">
                  Không có dịch vụ khả dụng trong danh mục.
                </div>
              )}
              {serviceUsageLoading && (
                <div className="ntp-note-box">
                  Đang tải danh sách dịch vụ đã sử dụng...
                </div>
              )}
              {!serviceUsageLoading && serviceItems.length === 0 && (
                <div className="ntp-note-box">
                  Chưa có dịch vụ nào được ghi nhận.
                </div>
              )}
              {serviceItems.map((item) => (
                <div key={item.id} className="ntp-minibar-row">
                  <select
                    value={item.name}
                    onChange={(e) =>
                      this.updateServiceItem(item.id, "name", e.target.value)
                    }
                    disabled={
                      !item.isDraft ||
                      item.isCreating ||
                      item.isDeleting ||
                      serviceCatalogLoading ||
                      serviceOptions.length === 0
                    }
                  >
                    <option value="">Chọn dịch vụ</option>
                    {serviceOptions.map((service) => (
                      <option key={service.serviceId} value={service.name}>
                        {service.label || service.name}
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
                    disabled={
                      item.isCreating ||
                      item.isUpdatingQty ||
                      item.isDeleting ||
                      !item.name
                    }
                  />
                  <button
                    className="ntp-btn-danger"
                    onClick={() => this.removeServiceItem(item.id)}
                    disabled={
                      item.isCreating || item.isUpdatingQty || item.isDeleting
                    }
                  >
                    {item.isDeleting ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              ))}
              <button
                className="ntp-btn ntp-btn-secondary ntp-btn-add"
                onClick={this.addServiceItem}
                disabled={
                  serviceUsageLoading ||
                  serviceCatalogLoading ||
                  serviceOptions.length === 0
                }
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
              {minibarCatalogLoading && (
                <div className="ntp-note-box">
                  Đang tải danh mục minibar theo phòng...
                </div>
              )}
              {!minibarCatalogLoading && minibarOptions.length === 0 && (
                <div className="ntp-note-box">
                  Không có minibar khả dụng cho phòng này.
                </div>
              )}
              {minibarUsageLoading && (
                <div className="ntp-note-box">
                  Đang tải danh sách minibar đã sử dụng...
                </div>
              )}
              {!minibarUsageLoading && minibarItems.length === 0 && (
                <div className="ntp-note-box">
                  Chưa có minibar nào được ghi nhận.
                </div>
              )}
              {minibarItems.map((item) => (
                <div key={item.id} className="ntp-minibar-row">
                  <select
                    value={item.minibarId}
                    onChange={(e) =>
                      this.updateMinibarItem(
                        item.id,
                        "minibarId",
                        e.target.value,
                      )
                    }
                    disabled={
                      !item.isDraft ||
                      item.isCreating ||
                      item.isDeleting ||
                      minibarCatalogLoading ||
                      minibarOptions.length === 0
                    }
                  >
                    <option value="">Chọn minibar</option>
                    {minibarOptions.map((option) => (
                      <option key={option.minibarId} value={option.minibarId}>
                        {option.label || option.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      this.updateMinibarItem(item.id, "qty", e.target.value)
                    }
                    disabled={
                      item.isCreating ||
                      item.isUpdatingQty ||
                      item.isDeleting ||
                      (item.isDraft && !item.minibarId)
                    }
                  />
                  <button
                    className="ntp-btn-danger"
                    onClick={() => this.removeMinibarItem(item.id)}
                    disabled={
                      item.isCreating || item.isUpdatingQty || item.isDeleting
                    }
                  >
                    {item.isDeleting ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ntp-btn ntp-btn-secondary ntp-btn-add"
                onClick={this.addMinibarItem}
              >
                Thêm minibar
              </button>
              <div className="ntp-sub-title">Phí phạt</div>
              {penaltyLoading && (
                <div className="ntp-note-box">
                  Đang tải danh sách phí phạt...
                </div>
              )}
              {!penaltyLoading && penalties.length === 0 && (
                <div className="ntp-note-box">
                  Chưa có phí phạt nào được ghi nhận.
                </div>
              )}
              <div className="ntp-penalty-row">
                <input
                  placeholder="Lý do phạt"
                  value={newPenalty.reason}
                  disabled={penaltyLoading || penaltyAdding}
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
                  disabled={penaltyLoading || penaltyAdding}
                  onChange={(e) =>
                    this.setState({
                      newPenalty: { ...newPenalty, amount: e.target.value },
                    })
                  }
                />
                <button
                  type="button"
                  className="ntp-btn ntp-btn-secondary"
                  onClick={this.addPenalty}
                  disabled={penaltyLoading || penaltyAdding}
                >
                  {penaltyAdding ? "Đang thêm..." : "Thêm"}
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
                          disabled={
                            p.isDeleting || penaltyLoading || penaltyAdding
                          }
                        >
                          {p.isDeleting ? "Đang xóa..." : "Xóa"}
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
                  ? checkoutSubmitting
                    ? "Đang Check-out..."
                    : "Xác nhận Check-out"
                  : modalType === "transfer"
                    ? transferSubmitting
                      ? "Đang chuyển..."
                      : "Xác nhận chuyển"
                    : modalType === "extend"
                      ? extendSubmitting
                        ? "Đang gia hạn..."
                        : "Xác nhận gia hạn"
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