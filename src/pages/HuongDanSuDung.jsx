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

// SVG Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
    <path d="M6 6h10M6 10h10"/>
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" x2="9" y1="3" y2="18"/>
    <line x1="15" x2="15" y1="6" y2="21"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
);

const SurveyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="m9 14 2 2 4-4"/>
  </svg>
);

const LibraryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
    <path d="M6 6h10M6 10h10"/>
  </svg>
);

const FileIcon = ({ type }) => {
  let color = "#0b8b4d";
  if (type === "pdf") color = "#dc3545";
  if (type === "docx") color = "#0d6efd";
  if (type === "pptx") color = "#fd7e14";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="M10 9H8M16 13H8M16 17H8"/>
    </svg>
  );
};

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);

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
            <h1>HƯỚNG DẪN SỬ DỤNG</h1>
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
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Các phân hệ chính trên website
                  </h3>
                  <p className="guide-sitemap-subtitle">Nhấp chuột trực tiếp vào tên phân hệ để chuyển nhanh tới trang tương ứng:</p>
                  
                  <div className="guide-sitemap-grid">
                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon"><HomeIcon /></div>
                      <h4><Link to="/">Trang chủ</Link></h4>
                      <p>Khám phá tổng quan, các nội dung nổi bật, tin tức hữu ích và thông tin liên hệ.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon"><BookIcon /></div>
                      <h4><Link to="/hoc-lieu">Học liệu số</Link></h4>
                      <p>Xem và tải về các loại học liệu (PDF, bài giảng PowerPoint, Kế hoạch dạy học, sơ đồ tư duy, bảng số liệu & biểu đồ) theo từng chủ đề.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon"><MapIcon /></div>
                      <h4><Link to="/ban-do">Bản đồ / Atlat</Link></h4>
                      <p>Hệ thống Bản đồ địa lí tương tác 7 vùng kinh tế lớn và 34 tỉnh thành của Việt Nam, cung cấp thông tin diện tích, dân số và thế mạnh kinh tế.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon"><EditIcon /></div>
                      <h4><Link to="/luyen-tap">Luyện tập trắc nghiệm</Link></h4>
                      <p>Làm bài kiểm tra trắc nghiệm củng cố kiến thức theo chủ đề, nhận kết quả chấm điểm tự động và lời giải thích chi tiết.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon"><SurveyIcon /></div>
                      <h4><Link to="/khao-sat">Khảo sát ý kiến</Link></h4>
                      <p>Nơi học sinh và giáo viên tham gia đóng góp khảo sát ngoài để nâng cấp, cải tiến nội dung website.</p>
                    </div>

                    <div className="guide-sitemap-card">
                      <div className="guide-card-icon"><LibraryIcon /></div>
                      <h4><Link to="/thu-vien">Thư viện tài liệu</Link></h4>
                      <p>Nơi tổng hợp đề thi học kỳ (Word/PDF) cho phép tải xuống và các bài viết tin tức địa lí kinh tế thực tế.</p>
                    </div>
                  </div>
                </div>

                {/* File đính kèm */}
                {config.fileKey && fileUrl ? (
                  <div className="guide-file-section">
                    <h3>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                      </svg>
                      Tài liệu hướng dẫn sử dụng chi tiết
                    </h3>
                    
                    {isImage ? (
                      <div className="guide-image-container">
                        <img src={fileUrl} alt="Hướng dẫn sử dụng chi tiết" className="guide-image" />
                        <div className="guide-image-actions">
                          <a href={fileUrl} download target="_blank" rel="noreferrer" className="btn-guide-download">
                            <DownloadIcon /> Tải ảnh hướng dẫn về máy
                          </a>
                        </div>
                      </div>
                    ) : isDocument ? (
                      <div className="guide-doc-container">
                        <div className="guide-doc-info">
                          <span className="guide-doc-icon">
                            <FileIcon type={fileExtension} />
                          </span>
                          <div className="guide-doc-details">
                            <span className="guide-doc-name">Tài liệu hướng dẫn sử dụng website (định dạng .{fileExtension})</span>
                            <span className="guide-doc-hint">Bạn có thể chọn xem trực tuyến trực tiếp trên web hoặc tải về máy.</span>
                          </div>
                        </div>

                        <div className="guide-doc-actions">
                          <button
                            type="button"
                            className={`btn-guide-preview ${showPreview ? "active" : ""}`}
                            onClick={() => setShowPreview(!showPreview)}
                          >
                            <EyeIcon /> {showPreview ? "Đóng xem trực tiếp" : "Xem trực tiếp"}
                          </button>
                          <a href={fileUrl} download target="_blank" rel="noreferrer" className="btn-guide-download">
                            <DownloadIcon /> Tải hướng dẫn về máy
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
                          <DownloadIcon /> Tải file hướng dẫn đính kèm (định dạng .{fileExtension})
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
