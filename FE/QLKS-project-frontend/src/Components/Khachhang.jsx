import React, { useState } from "react";
import "../style/Khachhang.css";
import { FeatureHeader } from "./Common";

const KH_LIST = [
  { name: "Phạm Văn An", phone: "0911111111", cmnd: "001234567890", email: "pva@gmail.com", address: "Hà Nội", stay: 0, note: "" },
  { name: "Hoàng Thị Bình", phone: "0922222222", cmnd: "001234567891", email: "htb@gmail.com", address: "TP. Hồ Chí Minh", stay: 0, note: "" },
  { name: "Đỗ Văn Công", phone: "0933333333", cmnd: "001234567892", email: "dvc@gmail.com", address: "Đà Nẵng", stay: 0, note: "" },
  { name: "Lý Thị Dung", phone: "0944444444", cmnd: "001234567893", email: "ltd@gmail.com", address: "Huế", stay: 0, note: "" },
];

const Khachhang = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", cmnd: "", email: "", address: "", note: "" });

  const filteredList = KH_LIST.filter(kh =>
    kh.name.toLowerCase().includes(search.toLowerCase()) ||
    kh.phone.includes(search) ||
    kh.cmnd.includes(search) ||
    kh.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    // Xử lý thêm khách hàng ở đây
    handleCloseModal();
  };

  return (
    <div className="khachhang-page">
      <div className="khachhang-header-row">
        <FeatureHeader
          title="Quản lý Khách hàng"
          description="Quản lý thông tin khách hàng"
        />
        <button className="add-btn" onClick={handleOpenModal}>+ Thêm khách hàng</button>
      </div>
      <div className="khachhang-table-card">
        <div className="khachhang-table-toolbar">
          <input
            className="khachhang-search"
            placeholder="Tìm kiếm theo tên, SĐT, CMND/CCCD, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <table className="khachhang-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Số điện thoại</th>
              <th>CMND/CCCD</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Lưu trú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((kh, idx) => (
              <tr key={idx}>
                <td><span role="img" aria-label="user"><i class="fa-solid fa-user"></i></span> <b>{kh.name}</b></td>
                <td>{kh.phone}</td>
                <td>{kh.cmnd}</td>
                <td>{kh.email}</td>
                <td>{kh.address}</td>
                <td>{kh.stay} lần</td>
                <td>
                  <button className="icon-btn edit" title="Sửa"><span role="img" aria-label="edit"><i class="fa-regular fa-pen-to-square"></i></span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm khách hàng */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal} title="Đóng">&times;</button>
            <h2>Thêm khách hàng mới</h2>
            <form className="add-customer-form" onSubmit={handleSubmit}>
              <label>
                Họ và tên *
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  autoFocus
                />
              </label>
              <label>
                Số điện thoại *
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                CMND/CCCD *
                <input
                  type="text"
                  name="cmnd"
                  value={form.cmnd}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Địa chỉ
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Ghi chú
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleFormChange}
                  rows={2}
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

export default Khachhang;