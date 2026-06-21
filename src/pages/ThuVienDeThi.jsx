import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { getExamKindLabel, getExamThumbnailUrl } from "../lib/libraryUtils";
import { buildR2ProxyFileUrl, getR2DownloadUrl } from "../lib/r2";
import { supabase } from "../lib/supabaseClient";
import "./PublicCollection.css";

const EXAMS_PER_PAGE = 6;
const SKELETON_CARD_COUNT = 6;

function ExamCard({ exam, topicName }) {
  const thumbnailUrl = getExamThumbnailUrl(exam);
  const fileTypeLabel = getExamKindLabel(exam.duong_dan_file);
  const downloadUrl = buildR2ProxyFileUrl(exam.duong_dan_file);
  const [hasImageError, setHasImageError] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const shouldShowImage = Boolean(thumbnailUrl) && !hasImageError;

  async function handleDownload(event) {
    event.preventDefault();

    if (!exam.duong_dan_file || downloading) return;

    setDownloading(true);
    setDownloadError("");

    try {
      const fileExtension = exam.duong_dan_file.split(".").pop()?.split(/[?#]/)[0] || "";
      const downloadFileName = `${exam.tieu_de || "de-thi"}${fileExtension ? `.${fileExtension}` : ""}`;
      const signedDownloadUrl = await getR2DownloadUrl(exam.duong_dan_file, downloadFileName);
      const downloadLink = document.createElement("a");
      downloadLink.href = signedDownloadUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (downloadFileError) {
      setDownloadError(downloadFileError?.message || "Không thể tải đề thi.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <article className="collection-card">
      {shouldShowImage ? (
        <img
          className="collection-card-media"
          src={thumbnailUrl}
          alt={exam.tieu_de}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="collection-card-media collection-card-media-placeholder">{fileTypeLabel}</div>
      )}

      <div className="collection-card-body">
        <div className="collection-card-chips">
          <span className="collection-chip">Đề thi</span>
          <span className="collection-chip collection-chip-secondary">{fileTypeLabel}</span>
          {topicName ? <span className="collection-chip collection-chip-warm">{topicName}</span> : null}
        </div>

        <h2>{exam.tieu_de}</h2>
        <p>{exam.mo_ta || "Tài liệu đề thi đã sẵn sàng để tải về và sử dụng trong quá trình ôn luyện."}</p>

        <div className="collection-card-meta">
          <span className="collection-chip">{exam.ten_nguon || "Tệp tải xuống"}</span>
        </div>

        <div className="collection-card-actions">
          <a
            className="collection-card-action"
            href={downloadUrl}
            onClick={handleDownload}
            aria-disabled={downloading}
          >
            {downloading ? "Đang chuẩn bị..." : "Tải đề thi"}
          </a>
        </div>
        {downloadError ? <p className="collection-card-download-error">{downloadError}</p> : null}
      </div>
    </article>
  );
}

function CollectionCardSkeleton() {
  return (
    <article className="collection-card collection-card-skeleton" aria-hidden="true">
      <div className="collection-card-media">
        <div className="collection-skeleton collection-skeleton-thumb" />
      </div>
      <div className="collection-card-body">
        <div className="collection-card-chips">
          <div className="collection-skeleton collection-skeleton-chip" />
          <div className="collection-skeleton collection-skeleton-chip collection-skeleton-chip-wide" />
        </div>
        <div className="collection-skeleton collection-skeleton-title" />
        <div className="collection-skeleton collection-skeleton-text collection-skeleton-text-wide" />
        <div className="collection-skeleton collection-skeleton-text" />
        <div className="collection-card-actions">
          <div className="collection-skeleton collection-skeleton-action" />
        </div>
      </div>
    </article>
  );
}

function ControlsSkeleton() {
  return (
    <section className="collection-controls collection-controls-skeleton" aria-hidden="true">
      <div>
        <div className="collection-skeleton collection-skeleton-label" />
        <div className="collection-skeleton collection-skeleton-input" />
      </div>
      <div>
        <div className="collection-skeleton collection-skeleton-label" />
        <div className="collection-skeleton collection-skeleton-input" />
      </div>
    </section>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="collection-pagination" aria-label="Phân trang đề thi">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Trang trước
      </button>

      <div className="collection-pagination-pages">
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

      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Trang sau
      </button>
    </nav>
  );
}

function ThuVienDeThi() {
  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("tat-ca");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setLoading(true);
      setError("");

      const [
        { data: topicsData, error: topicsError },
        { data: examsData, error: examsError },
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
      ]);

      if (!isMounted) return;

      if (topicsError) {
        setError(`Không thể tải chủ đề: ${topicsError.message}`);
        setTopics([]);
        setExams([]);
      } else if (examsError) {
        if (examsError.message?.includes("relation") && examsError.message?.includes("de_thi")) {
          setError(
            "Bảng de_thi chưa tồn tại trong Supabase. Cần chạy file supabase/seeds/2026-06-15_de_thi_thu_vien.sql rồi tải lại trang.",
          );
        } else {
          setError(`Không thể tải đề thi: ${examsError.message}`);
        }
        setTopics(topicsData || []);
        setExams([]);
      } else {
        setTopics(topicsData || []);
        setExams(examsData || []);
      }

      setLoading(false);
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const topicNameById = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic.ten_chu_de])),
    [topics],
  );

  const filteredExams = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase();

    return exams.filter((exam) => {
      const topicName = topicNameById.get(exam.chu_de_id) || "";
      const matchesTopic = selectedTopicId === "tat-ca" || exam.chu_de_id === Number(selectedTopicId);
      const matchesSearch =
        keyword === "" ||
        exam.tieu_de?.toLowerCase().includes(keyword) ||
        exam.mo_ta?.toLowerCase().includes(keyword) ||
        topicName.toLowerCase().includes(keyword);

      return matchesTopic && matchesSearch;
    });
  }, [deferredSearchText, exams, selectedTopicId, topicNameById]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / EXAMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedExams = filteredExams.slice(
    (currentPageSafe - 1) * EXAMS_PER_PAGE,
    currentPageSafe * EXAMS_PER_PAGE,
  );

  return (
    <div className="collection-page">
      <Header />

      <main>
        <section
          className="collection-hero"
          style={{
            "--collection-hero-image":
              'url("https://images.unsplash.com/photo-1455885666463-9b98d1df7e04?q=80&w=1600")',
          }}
        >
          <div className="collection-hero-content">
            <p className="collection-eyebrow">Thư viện - Đề thi</p>
            <h1>Danh sách đề thi được tách riêng để tải và tra cứu nhanh hơn</h1>
            <p>
              Toàn bộ đề thi được hiển thị theo dạng thẻ rõ ràng, có lọc theo chủ đề và ưu tiên thao tác tải về nhanh.
            </p>
          </div>
        </section>

        <section className="collection-shell">
          <div className="collection-topbar">
            <div className="collection-breadcrumbs">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <Link to="/thu-vien">Thư viện</Link>
              <span>/</span>
              <strong>Đề thi</strong>
            </div>

            <Link to="/thu-vien" className="collection-topbar-action">
              Về hub thư viện
            </Link>
          </div>

          {loading ? (
            <>
              <ControlsSkeleton />
              <section className="collection-grid">
                {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                  <CollectionCardSkeleton key={index} />
                ))}
              </section>
            </>
          ) : (
            <>
              <section className="collection-controls">
                <label>
                  <span>Tìm kiếm đề thi</span>
                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) => {
                      setSearchText(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Nhập tiêu đề, mô tả hoặc chủ đề"
                  />
                </label>

                <label>
                  <span>Lọc theo chủ đề</span>
                  <select
                    value={selectedTopicId}
                    onChange={(event) => {
                      setSelectedTopicId(event.target.value);
                      setCurrentPage(1);
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

              {error ? (
                <section className="collection-status collection-status-error">{error}</section>
              ) : filteredExams.length === 0 ? (
                <section className="collection-empty">
                  Chưa có đề thi phù hợp với bộ lọc hiện tại. Admin có thể thêm dữ liệu trong bảng <strong>de_thi</strong>.
                </section>
              ) : (
                <>
                  <section className="collection-grid">
                    {paginatedExams.map((exam) => (
                      <ExamCard key={exam.id} exam={exam} topicName={topicNameById.get(exam.chu_de_id) || ""} />
                    ))}
                  </section>

                  <Pagination currentPage={currentPageSafe} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default ThuVienDeThi;
