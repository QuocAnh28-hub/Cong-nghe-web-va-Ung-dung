// import { useState } from 'react'
// import QLkhachsan from './components/QLkhachsan'
// import './App.css'
// import Login from './Components/Login'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <Login></Login>

//       {/* <QLkhachsan></QLkhachsan> */}
//     </>
//   )
// }

// export default App

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Tongquan from "./components/Tongquan";
import QLKhachSan from "./Components/QLKhachSan";

function PrivateRoute({ children }) {
  const isLogin = localStorage.getItem("isLogin");

  return isLogin === "true" ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Trang hệ thống khách sạn */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <QLKhachSan />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;