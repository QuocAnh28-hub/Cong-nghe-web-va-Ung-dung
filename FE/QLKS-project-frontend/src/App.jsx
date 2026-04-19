import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import QLKhachSan from "./Components/QLKhachSan";
import TrangKhachHang from "./Components/TrangKhachHang";
import TrangKhachHang_PhongNghi from "./Components/TrangKhachHang_PhongNghi";
import TrangKhachHang_DatPhong from "./Components/TrangKhachHang_DatPhong";
import TrangKhachHang_ThongTin from "./Components/TrangKhachHang_ThongTin";

function PrivateRoute({ children }) {
  const isLogin = localStorage.getItem("isLogin");

  return isLogin === "true" ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <QLKhachSan />
            </PrivateRoute>
          }
        />

        <Route
          path="/trangkhachhang"
          element={
            <PrivateRoute>
              <TrangKhachHang />
            </PrivateRoute>
          }
        />

        <Route
          path="/trangkhachhang/phongnghi"
          element={
            <PrivateRoute>
              <TrangKhachHang_PhongNghi />
            </PrivateRoute>
          }
        />

        <Route
          path="/trangkhachhang/datphong"
          element={
            <PrivateRoute>
              <TrangKhachHang_DatPhong />
            </PrivateRoute>
          }
        />

        <Route
          path="/trangkhachhang/thongtin"
          element={
            <PrivateRoute>
              <TrangKhachHang_ThongTin />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
