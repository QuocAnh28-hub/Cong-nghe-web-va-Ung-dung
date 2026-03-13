// import React, { Component } from "react";
// import "../style/Header.css";

// class Header extends Component {
//   render() {
//     const { Name, Role } = this.props;
//     return (
//       <>
//         <div className="header">
//           <button className="btn-navigation">
//             <i className="fa-solid fa-list"></i>
//           </button>
//           <i className="fa-regular fa-building logo-hotel"></i>
//           <h2>QUẢN LÝ KHÁCH SẠN</h2>

//           <div className="header-right-text">
//             <h5>{Name}</h5>
//             <p>{Role}</p>
//           </div>

//           <button className="btn-logout">
//             <i className="fa-solid fa-arrow-right-from-bracket"></i>
//           </button>
//         </div>
//       </>
//     );
//   }
// }
// export default Header;

import React, { Component } from "react";
import "../style/Header.css";

class Header extends Component {

  logout = () => {

    const xacNhan = window.confirm("Bạn có chắc muốn đăng xuất không?");

    if (xacNhan) {

      localStorage.removeItem("token");
      localStorage.removeItem("isLogin");
      localStorage.removeItem("role");
      localStorage.removeItem("email");

      window.location.href = "/login";
    }

  };

  render() {

    const { Name, Role } = this.props;

    return (
      <div className="header">

        <button className="btn-navigation">
          <i className="fa-solid fa-list"></i>
        </button>

        <i className="fa-regular fa-building logo-hotel"></i>

        <h2>QUẢN LÝ KHÁCH SẠN</h2>

        <div className="header-right-text">
          <h5>{Name}</h5>
          <p>{Role}</p>
        </div>

        <button className="btn-logout" onClick={this.logout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>

      </div>
    );
  }
}

export default Header;