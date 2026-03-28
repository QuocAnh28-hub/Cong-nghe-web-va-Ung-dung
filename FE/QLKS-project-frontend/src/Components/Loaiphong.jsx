import React, { Component } from "react";
import "../style/Loaiphong.css";
import { FeatureHeader } from "./Common";

class Loaiphong extends Component {
  state = {
    types: [],
    search: "",
    isModalOpen: false,
    modalMode: "add",
    currentType: {
      id: null,
      name: "",
      description: "",
      capacity: "",
      price: "",
    },
  };

  componentDidMount() {
    this.loadRoomTypes();
  }

  loadRoomTypes = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/room-types");
      if (!response.ok) {
        throw new Error(`API lỗi: ${response.status}`);
      }
      const data = await response.json();
      const types = Array.isArray(data)
        ? data.map((item) => ({
            id: item.RoomTypeID,
            name: item.Name,
            description: item.Description,
            capacity: item.Capacity,
            price: item.DefaultPrice,
          }))
        : [];
      this.setState({ types });
    } catch (error) {
      console.error("Không load được loại phòng:", error);
    }
  };

  getFilteredTypes = () => {
    const { types, search } = this.state;
    const q = search.toLowerCase().trim();
    if (!q) return types;
    return types.filter(
      (type) =>
        type.name.toLowerCase().includes(q) ||
        type.description.toLowerCase().includes(q),
    );
  };

  openAddModal = () => {
    this.setState({
      isModalOpen: true,
      modalMode: "add",
      currentType: { id: null, name: "", description: "", capacity: "", price: ""},
    });
  };

  openEditModal = (typeItem) => {
    this.setState({
      isModalOpen: true,
      modalMode: "edit",
      currentType: {
        id: typeItem.id,
        name: typeItem.name,
        description: typeItem.description,
        capacity: typeItem.capacity,
        price: typeItem.price,
      },
    });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleChange = (field) => (e) => {
    const value = e.target.value;
    this.setState((prev) => ({
      currentType: { ...prev.currentType, [field]: value },
    }));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { types, modalMode, currentType } = this.state;
    const { name, description, capacity, price, id } = currentType;

    if (!name || !description || !capacity || !price) {
      alert("Vui lòng điền đủ các trường bắt buộc.");
      return;
    }

    const capacityNum = Number(capacity);
    const priceNum = Number(price);
    if (Number.isNaN(capacityNum) || Number.isNaN(priceNum)) {
      alert("Sức chứa và Giá phải là số.");
      return;
    }

    const data = {
      id: modalMode === "add" ? Math.max(0, ...types.map((t) => t.id)) + 1 : id,
      name: name.trim(),
      description: description.trim(),
      capacity: capacityNum,
      price: priceNum,
    };

    if (modalMode === "add") {
      this.setState({ types: [...types, data], isModalOpen: false });
    } else {
      this.setState({
        types: types.map((t) => (t.id === id ? data : t)),
        isModalOpen: false,
      });
    }
  };

  deleteType = (typeId) => {
    if (!window.confirm("Xóa loại phòng này?")) return;
    this.setState((prev) => ({ types: prev.types.filter((t) => t.id !== typeId) }));
  };

  render() {
    const { search, isModalOpen, modalMode, currentType } = this.state;
    const filteredTypes = this.getFilteredTypes();

    return (
      <div className="loaiphong">
        <div className="lp-top">
          <FeatureHeader
            title="Quản lý Loại phòng"
            description="Quản lý các loại phòng trong khách sạn"
          />
          <button className="btn-primary" onClick={this.openAddModal}>
            + Thêm loại phòng
          </button>
        </div>

        <div className="lp-main">
          <div className="lp-actions">
            <div className="lp-search-box">
              <i className="fa fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm loại phòng..."
                value={search}
                onChange={(e) => this.setState({ search: e.target.value })}
              />
            </div>
            <div />
          </div>

          <div className="lp-table-wrapper">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Tên loại phòng</th>
                  <th>Mô tả</th>
                  <th>Sức chứa</th>
                  <th>Giá cơ bản</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTypes.map((typeItem) => (
                  <tr key={typeItem.id}>
                    <td><strong>{typeItem.name}</strong></td>
                    <td>{typeItem.description}</td>
                    <td>{typeItem.capacity} người</td>
                    <td>{typeItem.price.toLocaleString()}đ</td>
                    <td>
                      <button className="btn-edit" onClick={() => this.openEditModal(typeItem)}>
                        <i className="fa fa-edit"></i>
                      </button>
                      <button className="btn-delete" onClick={() => this.deleteType(typeItem.id)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTypes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      Không có loại phòng phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={this.closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={this.closeModal}>
                ×
              </button>
              <h2>{modalMode === "add" ? "Thêm loại phòng mới" : "Chỉnh sửa loại phòng"}</h2>
              <form onSubmit={this.handleSubmit}>
                <label>
                  Tên loại phòng *
                  <input className="modal-input" type="text" value={currentType.name} onChange={this.handleChange("name")} />
                </label>

                <label>
                  Mô tả
                  <textarea className="modal-input" value={currentType.description} onChange={this.handleChange("description")} />
                </label>

                <label>
                  Sức chứa (người) *
                  <input className="modal-input" type="number" value={currentType.capacity} onChange={this.handleChange("capacity")} />
                </label>

                <label>
                  Giá cơ bản (VNĐ) *
                  <input className="modal-input" type="number" value={currentType.price} onChange={this.handleChange("price")} />
                </label>

                <div className="modal-buttons">
                  <button className="btn-secondary" type="button" onClick={this.closeModal}>
                    Hủy
                  </button>
                  <button className="btn-primary" type="submit">
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Loaiphong;