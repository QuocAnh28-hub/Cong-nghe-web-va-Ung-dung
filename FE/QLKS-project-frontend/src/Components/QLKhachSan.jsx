import React, { Component } from "react";
import "../style/QLKhachSan.css";
import Header from "./Header";
import Navigation from "./Navigation";
import Content from "./Content";
import Tongquan from "./Tongquan";
class QLKhachSan extends Component {

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
        <Navigation
          changePage={this.changePage}
          currentPage={this.state.page}
        />
        <Content page={this.state.page} />
      </>
    );
  }
}
export default QLKhachSan;
