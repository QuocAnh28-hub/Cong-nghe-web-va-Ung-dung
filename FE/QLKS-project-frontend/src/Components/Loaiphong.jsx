import React, { Component } from "react";
import "../style/Loaiphong.css";
import { FeatureHeader } from "./Common";
import { toast } from "react-toastify";

const API_URL = "http://localhost:3000/api/room-types";

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
    loading: false,
    submitLoading: false,
    error: "",
  };

  componentDidMount() {
    this.loadRoomTypes();
  }

  loadRoomTypes = async () => {
    this.setState({ loading: true, error: "" });

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const types = Array.isArray(data)
        ? data.map((item) => ({
            id: item.RoomTypeID,
            name: item.Name ?? "",
            description: item.Description ?? "",
            capacity: item.Capacity ?? 0,
            price: item.DefaultPrice ?? 0,
          }))
        : [];

      this.setState({ types, loading: false });
    } catch (error) {
      console.error("Không load được loại phòng:", error);
      toast.error("Lỗi tải loại phòng.");
      this.setState({
        error: error.message || "Không thể tải danh sách loại phòng.",
        loading: false,
      });
    }
  };

  getFilteredTypes = () => {
    const { types, search } = this.state;
    const q = search.toLowerCase().trim();

    if (!q) {
      return types;
    }

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
      currentType: {
        id: null,
        name: "",
        description: "",
        capacity: "",
        price: "",
      },
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

  handleSubmit = async (e) => {
    e.preventDefault();

    const { modalMode, currentType } = this.state;
    const { name, description, capacity, price, id } = currentType;

    if (!name.trim() || !description.trim() || !capacity || !price) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    const capacityNum = Number(capacity);
    const priceNum = Number(price);

    if (
      Number.isNaN(capacityNum) ||
      Number.isNaN(priceNum) ||
      capacityNum <= 0 ||
      priceNum <= 0
    ) {
      alert("Sức chứa và giá phải là số dương.");
      return;
    }

    const payload = {
      Name: name.trim(),
      Description: description.trim(),
      Capacity: capacityNum,
      DefaultPrice: priceNum,
    };

    const isEdit = modalMode === "edit";
    const url = isEdit ? `${API_URL}/${id}` : API_URL;

    try {
      this.setState({ submitLoading: true, error: "" });

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `API error: ${response.status}`);
      }

      await response.json();
      await this.loadRoomTypes();
      this.setState({ isModalOpen: false, submitLoading: false });
      toast.success(isEdit ? "Cập nhật loại phòng thành công." : "Thêm loại phòng thành công.");
    } catch (error) {
      this.setState({
        error: error.message || "Không thể lưu loại phòng.",
        submitLoading: false,
      });
      toast.error("Không thể lưu loại phòng.");
    }
  };

  deleteType = async (typeId) => {
    if (!window.confirm("Xóa loại phòng này?")) {
      return;
    }

    try {
      this.setState({ error: "" });

      const response = await fetch(`${API_URL}/${typeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `API error: ${response.status}`);
      }

      await response.json();
      await this.loadRoomTypes();
      toast.success("Xóa loại phòng thành công.");
    } catch (error) {
      this.setState({ error: error.message || "Không thể xóa loại phòng." });
      toast.error("Không thể xóa loại phòng.");
    }
  };

  render() {
    const {
      search,
      isModalOpen,
      modalMode,
      currentType,
      loading,
      submitLoading,
      error,
    } = this.state;
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
          {error && (
            <div
              className="lp-error"
              style={{
                marginBottom: "12px",
                color: "#b91c1c",
                backgroundColor: "#fee2e2",
                padding: "10px 12px",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

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
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Không có loại phòng phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((typeItem) => (
                    <tr key={typeItem.id}>
                      <td>
                        <strong>{typeItem.name}</strong>
                      </td>
                      <td>{typeItem.description}</td>
                      <td>{typeItem.capacity} người</td>
                      <td>{Number(typeItem.price).toLocaleString("vi-VN")}đ</td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => this.openEditModal(typeItem)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => this.deleteType(typeItem.id)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
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
              <h2>
                {modalMode === "add"
                  ? "Thêm loại phòng mới"
                  : "Chỉnh sửa loại phòng"}
              </h2>
              <form onSubmit={this.handleSubmit}>
                <label>
                  Tên loại phòng *
                  <input
                    className="modal-input"
                    type="text"
                    value={currentType.name}
                    onChange={this.handleChange("name")}
                  />
                </label>

                <label>
                  Mô tả *
                  <textarea
                    className="modal-input"
                    value={currentType.description}
                    onChange={this.handleChange("description")}
                  />
                </label>

                <label>
                  Sức chứa (người) *
                  <input
                    className="modal-input"
                    type="number"
                    value={currentType.capacity}
                    onChange={this.handleChange("capacity")}
                  />
                </label>

                <label>
                  Giá cơ bản (VNĐ) *
                  <input
                    className="modal-input"
                    type="number"
                    value={currentType.price}
                    onChange={this.handleChange("price")}
                  />
                </label>

                <div className="modal-buttons">
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={this.closeModal}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Đang lưu..." : "Lưu"}
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
