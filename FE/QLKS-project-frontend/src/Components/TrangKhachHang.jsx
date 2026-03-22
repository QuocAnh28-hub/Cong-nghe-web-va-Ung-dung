import React, { Component } from "react";
import "../style/QLKhachSan.css";
import Header from "./Header";
import Tongquan from "./Tongquan";
class TrangKhachHang extends Component {

  state = {
    page: Tongquan,
    fullname: "",
    role: ""
  };

  componentDidMount() {
    const fullname = localStorage.getItem("fullname");
    const role = localStorage.getItem("role");

    this.setState({
      fullname: fullname,
      role: role
    });
  }

  changePage = (page) => {
    this.setState({ page });
  };
  render() {
    return (
      <>
        <Header Name={this.state.fullname} Role={this.state.role} />
      </>
    );
  }
}
export default TrangKhachHang;
