import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import QLKhachSan from "./Components/QLKhachSan";
import TrangKhachHang from "./Components/TrangKhachHang";

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

        {/* Trang khách hàng */}
        <Route
          path="/trangkhachhang"
          element={
            <PrivateRoute>
              <TrangKhachHang />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;