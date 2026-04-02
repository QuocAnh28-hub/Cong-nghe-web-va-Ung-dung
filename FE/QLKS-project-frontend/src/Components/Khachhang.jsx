import React, { useEffect, useState } from "react";
import "../style/Khachhang.css";
import { FeatureHeader } from "./Common";

const API_URL = "http://localhost:3000/api/customers";
const PAGE_SIZE = 4;

const getDefaultForm = () => ({
  FullName: "",
  Phone: "",
  CCCD: "",
  Email: "",
});

const mapCustomerFromApi = (item) => ({
  CustomerID: item.CustomerID,
  FullName: item.FullName ?? "",
  Phone: item.Phone ?? "",
  CCCD: item.CCCD ?? "",
  Email: item.Email ?? "",
  TotalStays: item.TotalStays ?? 0,
  TotalSpent: item.TotalSpent ?? 0,
  LastStay: item.LastStay ?? null,
});

const Khachhang = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(getDefaultForm());
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setCustomers(Array.isArray(data) ? data.map(mapCustomerFromApi) : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Khong the tai danh sach khach hang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredList = customers.filter(
    (kh) =>
      kh.FullName.toLowerCase().includes(search.toLowerCase()) ||
      kh.Phone.includes(search) ||
      (kh.CCCD || "").includes(search) ||
      kh.Email.toLowerCase().includes(search.toLowerCase()) ||
      String(kh.CustomerID).includes(search),
  );

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedList = filteredList.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setForm({
        FullName: customer.FullName || "",
        Phone: customer.Phone || "",
        CCCD: customer.CCCD || "",
        Email: customer.Email || "",
      });
      setEditCustomerId(customer.CustomerID);
    } else {
      setForm(getDefaultForm());
      setEditCustomerId(null);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditCustomerId(null);
    setForm(getDefaultForm());
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.FullName.trim() || !form.Phone.trim()) {
      alert("Vui long nhap ho ten va so dien thoai.");
      return;
    }

    const payload = {
      FullName: form.FullName.trim(),
      Phone: form.Phone.trim(),
      CCCD: form.CCCD.trim() || null,
      Email: form.Email.trim() || null,
    };

    try {
      setSubmitLoading(true);
      setError("");

      const isEdit = editCustomerId !== null;
      const url = isEdit ? `${API_URL}/${editCustomerId}` : API_URL;
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `API error: ${response.status}`);
      }

      await fetchCustomers();
      alert(isEdit ? "Cập nhật khách hàng thành công." : "Thêm khách hàng thành công.");
      handleCloseModal();
    } catch (err) {
      setError(err.message || "Khong the luu thong tin khach hang.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="khachhang-page">
      <div className="khachhang-header-row">
        <FeatureHeader
          title="Quản lý Khách hàng"
          description="Quản lý thông tin khách hàng"
        />
        <button
          className="add-btn"
          type="button"
          onClick={() => handleOpenModal(null)}
        >
          + Thêm khách hàng
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

      <div className="khachhang-table-card">
        <div className="kh-search-box">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã KH, tên, SĐT, CCCD, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="khachhang-table">
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Họ và tên</th>
              <th>Số điện thoại</th>
              <th>CMND/CCCD</th>
              <th>Email</th>
              <th>Lưu trú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Dang tai du lieu...</td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan="7">Khong co du lieu khach hang.</td>
              </tr>
            ) : (
              paginatedList.map((kh) => (
                <tr key={kh.CustomerID}>
                  <td>{kh.CustomerID}</td>
                  <td>{kh.FullName}</td>
                  <td>{kh.Phone}</td>
                  <td>{kh.CCCD || "-"}</td>
                  <td>{kh.Email || "-"}</td>
                  <td>{kh.TotalStays} lần</td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn edit"
                      title="Sửa"
                      onClick={() => handleOpenModal(kh)}
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredList.length > 0 && (
          <div className="kh-pagination">
            <button
              type="button"
              className="kh-page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Trang trước"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`kh-page-btn ${page === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="kh-page-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={handleCloseModal}
              title="Đóng"
            >
              &times;
            </button>
            <h2>
              {editCustomerId !== null
                ? "Chỉnh sửa khách hàng"
                : "Thêm khách hàng mới"}
            </h2>
            <form className="add-customer-form" onSubmit={handleSubmit}>
              <label>
                Họ và tên *
                <input
                  type="text"
                  name="FullName"
                  value={form.FullName}
                  onChange={handleFormChange}
                  required
                  autoFocus
                />
              </label>
              <label>
                Số điện thoại *
                <input
                  type="text"
                  name="Phone"
                  value={form.Phone}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                CMND/CCCD
                <input
                  type="text"
                  name="CCCD"
                  value={form.CCCD}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="Email"
                  value={form.Email}
                  onChange={handleFormChange}
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                >
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

export default Khachhang;