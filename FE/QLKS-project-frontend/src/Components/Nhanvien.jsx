import React, { Component } from "react";
import "../style/Nhanvien.css";

class Nhanvien extends Component {
  render() {
    const listNhanVien = [
      { maNV: "NV001", tenNV: "Nguyễn Văn A", sDT: "0123456789", maTK: "TK001" },
      { maNV: "NV002", tenNV: "Nguyễn Văn B", sDT: "0123456789", maTK: "TK002" },
      { maNV: "NV003", tenNV: "Nguyễn Văn C", sDT: "0123456789", maTK: "TK003" }
    ];

    return (
      <div className="nhanvien">
        <div id="nhanvien-header">
          <div id="info">
            <h1>Quản lý nhân viên</h1>
            <p>Quản lý tài khoản nhân viên khách sạn</p>
          </div>
          <button>+ Thêm nhân viên</button>
        </div>
        
        <div className="table-card">

          <table>

            <thead>
              <tr>
                <th>Mã nhân viên</th>
                <th>Tên nhân viên</th>
                <th>Số điện thoại</th>
                <th>Mã tài khoản</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {listNhanVien.map((nv, index) => (
                <tr key={index}>
                  <td>{nv.maNV}</td>
                  <td>{nv.tenNV}</td>
                  <td>{nv.sDT}</td>
                  <td>{nv.maTK}</td>
                  <td>
                    <button className="button update">Update</button>
                    <button className="button showpass">ShowPass</button>
                    <button className="button delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
          <div className="nhanVienFunc">
            <button className="button addnew">Thêm nhân viên</button>
          </div>

        </div>
      </div>
    );
  }
}

export default Nhanvien;