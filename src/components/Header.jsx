import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Header.css";

function Header() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        <span className="site-logo-icon">🌎</span>
        <span>HỌC LIỆU ĐỊA LÍ KINH TẾ VIỆT NAM</span>
      </Link>

      <nav className="site-nav">
        <Link to="/">TRANG CHỦ</Link>

        <div className="nav-dropdown">
          <button type="button" className="nav-dropdown-button">
            HỌC LIỆU
          </button>

          <div className="nav-dropdown-menu">
            {loading ? (
              <span className="nav-dropdown-empty">Đang tải...</span>
            ) : topics.length === 0 ? (
              <span className="nav-dropdown-empty">Chưa có chủ đề</span>
            ) : (
              topics.map((topic) => (
                <Link key={topic.id} to={`/hoc-lieu/${topic.duong_dan}`}>
                  {topic.ten_chu_de}
                </Link>
              ))
            )}
          </div>
        </div>

        <Link to="/ban-do">BẢN ĐỒ</Link>
        <Link to="/luyen-tap">LUYỆN TẬP</Link>
        <Link to="/khao-sat">KHẢO SÁT</Link>
        <Link to="/thu-vien">THƯ VIỆN</Link>
      </nav>
    </header>
  );
}

export default Header;
