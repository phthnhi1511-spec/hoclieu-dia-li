import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CollectionWindowControls from "../components/CollectionWindowControls";
import Header from "../components/Header";
import { normalizeExternalUrl } from "../lib/libraryUtils";
import { supabase } from "../lib/supabaseClient";
import "./PublicCollection.css";

const SURVEYS_PER_PAGE = 10;
const ITEMS_PER_WINDOW = 3;
const SURVEY_SKELETON_COUNT = 3;

function SurveyCard({ survey, onOpen }) {
  return (
    <article className="collection-card">
      <div className="collection-card-body">
        <div className="collection-card-chips">
          <span className="collection-chip">Khảo sát</span>
          {survey.doi_tuong_khao_sat ? (
            <span className="collection-chip collection-chip-secondary">{survey.doi_tuong_khao_sat}</span>
          ) : null}
          <span className="collection-chip collection-chip-warm">Đang mở</span>
        </div>

        <h2>{survey.tieu_de}</h2>
        <p>{survey.mo_ta || "Khảo sát đang mở để thu thập ý kiến người học và giáo viên qua biểu mẫu bên ngoài."}</p>

        <div className="collection-card-meta">
          <span className="collection-chip">{survey.doi_tuong_khao_sat || "Không giới hạn đối tượng"}</span>
        </div>

        <div className="collection-card-actions">
          <button type="button" className="collection-card-action" onClick={() => onOpen(survey)}>
            Mở biểu mẫu
          </button>
        </div>
      </div>
    </article>
  );
}

function CollectionCardSkeleton() {
  return (
    <article className="collection-card collection-card-skeleton" aria-hidden="true">
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
    <nav className="collection-pagination" aria-label="Phân trang khảo sát">
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

function SurveyConfirmModal({ survey, onClose }) {
  if (!survey) return null;

  const externalUrl = normalizeExternalUrl(survey.duong_dan_khao_sat);

  return (
    <div className="collection-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="collection-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="collection-modal-eyebrow">Xác nhận rời website</p>
        <h2 id="survey-modal-title">{survey.tieu_de}</h2>
        <p>
          Bạn sắp chuyển đến một biểu mẫu khảo sát bên ngoài website. Hệ thống sẽ mở liên kết mới để bạn tiếp tục trả lời.
        </p>

        <div className="collection-modal-source">
          <strong>Đối tượng:</strong>
          <span>{survey.doi_tuong_khao_sat || "Chưa giới hạn đối tượng"}</span>
        </div>

        <div className="collection-modal-actions">
          <button type="button" className="collection-modal-cancel" onClick={onClose}>
            Ở lại trang này
          </button>
          <a href={externalUrl} target="_blank" rel="noreferrer" onClick={onClose}>
            Tiếp tục đến khảo sát
          </a>
        </div>
      </div>
    </div>
  );
}

function KhaoSat() {
  const [surveys, setSurveys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("tat-ca");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentWindow, setCurrentWindow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSurvey, setActiveSurvey] = useState(null);
  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    let isMounted = true;

    async function loadSurveyPage() {
      setLoading(true);
      setError("");

      const { data, error: loadError } = await supabase
        .from("khao_sat")
        .select("id, tieu_de, mo_ta, doi_tuong_khao_sat, duong_dan_khao_sat, dang_mo")
        .eq("dang_mo", true)
        .order("id", { ascending: false });

      if (!isMounted) return;

      if (loadError) {
        if (loadError.message?.includes("duong_dan_khao_sat") && loadError.message?.includes("does not exist")) {
          setError(
            "Bảng khao_sat còn thiếu cột duong_dan_khao_sat. Cần chạy file supabase/seeds/2026-06-15_khao_sat_link_ngoai.sql rồi tải lại trang.",
          );
        } else {
          setError(`Không thể tải khảo sát: ${loadError.message}`);
        }
        setSurveys([]);
      } else {
        setSurveys(data || []);
      }

      setLoading(false);
    }

    loadSurveyPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const audienceOptions = useMemo(() => {
    return Array.from(
      new Set(
        surveys
          .map((survey) => survey.doi_tuong_khao_sat?.trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right, "vi"));
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase();

    return surveys.filter((survey) => {
      const audience = survey.doi_tuong_khao_sat || "";
      const matchesAudience = selectedAudience === "tat-ca" || audience === selectedAudience;
      const matchesSearch =
        keyword === "" ||
        survey.tieu_de?.toLowerCase().includes(keyword) ||
        survey.mo_ta?.toLowerCase().includes(keyword) ||
        audience.toLowerCase().includes(keyword);

      return matchesAudience && matchesSearch;
    });
  }, [deferredSearchText, selectedAudience, surveys]);

  const totalPages = Math.max(1, Math.ceil(filteredSurveys.length / SURVEYS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedSurveys = filteredSurveys.slice(
    (currentPageSafe - 1) * SURVEYS_PER_PAGE,
    currentPageSafe * SURVEYS_PER_PAGE,
  );
  const totalWindows = Math.max(1, Math.ceil(paginatedSurveys.length / ITEMS_PER_WINDOW));
  const currentWindowSafe = Math.min(currentWindow, totalWindows - 1);
  const visibleSurveys = paginatedSurveys.slice(
    currentWindowSafe * ITEMS_PER_WINDOW,
    currentWindowSafe * ITEMS_PER_WINDOW + ITEMS_PER_WINDOW,
  );

  return (
    <div className="collection-page">
      <Header />

      <main>
        <section
          className="collection-hero"
          style={{
            "--collection-hero-image":
              'url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600")',
          }}
        >
          <div className="collection-hero-content">
            <p className="collection-eyebrow">Khảo sát</p>
            <h1>Danh sách khảo sát được trình bày lại theo kiểu dễ đọc và dễ thao tác hơn</h1>
            <p>
              Các biểu mẫu được hiển thị như một danh sách nhiệm vụ rõ ràng, giữ bước xác nhận trước khi chuyển sang nền tảng ngoài website.
            </p>
          </div>
        </section>

        <section className="collection-shell">
          <div className="collection-topbar">
            <div className="collection-breadcrumbs">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <strong>Khảo sát</strong>
            </div>

            <Link to="/" className="collection-topbar-action">
              Về trang chủ
            </Link>
          </div>

          {loading ? (
            <>
              <ControlsSkeleton />
              <section className="collection-grid collection-window-grid">
                {Array.from({ length: SURVEY_SKELETON_COUNT }, (_, index) => (
                  <CollectionCardSkeleton key={index} />
                ))}
              </section>
            </>
          ) : (
            <>
              <section className="collection-controls">
                <label>
                  <span>Tìm kiếm khảo sát</span>
                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) => {
                      setSearchText(event.target.value);
                      setCurrentPage(1);
                      setCurrentWindow(0);
                    }}
                    placeholder="Nhập tiêu đề, mô tả hoặc đối tượng khảo sát"
                  />
                </label>

                <label>
                  <span>Lọc theo đối tượng</span>
                  <select
                    value={selectedAudience}
                    onChange={(event) => {
                      setSelectedAudience(event.target.value);
                      setCurrentPage(1);
                      setCurrentWindow(0);
                    }}
                  >
                    <option value="tat-ca">Tất cả đối tượng</option>
                    {audienceOptions.map((audience) => (
                      <option key={audience} value={audience}>
                        {audience}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              {error ? (
                <section className="collection-status collection-status-error">{error}</section>
              ) : filteredSurveys.length === 0 ? (
                <section className="collection-empty">
                  Chưa có khảo sát phù hợp. Admin có thể thêm khảo sát mới và bật trạng thái mở trong trang quản trị.
                </section>
              ) : (
                <>
                  <section className="collection-grid collection-window-grid">
                    {visibleSurveys.map((survey) => (
                      <SurveyCard key={survey.id} survey={survey} onOpen={setActiveSurvey} />
                    ))}
                  </section>

                  <CollectionWindowControls
                    currentWindow={currentWindowSafe}
                    totalWindows={totalWindows}
                    onWindowChange={setCurrentWindow}
                    label="khảo sát"
                  />

                  <Pagination
                    currentPage={currentPageSafe}
                    totalPages={totalPages}
                    onPageChange={(nextPage) => {
                      setCurrentPage(nextPage);
                      setCurrentWindow(0);
                    }}
                  />
                </>
              )}
            </>
          )}
        </section>
      </main>

      <SurveyConfirmModal survey={activeSurvey} onClose={() => setActiveSurvey(null)} />
    </div>
  );
}

export default KhaoSat;
