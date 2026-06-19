import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { formatPublishDate, normalizeExternalUrl } from "../lib/libraryUtils";
import { buildR2FileUrl } from "../lib/r2";
import { supabase } from "../lib/supabaseClient";
import "./PublicCollection.css";

const NEWS_PER_PAGE = 6;
const SKELETON_CARD_COUNT = 6;

function NewsCard({ news, topicName, onOpen }) {
  const imageUrl = news.duong_dan_anh_dai_dien ? buildR2FileUrl(news.duong_dan_anh_dai_dien) : "";
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(imageUrl) && !hasImageError;

  return (
    <article className="collection-card">
      {shouldShowImage ? (
        <img
          className="collection-card-media"
          src={imageUrl}
          alt={news.tieu_de}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="collection-card-media collection-card-media-placeholder">Tin</div>
      )}

      <div className="collection-card-body">
        <div className="collection-card-chips">
          <span className="collection-chip">Tin tức tư liệu</span>
          {topicName ? <span className="collection-chip collection-chip-secondary">{topicName}</span> : null}
          <span className="collection-chip collection-chip-warm">{formatPublishDate(news.ngay_xuat_ban)}</span>
        </div>

        <h2>{news.tieu_de}</h2>
        <p>{news.tom_tat || "Bài viết nổi bật liên quan đến nội dung học tập và thực tiễn địa lí kinh tế."}</p>

        <div className="collection-card-meta">
          <span className="collection-chip">{news.ten_nguon || "Nguồn ngoài website"}</span>
        </div>

        <div className="collection-card-actions">
          <button type="button" className="collection-card-action" onClick={() => onOpen(news)}>
            Xem tin bên ngoài
          </button>
        </div>
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
    <nav className="collection-pagination" aria-label="Phân trang tin tức tư liệu">
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

function ExitConfirmModal({ news, onClose }) {
  if (!news) return null;

  const externalUrl = normalizeExternalUrl(news.duong_dan_nguon);

  return (
    <div className="collection-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="collection-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-exit-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="collection-modal-eyebrow">Xác nhận rời website</p>
        <h2 id="news-exit-modal-title">{news.tieu_de}</h2>
        <p>
          Bạn sắp mở một bài viết từ nguồn bên ngoài. Hệ thống sẽ điều hướng sang trang khác để xem đầy đủ nội dung.
        </p>

        <div className="collection-modal-source">
          <strong>Nguồn:</strong>
          <span>{news.ten_nguon || externalUrl}</span>
        </div>

        <div className="collection-modal-actions">
          <button type="button" className="collection-modal-cancel" onClick={onClose}>
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

function ThuVienTinTuc() {
  const [topics, setTopics] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("tat-ca");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeExternalNews, setActiveExternalNews] = useState(null);
  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setLoading(true);
      setError("");

      const [
        { data: topicsData, error: topicsError },
        { data: newsData, error: newsError },
      ] = await Promise.all([
        supabase
          .from("chu_de")
          .select("id, ten_chu_de")
          .eq("dang_hien_thi", true)
          .order("thu_tu_hien_thi", { ascending: true }),
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
        setNewsList([]);
      } else if (newsError) {
        setError(`Không thể tải tin tức: ${newsError.message}`);
        setTopics(topicsData || []);
        setNewsList([]);
      } else {
        setTopics(topicsData || []);
        setNewsList(newsData || []);
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

  const filteredNews = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase();

    return newsList.filter((news) => {
      const topicName = topicNameById.get(news.chu_de_id) || "";
      const matchesTopic = selectedTopicId === "tat-ca" || news.chu_de_id === Number(selectedTopicId);
      const matchesSearch =
        keyword === "" ||
        news.tieu_de?.toLowerCase().includes(keyword) ||
        news.tom_tat?.toLowerCase().includes(keyword) ||
        topicName.toLowerCase().includes(keyword) ||
        news.ten_nguon?.toLowerCase().includes(keyword);

      return matchesTopic && matchesSearch;
    });
  }, [deferredSearchText, newsList, selectedTopicId, topicNameById]);

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / NEWS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedNews = filteredNews.slice(
    (currentPageSafe - 1) * NEWS_PER_PAGE,
    currentPageSafe * NEWS_PER_PAGE,
  );

  return (
    <div className="collection-page">
      <Header />

      <main>
        <section
          className="collection-hero"
          style={{
            "--collection-hero-image":
              'url("https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1600")',
          }}
        >
          <div className="collection-hero-content">
            <p className="collection-eyebrow">Thư viện - Tin tức tư liệu</p>
            <h1>Danh sách nguồn tin bên ngoài được tách riêng để dễ đọc và dễ chọn lọc</h1>
            <p>
              Các bài báo và liên kết tham khảo được gom thành một trang riêng, giữ bước xác nhận trước khi điều hướng ra ngoài website.
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
              <strong>Tin tức tư liệu</strong>
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
                  <span>Tìm kiếm tin tư liệu</span>
                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) => {
                      setSearchText(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Nhập tiêu đề, tóm tắt, nguồn hoặc chủ đề"
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
              ) : filteredNews.length === 0 ? (
                <section className="collection-empty">
                  Chưa có tin tư liệu phù hợp. Admin có thể thêm và xuất bản trong bảng <strong>tin_tuc_tu_lieu</strong>.
                </section>
              ) : (
                <>
                  <section className="collection-grid">
                    {paginatedNews.map((news) => (
                      <NewsCard
                        key={news.id}
                        news={news}
                        topicName={topicNameById.get(news.chu_de_id) || ""}
                        onOpen={setActiveExternalNews}
                      />
                    ))}
                  </section>

                  <Pagination currentPage={currentPageSafe} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </>
          )}
        </section>
      </main>

      <ExitConfirmModal news={activeExternalNews} onClose={() => setActiveExternalNews(null)} />
    </div>
  );
}

export default ThuVienTinTuc;
