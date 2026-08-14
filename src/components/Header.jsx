import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Header.css";

function Header() {
  const location = useLocation();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(location.pathname);
  const [openDropdown, setOpenDropdown] = useState("");
  const isMenuVisible = isMenuOpen && menuPath === location.pathname;

  useEffect(() => {
    let isMounted = true;

    async function loadTopics() {
      const { data, error } = await supabase
        .from("chu_de")
        .select("id, ten_chu_de, duong_dan")
        .eq("dang_hien_thi", true)
        .order("thu_tu_hien_thi", { ascending: true });

      if (!isMounted) return;

      if (error) {
        console.error("Lỗi tải chủ đề:", error.message);
        setTopics([]);
      } else {
        setTopics(data || []);
      }

      setLoading(false);
    }

    loadTopics();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isMenuVisible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeMobileMenu() {
      setIsMenuOpen(false);
      setOpenDropdown("");
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") closeMobileMenu();
    }

    function handleResize() {
      if (window.innerWidth > 900) closeMobileMenu();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuVisible]);

  function closeMenu() {
    setIsMenuOpen(false);
    setOpenDropdown("");
  }

  function toggleDropdown(dropdownName) {
    setOpenDropdown((currentName) =>
      currentName === dropdownName ? "" : dropdownName,
    );
  }

  return (
    <header className={`site-header${isMenuVisible ? " is-menu-open" : ""}`}>
      <Link to="/" className="site-logo" onClick={closeMenu}>
        <span className="site-logo-icon">🌎</span>
        <span>HỌC LIỆU SỐ ĐỊA LÍ CÁC NGÀNH KINH TẾ VIỆT NAM</span>
      </Link>

      <button
        type="button"
        className="site-menu-toggle"
        aria-expanded={isMenuVisible}
        aria-controls="site-navigation"
        aria-label={isMenuVisible ? "Đóng menu" : "Mở menu"}
        onClick={() => {
          setIsMenuOpen((isOpen) => (menuPath === location.pathname ? !isOpen : true));
          setMenuPath(location.pathname);
          setOpenDropdown("");
        }}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="site-navigation"
        className={`site-nav${isMenuVisible ? " is-open" : ""}`}
        aria-label="Điều hướng chính"
      >
        <Link to="/" onClick={closeMenu}>TRANG CHỦ</Link>

        <div className={`nav-dropdown${openDropdown === "materials" ? " is-open" : ""}`}>
          <div className="nav-dropdown-heading">
            <Link to="/hoc-lieu" className="nav-dropdown-button" onClick={closeMenu}>
              HỌC LIỆU
            </Link>
            <button
              type="button"
              className="nav-dropdown-toggle"
              aria-expanded={openDropdown === "materials"}
              aria-label="Mở danh mục học liệu"
              onClick={() => toggleDropdown("materials")}
            />
          </div>

          <div className="nav-dropdown-menu">
            <Link to="/hoc-lieu" onClick={closeMenu}>Tất cả học liệu</Link>

            {loading ? (
              <span className="nav-dropdown-empty">Đang tải...</span>
            ) : topics.length === 0 ? (
              <span className="nav-dropdown-empty">Chưa có chủ đề</span>
            ) : (
              topics.map((topic) => (
                <Link key={topic.id} to={`/hoc-lieu/${topic.duong_dan}`} onClick={closeMenu}>
                  {topic.ten_chu_de}
                </Link>
              ))
            )}
          </div>
        </div>

        <Link to="/ban-do" onClick={closeMenu}>BẢN ĐỒ</Link>
        <Link to="/luyen-tap" onClick={closeMenu}>LUYỆN TẬP</Link>
        <Link to="/khao-sat" onClick={closeMenu}>KHẢO SÁT</Link>
        <Link to="/huong-dan" onClick={closeMenu}>HƯỚNG DẪN</Link>

        <div className={`nav-dropdown${openDropdown === "library" ? " is-open" : ""}`}>
          <div className="nav-dropdown-heading">
            <Link to="/thu-vien" className="nav-dropdown-button" onClick={closeMenu}>
              THƯ VIỆN
            </Link>
            <button
              type="button"
              className="nav-dropdown-toggle"
              aria-expanded={openDropdown === "library"}
              aria-label="Mở danh mục thư viện"
              onClick={() => toggleDropdown("library")}
            />
          </div>

          <div className="nav-dropdown-menu">
            <Link to="/thu-vien" onClick={closeMenu}>Tổng quan thư viện</Link>
            <Link to="/thu-vien/de-thi" onClick={closeMenu}>Đề thi</Link>
            <Link to="/thu-vien/tin-tuc" onClick={closeMenu}>Tin tức tư liệu</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
