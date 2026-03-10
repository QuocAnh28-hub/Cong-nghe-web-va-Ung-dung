import React, { Component } from "react";
import "../style/Content.css";

class Content extends Component {
  render() {
    const Page = this.props.page;
    return (
      <>
        <div className="Content">
            <Page/>
        </div>
      </>
    );
  }
}
export default Content;
