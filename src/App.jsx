import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NongNghiep from "./pages/NongNghiep";
import Admin from "./pages/Admin";
import HocLieuTheoChuDe from "./pages/HocLieuTheoChuDe";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/nong-nghiep" element={<NongNghiep />} />
      <Route path="/hoc-lieu/:duongDan" element={<HocLieuTheoChuDe />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
