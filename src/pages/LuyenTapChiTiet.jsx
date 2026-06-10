import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import { buildR2ProxyFileUrl } from "../lib/r2";
import { supabase } from "../lib/supabaseClient";
import "./LuyenTapChiTiet.css";

const INITIAL_PARTICIPANT_INFO = {
  hoTenHocSinh: "",
  tenLop: "",
  tenTruong: "",
};

function QuizDetailSkeleton() {
  return (
    <section className="quiz-detail-shell quiz-detail-shell-skeleton" aria-hidden="true">
      <div className="quiz-detail-sidebar">
        <div className="quiz-detail-card">
          <div className="quiz-detail-skeleton quiz-detail-skeleton-title" />
          <div className="quiz-detail-skeleton quiz-detail-skeleton-text" />
          <div className="quiz-detail-skeleton quiz-detail-skeleton-text quiz-detail-skeleton-text-wide" />
          <div className="quiz-detail-nav-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="quiz-detail-skeleton quiz-detail-skeleton-nav" />
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-detail-content">
        <div className="quiz-detail-card">
          <div className="quiz-detail-skeleton quiz-detail-skeleton-kicker" />
          <div className="quiz-detail-skeleton quiz-detail-skeleton-heading" />
          <div className="quiz-detail-skeleton quiz-detail-skeleton-text quiz-detail-skeleton-text-wide" />
          <div className="quiz-detail-skeleton quiz-detail-skeleton-text" />
          <div className="quiz-detail-option-list">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="quiz-detail-skeleton quiz-detail-skeleton-option" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatDurationLabel(minutes) {
  if (!minutes) return "Không giới hạn";
  return `${minutes} phút`;
}

function buildReviewData(questions, answersByQuestionId) {
  return questions.map((question) => {
    const selectedAnswerId = answersByQuestionId[question.id] || null;
    const selectedAnswer =
      question.answers.find((answer) => answer.id === selectedAnswerId) || null;
    const correctAnswer = question.answers.find((answer) => answer.la_dap_an_dung) || null;
    const isCorrect = Boolean(selectedAnswer && correctAnswer && selectedAnswer.id === correctAnswer.id);

    return {
      correctAnswer,
      isCorrect,
      question,
      selectedAnswer,
      selectedAnswerId,
    };
  });
}

function formatTimeSpent(startedAt) {
  if (!startedAt) return "";

  const elapsedSeconds = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${minutes} phút ${String(seconds).padStart(2, "0")} giây`;
}

function LuyenTapChiTiet() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("intro");
  const [participantInfo, setParticipantInfo] = useState(INITIAL_PARTICIPANT_INFO);
  const [answersByQuestionId, setAnswersByQuestionId] = useState({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [resultSummary, setResultSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadQuizDetail() {
      setLoading(true);
      setError("");
      setQuiz(null);
      setQuestions([]);

      const { data: quizData, error: quizError } = await supabase
        .from("bai_kiem_tra")
        .select("id, tieu_de, mo_ta, chu_de_id, thoi_gian_lam_bai_phut, da_xuat_ban")
        .eq("id", Number(quizId))
        .eq("da_xuat_ban", true)
        .maybeSingle();

      if (!isMounted) return;

      if (quizError) {
        setError(`Không thể tải bài kiểm tra: ${quizError.message}`);
        setLoading(false);
        return;
      }

      if (!quizData) {
        setError("Không tìm thấy bài kiểm tra hoặc bài kiểm tra chưa được xuất bản.");
        setLoading(false);
        return;
      }

      const [{ data: topicData, error: topicError }, { data: questionRows, error: questionError }] =
        await Promise.all([
          supabase.from("chu_de").select("id, ten_chu_de").eq("id", quizData.chu_de_id).maybeSingle(),
          supabase
            .from("cau_hoi_kiem_tra")
            .select("id, noi_dung_cau_hoi, duong_dan_anh_cau_hoi, giai_thich_dap_an, diem, thu_tu_hien_thi")
            .eq("bai_kiem_tra_id", quizData.id)
            .order("thu_tu_hien_thi", { ascending: true })
            .order("id", { ascending: true }),
        ]);

      if (!isMounted) return;

      if (topicError) {
        setError(`Không thể tải chủ đề: ${topicError.message}`);
        setLoading(false);
        return;
      }

      if (questionError) {
        setError(`Không thể tải câu hỏi: ${questionError.message}`);
        setLoading(false);
        return;
      }

      const questionIds = (questionRows || []).map((question) => question.id);
      let answersByQuestion = new Map();

      if (questionIds.length > 0) {
        const { data: answerRows, error: answerError } = await supabase
          .from("dap_an_kiem_tra")
          .select("id, cau_hoi_id, noi_dung_dap_an, la_dap_an_dung, thu_tu_hien_thi")
          .in("cau_hoi_id", questionIds)
          .order("thu_tu_hien_thi", { ascending: true })
          .order("id", { ascending: true });

        if (!isMounted) return;

        if (answerError) {
          setError(`Không thể tải đáp án: ${answerError.message}`);
          setLoading(false);
          return;
        }

        answersByQuestion = (answerRows || []).reduce((answerMap, answer) => {
          const currentAnswers = answerMap.get(answer.cau_hoi_id) || [];
          currentAnswers.push({
            ...answer,
            la_dap_an_dung: Boolean(answer.la_dap_an_dung),
          });
          answerMap.set(answer.cau_hoi_id, currentAnswers);
          return answerMap;
        }, new Map());
      }

      setQuiz({
        ...quizData,
        topicName: topicData?.ten_chu_de || "Chưa gắn chủ đề",
      });
      setQuestions(
        (questionRows || []).map((question) => ({
          ...question,
          answers: answersByQuestion.get(question.id) || [],
        })),
      );
      setLoading(false);
    }

    loadQuizDetail();

    return () => {
      isMounted = false;
    };
  }, [quizId]);

  const activeQuestion = questions[activeQuestionIndex] || null;
  const answeredCount = useMemo(
    () => Object.values(answersByQuestionId).filter(Boolean).length,
    [answersByQuestionId],
  );
  const totalPoints = useMemo(
    () => questions.reduce((total, question) => total + (Number(question.diem) || 1), 0),
    [questions],
  );

  function updateParticipantField(fieldName, value) {
    setParticipantInfo((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }

  function handleStartQuiz(event) {
    event.preventDefault();
    setSubmitError("");

    if (!participantInfo.hoTenHocSinh.trim()) {
      setSubmitError("Vui lòng nhập họ tên học sinh trước khi bắt đầu làm bài.");
      return;
    }

    if (!participantInfo.tenLop.trim()) {
      setSubmitError("Vui lòng nhập lớp trước khi bắt đầu làm bài.");
      return;
    }

    setPhase("quiz");
    setStartedAt(new Date());
    setActiveQuestionIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleChooseAnswer(questionId, answerId) {
    setAnswersByQuestionId((current) => ({
      ...current,
      [questionId]: answerId,
    }));
  }

  function goToQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    setActiveQuestionIndex(index);
  }

  async function handleSubmitQuiz() {
    if (submitting || !quiz) return;

    const unansweredCount = questions.length - answeredCount;

    if (unansweredCount > 0) {
      const confirmed = window.confirm(
        `Bạn còn ${unansweredCount} câu chưa trả lời. Vẫn nộp bài và chấm kết quả ngay bây giờ?`,
      );

      if (!confirmed) return;
    }

    setSubmitting(true);
    setSubmitError("");

    const reviewItems = buildReviewData(questions, answersByQuestionId);
    const correctCount = reviewItems.filter((item) => item.isCorrect).length;
    const earnedPoints = reviewItems.reduce(
      (total, item) => total + (item.isCorrect ? Number(item.question.diem) || 1 : 0),
      0,
    );
    const diemSo = totalPoints > 0 ? Number(((earnedPoints / totalPoints) * 10).toFixed(2)) : 0;
    let createdResultId = null;

    try {
      const { data: createdResult, error: resultError } = await supabase
        .from("ket_qua_kiem_tra")
        .insert({
          bai_kiem_tra_id: quiz.id,
          diem_so: diemSo,
          ho_ten_hoc_sinh: participantInfo.hoTenHocSinh.trim(),
          so_cau_dung: correctCount,
          ten_lop: participantInfo.tenLop.trim(),
          ten_truong: participantInfo.tenTruong.trim() || null,
          tong_so_cau: questions.length,
        })
        .select("id")
        .single();

      if (resultError) {
        throw new Error(resultError.message);
      }

      createdResultId = createdResult.id;

      const detailPayload = reviewItems.map((item) => ({
        cau_hoi_id: item.question.id,
        dap_an_da_chon_id: item.selectedAnswerId,
        ket_qua_id: createdResult.id,
        la_dap_an_dung: item.isCorrect,
      }));

      if (detailPayload.length > 0) {
        const { error: detailError } = await supabase
          .from("chi_tiet_ket_qua_kiem_tra")
          .insert(detailPayload);

        if (detailError) {
          throw new Error(detailError.message);
        }
      }

      setResultSummary({
        answeredCount,
        correctCount,
        diemSo,
        earnedPoints,
        ketQuaId: createdResult.id,
        percent: questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0,
        reviewItems,
        timeSpentLabel: formatTimeSpent(startedAt),
        totalPoints,
        wrongCount: questions.length - correctCount,
      });
      setPhase("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (saveError) {
      if (createdResultId) {
        await supabase.from("chi_tiet_ket_qua_kiem_tra").delete().eq("ket_qua_id", createdResultId);
        await supabase.from("ket_qua_kiem_tra").delete().eq("id", createdResultId);
      }

      setSubmitError(saveError.message || "Không thể lưu kết quả bài làm.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetryQuiz() {
    setAnswersByQuestionId({});
    setActiveQuestionIndex(0);
    setStartedAt(new Date());
    setResultSummary(null);
    setSubmitError("");
    setPhase("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <Header />

      <main className="quiz-detail-page">
        <section className="quiz-detail-hero">
          <p className="quiz-detail-eyebrow">Luyện tập trắc nghiệm</p>
          <h1>{quiz?.tieu_de || "Bài kiểm tra theo chủ đề"}</h1>
          <p>
            Làm bài trực tuyến, nhận kết quả ngay sau khi nộp và lưu lại lịch sử làm bài vào hệ
            thống.
          </p>
        </section>

        {loading ? (
          <QuizDetailSkeleton />
        ) : error ? (
          <section className="quiz-detail-status quiz-detail-status-error">{error}</section>
        ) : !quiz || questions.length === 0 ? (
          <section className="quiz-detail-status">
            Bài kiểm tra này hiện chưa có câu hỏi để hiển thị.
          </section>
        ) : (
          <>
            {phase === "intro" ? (
              <section className="quiz-detail-intro">
                <div className="quiz-detail-card quiz-detail-summary-card">
                  <div className="quiz-detail-summary-meta">
                    <span>{quiz.topicName}</span>
                    <span>{questions.length} câu hỏi</span>
                    <span>{formatDurationLabel(quiz.thoi_gian_lam_bai_phut)}</span>
                  </div>
                  <h2>Thông tin trước khi làm bài</h2>
                  <p>
                    Kết quả chỉ được lưu vào cơ sở dữ liệu sau khi bạn nộp bài. Hãy nhập thông tin
                    người làm để hệ thống ghi lại kết quả đúng với từng học sinh.
                  </p>
                </div>

                <form className="quiz-detail-card quiz-detail-intro-form" onSubmit={handleStartQuiz}>
                  <label>
                    <span>Họ và tên học sinh *</span>
                    <input
                      type="text"
                      value={participantInfo.hoTenHocSinh}
                      onChange={(event) =>
                        updateParticipantField("hoTenHocSinh", event.target.value)
                      }
                      placeholder="Nhập họ tên học sinh"
                    />
                  </label>

                  <label>
                    <span>Lớp *</span>
                    <input
                      type="text"
                      value={participantInfo.tenLop}
                      onChange={(event) => updateParticipantField("tenLop", event.target.value)}
                      placeholder="Ví dụ: 9A1"
                    />
                  </label>

                  <label>
                    <span>Trường</span>
                    <input
                      type="text"
                      value={participantInfo.tenTruong}
                      onChange={(event) => updateParticipantField("tenTruong", event.target.value)}
                      placeholder="Nhập tên trường nếu có"
                    />
                  </label>

                  {submitError ? <div className="quiz-detail-inline-error">{submitError}</div> : null}

                  <div className="quiz-detail-intro-actions">
                    <Link to="/luyen-tap" className="quiz-detail-secondary-link">
                      Quay lại danh sách bài kiểm tra
                    </Link>
                    <button type="submit" className="quiz-detail-primary-button">
                      Bắt đầu làm bài
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            {phase === "quiz" && activeQuestion ? (
              <section className="quiz-detail-shell">
                <aside className="quiz-detail-sidebar">
                  <div className="quiz-detail-card quiz-detail-sticky-card">
                    <div className="quiz-detail-progress-head">
                      <h2>Tiến độ làm bài</h2>
                      <span>
                        {answeredCount}/{questions.length} câu
                      </span>
                    </div>

                    <div className="quiz-detail-summary-meta">
                      <span>{participantInfo.hoTenHocSinh}</span>
                      <span>{participantInfo.tenLop}</span>
                      <span>{formatDurationLabel(quiz.thoi_gian_lam_bai_phut)}</span>
                    </div>

                    <div className="quiz-detail-nav-grid">
                      {questions.map((question, index) => {
                        const isAnswered = Boolean(answersByQuestionId[question.id]);
                        const isActive = index === activeQuestionIndex;

                        return (
                          <button
                            key={question.id}
                            type="button"
                            className={[
                              "quiz-detail-nav-button",
                              isAnswered ? "is-answered" : "",
                              isActive ? "is-active" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => goToQuestion(index)}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="quiz-detail-side-actions">
                      <button
                        type="button"
                        className="quiz-detail-secondary-button"
                        onClick={() => goToQuestion(activeQuestionIndex - 1)}
                        disabled={activeQuestionIndex === 0}
                      >
                        Câu trước
                      </button>
                      <button
                        type="button"
                        className="quiz-detail-secondary-button"
                        onClick={() => goToQuestion(activeQuestionIndex + 1)}
                        disabled={activeQuestionIndex === questions.length - 1}
                      >
                        Câu sau
                      </button>
                      <button
                        type="button"
                        className="quiz-detail-primary-button"
                        onClick={handleSubmitQuiz}
                        disabled={submitting}
                      >
                        {submitting ? "Đang nộp bài..." : "Nộp bài và chấm kết quả"}
                      </button>
                    </div>

                    {submitError ? <div className="quiz-detail-inline-error">{submitError}</div> : null}
                  </div>
                </aside>

                <div className="quiz-detail-content">
                  <article className="quiz-detail-card quiz-detail-question-card">
                    <div className="quiz-detail-question-meta">
                      <span>
                        Câu {activeQuestionIndex + 1}/{questions.length}
                      </span>
                      <span>{Number(activeQuestion.diem) || 1} điểm</span>
                    </div>

                    <h2>{activeQuestion.noi_dung_cau_hoi}</h2>

                    {activeQuestion.duong_dan_anh_cau_hoi ? (
                      <div className="quiz-detail-question-image-wrap">
                        <img
                          src={buildR2ProxyFileUrl(activeQuestion.duong_dan_anh_cau_hoi)}
                          alt={`Minh họa cho câu ${activeQuestionIndex + 1}`}
                          className="quiz-detail-question-image"
                        />
                      </div>
                    ) : null}

                    <div className="quiz-detail-option-list">
                      {activeQuestion.answers.map((answer, answerIndex) => {
                        const checked = answersByQuestionId[activeQuestion.id] === answer.id;

                        return (
                          <label
                            key={answer.id}
                            className={[
                              "quiz-detail-option",
                              checked ? "is-selected" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <input
                              type="radio"
                              name={`question-${activeQuestion.id}`}
                              checked={checked}
                              onChange={() => handleChooseAnswer(activeQuestion.id, answer.id)}
                            />
                            <span className="quiz-detail-option-marker">
                              {String.fromCharCode(65 + answerIndex)}
                            </span>
                            <span className="quiz-detail-option-text">{answer.noi_dung_dap_an}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="quiz-detail-question-actions">
                      <button
                        type="button"
                        className="quiz-detail-secondary-button"
                        onClick={() => goToQuestion(activeQuestionIndex - 1)}
                        disabled={activeQuestionIndex === 0}
                      >
                        Câu trước
                      </button>

                      {activeQuestionIndex === questions.length - 1 ? (
                        <button
                          type="button"
                          className="quiz-detail-primary-button"
                          onClick={handleSubmitQuiz}
                          disabled={submitting}
                        >
                          {submitting ? "Đang nộp bài..." : "Nộp bài"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="quiz-detail-primary-button"
                          onClick={() => goToQuestion(activeQuestionIndex + 1)}
                        >
                          Câu sau
                        </button>
                      )}
                    </div>
                  </article>
                </div>
              </section>
            ) : null}

            {phase === "result" && resultSummary ? (
              <section className="quiz-detail-result-page">
                <div className="quiz-detail-card quiz-detail-result-hero">
                  <div className="quiz-detail-result-head">
                    <div>
                      <p className="quiz-detail-result-eyebrow">Kết quả bài làm</p>
                      <h2>{participantInfo.hoTenHocSinh}</h2>
                      <p>
                        Mã kết quả #{resultSummary.ketQuaId} • {participantInfo.tenLop}
                        {participantInfo.tenTruong ? ` • ${participantInfo.tenTruong}` : ""}
                      </p>
                    </div>
                    <div className="quiz-detail-score-badge">
                      <strong>{resultSummary.diemSo}</strong>
                      <span>/10 điểm</span>
                    </div>
                  </div>

                  <div className="quiz-detail-result-grid">
                    <div>
                      <span className="quiz-detail-result-label">Số câu đúng</span>
                      <strong>{resultSummary.correctCount}</strong>
                    </div>
                    <div>
                      <span className="quiz-detail-result-label">Số câu sai</span>
                      <strong>{resultSummary.wrongCount}</strong>
                    </div>
                    <div>
                      <span className="quiz-detail-result-label">Tỉ lệ đúng</span>
                      <strong>{resultSummary.percent}%</strong>
                    </div>
                    <div>
                      <span className="quiz-detail-result-label">Đã trả lời</span>
                      <strong>{resultSummary.answeredCount}/{questions.length}</strong>
                    </div>
                    <div>
                      <span className="quiz-detail-result-label">Điểm thô</span>
                      <strong>
                        {resultSummary.earnedPoints}/{resultSummary.totalPoints}
                      </strong>
                    </div>
                    <div>
                      <span className="quiz-detail-result-label">Thời gian làm bài</span>
                      <strong>{resultSummary.timeSpentLabel || "Vừa xong"}</strong>
                    </div>
                  </div>

                  <div className="quiz-detail-intro-actions">
                    <Link to="/luyen-tap" className="quiz-detail-secondary-link">
                      Quay lại danh sách bài kiểm tra
                    </Link>
                    <button
                      type="button"
                      className="quiz-detail-primary-button"
                      onClick={handleRetryQuiz}
                    >
                      Làm lại bài này
                    </button>
                  </div>
                </div>

                <div className="quiz-detail-review-list">
                  {resultSummary.reviewItems.map((item, index) => (
                    <article
                      key={item.question.id}
                      className={[
                        "quiz-detail-card",
                        "quiz-detail-review-card",
                        item.isCorrect ? "is-correct" : "is-incorrect",
                      ].join(" ")}
                    >
                      <div className="quiz-detail-review-head">
                        <div>
                          <span className="quiz-detail-review-kicker">Câu {index + 1}</span>
                          <h3>{item.question.noi_dung_cau_hoi}</h3>
                        </div>
                        <span className={item.isCorrect ? "quiz-detail-result-pill is-correct" : "quiz-detail-result-pill is-incorrect"}>
                          {item.isCorrect ? "Đúng" : "Sai"}
                        </span>
                      </div>

                      <div className="quiz-detail-review-answer-group">
                        <p>
                          <strong>Bạn chọn:</strong>{" "}
                          {item.selectedAnswer?.noi_dung_dap_an || "Chưa chọn đáp án"}
                        </p>
                        <p>
                          <strong>Đáp án đúng:</strong>{" "}
                          {item.correctAnswer?.noi_dung_dap_an || "Chưa có đáp án đúng"}
                        </p>
                        {item.question.giai_thich_dap_an ? (
                          <p>
                            <strong>Giải thích:</strong> {item.question.giai_thich_dap_an}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

export default LuyenTapChiTiet;
