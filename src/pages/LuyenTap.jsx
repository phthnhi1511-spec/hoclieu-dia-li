import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import "./LuyenTap.css";

const ITEMS_PER_PAGE = 6;
const QUIZ_SKELETON_COUNT = 6;

function QuizCard({ quiz }) {
  return (
    <article className="quiz-list-card">
      <div className="quiz-list-card-head">
        <span className="quiz-list-card-type">TRẮC NGHIỆM</span>
        <span className="quiz-list-card-topic">{quiz.topicName}</span>
      </div>

      <h2>{quiz.tieu_de}</h2>
      <p>{quiz.mo_ta || "Bài kiểm tra này đã sẵn sàng để học sinh luyện tập theo chủ đề."}</p>

      <div className="quiz-list-meta">
        <span>{quiz.questionCount} câu hỏi</span>
        <span>{quiz.thoi_gian_lam_bai_phut || 0} phút</span>
      </div>

      <div className="quiz-list-card-footer">
        <span className="quiz-list-ready">Đã xuất bản</span>
        <Link className="quiz-list-card-action" to={`/luyen-tap/${quiz.id}`}>
          Vào làm bài
        </Link>
      </div>
    </article>
  );
}

function QuizCardSkeleton() {
  return (
    <article className="quiz-list-card quiz-list-card-skeleton" aria-hidden="true">
      <div className="quiz-list-card-head">
        <div className="quiz-skeleton quiz-skeleton-chip" />
        <div className="quiz-skeleton quiz-skeleton-chip quiz-skeleton-chip-wide" />
      </div>

      <div className="quiz-skeleton quiz-skeleton-title" />
      <div className="quiz-skeleton quiz-skeleton-text quiz-skeleton-text-wide" />
      <div className="quiz-skeleton quiz-skeleton-text" />

      <div className="quiz-list-meta">
        <div className="quiz-skeleton quiz-skeleton-chip" />
        <div className="quiz-skeleton quiz-skeleton-chip" />
      </div>

      <div className="quiz-list-card-footer">
        <div className="quiz-skeleton quiz-skeleton-badge" />
        <div className="quiz-skeleton quiz-skeleton-action" />
      </div>
    </article>
  );
}

function QuizControlsSkeleton() {
  return (
    <section className="quiz-controls quiz-controls-skeleton" aria-hidden="true">
      <div>
        <div className="quiz-skeleton quiz-skeleton-label" />
        <div className="quiz-skeleton quiz-skeleton-input" />
      </div>
      <div>
        <div className="quiz-skeleton quiz-skeleton-label" />
        <div className="quiz-skeleton quiz-skeleton-input" />
      </div>
    </section>
  );
}

function QuizPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="quiz-pagination" aria-label="Phân trang bài kiểm tra">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Trang trước
      </button>

      <div className="quiz-pagination-pages">
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

function LuyenTap() {
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("tat-ca");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    let isMounted = true;

    async function loadQuizPage() {
      setLoading(true);
      setError("");

      const [
        { data: topicsData, error: topicsError },
        { data: quizData, error: quizError },
      ] = await Promise.all([
        supabase
          .from("chu_de")
          .select("id, ten_chu_de")
          .eq("dang_hien_thi", true)
          .order("thu_tu_hien_thi", { ascending: true }),
        supabase
          .from("bai_kiem_tra")
          .select("id, tieu_de, mo_ta, chu_de_id, thoi_gian_lam_bai_phut, da_xuat_ban")
          .eq("da_xuat_ban", true)
          .order("id", { ascending: false }),
      ]);

      if (!isMounted) return;

      if (topicsError) {
        setError(`Không thể tải chủ đề: ${topicsError.message}`);
        setTopics([]);
        setQuizzes([]);
        setLoading(false);
        return;
      }

      if (quizError) {
        setError(`Không thể tải bài kiểm tra: ${quizError.message}`);
        setTopics(topicsData || []);
        setQuizzes([]);
        setLoading(false);
        return;
      }

      const loadedQuizzes = quizData || [];
      const quizIds = loadedQuizzes.map((quiz) => quiz.id);
      const topicNameById = new Map((topicsData || []).map((topic) => [topic.id, topic.ten_chu_de]));
      let questionCountsByQuizId = new Map();

      if (quizIds.length > 0) {
        const { data: questionRows, error: questionError } = await supabase
          .from("cau_hoi_kiem_tra")
          .select("id, bai_kiem_tra_id")
          .in("bai_kiem_tra_id", quizIds);

        if (!isMounted) return;

        if (questionError) {
          setError(`Không thể tải câu hỏi: ${questionError.message}`);
          setTopics(topicsData || []);
          setQuizzes([]);
          setLoading(false);
          return;
        }

        questionCountsByQuizId = (questionRows || []).reduce((countMap, question) => {
          countMap.set(question.bai_kiem_tra_id, (countMap.get(question.bai_kiem_tra_id) || 0) + 1);
          return countMap;
        }, new Map());
      }

      setTopics(topicsData || []);
      setQuizzes(
        loadedQuizzes.map((quiz) => ({
          ...quiz,
          questionCount: questionCountsByQuizId.get(quiz.id) || 0,
          topicName: topicNameById.get(quiz.chu_de_id) || "Chưa gắn chủ đề",
        })),
      );
      setLoading(false);
    }

    loadQuizPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredQuizzes = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const matchesTopic =
        selectedTopicId === "tat-ca" || quiz.chu_de_id === Number(selectedTopicId);
      const matchesSearch =
        keyword === "" ||
        quiz.tieu_de?.toLowerCase().includes(keyword) ||
        quiz.mo_ta?.toLowerCase().includes(keyword) ||
        quiz.topicName?.toLowerCase().includes(keyword);

      return matchesTopic && matchesSearch;
    });
  }, [deferredSearchText, quizzes, selectedTopicId]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPageSafe - 1) * ITEMS_PER_PAGE,
    currentPageSafe * ITEMS_PER_PAGE,
  );

  return (
    <div>
      <Header />

      <main className="quiz-page">
        <section className="quiz-hero">
          <p className="quiz-eyebrow">Luyện tập</p>
          <h1>Danh sách bài kiểm tra theo chủ đề</h1>
          <p>
            Chọn bài kiểm tra phù hợp, tìm nhanh theo từ khóa và lọc theo chủ đề để học sinh
            luyện tập theo đúng nội dung đang học.
          </p>
        </section>

        <section className="quiz-topbar">
          <div className="quiz-breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <strong>Luyện tập</strong>
          </div>

          <Link to="/" className="quiz-topbar-action">
            Về trang chủ
          </Link>
        </section>

        {loading ? (
          <>
            <QuizControlsSkeleton />

            <section className="quiz-grid quiz-grid-skeleton">
              {Array.from({ length: QUIZ_SKELETON_COUNT }, (_, index) => (
                <QuizCardSkeleton key={index} />
              ))}
            </section>

            <div className="quiz-pagination quiz-pagination-skeleton" aria-hidden="true">
              <div className="quiz-skeleton quiz-skeleton-button" />
              <div className="quiz-pagination-pages">
                <div className="quiz-skeleton quiz-skeleton-dot" />
                <div className="quiz-skeleton quiz-skeleton-dot" />
                <div className="quiz-skeleton quiz-skeleton-dot" />
              </div>
              <div className="quiz-skeleton quiz-skeleton-button" />
            </div>
          </>
        ) : (
          <>
            <section className="quiz-controls">
              <label>
                <span>Tìm kiếm bài kiểm tra</span>
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
              <section className="quiz-status-panel quiz-status-panel-error">{error}</section>
            ) : filteredQuizzes.length === 0 ? (
              <section className="quiz-status-panel">
                Chưa có bài kiểm tra phù hợp. Admin có thể tạo và xuất bản bài kiểm tra trong
                trang quản trị.
              </section>
            ) : (
              <>
                <section className="quiz-grid">
                  {paginatedQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
                </section>

                <QuizPagination
                  currentPage={currentPageSafe}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}

        <div className="quiz-back">
          <Link to="/">Quay lại trang chủ</Link>
        </div>
      </main>
    </div>
  );
}

export default LuyenTap;
