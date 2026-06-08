function NongNghiep() {
  return (
    <div>
      {/* BANNER */}
      <section
        style={{
          height: "350px",
          background:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600')",
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
        <h1 style={{ fontSize: "60px" }}>
          🌾 CHỦ ĐỀ NÔNG NGHIỆP
        </h1>

        <p style={{ fontSize: "22px" }}>
          Khám phá ngành nông nghiệp Việt Nam
        </p>
      </section>

      {/* KHỞI ĐỘNG */}
      <section
        style={{
          padding: "70px 10%",
          background: "#fff8e1",
        }}
      >
        <h2 style={{ color: "#ef6c00" }}>
          🟧 KHỞI ĐỘNG
        </h2>

        <div className="card">
          <h3>🎥 Video mở đầu</h3>

          <p>
            Video giới thiệu vai trò của ngành nông nghiệp đối với nền kinh tế
            Việt Nam.
          </p>

          <h3>❓ Câu hỏi dẫn nhập</h3>

          <p>
            Vì sao Việt Nam là một trong những quốc gia xuất khẩu nông sản hàng
            đầu thế giới?
          </p>
        </div>
      </section>

      {/* KHÁM PHÁ KIẾN THỨC */}
      <section
        style={{
          padding: "70px 10%",
          background: "#f5f7fa",
        }}
      >
        <h2
          style={{
            color: "#1565c0",
            marginBottom: "40px",
          }}
        >
          🟦 KHÁM PHÁ KIẾN THỨC
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))",
            gap: "30px",
          }}
        >
          <div className="card">
            <h3>🌱 TRỒNG TRỌT</h3>

            <h4>🌾 Cây lương thực</h4>
            <ul>
              <li>Lúa</li>
              <li>Ngô</li>
            </ul>

            <h4>☕ Cây công nghiệp hàng năm</h4>
            <ul>
              <li>Mía</li>
              <li>Lạc</li>
              <li>Đậu tương</li>
            </ul>

            <h4>🌳 Cây công nghiệp lâu năm</h4>
            <ul>
              <li>Cà phê</li>
              <li>Cao su</li>
              <li>Hồ tiêu</li>
              <li>Điều</li>
            </ul>

            <h4>🍊 Cây ăn quả</h4>
            <ul>
              <li>Sầu riêng</li>
              <li>Thanh long</li>
              <li>Cam</li>
              <li>Bưởi</li>
            </ul>
          </div>

          <div className="card">
            <h3>🐄 CHĂN NUÔI</h3>

            <h4>🐃 Gia súc</h4>
            <ul>
              <li>Trâu</li>
              <li>Bò</li>
              <li>Lợn</li>
            </ul>

            <h4>🐔 Gia cầm</h4>
            <ul>
              <li>Gà</li>
              <li>Vịt</li>
              <li>Ngan</li>
            </ul>

            <h4>📍 Vai trò</h4>
            <p>
              Cung cấp thực phẩm, nguyên liệu cho công nghiệp chế biến và tạo
              việc làm cho người lao động.
            </p>
          </div>
        </div>
      </section>

      {/* KHAI THÁC ĐỊA LÍ */}
      <section
        style={{
          padding: "70px 10%",
          background: "#e8f5e9",
        }}
      >
        <h2 style={{ color: "#2e7d32" }}>
          🟩 KHAI THÁC ĐỊA LÍ
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "25px",
          }}
        >
          <div className="card">
            <h3>🗺️ Bản đồ tương tác</h3>
            <p>Phân bố lúa, cà phê, cao su và cây ăn quả.</p>
          </div>

          <div className="card">
            <h3>📊 Biểu đồ</h3>
            <p>Sản lượng lúa, cà phê và chăn nuôi.</p>
          </div>

          <div className="card">
            <h3>📋 Bảng số liệu</h3>
            <p>Khai thác và phân tích số liệu nông nghiệp.</p>
          </div>
        </div>
      </section>

      {/* LUYỆN TẬP */}
      <section
        style={{
          padding: "70px 10%",
          background: "#fffde7",
        }}
      >
        <h2 style={{ color: "#f9a825" }}>
          🟨 LUYỆN TẬP
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "25px",
          }}
        >
          <div className="card">📝 Quiz</div>
          <div className="card">🧠 Flashcard</div>
          <div className="card">🎮 Trò chơi học tập</div>
          <div className="card">🧩 Kéo thả</div>
        </div>
      </section>

      {/* VẬN DỤNG */}
      <section
        style={{
          padding: "70px 10%",
          background: "#ffebee",
        }}
      >
        <h2 style={{ color: "#c62828" }}>
          🟥 VẬN DỤNG
        </h2>

        <div className="card">
          <h3>💡 Tình huống thực tiễn</h3>

          <p>
            Nếu địa phương em muốn phát triển cây công nghiệp thì cần những điều
            kiện nào?
          </p>
        </div>
      </section>

      {/* MỞ RỘNG */}
      <section
        style={{
          padding: "70px 10%",
          background: "#f3e5f5",
        }}
      >
        <h2 style={{ color: "#7b1fa2" }}>
          🟪 MỞ RỘNG
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "25px",
          }}
        >
          <div className="card">
            🎥 Video tham khảo
          </div>

          <div className="card">
            📰 Tin tức nông nghiệp
          </div>

          <div className="card">
            📚 Tài liệu tham khảo
          </div>
        </div>
      </section>
    </div>
  );
}

export default NongNghiep;