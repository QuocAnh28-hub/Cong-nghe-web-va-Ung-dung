// import React, { Component } from "react";
// import "../style/Tongquan.css";
// import Header from "./Header";

// class Tongquan extends Component {

//   constructor(props){
//     super(props);

//     this.state = {
//       role: ""
//     }
//   }

//   componentDidMount(){

//     const isLogin = localStorage.getItem("isLogin");

//     if(isLogin !== "true"){
//       window.location.href="/login";
//     }

//     const role = localStorage.getItem("role");

//     this.setState({
//       role: role
//     });

//   }

//   logout = () => {

//     localStorage.removeItem("token");
//     localStorage.removeItem("isLogin");
//     localStorage.removeItem("role");

//     window.location.href="/login";

//   }

//   render() {
//     return (
//       <div className="tongquan">

//         <div className="tongquan-top">

//           <h2>Tổng quan</h2>

//           <p>Chào mừng đến với hệ thống quản lý khách sạn</p>

//           <p>Quyền tài khoản: <b>{this.state.role}</b></p>

//           <button onClick={this.logout}>
//             Đăng xuất
//           </button>

//         </div>

//         <div className="tongquan-mid">

//           <Cards
//             title="Tổng số phòng"
//             logo="fa-solid fa-building"
//             number="0"
//             desc="Trống: | Đang dùng:"
//           />

//           <Cards
//             title="Công suất phòng"
//             logo="fa-solid fa-bed"
//             number="0"
//             desc=""
//           />

//           <Cards
//             title="Check-in/out hôm nay"
//             logo="fa-solid fa-calendar-check"
//             number="0"
//             desc="Nhận / Trả phòng"
//           />

//           <Cards
//             title="Doanh thu tháng này"
//             logo="fa-solid fa-money-bill"
//             number="0"
//             desc="Từ 0 lượt lưu trú"
//           />

//         </div>

//         <div className="tongquan-low">

//           <Activity
//             title="Trạng thái phòng"
//             items={[
//               {
//                 label: "Phòng trống",
//                 value: 0,
//                 color: "green",
//                 className: "phongtrong"
//               },
//               {
//                 label: "Đang sử dụng",
//                 value: 0,
//                 color: "blue",
//                 className: "dangsudung"
//               },
//               {
//                 label: "Cần dọn dẹp",
//                 value: 0,
//                 color: "orange",
//                 className: "candondep"
//               }
//             ]}
//           />

//           <Activity
//             title="Thông tin khách"
//             items={[
//               {
//                 label: "Tổng khách hàng",
//                 logo: "fa-solid fa-user",
//                 value: 0
//               },
//               {
//                 label: "Đang lưu trú",
//                 logo: "fa-solid fa-user-check",
//                 value: 0
//               }
//             ]}
//           />

//         </div>

//       </div>
//     );
//   }
// }

// function Cards({ title, logo, number, desc }) {
//   return (
//     <div className="card">
//       <h3>{title}</h3>
//       <i className={logo}></i>
//       <p className="number">{number}</p>
//       <span>{desc}</span>
//     </div>
//   );
// }

// function Activity({ title, items }) {
//   return (
//     <div className="activity">

//       <h3>{title}</h3>

//       {items.map((item, index) => (
//         <div className={`act ${item.className || ""}`} key={index}>

//           {item.logo && <i className={item.logo}></i>}

//           <p className={item.color}>{item.label}</p>

//           <span>{item.value}</span>

//         </div>
//       ))}

//     </div>
//   );
// }

// export default Tongquan;

import React, { Component } from "react";
import "../style/Tongquan.css";
import Header from "./Header";

class Tongquan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      role: "",
      name: ""
    };
  }

  componentDidMount() {
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin !== "true") {
      window.location.href = "/login";
    }

    const role = localStorage.getItem("role");
    const name = localStorage.getItem("email");

    this.setState({
      role: role,
      name: name
    });
  }

  render() {
    return (
      <div className="tongquan">

        {/* Header */}
        <Header 
          Name={this.state.name}
          Role={this.state.role}
        />

        <div className="tongquan-top">
          <h2>Tổng quan</h2>
          <p>Chào mừng đến với hệ thống quản lý khách sạn</p>
        </div>

        <div className="tongquan-mid">

          <Cards
            title="Tổng số phòng"
            logo="fa-solid fa-building"
            number="0"
            desc="Trống: | Đang dùng:"
          />

          <Cards
            title="Công suất phòng"
            logo="fa-solid fa-bed"
            number="0"
            desc=""
          />

          <Cards
            title="Check-in/out hôm nay"
            logo="fa-solid fa-calendar-check"
            number="0"
            desc="Nhận / Trả phòng"
          />

          <Cards
            title="Doanh thu tháng này"
            logo="fa-solid fa-money-bill"
            number="0"
            desc="Từ 0 lượt lưu trú"
          />

        </div>

        <div className="tongquan-low">

          <Activity
            title="Trạng thái phòng"
            items={[
              {
                label: "Phòng trống",
                value: 0,
                color: "green",
                className: "phongtrong"
              },
              {
                label: "Đang sử dụng",
                value: 0,
                color: "blue",
                className: "dangsudung"
              },
              {
                label: "Cần dọn dẹp",
                value: 0,
                color: "orange",
                className: "candondep"
              }
            ]}
          />

          <Activity
            title="Thông tin khách"
            items={[
              {
                label: "Tổng khách hàng",
                logo: "fa-solid fa-user",
                value: 0
              },
              {
                label: "Đang lưu trú",
                logo: "fa-solid fa-user-check",
                value: 0
              }
            ]}
          />

        </div>

      </div>
    );
  }
}

function Cards({ title, logo, number, desc }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <i className={logo}></i>
      <p className="number">{number}</p>
      <span>{desc}</span>
    </div>
  );
}

function Activity({ title, items }) {
  return (
    <div className="activity">
      <h3>{title}</h3>

      {items.map((item, index) => (
        <div className={`act ${item.className || ""}`} key={index}>

          {item.logo && <i className={item.logo}></i>}

          <p className={item.color}>{item.label}</p>

          <span>{item.value}</span>

        </div>
      ))}
    </div>
  );
}

export default Tongquan;