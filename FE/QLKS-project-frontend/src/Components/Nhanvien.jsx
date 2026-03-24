
import React, { useState } from "react";
import "../style/Nhanvien.css";
import { FeatureHeader } from "./Common";

const listNhanVien = [
  {
    fullName: "Nguyễn Văn Admin",
    role: "Quản trị viên",
    email: "admin@hotel.com",
    phone: "0901234567",
    createdAt: "15/3/2026",
  },
  {
    fullName: "Trần Thị Lễ Tân",
    role: "Lễ tân",
    email: "letan1@hotel.com",
    phone: "0902234567",
    createdAt: "15/3/2026",
  },
  {
    fullName: "Lê Văn Tân",
    role: "Lễ tân",
    email: "letan2@hotel.com",
    phone: "0903234567",
    createdAt: "15/3/2026",
  },
];

const getRoleBadge = (role) => {
  if (role === "Quản trị viên") {
    return (
      <span className="badge admin">
        <span role="img" aria-label="admin"><i class="fa-solid fa-shield"></i></span> Quản trị viên
      </span>
    );
  }
  return (
    <span className="badge letan">
      <span role="img" aria-label="letan"><i class="fa-solid fa-circle-user"></i></span> Lễ tân
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

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý lưu dữ liệu ở đây
    handleCloseModal();
  };

  return (
    <div className="nhanvien">
      <div className="nhanvien-header">
        <FeatureHeader
          title="Quản lý Nhân viên"
          description="Quản lý tài khoản nhân viên khách sạn"
        />
        <button className="add-btn" onClick={handleOpenModal}>+ Thêm nhân viên</button>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Vai trò</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {listNhanVien.map((nv, idx) => (
              <tr key={idx}>
                <td>{nv.fullName}</td>
                <td>{getRoleBadge(nv.role)}</td>
                <td>{nv.email}</td>
                <td>{nv.phone}</td>
                <td>{nv.createdAt}</td>
                <td>
                  <button className="icon-btn edit" title="Sửa">
                    <span role="img" aria-label="edit"><i class="fa-regular fa-pen-to-square"></i></span>
                  </button>
                  <button className="icon-btn delete" title="Xóa">
                    <span role="img" aria-label="delete"><i class="fa-regular fa-trash-can"></i></span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm nhân viên */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal} title="Đóng">&times;</button>
            <h2>Thêm nhân viên mới</h2>
            <form className="add-staff-form" onSubmit={handleSubmit}>
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
                Vai trò *
                <select name="role" value={form.role} onChange={handleChange} required>
                  <option value="Lễ tân">Lễ tân</option>
                  <option value="Quản trị viên">Quản trị viên</option>
                </select>
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
                Mật khẩu *
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu"
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="save-btn">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nhanvien;