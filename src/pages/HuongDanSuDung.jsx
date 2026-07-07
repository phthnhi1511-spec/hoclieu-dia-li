import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import { resolveR2ObjectUrl } from "../lib/r2";
import "./HuongDanSuDung.css";

const officeViewerBaseUrl = "https://view.officeapps.live.com/op/embed.aspx?src=";

function getFileExtension(filePath) {
  const cleanValue = (filePath || "").split("?")[0].toLowerCase();
  const segments = cleanValue.split(".");
  return segments.length > 1 ? segments.at(-1) : "";
}

function HuongDanSuDung() {
  const [config, setConfig] = useState({
    title: "Hướng dẫn sử dụng website Học liệu số Địa lí 9",
    content: "Chào mừng bạn đến với website học liệu số hỗ trợ dạy và học Địa lí 9! Website được thiết kế trực quan nhằm giúp học sinh tự học và giáo viên dễ dàng khai thác tài nguyên học liệu số Địa lí Kinh tế Việt Nam.",
    fileKey: "",
  });
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cau_hinh_website")
          .select("khoa_cau_hinh, gia_tri_cau_hinh")
          .in("khoa_cau_hinh", ["guide_page_title", "guide_page_content", "guide_page_file"]);

        if (error) throw error;

        const dataMap = (data || []).reduce((acc, row) => {
          acc[row.khoa_cau_hinh] = row.gia_tri_cau_hinh || "";
          return acc;
        }, {});

        if (!isMounted) return;

        const title = dataMap.guide_page_title || "Hướng dẫn sử dụng website Học liệu số Địa lí 9";
        const content = dataMap.guide_page_content || "Chào mừng bạn đến với website học liệu số hỗ trợ dạy và học Địa lí 9! Website được thiết kế trực quan nhằm giúp học sinh tự học và giáo viên dễ dàng khai thác tài nguyên học liệu số Địa lí Kinh tế Việt Nam.";
        const fileKey = dataMap.guide_page_file || "";

        setConfig({ title, content, fileKey });

        if (fileKey) {
          const url = await resolveR2ObjectUrl(fileKey);
          if (isMounted) {
            setFileUrl(url);
          }
        }
      } catch (err) {
        console.error("Lỗi tải thông tin hướng dẫn sử dụng:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fileExtension = getFileExtension(config.fileKey);
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(fileExtension);
  const isDocument = ["docx", "pptx", "pdf"].includes(fileExtension);

  let embedUrl = "";
  if (isDocument && fileUrl) {
    if (fileExtension === "pdf") {
      embedUrl = fileUrl;
    } else {
      embedUrl = `${officeViewerBaseUrl}${encodeURIComponent(fileUrl)}`;
    }
  }

  return (
    <div className="guide-page-container">
      <Header />

      <main className="guide-main">
        {/* Banner */}
        <section className="guide-banner">
          <div className="guide-banner-overlay" />
          <div className="guide-banner-content">
            <h1>📖 HƯỚNG DẪN SỬ DỤNG</h1>
            <p>Khai thác hiệu quả tài nguyên học liệu số Địa lí Kinh tế Việt Nam</p>
          </div>
        </section>

        <div className="guide-layout">
          {/* Main content */}
          <div className="guide-content-section">
            {loading ? (
              <div className="guide-loading">
                <div className="guide-spinner" />
                <p>Đang tải hướng dẫn sử dụng...</p>
              </div>
            ) : (
              <>
                <h2 className="guide-title">{config.title}</h2>
                <p className="guide-intro">{config.content}</p>

                {/* Sitemap & Modules guide */}
                <div className="guide-sitemap-section">
                  <h3>🗺️ Các phân hệ chính trên website</h3>
                  <p className="guide-sitemap-subtitle">Hãy click trực tiếp vào tên phân hệ để di chuyển nhanh tới trang tương ứng:</p>
                  
                  <div className="guide-sitemap-grid">
                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon">🏠</div>
                      <h4><Link to="/">Trang chủ</Link></h4>
                      <p>Giới thiệu chung, hiển thị học liệu nổi bật, tin tức tiêu biểu và liên hệ của ban quản trị.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon">📚</div>
                      <h4><Link to="/hoc-lieu">Học liệu số</Link></h4>
                      <p>Kho học liệu điện tử đa dạng (PDF, bài giảng PowerPoint, Kế hoạch dạy học, sơ đồ tư duy, bảng số liệu & biểu đồ) theo các chủ đề lớn.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon">🗺️</div>
                      <h4><Link to="/ban-do">Bản đồ / Atlat</Link></h4>
                      <p>Hệ thống Bản đồ địa lí tương tác 7 vùng kinh tế lớn và 34 tỉnh thành của Việt Nam, cung cấp thông tin diện tích, dân số và thế mạnh kinh tế.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon">✏️</div>
                      <h4><Link to="/luyen-tap">Luyện tập trắc nghiệm</Link></h4>
                      <p>Làm bài kiểm tra trắc nghiệm củng cố kiến thức theo chủ đề, nhận kết quả chấm điểm tự động và lời giải thích chi tiết.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon">📋</div>
                      <h4><Link to="/khao-sat">Khảo sát ý kiến</Link></h4>
                      <p>Nơi học sinh và giáo viên tham gia đóng góp khảo sát ngoài để nâng cấp, cải tiến nội dung website.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon">🏛️</div>
                      <h4><Link to="/thu-vien">Thư viện tài liệu</Link></h4>
                      <p>Nơi tổng hợp đề thi học kỳ (Word/PDF) cho phép tải xuống và các bài viết tin tức địa lí kinh tế thực tế.</p>
                    </div>
                  </div>
                </div>

                {/* File đính kèm */}
                {config.fileKey && fileUrl ? (
                  <div className="guide-file-section">
                    <h3>file_present tài liệu hướng dẫn cụ thể</h3>
                    
                    {isImage ? (
                      <div className="guide-image-container">
                        <img src={fileUrl} alt="Hướng dẫn sử dụng chi tiết" className="guide-image" />
                        <div className="guide-image-actions">
                          <a href={fileUrl} download target="_blank" rel="noreferrer" className="btn-guide-download">
                            ⬇️ Tải ảnh hướng dẫn về máy
                          </a>
                        </div>
                      </div>
                    ) : isDocument ? (
                      <div className="guide-doc-container">
                        <div className="guide-doc-info">
                          <span className="guide-doc-icon">
                            {fileExtension === "pdf" ? "📕" : fileExtension === "pptx" ? "📙" : "📘"}
                          </span>
                          <div className="guide-doc-details">
                            <span className="guide-doc-name">Tài liệu hướng dẫn sử dụng website (. {fileExtension})</span>
                            <span className="guide-doc-hint">Bạn có thể chọn xem trực tiếp trực tuyến hoặc tải về máy.</span>
                          </div>
                        </div>

                        <div className="guide-doc-actions">
                          <button
                            type="button"
                            className={`btn-guide-preview ${showPreview ? "active" : ""}`}
                            onClick={() => setShowPreview(!showPreview)}
                          >
                            👁️ {showPreview ? "Đóng xem trực tiếp" : "Xem trực tiếp"}
                          </button>
                          <a href={fileUrl} download target="_blank" rel="noreferrer" className="btn-guide-download">
                            ⬇️ Tải hướng dẫn về máy
                          </a>
                        </div>

                        {showPreview && embedUrl ? (
                          <div className="guide-iframe-preview">
                            <iframe src={embedUrl} title="Xem trực tiếp tài liệu hướng dẫn" loading="lazy" />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="guide-generic-file">
                        <a href={fileUrl} download target="_blank" rel="noreferrer" className="btn-guide-download">
                          ⬇️ Tải file hướng dẫn đính kèm (. {fileExtension})
                        </a>
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HuongDanSuDung;
