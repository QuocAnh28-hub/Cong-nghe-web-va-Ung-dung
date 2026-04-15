
import React, { useState, useEffect } from "react";
import "../style/Nhanvien.css";
import { FeatureHeader } from "./Common";
import { toast } from "react-toastify";

const getRoleBadge = (role) => {
  if (role === "Quản trị viên") {
    return (
      <span className="nhanvien-badge nhanvien-badge-admin">
        <span role="img" aria-label="admin"><i className="fa-solid fa-shield"></i> Quản trị viên</span>
      </span>
    );
  }
  return (
    <span className="nhanvien-badge nhanvien-badge-letan">
      <span role="img" aria-label="letan"><i className="fa-solid fa-circle-user"></i> Lễ tân</span>
    </span>
  );
};


const Nhanvien = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    password: "",
    fullName: "",
    role: "Lễ tân",
    email: "",
    phone: "",
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await fetch("http://localhost:3000/api/receptionists");
        if (!response.ok) {
          throw new Error(`Lỗi tải dữ liệu: ${response.status}`);
        }
        const data = await response.json();
        const normalized = data.map((item) => ({
          id: item.UserID || item.Id || item.id || item._id || null,
          UserID: item.UserID || item.Id || item.id || item._id || null,
          fullName: item.FullName || "",
          role:
            item.Role === "RECEPTIONIST"
              ? "Lễ tân"
              : item.Role === "ADMIN"
              ? "Quản trị viên"
              : item.Role || "",
          email: item.Email || "",
          phone: item.Phone || "",
          createdAt: item.CreatedAt
            ? new Date(item.CreatedAt).toLocaleDateString("vi-VN")
            : "",
        }));
        setEmployees(normalized);
      } catch (err) {
        setLoadError(err.message || "Lỗi khi tải dữ liệu nhân viên");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleOpenModal = () => {
    setEditingEmployee(null);
    setForm({
      password: "",
      fullName: "",
      role: "Lễ tân",
      email: "",
      phone: "",
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setSubmitError(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setSubmitError(null);
    setForm({
      password: "",
      fullName: employee.fullName,
      role: employee.role,
      email: employee.email,
      phone: employee.phone,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (employee) => {
    const deleteId =
      employee.id || employee.UserID || employee.userId || employee.Id || employee._id;
    if (!deleteId) {
      window.alert("Không xác định được nhân viên để xóa.");
      return;
    }

    const confirmed = window.confirm(
      `Xác nhận xóa nhân viên ${employee.fullName}?`
    );
    if (!confirmed) return;

    try {
      const response = await fetch("http://localhost:3000/api/receptionists", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deleteId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Lỗi khi xóa nhân viên: ${response.status}`
        );
      }

      setEmployees((prev) =>
        prev.filter(
          (emp) =>
            (emp.id || emp.UserID || emp.userId || emp.Id || emp._id) !== deleteId
        )
      );
    } catch (err) {
      toast.error(err.message || "Xóa nhân viên không thành công.");
    }
  };

  const filteredEmployees = employees.filter((nv) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      nv.fullName.toLowerCase().includes(term) ||
      nv.email.toLowerCase().includes(term) ||
      nv.phone.toLowerCase().includes(term)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const isEdit = Boolean(editingEmployee);
      let payload;

      if (isEdit) {
        const editId =
          editingEmployee?.id ||
          editingEmployee?.UserID ||
          editingEmployee?.userId ||
          editingEmployee?.Id ||
          editingEmployee?._id;

        if (!editId) {
          throw new Error("Không xác định được nhân viên để cập nhật.");
        }

        payload = {
          UserID: editId,
          Email: form.email || editingEmployee.email,
          FullName: form.fullName || editingEmployee.fullName,
          Phone: form.phone || editingEmployee.phone,
          ...(form.password ? { Password: form.password } : {}),
        };
      } else {
        payload = {
          Email: form.email,
          PasswordHash: form.password,
          FullName: form.fullName,
          Phone: form.phone,
        };
      }

      const response = await fetch("http://localhost:3000/api/receptionists", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Lỗi khi ${isEdit ? "cập nhật" : "thêm"} nhân viên: ${response.status}`
        );
      }

      const result = await response.json();
      const added = result.data || result;
      const updatedEmployee = {
        id: added.UserID || added.Id || added.id || added._id || editingEmployee?.id || null,
        fullName: added.FullName || form.fullName || editingEmployee?.fullName || "",
        role: editingEmployee?.role || "Lễ tân",
        email: added.Email || form.email || editingEmployee?.email || "",
        phone: added.Phone || form.phone || editingEmployee?.phone || "",
        createdAt:
          editingEmployee?.createdAt || new Date().toLocaleDateString("vi-VN"),
      };

      setEmployees((prev) => {
        if (editingEmployee) {
          const editId =
            editingEmployee.id ||
            editingEmployee.UserID ||
            editingEmployee.userId ||
            editingEmployee.Id ||
            editingEmployee._id;
          return prev.map((emp) =>
            (emp.id || emp.UserID || emp.userId || emp.Id || emp._id) === editId
              ? { ...emp, ...updatedEmployee }
              : emp
          );
        }
        return [updatedEmployee, ...prev];
      });

      setForm({
        password: "",
        fullName: "",
        role: "Lễ tân",
        email: "",
        phone: "",
      });
      handleCloseModal();
      toast.success(isEdit ? "Cập nhật nhân viên thành công." : "Thêm nhân viên thành công.");
    } catch (err) {
      setSubmitError(err.message || "Lỗi khi thêm nhân viên");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nhanvien">
      <div className="nhanvien-header">
        <div className="nhanvien-top">
          <div className="nhanvien-info">
            <FeatureHeader
              title="Quản lý Nhân viên"
              description="Quản lý tài khoản nhân viên khách sạn"
            />
          </div>
          <button className="nhanvien-add-btn" onClick={handleOpenModal}>+ Thêm nhân viên</button>
        </div>
      </div>
      <div className="nhanvien-table-card">
        <div className="nhanvien-table-search">
          <div className="nhanvien-search-box">
            <i className="fa fa-search"></i>
            <input
              type="search"
              className="nhanvien-search-input"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Tìm kiếm nhân viên..."
            />
          </div>
        </div>
        <table className="nhanvien-table">
          <thead className="nhanvien-table-head">
            <tr>
              <th>Họ và tên</th>
              <th>Vai trò</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody className="nhanvien-table-body">
            {loading ? (
              <tr>
                <td colSpan="6">Đang tải dữ liệu nhân viên...</td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan="6">{loadError}</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="6">Không có nhân viên nào.</td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6">Không tìm thấy nhân viên phù hợp.</td>
              </tr>
            ) : (
              filteredEmployees.map((nv, idx) => (
                <tr key={idx}>
                  <td>{nv.fullName}</td>
                  <td>{getRoleBadge(nv.role)}</td>
                  <td>{nv.email}</td>
                  <td>{nv.phone}</td>
                  <td>{nv.createdAt}</td>
                  <td>
                    <button className="nhanvien-icon-btn nhanvien-icon-btn-edit" title="Sửa" onClick={() => handleEdit(nv)}>
                      <span role="img" aria-label="edit"><i className="fa-regular fa-pen-to-square"></i></span>
                    </button>
                    <button className="nhanvien-icon-btn nhanvien-icon-btn-delete" title="Xóa" onClick={() => handleDelete(nv)}>
                      <span role="img" aria-label="delete"><i className="fa-regular fa-trash-can"></i></span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm nhân viên */}
      {showModal && (
        <div className="nhanvien-modal-overlay">
          <div className="nhanvien-modal-content">
            <button className="nhanvien-modal-close" onClick={handleCloseModal} title="Đóng">&times;</button>
            <h2>{editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</h2>
            <form className="nhanvien-form" onSubmit={handleSubmit}>
              <label>
                Họ và tên *
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Số điện thoại *
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Mật khẩu {editingEmployee ? "(để trống nếu không đổi)" : "*"}
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editingEmployee}
                  placeholder={editingEmployee ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                />
              </label>
              <div className="nhanvien-modal-actions">
                <button type="button" className="nhanvien-cancel-btn" onClick={handleCloseModal} disabled={submitting}>Hủy</button>
                <button type="submit" className="nhanvien-save-btn" disabled={submitting}>
                  {editingEmployee ? (submitting ? "Đang cập nhật..." : "Cập nhật") : (submitting ? "Đang lưu..." : "Lưu")}
                </button>
              </div>
              {submitError && (
                <p className="nhanvien-modal-error">{submitError}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nhanvien;
