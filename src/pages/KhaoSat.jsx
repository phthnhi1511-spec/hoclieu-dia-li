import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import "./KhaoSat.css";

const SURVEYS_PER_PAGE = 6;
const SURVEY_SKELETON_COUNT = 6;

function normalizeExternalUrl(url) {
  if (!url) return "";

  const trimmedUrl = String(url).trim();

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl.replace(/^\/+/, "")}`;
}

function SurveyControlsSkeleton() {
  return (
    <section className="survey-controls survey-controls-skeleton" aria-hidden="true">
      <div>
        <div className="survey-skeleton survey-skeleton-label" />
        <div className="survey-skeleton survey-skeleton-input" />
      </div>
      <div>
        <div className="survey-skeleton survey-skeleton-label" />
        <div className="survey-skeleton survey-skeleton-input" />
      </div>
    </section>
  );
}

function SurveyCard({ survey, onOpen }) {
  return (
    <article className="survey-card">
      <div className="survey-card-head">
        <span className="survey-card-type">KHẢO SÁT</span>
        {survey.doi_tuong_khao_sat ? (
          <span className="survey-card-audience">{survey.doi_tuong_khao_sat}</span>
        ) : null}
      </div>

      <h2>{survey.tieu_de}</h2>
      <p>{survey.mo_ta || "Khảo sát đang mở để thu thập ý kiến người học và giáo viên qua biểu mẫu bên ngoài."}</p>

      <div className="survey-card-footer">
        <span className="survey-card-status">Đang mở</span>
        <button type="button" className="survey-card-action" onClick={() => onOpen(survey)}>
          Mở biểu mẫu
        </button>
      </div>
    </article>
  );
}

function SurveyCardSkeleton() {
  return (
    <article className="survey-card survey-card-skeleton" aria-hidden="true">
      <div className="survey-card-head">
        <div className="survey-skeleton survey-skeleton-chip" />
        <div className="survey-skeleton survey-skeleton-chip survey-skeleton-chip-wide" />
      </div>

      <div className="survey-skeleton survey-skeleton-title" />
      <div className="survey-skeleton survey-skeleton-text survey-skeleton-text-wide" />
      <div className="survey-skeleton survey-skeleton-text" />

      <div className="survey-card-footer">
        <div className="survey-skeleton survey-skeleton-badge" />
        <div className="survey-skeleton survey-skeleton-action" />
      </div>
    </article>
  );
}

function SurveyPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="survey-pagination" aria-label="Phân trang khảo sát">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Trang trước
      </button>

      <div className="survey-pagination-pages">
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

function SurveyConfirmModal({ survey, onClose }) {
  if (!survey) return null;

  const externalUrl = normalizeExternalUrl(survey.duong_dan_khao_sat);

  return (
    <div className="survey-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="survey-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="survey-modal-eyebrow">Xác nhận rời website</p>
        <h2 id="survey-modal-title">{survey.tieu_de}</h2>
        <p>
          Bạn sắp chuyển đến một biểu mẫu khảo sát bên ngoài website. Hệ thống sẽ mở liên kết mới để
          bạn tiếp tục trả lời.
        </p>

        <div className="survey-modal-source">
          <strong>Đối tượng:</strong>
          <span>{survey.doi_tuong_khao_sat || "Chưa giới hạn đối tượng"}</span>
        </div>

        <div className="survey-modal-actions">
          <button type="button" className="survey-modal-cancel" onClick={onClose}>
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
        if (
          loadError.message?.includes("duong_dan_khao_sat") &&
          loadError.message?.includes("does not exist")
        ) {
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
      const matchesAudience =
        selectedAudience === "tat-ca" || audience === selectedAudience;
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

  return (
    <div>
      <Header />

      <main className="survey-page">
        <section className="survey-hero">
          <p className="survey-eyebrow">Khảo sát</p>
          <h1>Danh sách biểu mẫu khảo sát</h1>
          <p>
            Nơi tập trung các khảo sát đang mở dành cho học sinh, giáo viên hoặc người dùng liên quan.
            Chọn biểu mẫu phù hợp rồi xác nhận để chuyển đến trang ngoài.
          </p>
        </section>

        <section className="survey-topbar">
          <div className="survey-breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <strong>Khảo sát</strong>
          </div>

          <Link to="/" className="survey-topbar-action">
            Về trang chủ
          </Link>
        </section>

        {loading ? (
          <>
            <SurveyControlsSkeleton />

            <section className="survey-grid survey-grid-skeleton">
              {Array.from({ length: SURVEY_SKELETON_COUNT }, (_, index) => (
                <SurveyCardSkeleton key={index} />
              ))}
            </section>

            <div className="survey-pagination survey-pagination-skeleton" aria-hidden="true">
              <div className="survey-skeleton survey-skeleton-button" />
              <div className="survey-pagination-pages">
                <div className="survey-skeleton survey-skeleton-dot" />
                <div className="survey-skeleton survey-skeleton-dot" />
                <div className="survey-skeleton survey-skeleton-dot" />
              </div>
              <div className="survey-skeleton survey-skeleton-button" />
            </div>
          </>
        ) : (
          <>
            <section className="survey-controls">
              <label>
                <span>Tìm kiếm khảo sát</span>
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setCurrentPage(1);
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
              <section className="survey-status survey-status-error">{error}</section>
            ) : filteredSurveys.length === 0 ? (
              <section className="survey-status">
                Chưa có khảo sát phù hợp. Admin có thể thêm khảo sát mới và bật trạng thái mở trong
                trang quản trị.
              </section>
            ) : (
              <>
                <section className="survey-grid">
                  {paginatedSurveys.map((survey) => (
                    <SurveyCard key={survey.id} survey={survey} onOpen={setActiveSurvey} />
                  ))}
                </section>

                <SurveyPagination
                  currentPage={currentPageSafe}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}
      </main>

      <SurveyConfirmModal survey={activeSurvey} onClose={() => setActiveSurvey(null)} />
    </div>
  );
}

export default KhaoSat;
