import { Route, Routes } from "react-router-dom";
import BackToTopButton from "./components/BackToTopButton";
import FloatingContactButton from "./components/FloatingContactButton";
import ScrollToTop from "./components/ScrollToTop";
import Admin from "./pages/Admin";
import BanDo from "./pages/BanDo";
import HocLieuChiTiet from "./pages/HocLieuChiTiet";
import HocLieuTatCa from "./pages/HocLieuTatCa";
import HocLieuTheoChuDe from "./pages/HocLieuTheoChuDe";
import Home from "./pages/Home";
import KhaoSat from "./pages/KhaoSat";
import LuyenTap from "./pages/LuyenTap";
import LuyenTapChiTiet from "./pages/LuyenTapChiTiet";
import NongNghiep from "./pages/NongNghiep";
import ThuVien from "./pages/ThuVien";
import ThuVienDeThi from "./pages/ThuVienDeThi";
import ThuVienTinTuc from "./pages/ThuVienTinTuc";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ban-do" element={<BanDo />} />
        <Route path="/khao-sat" element={<KhaoSat />} />
        <Route path="/nong-nghiep" element={<NongNghiep />} />
        <Route path="/luyen-tap" element={<LuyenTap />} />
        <Route path="/luyen-tap/:quizId" element={<LuyenTapChiTiet />} />
        <Route path="/thu-vien" element={<ThuVien />} />
        <Route path="/thu-vien/de-thi" element={<ThuVienDeThi />} />
        <Route path="/thu-vien/tin-tuc" element={<ThuVienTinTuc />} />
        <Route path="/hoc-lieu" element={<HocLieuTatCa />} />
        <Route path="/hoc-lieu/:duongDan" element={<HocLieuTheoChuDe />} />
        <Route path="/hoc-lieu/:duongDan/:materialId" element={<HocLieuChiTiet />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <FloatingContactButton />
      <BackToTopButton />
    </>
  );
}

export default App;
