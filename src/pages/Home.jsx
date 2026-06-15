import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import "./Home.css";

const featureItems = [
  {
    title: "Học mọi lúc, mọi nơi",
    description: "Truy cập kho học liệu địa lí trên nhiều thiết bị, phù hợp cho cả học sinh và giáo viên.",
  },
  {
    title: "Nội dung đa dạng",
    description: "Tổng hợp bài giảng, bản đồ, đề thi, quiz, infographic và nhiều tư liệu trực quan.",
  },
  {
    title: "Bám sát chương trình",
    description: "Nội dung được tổ chức theo định hướng học tập và luyện tập của môn Địa lí 9.",
  },
  {
    title: "Hỗ trợ tự học",
    description: "Tạo trải nghiệm học tập rõ ràng, dễ tìm kiếm và dễ quay lại ôn tập theo chủ đề.",
  },
];

const introCards = [
  {
    title: "Nhận thức khoa học địa lí",
    description: "Hiểu được đặc điểm, vai trò và sự phân bố của các ngành kinh tế Việt Nam.",
  },
  {
    title: "Tìm hiểu địa lí bằng trực quan",
    description: "Khai thác bản đồ, Atlat, số liệu, hình ảnh và học liệu số theo cách dễ tiếp cận hơn.",
  },
  {
    title: "Vận dụng kiến thức",
    description: "Kết nối kiến thức với thực tiễn học tập, luyện tập và kiểm tra đánh giá hằng ngày.",
  },
];

const highlightedMaterials = [
  {
    badge: "Học liệu",
    title: "Kho học liệu số",
    description: "Tập hợp PDF, video, bản trình chiếu, infographic và nhiều tư liệu trực quan khác.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    to: "/hoc-lieu",
    action: "Xem học liệu",
  },
  {
    badge: "Bản đồ",
    title: "Bản đồ vùng kinh tế",
    description: "Khám phá các vùng kinh tế bằng bản đồ tương tác và thông tin do admin quản lý.",
    image:
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=900&q=80",
    to: "/ban-do",
    action: "Mở bản đồ",
  },
  {
    badge: "Luyện tập",
    title: "Bài kiểm tra trắc nghiệm",
    description: "Làm bài, lưu kết quả, xem đáp án và giải thích ngay sau khi hoàn thành.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    to: "/luyen-tap",
    action: "Làm bài ngay",
  },
  {
    badge: "Khảo sát",
    title: "Khảo sát học tập",
    description: "Tổng hợp các biểu mẫu khảo sát để lấy ý kiến và đánh giá trải nghiệm học tập.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    to: "/khao-sat",
    action: "Xem khảo sát",
  },
  {
    badge: "Thư viện",
    title: "Đề thi và tư liệu",
    description: "Lưu trữ đề thi, tài liệu tham khảo và các nguồn hỗ trợ ôn tập riêng cho học sinh.",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
    to: "/thu-vien",
    action: "Mở thư viện",
  },
  {
    badge: "Tổng hợp",
    title: "Không gian học tập tập trung",
    description: "Gom học liệu, bản đồ, quiz và đề thi vào một luồng sử dụng đơn giản, dễ theo dõi.",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80",
    to: "/hoc-lieu",
    action: "Khám phá thêm",
  },
];

const footerLinks = [
  { label: "Trang chủ", to: "/" },
  { label: "Học liệu", to: "/hoc-lieu" },
  { label: "Bản đồ", to: "/ban-do" },
  { label: "Luyện tập", to: "/luyen-tap" },
  { label: "Khảo sát", to: "/khao-sat" },
];

function HomeMaterialCard({ item }) {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(item.image) && !hasImageError;

  return (
    <article className="home-material-card">
      <div className="home-material-image-wrap">
        {shouldShowImage ? (
          <img
            src={item.image}
            alt={item.title}
            className="home-material-image"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="home-material-image-placeholder">
            <span>{item.badge}</span>
          </div>
        )}
      </div>

      <div className="home-material-body">
        <span className="home-material-badge">{item.badge}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <Link to={item.to} className="home-material-link">
          {item.action}
        </Link>
      </div>
    </article>
  );
}

function Home() {
  return (
    <div className="home-page">
      <Header />

      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-content">
            <p className="home-hero-eyebrow">HỌC LIỆU SỐ ĐỊA LÍ 9</p>
            <h1>
              Học liệu số
              <br />
              Địa lí Kinh tế Việt Nam
            </h1>
            <p className="home-hero-description">
              Khám phá, tìm hiểu và vận dụng kiến thức địa lí bằng hệ thống học liệu trực quan, dễ
              dùng và bám sát chương trình học.
            </p>

            <div className="home-hero-actions">
              <Link to="/hoc-lieu" className="home-button home-button-primary">
                Bắt đầu học tập
              </Link>
              <Link to="/luyen-tap" className="home-button home-button-secondary">
                Xem luyện tập
              </Link>
            </div>
          </div>

          <div className="home-feature-strip">
            {featureItems.map((item) => (
              <article key={item.title} className="home-feature-card">
                <span className="home-feature-icon" aria-hidden="true">
                  +
                </span>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-heading">
            <p className="home-section-kicker">Giới thiệu</p>
            <h2>Giới thiệu website</h2>
            <p>
              Website học liệu số Địa lí Kinh tế Việt Nam được xây dựng để hỗ trợ học sinh và giáo
              viên khai thác học liệu trực quan, bản đồ, bài luyện tập và các nguồn tư liệu học tập
              trong cùng một không gian thống nhất.
            </p>
          </div>

          <div className="home-intro-grid">
            {introCards.map((item, index) => (
              <article key={item.title} className="home-intro-card">
                <span className="home-intro-badge">{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-highlight-section">
          <div className="home-section-heading">
            <p className="home-section-kicker">Nổi bật</p>
            <h2>Học liệu nổi bật</h2>
            <p>
              Từ trang chủ, người dùng có thể đi vào các khu chức năng chính hoặc mở toàn bộ học
              liệu để lọc tiếp theo chủ đề và loại nội dung.
            </p>
          </div>

          <div className="home-material-grid">
            {highlightedMaterials.map((item) => (
              <HomeMaterialCard key={item.title} item={item} />
            ))}
          </div>

          <div className="home-material-cta">
            <Link to="/hoc-lieu" className="home-button home-button-primary">
              Xem toàn bộ học liệu
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer-grid">
          <div className="home-footer-brand">
            <p className="home-footer-kicker">Học liệu địa lí kinh tế Việt Nam</p>
            <h2>Không gian học tập trực quan cho Địa lí 9</h2>
            <p>
              Hệ thống hỗ trợ tìm học liệu, khai thác bản đồ, làm bài luyện tập và tra cứu tài liệu
              theo một giao diện thống nhất.
            </p>
          </div>

          <div>
            <h3>Liên kết nhanh</h3>
            <ul className="home-footer-links">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Hỗ trợ</h3>
            <ul className="home-footer-links">
              <li>Tìm kiếm học liệu theo nhu cầu học tập</li>
              <li>Khai thác bản đồ tương tác theo vùng kinh tế</li>
              <li>Làm bài và xem lại kết quả kiểm tra</li>
            </ul>
          </div>

          <div>
            <h3>Liên hệ</h3>
            <ul className="home-footer-links">
              <li>Email: phthnhi1511@gmail.com</li>
              <li>Điện thoại: 0774523201</li>
              <li>Đại học Sư phạm - Đại học Đà Nẵng</li>
            </ul>
          </div>
        </div>

        <p className="home-footer-copy">© 2026 Học liệu Địa lí Kinh tế Việt Nam. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
