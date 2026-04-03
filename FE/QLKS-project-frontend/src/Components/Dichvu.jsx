import React, { useEffect, useState } from "react";
import "../style/Dichvu.css";
import { FeatureHeader } from "./Common";
import { toast } from "react-toastify";

const API_URL = "http://localhost:3000/api/services";

const getDefaultForm = () => ({
  ServiceName: "",
  Price: "",
});

const mapServiceFromApi = (item) => ({
  ServiceID: item.ServiceID,
  ServiceName: item.ServiceName ?? "",
  Price: Number(item.Price) || 0,
  Status: item.Status ?? "",
});

const Dichvu = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(getDefaultForm());
  const [editServiceId, setEditServiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setServices(Array.isArray(data) ? data.map(mapServiceFromApi) : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredList = services.filter(
    (service) =>
      service.ServiceName.toLowerCase().includes(search.toLowerCase()) ||
      String(service.ServiceID).includes(search),
  );

  const handleOpenModal = (service = null) => {
    if (service) {
      setForm({
        ServiceName: service.ServiceName,
        Price: String(service.Price),
      });
      setEditServiceId(service.ServiceID);
    } else {
      setForm(getDefaultForm());
      setEditServiceId(null);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditServiceId(null);
    setForm(getDefaultForm());
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ServiceName.trim() || form.Price === "") {
      alert("Vui lòng nhập tên dịch vụ và giá.");
      return;
    }

    const price = Number(form.Price);
    if (Number.isNaN(price) || price < 0) {
      alert("Giá dịch vụ phải là số không âm.");
      return;
    }

    const payload = {
      ServiceName: form.ServiceName.trim(),
      Price: price,
    };

    const isEdit = editServiceId !== null;
    const url = isEdit ? `${API_URL}/${editServiceId}` : API_URL;

    try {
      setSubmitLoading(true);
      setError("");

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `API error: ${response.status}`);
      }

      await fetchServices();
      toast.success(isEdit ? "Cập nhật dịch vụ thành công." : "Thêm dịch vụ thành công.");
      handleCloseModal();
    } catch (err) {
      setError(err.message || "Không thể lưu dịch vụ.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Xóa dịch vụ này?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/${serviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `API error: ${response.status}`);
      }

      await fetchServices();
      toast.success("Xóa dịch vụ thành công.");
    } catch (err) {
      setError(err.message || "Không thể xóa dịch vụ.");
    }
  };

  return (
    <div className="dichvu-page">
      <div className="dichvu-header-row">
        <FeatureHeader
          title="Quản lý Dịch vụ"
          description="Quản lý các dịch vụ khách sạn"
        />
        <button className="add-btn" type="button" onClick={() => handleOpenModal()}>
          + Thêm dịch vụ
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            padding: "10px 12px",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      <div className="dichvu-table-card">
        <div className="dichvu-table-toolbar">
          <input
            className="dichvu-search"
            placeholder="Tìm kiếm theo mã hoặc tên dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="dichvu-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên dịch vụ</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Đang tải dữ liệu...</td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan="5">Không có dữ liệu dịch vụ.</td>
              </tr>
            ) : (
              filteredList.map((service) => (
                <tr key={service.ServiceID}>
                  <td>{service.ServiceID}</td>
                  <td>
                    <b>{service.ServiceName}</b>
                  </td>
                  <td>{service.Price.toLocaleString("vi-VN")}đ</td>
                  <td>{service.Status || "-"}</td>
                  <td>
                    <button
                      className="icon-btn edit"
                      type="button"
                      title="Sửa"
                      onClick={() => handleOpenModal(service)}
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button
                      className="icon-btn delete"
                      type="button"
                      title="Xóa"
                      onClick={() => handleDelete(service.ServiceID)}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal} title="Đóng">
              &times;
            </button>
            <h2>{editServiceId !== null ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
            <form className="add-service-form" onSubmit={handleSubmit}>
              <label>
                Tên dịch vụ *
                <input
                  type="text"
                  name="ServiceName"
                  value={form.ServiceName}
                  onChange={handleFormChange}
                  required
                  autoFocus
                />
              </label>
              <label>
                Giá (VNĐ) *
                <input
                  type="number"
                  name="Price"
                  value={form.Price}
                  onChange={handleFormChange}
                  required
                  min="0"
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="save-btn" disabled={submitLoading}>
                  {submitLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dichvu;
