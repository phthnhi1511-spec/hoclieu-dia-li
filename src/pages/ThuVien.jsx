import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { getFileExtension, parseMediaList } from "../lib/materialUtils";
import { buildR2FileUrl, buildR2ProxyFileUrl } from "../lib/r2";
import { supabase } from "../lib/supabaseClient";
import "./ThuVien.css";

const EXAMS_PER_PAGE = 6;
const NEWS_PER_PAGE = 6;
const SKELETON_CARD_COUNT = 6;

function normalizeExternalUrl(url) {
  if (!url) return "";

  const trimmedUrl = String(url).trim();

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl.replace(/^\/+/, "")}`;
}

function formatPublishDate(value) {
  if (!value) return "Chưa cập nhật ngày đăng";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật ngày đăng";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getExamKindLabel(filePath) {
  const extension = getFileExtension(filePath);

  if (extension === "pdf") return "PDF";
  if (["doc", "docx"].includes(extension)) return "WORD";
  if (["jpg", "jpeg", "png", "webp"].includes(extension)) return "ẢNH";

  return "TỆP";
}

function getExamThumbnailUrl(exam) {
  const previewImages = parseMediaList(exam.duong_dan_anh_dai_dien);

  if (previewImages[0]) {
    return buildR2FileUrl(previewImages[0]);
  }

  if (["jpg", "jpeg", "png", "webp"].includes(getFileExtension(exam.duong_dan_file))) {
    return buildR2FileUrl(exam.duong_dan_file);
  }

  return "";
}

function ControlsSkeleton() {
  return (
    <section className="library-controls library-controls-skeleton" aria-hidden="true">
      <div>
        <div className="library-skeleton library-skeleton-label" />
        <div className="library-skeleton library-skeleton-input" />
      </div>
      <div>
        <div className="library-skeleton library-skeleton-label" />
        <div className="library-skeleton library-skeleton-input" />
      </div>
    </section>
  );
}

function ExamCard({ exam, topicName }) {
  const thumbnailUrl = getExamThumbnailUrl(exam);
  const fileTypeLabel = getExamKindLabel(exam.duong_dan_file);
  const downloadUrl = buildR2ProxyFileUrl(exam.duong_dan_file);
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(thumbnailUrl) && !hasImageError;

  return (
    <article className="library-card">
      {shouldShowImage ? (
        <img
          className="library-card-image"
          src={thumbnailUrl}
          alt={exam.tieu_de}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="library-card-image library-card-image-placeholder">
          <span>{fileTypeLabel}</span>
        </div>
      )}

      <div className="library-card-body">
        <div className="library-card-tags">
          <span>Đề thi</span>
          <span>{fileTypeLabel}</span>
          {topicName ? <span>{topicName}</span> : null}
        </div>

        <h2>{exam.tieu_de}</h2>
        <p>{exam.mo_ta || "Tài liệu đề thi đã sẵn sàng để tải về và sử dụng trong quá trình ôn luyện."}</p>

        <div className="library-card-meta">
          {exam.ten_nguon ? <span>Nguồn: {exam.ten_nguon}</span> : <span>Tệp tải xuống</span>}
        </div>

        <div className="library-card-actions">
          <a href={downloadUrl} target="_blank" rel="noreferrer" download>
            Tải đề thi
          </a>
        </div>
      </div>
    </article>
  );
}

function NewsCard({ news, topicName, onOpen }) {
  const imageUrl = news.duong_dan_anh_dai_dien ? buildR2FileUrl(news.duong_dan_anh_dai_dien) : "";
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(imageUrl) && !hasImageError;

  return (
    <article className="library-card">
      {shouldShowImage ? (
        <img
          className="library-card-image"
          src={imageUrl}
          alt={news.tieu_de}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="library-card-image library-card-image-news">
          <span>Tin tức</span>
        </div>
      )}

      <div className="library-card-body">
        <div className="library-card-tags">
          <span>Tin tức</span>
          {topicName ? <span>{topicName}</span> : null}
          <span>{formatPublishDate(news.ngay_xuat_ban)}</span>
        </div>

        <h2>{news.tieu_de}</h2>
        <p>{news.tom_tat || "Bài viết nổi bật liên quan đến nội dung học tập và thực tiễn địa lí kinh tế."}</p>

        <div className="library-card-meta">
          <span>{news.ten_nguon || "Nguồn ngoài website"}</span>
        </div>

        <div className="library-card-actions">
          <button type="button" onClick={() => onOpen(news)}>
            Xem tin bên ngoài
          </button>
        </div>
      </div>
    </article>
  );
}

function LibraryCardSkeleton() {
  return (
    <article className="library-card library-card-skeleton" aria-hidden="true">
      <div className="library-card-image">
        <div className="library-skeleton library-skeleton-thumb" />
      </div>

      <div className="library-card-body">
        <div className="library-card-tags">
          <div className="library-skeleton library-skeleton-chip" />
          <div className="library-skeleton library-skeleton-chip" />
        </div>

        <div className="library-skeleton library-skeleton-title" />
        <div className="library-skeleton library-skeleton-text library-skeleton-text-wide" />
        <div className="library-skeleton library-skeleton-text" />

        <div className="library-card-meta">
          <div className="library-skeleton library-skeleton-chip library-skeleton-chip-wide" />
        </div>

        <div className="library-card-actions">
          <div className="library-skeleton library-skeleton-button" />
        </div>
      </div>
    </article>
  );
}

function LibraryPagination({ currentPage, totalPages, onPageChange, ariaLabel }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="library-pagination" aria-label={ariaLabel}>
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Trang trước
      </button>

      <div className="library-pagination-pages">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={page === currentPage ? "is-active" : ""}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Trang sau
      </button>
    </nav>
  );
}

function ExitConfirmModal({ news, onClose }) {
  if (!news) return null;

  const externalUrl = normalizeExternalUrl(news.duong_dan_nguon);

  return (
    <div className="library-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="library-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-exit-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="library-modal-eyebrow">Xác nhận rời website</p>
        <h2 id="library-exit-modal-title">{news.tieu_de}</h2>
        <p>
          Bạn sắp mở một bài viết từ nguồn bên ngoài. Hệ thống sẽ điều hướng sang trang khác để xem
          nội dung đầy đủ.
        </p>

        <div className="library-modal-source">
          <strong>Nguồn:</strong>
          <span>{news.ten_nguon || externalUrl}</span>
        </div>

        <div className="library-modal-actions">
          <button type="button" className="library-modal-cancel" onClick={onClose}>
            Ở lại trang này
          </button>
          <a href={externalUrl} target="_blank" rel="noreferrer" onClick={onClose}>
            Tiếp tục mở bài viết
          </a>
        </div>
      </div>
    </div>
  );
}

function ThuVien() {
  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("tat-ca");
  const [currentExamPage, setCurrentExamPage] = useState(1);
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeExternalNews, setActiveExternalNews] = useState(null);
  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    let isMounted = true;

    async function loadLibraryPage() {
      setLoading(true);
      setError("");

      const [
        { data: topicsData, error: topicsError },
        { data: examsData, error: examsError },
        { data: newsData, error: newsError },
      ] = await Promise.all([
        supabase
          .from("chu_de")
          .select("id, ten_chu_de")
          .eq("dang_hien_thi", true)
          .order("thu_tu_hien_thi", { ascending: true }),
        supabase
          .from("de_thi")
          .select("id, tieu_de, mo_ta, duong_dan_file, duong_dan_anh_dai_dien, ten_nguon, chu_de_id")
          .eq("da_xuat_ban", true)
          .order("id", { ascending: false }),
        supabase
          .from("tin_tuc_tu_lieu")
          .select(
            "id, tieu_de, tom_tat, duong_dan_anh_dai_dien, ten_nguon, duong_dan_nguon, ngay_xuat_ban, chu_de_id",
          )
          .eq("da_xuat_ban", true)
          .order("ngay_xuat_ban", { ascending: false }),
      ]);

      if (!isMounted) return;

      if (topicsError) {
        setError(`Không thể tải chủ đề: ${topicsError.message}`);
        setTopics([]);
        setExams([]);
        setNewsList([]);
        setLoading(false);
        return;
      }

      if (examsError) {
        if (examsError.message?.includes("relation") && examsError.message?.includes("de_thi")) {
          setError(
            "Bảng de_thi chưa tồn tại trong Supabase. Cần chạy file supabase/seeds/2026-06-15_de_thi_thu_vien.sql rồi tải lại trang.",
          );
        } else {
          setError(`Không thể tải đề thi: ${examsError.message}`);
        }
        setTopics(topicsData || []);
        setExams([]);
        setNewsList(newsData || []);
        setLoading(false);
        return;
      }

      if (newsError) {
        setError(`Không thể tải tin tức: ${newsError.message}`);
        setTopics(topicsData || []);
        setExams(examsData || []);
        setNewsList([]);
        setLoading(false);
        return;
      }

      setTopics(topicsData || []);
      setExams(examsData || []);
      setNewsList(newsData || []);
      setLoading(false);
    }

    loadLibraryPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const topicNameById = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic.ten_chu_de])),
    [topics],
  );

  const normalizedKeyword = deferredSearchText.trim().toLowerCase();

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const topicName = topicNameById.get(exam.chu_de_id) || "";
      const matchesTopic =
        selectedTopicId === "tat-ca" || exam.chu_de_id === Number(selectedTopicId);
      const matchesSearch =
        normalizedKeyword === "" ||
        exam.tieu_de?.toLowerCase().includes(normalizedKeyword) ||
        exam.mo_ta?.toLowerCase().includes(normalizedKeyword) ||
        topicName.toLowerCase().includes(normalizedKeyword);

      return matchesTopic && matchesSearch;
    });
  }, [exams, normalizedKeyword, selectedTopicId, topicNameById]);

  const filteredNews = useMemo(() => {
    return newsList.filter((news) => {
      const topicName = topicNameById.get(news.chu_de_id) || "";
      const matchesTopic =
        selectedTopicId === "tat-ca" || news.chu_de_id === Number(selectedTopicId);
      const matchesSearch =
        normalizedKeyword === "" ||
        news.tieu_de?.toLowerCase().includes(normalizedKeyword) ||
        news.tom_tat?.toLowerCase().includes(normalizedKeyword) ||
        topicName.toLowerCase().includes(normalizedKeyword) ||
        news.ten_nguon?.toLowerCase().includes(normalizedKeyword);

      return matchesTopic && matchesSearch;
    });
  }, [newsList, normalizedKeyword, selectedTopicId, topicNameById]);

  const examTotalPages = Math.max(1, Math.ceil(filteredExams.length / EXAMS_PER_PAGE));
  const newsTotalPages = Math.max(1, Math.ceil(filteredNews.length / NEWS_PER_PAGE));
  const currentExamPageSafe = Math.min(currentExamPage, examTotalPages);
  const currentNewsPageSafe = Math.min(currentNewsPage, newsTotalPages);

  const paginatedExams = filteredExams.slice(
    (currentExamPageSafe - 1) * EXAMS_PER_PAGE,
    currentExamPageSafe * EXAMS_PER_PAGE,
  );

  const paginatedNews = filteredNews.slice(
    (currentNewsPageSafe - 1) * NEWS_PER_PAGE,
    currentNewsPageSafe * NEWS_PER_PAGE,
  );

  return (
    <div>
      <Header />

      <main className="library-page">
        <section className="library-hero">
          <p className="library-eyebrow">Thư viện số</p>
          <h1>Thư viện đề thi và tin tức học tập</h1>
          <p>
            Tập trung các đề thi tải về và các bài báo nổi bật liên quan đến nội dung Địa lí Kinh tế
            Việt Nam để học sinh, giáo viên tra cứu nhanh trong cùng một nơi.
          </p>
        </section>

        <section className="library-topbar">
          <div className="library-breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <strong>Thư viện</strong>
          </div>

          <Link to="/" className="library-topbar-action">
            Về trang chủ
          </Link>
        </section>

        {loading ? (
          <>
            <ControlsSkeleton />

            <section className="library-section">
              <div className="library-section-head">
                <div>
                  <div className="library-skeleton library-skeleton-title library-skeleton-title-short" />
                  <div className="library-skeleton library-skeleton-text" />
                </div>
              </div>

              <div className="library-grid">
                {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                  <LibraryCardSkeleton key={`exam-skeleton-${index}`} />
                ))}
              </div>
            </section>

            <section className="library-section">
              <div className="library-section-head">
                <div>
                  <div className="library-skeleton library-skeleton-title library-skeleton-title-short" />
                  <div className="library-skeleton library-skeleton-text" />
                </div>
              </div>

              <div className="library-grid">
                {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                  <LibraryCardSkeleton key={`news-skeleton-${index}`} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="library-controls">
              <label>
                <span>Tìm kiếm trong thư viện</span>
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setCurrentExamPage(1);
                    setCurrentNewsPage(1);
                  }}
                  placeholder="Nhập tiêu đề đề thi, tin tức, nguồn hoặc chủ đề"
                />
              </label>

              <label>
                <span>Lọc theo chủ đề</span>
                <select
                  value={selectedTopicId}
                  onChange={(event) => {
                    setSelectedTopicId(event.target.value);
                    setCurrentExamPage(1);
                    setCurrentNewsPage(1);
                  }}
                >
                  <option value="tat-ca">Tất cả chủ đề</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.ten_chu_de}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            {error ? <section className="library-status library-status-error">{error}</section> : null}

            <section className="library-section" id="de-thi">
              <div className="library-section-head">
                <div>
                  <p className="library-section-eyebrow">Mục 1</p>
                  <h2>Đề thi tải về</h2>
                  <p>Hiển thị các đề thi dạng ảnh, PDF hoặc Word để học sinh tải xuống sử dụng ngay.</p>
                </div>

                <span className="library-section-count">{filteredExams.length} đề thi</span>
              </div>

              {filteredExams.length === 0 ? (
                <section className="library-status">
                  Chưa có đề thi phù hợp với bộ lọc hiện tại. Admin có thể thêm trực tiếp trong bảng{" "}
                  <strong>de_thi</strong>.
                </section>
              ) : (
                <>
                  <div className="library-grid">
                    {paginatedExams.map((exam) => (
                      <ExamCard
                        key={exam.id}
                        exam={exam}
                        topicName={topicNameById.get(exam.chu_de_id) || ""}
                      />
                    ))}
                  </div>

                  <LibraryPagination
                    currentPage={currentExamPageSafe}
                    totalPages={examTotalPages}
                    onPageChange={setCurrentExamPage}
                    ariaLabel="Phân trang đề thi"
                  />
                </>
              )}
            </section>

            <section className="library-section" id="tin-tuc">
              <div className="library-section-head">
                <div>
                  <p className="library-section-eyebrow">Mục 2</p>
                  <h2>Tin tức nổi bật</h2>
                  <p>
                    Danh sách các bài báo và nguồn tư liệu bên ngoài. Khi bấm xem, hệ thống sẽ xác nhận
                    trước khi điều hướng ra ngoài website.
                  </p>
                </div>

                <span className="library-section-count">{filteredNews.length} tin</span>
              </div>

              {filteredNews.length === 0 ? (
                <section className="library-status">
                  Chưa có tin tức phù hợp. Admin có thể thêm và xuất bản trong bảng{" "}
                  <strong>tin_tuc_tu_lieu</strong>.
                </section>
              ) : (
                <>
                  <div className="library-grid">
                    {paginatedNews.map((news) => (
                      <NewsCard
                        key={news.id}
                        news={news}
                        topicName={topicNameById.get(news.chu_de_id) || ""}
                        onOpen={setActiveExternalNews}
                      />
                    ))}
                  </div>

                  <LibraryPagination
                    currentPage={currentNewsPageSafe}
                    totalPages={newsTotalPages}
                    onPageChange={setCurrentNewsPage}
                    ariaLabel="Phân trang tin tức"
                  />
                </>
              )}
            </section>
          </>
        )}
      </main>

      <ExitConfirmModal news={activeExternalNews} onClose={() => setActiveExternalNews(null)} />
    </div>
  );
}

export default ThuVien;
