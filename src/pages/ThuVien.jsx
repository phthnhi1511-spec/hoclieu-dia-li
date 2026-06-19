import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import "./ThuVien.css";

function HubMetric({ label, value, note }) {
  return (
    <article className="library-hub-metric">
      <span className="library-hub-metric-label">{label}</span>
      <strong className="library-hub-metric-value">{value}</strong>
      <span className="library-hub-metric-note">{note}</span>
    </article>
  );
}

function HubCard({ eyebrow, title, description, to, note }) {
  return (
    <Link to={to} className="library-hub-card">
      <span className="library-hub-card-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="library-hub-card-footer">
        <span>{note}</span>
        <strong>Đi đến danh sách</strong>
      </div>
    </Link>
  );
}

function ThuVien() {
  const [examCount, setExamCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCounts() {
      setLoading(true);

      const [
        { count: loadedExamCount },
        { count: loadedNewsCount },
      ] = await Promise.all([
        supabase.from("de_thi").select("*", { count: "exact", head: true }).eq("da_xuat_ban", true),
        supabase
          .from("tin_tuc_tu_lieu")
          .select("*", { count: "exact", head: true })
          .eq("da_xuat_ban", true),
      ]);

      if (!isMounted) return;

      setExamCount(loadedExamCount || 0);
      setNewsCount(loadedNewsCount || 0);
      setLoading(false);
    }

    loadCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="library-hub-page">
      <Header />

      <main className="library-hub-main">
        <section className="library-hub-hero">
          <div className="library-hub-hero-content">
            <p className="library-hub-eyebrow">Thư viện số</p>
            <h1>Thư viện được tách theo đúng nhu cầu tra cứu</h1>
            <p>
              Thay vì dồn mọi thứ vào một màn hình, khu thư viện giờ chia rõ thành hai lối đi:
              đề thi tải về và tin tức tư liệu tham khảo. Người dùng chỉ cần chọn đúng khu mình
              cần rồi tiếp tục lọc, tìm và xem nội dung.
            </p>
          </div>
        </section>

        <section className="library-hub-shell">
          <div className="library-hub-topbar">
            <div className="library-hub-breadcrumbs">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <strong>Thư viện</strong>
            </div>

            <Link to="/" className="library-hub-topbar-action">
              Về trang chủ
            </Link>
          </div>

          <div className="library-hub-summary">
            <div className="library-hub-summary-copy">
              <h2>Chọn đúng loại nội dung trước khi vào danh sách</h2>
              <p>
                Mỗi nhóm dữ liệu giờ có trang riêng, bộ lọc riêng và cách hiển thị riêng để tránh
                cảm giác rối như bảng dữ liệu.
              </p>
            </div>

            <HubMetric
              label="Đề thi đã xuất bản"
              value={loading ? "..." : examCount}
              note="Tài liệu tải về"
            />
            <HubMetric
              label="Tin tức đang hiển thị"
              value={loading ? "..." : newsCount}
              note="Nguồn tham khảo ngoài website"
            />
          </div>

          <section className="library-hub-grid">
            <HubCard
              eyebrow="Mục 01"
              title="Đề thi"
              description="Tập trung các đề thi dạng PDF, Word hoặc ảnh để học sinh và giáo viên tải xuống, in ra hoặc dùng trong quá trình ôn luyện."
              to="/thu-vien/de-thi"
              note={loading ? "Đang tải số lượng..." : `${examCount} đề thi đang mở`}
            />

            <HubCard
              eyebrow="Mục 02"
              title="Tin tức tư liệu"
              description="Danh sách bài báo, liên kết và nguồn tư liệu nổi bật. Khi mở, hệ thống vẫn giữ bước xác nhận trước khi chuyển sang website ngoài."
              to="/thu-vien/tin-tuc"
              note={loading ? "Đang tải số lượng..." : `${newsCount} tin tư liệu đang hiển thị`}
            />
          </section>
        </section>
      </main>
    </div>
  );
}

export default ThuVien;
