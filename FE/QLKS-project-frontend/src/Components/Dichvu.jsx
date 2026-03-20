import React, { useState } from "react";
import "../style/Dichvu.css";

const DICHVU_LIST = [
  { name: "Giặt ủi", category: "Vệ sinh", price: 50000, desc: "Dịch vụ giặt ủi quần áo" },
  { name: "Ăn sáng buffet", category: "Ăn uống", price: 150000, desc: "Buffet sáng đa dạng món ăn" },
  { name: "Massage", category: "Spa", price: 300000, desc: "Massage thư giãn 60 phút" },
  { name: "Đưa đón sân bay", category: "Vận chuyển", price: 500000, desc: "Xe đưa đón sân bay" },
];
const CATEGORY_COLORS = {
  "Ăn uống": "#60a5fa",
  "Vệ sinh": "#a5b4fc",
  "Spa": "#f9a8d4",
  "Vận chuyển": "#6ee7b7",
  "Phòng": "#fcd34d",
  "Khác": "#cbd5e1",
};
const CATEGORY_LIST = [
  "Tất cả danh mục",
  "Ăn uống",
  "Vệ sinh",
  "Spa",
  "Vận chuyển",
  "Phòng",
  "Khác",
];

const Dichvu = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả danh mục");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Khác", price: "", desc: "" });

  const filteredList = DICHVU_LIST.filter(dv =>
    (category === "Tất cả danh mục" || dv.category === category) &&
    dv.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    // Xử lý thêm dịch vụ ở đây
    handleCloseModal();
  };

  return (
    <div className="dichvu-page">
      <div className="dichvu-header-row">
        <div>
          <h1 className="dichvu-title">Quản lý Dịch vụ</h1>
          <p className="dichvu-desc">Quản lý các dịch vụ khách sạn</p>
        </div>
        <button className="add-btn" onClick={handleOpenModal}>+ Thêm dịch vụ</button>
      </div>
      <div className="dichvu-table-card">
        <div className="dichvu-table-toolbar">
          <input
            className="dichvu-search"
            placeholder="Tìm kiếm dịch vụ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="dichvu-category-filter"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORY_LIST.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <table className="dichvu-table">
          <thead>
            <tr>
              <th>Tên dịch vụ</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((dv, idx) => (
              <tr key={idx}>
                <td><b>{dv.name}</b></td>
                <td>
                  <span className="badge" style={{background: CATEGORY_COLORS[dv.category] || '#e5e7eb'}}>{dv.category}</span>
                </td>
                <td>{dv.price.toLocaleString()}đ</td>
                <td>{dv.desc}</td>
                <td>
                  <button className="icon-btn edit" title="Sửa"><span role="img" aria-label="edit"><i class="fa-regular fa-pen-to-square"></i></span></button>
                  <button className="icon-btn delete" title="Xóa"><span role="img" aria-label="delete"><i class="fa-regular fa-trash-can"></i></span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm dịch vụ */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal} title="Đóng">&times;</button>
            <h2>Thêm dịch vụ mới</h2>
            <form className="add-service-form" onSubmit={handleSubmit}>
              <label>
                Tên dịch vụ *
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
                Danh mục *
                <select name="category" value={form.category} onChange={handleFormChange} required>
                  <option value="Ăn uống">Ăn uống</option>
                  <option value="Vệ sinh">Vệ sinh</option>
                  <option value="Spa">Spa</option>
                  <option value="Vận chuyển">Vận chuyển</option>
                  <option value="Phòng">Phòng</option>
                  <option value="Khác">Khác</option>
                </select>
              </label>
              <label>
                Giá (VNĐ) *
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleFormChange}
                  required
                  min="0"
                />
              </label>
              <label>
                Mô tả
                <textarea
                  name="desc"
                  value={form.desc}
                  onChange={handleFormChange}
                  rows={3}
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

export default Dichvu;