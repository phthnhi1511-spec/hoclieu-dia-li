import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CollectionWindowControls from "../components/CollectionWindowControls";
import Header from "../components/Header";
import { buildR2FileUrl } from "../lib/r2";
import { supabase } from "../lib/supabaseClient";
import "./PublicCollection.css";

const ITEMS_PER_PAGE = 10;
const ITEMS_PER_WINDOW = 3;
const QUIZ_SKELETON_COUNT = 3;
const GAME_ITEMS_PER_PAGE = 10;
const fallbackLearningGames = [
  {
    icon: "🧩",
    name: "Ô chữ Địa lí kinh tế",
    description: "Củng cố khái niệm, ngành kinh tế và vùng kinh tế qua trò chơi ô chữ.",
    url: "https://wordwall.net/vi-vn/community/%C4%91%E1%BB%8Ba-l%C3%AD-9",
  },
  {
    icon: "⚡",
    name: "Đố vui nhanh",
    description: "Luyện phản xạ với các câu hỏi ngắn về Địa lí Việt Nam lớp 9.",
    url: "https://quizizz.com/admin/search/%C4%91%E1%BB%8Ba%20l%C3%AD%209",
  },
  {
    icon: "🗺️",
    name: "Ghép cặp bản đồ",
    description: "Nhận diện địa danh, vùng kinh tế và kiến thức bản đồ bằng hoạt động tương tác.",
    url: "https://learningapps.org/index.php?category=89&s=%C4%91%E1%BB%8Ba+l%C3%AD+9",
  },
];

function QuizCard({ quiz }) {
  return (
    <article className="collection-card">
      <div className="collection-card-body">
        <div className="collection-card-chips">
          <span className="collection-chip">Trắc nghiệm</span>
          <span className="collection-chip collection-chip-secondary">{quiz.topicName}</span>
          <span className="collection-chip collection-chip-warm">{quiz.thoi_gian_lam_bai_phut || 0} phút</span>
        </div>

        <h2>{quiz.tieu_de}</h2>
        <p>{quiz.mo_ta || "Bài kiểm tra này đã sẵn sàng để học sinh luyện tập theo chủ đề."}</p>

        <div className="collection-card-meta">
          <span className="collection-chip">{quiz.questionCount} câu hỏi</span>
          <span className="collection-chip">Đã xuất bản</span>
        </div>

        <div className="collection-card-actions">
          <Link className="collection-card-action" to={`/luyen-tap/${quiz.id}`}>
            Vào làm bài
          </Link>
        </div>
      </div>
    </article>
  );
}

function LearningGameCard({ game }) {
  return (
    <article className="learning-game-card">
      <div className="learning-game-media">
        {game.imageUrl ? (
          <img className="learning-game-image" src={game.imageUrl} alt={game.name} />
        ) : (
          <div className="learning-game-icon" aria-hidden="true">
            {game.icon}
          </div>
        )}
      </div>
      <div className="learning-game-body">
        <h3>{game.name}</h3>
        <p>{game.description}</p>
        {game.topic ? <span className="learning-game-topic">{game.topic}</span> : null}
      </div>
      <a className="learning-game-action" href={game.url} target="_blank" rel="noreferrer">
        Chơi ngay
      </a>
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
        <div className="collection-card-meta">
          <div className="collection-skeleton collection-skeleton-chip" />
          <div className="collection-skeleton collection-skeleton-chip" />
        </div>
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

function Pagination({ ariaLabel = "Pagination", currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const arrowIcon = (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  );

  return (
    <nav className="collection-pagination" aria-label={ariaLabel}>
      <button
        type="button"
        className="collection-pagination-arrow collection-pagination-prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {arrowIcon}
        <span>Trang trước</span>
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

      <button
        type="button"
        className="collection-pagination-arrow collection-pagination-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span>Trang sau</span>
        {arrowIcon}
      </button>
    </nav>
  );
}

function LuyenTap() {
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [learningGames, setLearningGames] = useState(fallbackLearningGames);
  const [searchText, setSearchText] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("tat-ca");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentGamePage, setCurrentGamePage] = useState(1);
  const [quizWindow, setQuizWindow] = useState(0);
  const [gameWindow, setGameWindow] = useState(0);
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
        { data: gameData, error: gameError },
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
        supabase
          .from("tro_choi_hoc_tap")
          .select("id, ten_tro_choi, mo_ta, duong_dan, chu_de, hinh_dai_dien_url, thu_tu_hien_thi")
          .eq("da_xuat_ban", true)
          .order("thu_tu_hien_thi", { ascending: true })
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
      if (!gameError) {
        setLearningGames(
          (gameData || []).map((game) => ({
            description: game.mo_ta || "Trò chơi học tập tương tác giúp ôn luyện kiến thức Địa lí.",
            icon: "🎮",
            imageUrl: game.hinh_dai_dien_url ? buildR2FileUrl(game.hinh_dai_dien_url) : "",
            name: game.ten_tro_choi,
            topic: game.chu_de,
            url: game.duong_dan,
          })),
        );
      }
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
      const matchesTopic = selectedTopicId === "tat-ca" || quiz.chu_de_id === Number(selectedTopicId);
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
  const totalQuizWindows = Math.max(1, Math.ceil(paginatedQuizzes.length / ITEMS_PER_WINDOW));
  const quizWindowSafe = Math.min(quizWindow, totalQuizWindows - 1);
  const visibleQuizzes = paginatedQuizzes.slice(
    quizWindowSafe * ITEMS_PER_WINDOW,
    quizWindowSafe * ITEMS_PER_WINDOW + ITEMS_PER_WINDOW,
  );
  const totalGamePages = Math.max(1, Math.ceil(learningGames.length / GAME_ITEMS_PER_PAGE));
  const currentGamePageSafe = Math.min(currentGamePage, totalGamePages);
  const paginatedLearningGames = learningGames.slice(
    (currentGamePageSafe - 1) * GAME_ITEMS_PER_PAGE,
    currentGamePageSafe * GAME_ITEMS_PER_PAGE,
  );
  const totalGameWindows = Math.max(1, Math.ceil(paginatedLearningGames.length / ITEMS_PER_WINDOW));
  const gameWindowSafe = Math.min(gameWindow, totalGameWindows - 1);
  const visibleLearningGames = paginatedLearningGames.slice(
    gameWindowSafe * ITEMS_PER_WINDOW,
    gameWindowSafe * ITEMS_PER_WINDOW + ITEMS_PER_WINDOW,
  );

  useEffect(() => {
    setQuizWindow(0);
  }, [currentPageSafe, deferredSearchText, selectedTopicId]);

  useEffect(() => {
    setGameWindow(0);
  }, [currentGamePageSafe]);

  return (
    <div className="collection-page">
      <Header />

      <main>
        <section
          className="collection-hero"
          style={{
            "--collection-hero-image":
              'url("https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1600")',
          }}
        >
          <div className="collection-hero-content">
            <p className="collection-eyebrow">Luyện tập</p>
            <h1>Danh sách bài kiểm tra theo chủ đề với bố cục gọn và dễ chọn hơn</h1>
            <p>
              Bài kiểm tra được hiển thị theo dạng thẻ rõ ràng, cho phép người học xem nhanh chủ đề, số câu hỏi và thời gian làm bài trước khi vào làm.
            </p>
          </div>
        </section>

        <section className="collection-shell">
          <div className="collection-topbar">
            <div className="collection-breadcrumbs">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <strong>Luyện tập</strong>
            </div>

            <Link to="/" className="collection-topbar-action">
              Về trang chủ
            </Link>
          </div>

          {loading ? (
            <>
              <ControlsSkeleton />
              <section className="collection-grid quiz-collection-grid">
                {Array.from({ length: QUIZ_SKELETON_COUNT }, (_, index) => (
                  <CollectionCardSkeleton key={index} />
                ))}
              </section>
            </>
          ) : (
            <>
              <section className="learning-games-section">
                <div className="learning-games-heading">
                  <p className="collection-eyebrow">Trò chơi học tập</p>
                  <h2>TRÒ CHƠI HỌC TẬP</h2>
                </div>

                <div className="learning-games-grid">
                  {visibleLearningGames.map((game) => (
                    <LearningGameCard key={game.name} game={game} />
                  ))}
                </div>

                <CollectionWindowControls
                  currentWindow={gameWindowSafe}
                  totalWindows={totalGameWindows}
                  onWindowChange={setGameWindow}
                  label="trò chơi học tập"
                />

                <Pagination
                  ariaLabel="Phân trang trò chơi học tập"
                  currentPage={currentGamePageSafe}
                  totalPages={totalGamePages}
                  onPageChange={setCurrentGamePage}
                />
              </section>

              <section className="collection-controls">
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
                <section className="collection-status collection-status-error">{error}</section>
              ) : filteredQuizzes.length === 0 ? (
                <section className="collection-empty">
                  Chưa có bài kiểm tra phù hợp. Admin có thể tạo và xuất bản bài kiểm tra trong trang quản trị.
                </section>
              ) : (
                <>
                  <section className="collection-grid quiz-collection-grid">
                    {visibleQuizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                  </section>

                  <CollectionWindowControls
                    currentWindow={quizWindowSafe}
                    totalWindows={totalQuizWindows}
                    onWindowChange={setQuizWindow}
                    label="bài kiểm tra"
                  />

                  <Pagination
                    ariaLabel="Phân trang bài kiểm tra"
                    currentPage={currentPageSafe}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default LuyenTap;
