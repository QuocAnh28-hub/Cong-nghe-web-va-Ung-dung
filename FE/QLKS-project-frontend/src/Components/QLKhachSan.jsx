import React, { Component } from "react";
import "../style/QLKhachSan.css";
import Header from "./Header";
import Navigation from "./Navigation";
import Content from "./Content";
import Tongquan from "./Tongquan";
class QLKhachSan extends Component {
  state = {
    page: Tongquan,
  };

  changePage = (page) => {
    this.setState({ page });
  };
  render() {
    return (
      <>
        <Header Name="Quoc Anh" Role="Admin" />
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
