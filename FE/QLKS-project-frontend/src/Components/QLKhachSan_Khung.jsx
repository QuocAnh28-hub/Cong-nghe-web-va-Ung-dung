import React, { Component } from "react";
import { Outlet } from "react-router-dom";
import "../style/QLKhachSan.css";
import Header from "./Header";
import Navigation from "./Navigation";

class QLKhachSan_Khung extends Component {
  state = {
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

  render() {
    const { fullname, role } = this.state;

    return (
      <>
        <Header Name={fullname} Role={role} />
        <Navigation />
        <div className="Content">
          <Outlet />
        </div>
      </>
    );
  }
}

export default QLKhachSan_Khung;