import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NongNghiep from "./pages/NongNghiep";
import Admin from "./pages/Admin";
import HocLieuChiTiet from "./pages/HocLieuChiTiet";
import HocLieuTheoChuDe from "./pages/HocLieuTheoChuDe";
import LuyenTap from "./pages/LuyenTap";
import LuyenTapChiTiet from "./pages/LuyenTapChiTiet";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/nong-nghiep" element={<NongNghiep />} />
      <Route path="/luyen-tap" element={<LuyenTap />} />
      <Route path="/luyen-tap/:quizId" element={<LuyenTapChiTiet />} />
      <Route path="/hoc-lieu/:duongDan" element={<HocLieuTheoChuDe />} />
      <Route path="/hoc-lieu/:duongDan/:materialId" element={<HocLieuChiTiet />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
