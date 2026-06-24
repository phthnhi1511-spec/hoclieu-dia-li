import { Routes, Route } from "react-router-dom";
import NongNghiep from "./pages/NongNghiep";
function App() {
  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 40px",
          background: "#0f440f",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <div style={{ fontSize: "40px" }}>🌎</div>

  <div
    style={{
      fontSize: "28px",
      fontWeight: "bold",
      color: "white",
    }}
  >
    HỌC LIỆU ĐỊA LÍ KINH TẾ VIỆT NAM
  </div>
</div>
        <nav
          style={{
            display: "flex",
            gap: "25px",
            fontWeight: "bold",
            color: "white",
          }}
        >
          <span>TRANG CHỦ</span>
          <span>BÀI HỌC</span>
          <span>GÓC BẢN ĐỒ</span>
          <span>THƯ VIỆN</span>
          <span>KHẢO SÁT</span>
          <span>GIỚI THIỆU</span>
        </nav>
      </header>

      <section
        style={{
          height: "550px",
          background:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "800",
            letterSpacing: "2px",
            marginBottom: "10px",
          }}
        >
          HỌC LIỆU SỐ
        </h1>

        <h2
          style={{
            fontSize: "48px",
            marginTop: 0,
          }}
        >
          ĐỊA LÍ KINH TẾ VIỆT NAM
        </h2>

        <p
          style={{
            fontSize: "24px",
            marginBottom: "30px",
          }}
        >
          Khám phá – Tìm hiểu – Vận dụng kiến thức địa lí
        </p>

        <button
          style={{
            background: "#0b8b4d",
            color: "white",
            border: "none",
            padding: "16px 40px",
            borderRadius: "40px",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          📖 BẮT ĐẦU HỌC TẬP
        </button>
      </section>
            {/* GIỚI THIỆU WEBSITE */}
      <section
        style={{
          padding: "80px 10%",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "42px",
            color: "#0b6b3a",
            marginBottom: "20px",
          }}
        >
          GIỚI THIỆU WEBSITE
        </h2>

        <p
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            fontSize: "18px",
            lineHeight: "1.8",
            color: "#555",
          }}
        >
          Website học liệu số Địa lí Kinh tế Việt Nam được xây dựng nhằm hỗ trợ
          học sinh học tập, khám phá kiến thức và phát triển năng lực địa lí
          thông qua hệ thống bản đồ, video, trò chơi học tập, biểu đồ và nhiều
          học liệu trực quan khác.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
            marginTop: "60px",
          }}
        >
          <div className="card">
            <div className="card-icon">🌍</div>
            <h3>Nhận thức khoa học địa lí</h3>
            <p>
              Hiểu được đặc điểm, vai trò và sự phân bố của các ngành kinh tế.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">🗺️</div>
            <h3>Tìm hiểu địa lí</h3>
            <p>
              Khai thác bản đồ, Atlat, số liệu thống kê và học liệu số.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">💡</div>
            <h3>Vận dụng kiến thức</h3>
            <p>
              Giải quyết các tình huống thực tiễn gắn với địa phương và đất
              nước.
            </p>
          </div>
        </div>
      </section>
            {/* DANH MỤC BÀI HỌC */}
      <section
        style={{
          padding: "80px 10%",
          background: "#f5f7fa",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#0b6b3a",
            fontSize: "42px",
            marginBottom: "50px",
          }}
        >
          DANH MỤC BÀI HỌC
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "25px",
          }}
        >
          <div className="card">
            <div className="card-icon">🌾</div>
            <h3>NÔNG NGHIỆP</h3>
            <p>Trồng trọt • Chăn nuôi</p>
            <button className="hero-btn">Khám phá</button>
          </div>

          <div className="card">
            <div className="card-icon">🌳</div>
            <h3>LÂM NGHIỆP & THỦY SẢN</h3>
            <p>Lâm nghiệp • Thủy sản</p>
            <button className="hero-btn">Khám phá</button>
          </div>

          <div className="card">
            <div className="card-icon">🏭</div>
            <h3>CÔNG NGHIỆP</h3>
            <p>Các ngành công nghiệp trọng điểm</p>
            <button className="hero-btn">Khám phá</button>
          </div>

          <div className="card">
            <div className="card-icon">🚆</div>
            <h3>DỊCH VỤ</h3>
            <p>Giao thông • Thương mại • Du lịch</p>
            <button className="hero-btn">Khám phá</button>
          </div>
        </div>
      </section>      {/* HỌC LIỆU NỔI BẬT */}
      <section
        style={{
          padding: "80px 10%",
          background: "#ffffff",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#0b6b3a",
            fontSize: "42px",
            marginBottom: "50px",
          }}
        >
          HỌC LIỆU NỔI BẬT
        </h2>

        <div className="card-container">
          <div className="card">
            <div className="card-icon">🗺️</div>
            <h3>Bản đồ tương tác</h3>
            <p>Khám phá các vùng kinh tế Việt Nam.</p>
          </div>

          <div className="card">
            <div className="card-icon">📊</div>
            <h3>Biểu đồ - Số liệu</h3>
            <p>Hệ thống biểu đồ và dữ liệu trực quan.</p>
          </div>

          <div className="card">
            <div className="card-icon">🎮</div>
            <h3>Trò chơi học tập</h3>
            <p>Học mà chơi - Chơi mà học.</p>
          </div>

          <div className="card">
            <div className="card-icon">📚</div>
            <h3>Thư viện học tập</h3>
            <p>Tổng hợp PDF, Atlas, video, infographic.</p>
          </div>
        </div>
      </section>
      <footer className="footer">
  <h2>HỌC LIỆU ĐỊA LÍ KINH TẾ VIỆT NAM</h2>

  <p>
    Website học liệu số hỗ trợ dạy học và học tập Địa lí Kinh tế Việt Nam theo
    định hướng phát triển năng lực.
  </p>

  <br />

  <p>
    <strong>Tác giả:</strong> Phan Thị Hoài Nhi
  </p>

  <p>
    Sinh viên ngành Sư phạm Lịch sử - Địa lí
  </p>

  <p>
    Trường Đại học Sư phạm – Đại học Đà Nẵng
  </p>

  <br />

  <p>📧 Email: phthnhi1511@gmail.com</p>

  <p>📱 Điện thoại: 0774523201</p>

  <p>
    🌐 Fanpage: Địa lý 4.0
  </p>

  <br />

  <p>
    © 2026 Phan Thị Hoài Nhi. All Rights Reserved.
  </p>
</footer>
    </div>
  );
}

export default App;