import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function createEmptyResultForm() {
  return {
    bai_kiem_tra_id: "",
    diem_so: "",
    ho_ten_hoc_sinh: "",
    so_cau_dung: "",
    ten_lop: "",
    ten_truong: "",
    tong_so_cau: "",
  };
}

function createEmptyDetailForm() {
  return {
    cau_hoi_id: "",
    dap_an_da_chon_id: "",
    la_dap_an_dung: true,
  };
}

function formatScore(value) {
  if (value === null || value === undefined || value === "") return "—";
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return `${numericValue}/10`;
}

function buildQuestionOptionLabel(question) {
  const orderLabel = question.thu_tu_hien_thi ? `Câu ${question.thu_tu_hien_thi}` : `ID ${question.id}`;
  return `${orderLabel}: ${question.noi_dung_cau_hoi}`;
}

function buildAnswerOptionLabel(answer) {
  const orderLabel = answer.thu_tu_hien_thi ? `Đáp án ${answer.thu_tu_hien_thi}` : `ID ${answer.id}`;
  return `${orderLabel}: ${answer.noi_dung_dap_an}`;
}

function AdminQuizResultsManager() {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [resultForm, setResultForm] = useState(() => createEmptyResultForm());
  const [editingResultId, setEditingResultId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("tat-ca");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [activeResult, setActiveResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [detailRows, setDetailRows] = useState([]);
  const [detailForm, setDetailForm] = useState(() => createEmptyDetailForm());
  const [editingDetailId, setEditingDetailId] = useState(null);
  const [detailSearchText, setDetailSearchText] = useState("");
  const [detailStatusFilter, setDetailStatusFilter] = useState("tat-ca");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailMessage, setDetailMessage] = useState("");
  const [detailError, setDetailError] = useState("");

  const answersByQuestionId = useMemo(() => {
    return answers.reduce((answerMap, answer) => {
      const currentAnswers = answerMap.get(answer.cau_hoi_id) || [];
      currentAnswers.push(answer);
      answerMap.set(answer.cau_hoi_id, currentAnswers);
      return answerMap;
    }, new Map());
  }, [answers]);

  const answerById = useMemo(
    () => new Map(answers.map((answer) => [answer.id, answer])),
    [answers],
  );

  async function loadManagerData() {
    setLoading(true);
    setError("");

    const [{ data: quizRows, error: quizError }, { data: resultRows, error: resultError }] =
      await Promise.all([
        supabase
          .from("bai_kiem_tra")
          .select("id, tieu_de")
          .order("id", { ascending: false }),
        supabase
          .from("ket_qua_kiem_tra")
          .select("*")
          .order("id", { ascending: false })
          .limit(150),
      ]);

    if (quizError) {
      setError(`Không thể tải bài kiểm tra: ${quizError.message}`);
      setQuizzes([]);
      setResults([]);
      setLoading(false);
      return [];
    }

    if (resultError) {
      setError(`Không thể tải kết quả kiểm tra: ${resultError.message}`);
      setQuizzes(quizRows || []);
      setResults([]);
      setLoading(false);
      return [];
    }

    const nextQuizzes = quizRows || [];
    const quizTitleById = new Map(nextQuizzes.map((quiz) => [quiz.id, quiz.tieu_de]));
    const nextResults = (resultRows || []).map((result) => ({
      ...result,
      quizTitle: quizTitleById.get(result.bai_kiem_tra_id) || "Chưa gắn bài kiểm tra",
    }));

    setQuizzes(nextQuizzes);
    setResults(nextResults);
    setLoading(false);

    return nextResults;
  }

  async function loadDetailData(result) {
    if (!result?.bai_kiem_tra_id) return;

    setDetailLoading(true);
    setDetailError("");
    setDetailMessage("");

    const [{ data: questionRows, error: questionError }, { data: detailRowsData, error: detailRowsError }] =
      await Promise.all([
        supabase
          .from("cau_hoi_kiem_tra")
          .select("id, noi_dung_cau_hoi, diem, thu_tu_hien_thi")
          .eq("bai_kiem_tra_id", result.bai_kiem_tra_id)
          .order("thu_tu_hien_thi", { ascending: true })
          .order("id", { ascending: true }),
        supabase
          .from("chi_tiet_ket_qua_kiem_tra")
          .select("*")
          .eq("ket_qua_id", result.id)
          .order("id", { ascending: true }),
      ]);

    if (questionError) {
      setDetailError(`Không thể tải câu hỏi của bài kiểm tra: ${questionError.message}`);
      setQuestions([]);
      setAnswers([]);
      setDetailRows([]);
      setDetailLoading(false);
      return;
    }

    if (detailRowsError) {
      setDetailError(`Không thể tải chi tiết kết quả: ${detailRowsError.message}`);
      setQuestions(questionRows || []);
      setAnswers([]);
      setDetailRows([]);
      setDetailLoading(false);
      return;
    }

    const questionIds = (questionRows || []).map((question) => question.id);
    let answerRows = [];

    if (questionIds.length > 0) {
      const { data: answerData, error: answerError } = await supabase
        .from("dap_an_kiem_tra")
        .select("id, cau_hoi_id, noi_dung_dap_an, la_dap_an_dung, thu_tu_hien_thi")
        .in("cau_hoi_id", questionIds)
        .order("thu_tu_hien_thi", { ascending: true })
        .order("id", { ascending: true });

      if (answerError) {
        setDetailError(`Không thể tải đáp án câu hỏi: ${answerError.message}`);
        setQuestions(questionRows || []);
        setAnswers([]);
        setDetailRows([]);
        setDetailLoading(false);
        return;
      }

      answerRows = answerData || [];
    }

    const questionMap = new Map((questionRows || []).map((question) => [question.id, question]));
    const answerMap = new Map(answerRows.map((answer) => [answer.id, answer]));

    setQuestions(questionRows || []);
    setAnswers(answerRows);
    setDetailRows(
      (detailRowsData || []).map((detail) => {
        const question = questionMap.get(detail.cau_hoi_id);
        const selectedAnswer = answerMap.get(detail.dap_an_da_chon_id);
        const correctAnswer =
          answerRows.find(
            (answer) => answer.cau_hoi_id === detail.cau_hoi_id && answer.la_dap_an_dung,
          ) || null;

        return {
          ...detail,
          correctAnswerText: correctAnswer?.noi_dung_dap_an || "Chưa có đáp án đúng",
          questionText: question?.noi_dung_cau_hoi || `Câu hỏi ID ${detail.cau_hoi_id}`,
          selectedAnswerText: selectedAnswer?.noi_dung_dap_an || "Chưa chọn đáp án",
        };
      }),
    );
    setDetailLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadManagerData();
    });
  }, []);

  const filteredResults = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return results.filter((result) => {
      const matchesQuiz =
        selectedQuizId === "tat-ca" || result.bai_kiem_tra_id === Number(selectedQuizId);
      const matchesKeyword =
        keyword === "" ||
        result.quizTitle?.toLowerCase().includes(keyword) ||
        result.ho_ten_hoc_sinh?.toLowerCase().includes(keyword) ||
        result.ten_lop?.toLowerCase().includes(keyword) ||
        result.ten_truong?.toLowerCase().includes(keyword) ||
        String(result.id).includes(keyword);

      return matchesQuiz && matchesKeyword;
    });
  }, [results, searchText, selectedQuizId]);

  const availableAnswers = useMemo(() => {
    const questionId = Number(detailForm.cau_hoi_id);

    if (!questionId) return [];

    return answersByQuestionId.get(questionId) || [];
  }, [answersByQuestionId, detailForm.cau_hoi_id]);

  const filteredDetailRows = useMemo(() => {
    const keyword = detailSearchText.trim().toLowerCase();

    return detailRows.filter((detail) => {
      const matchesStatus =
        detailStatusFilter === "tat-ca" ||
        (detailStatusFilter === "dung" && detail.la_dap_an_dung) ||
        (detailStatusFilter === "sai" && !detail.la_dap_an_dung);
      const matchesKeyword =
        keyword === "" ||
        detail.questionText?.toLowerCase().includes(keyword) ||
        detail.selectedAnswerText?.toLowerCase().includes(keyword) ||
        detail.correctAnswerText?.toLowerCase().includes(keyword);

      return matchesStatus && matchesKeyword;
    });
  }, [detailRows, detailSearchText, detailStatusFilter]);

  function handleResultFormChange(fieldName, value) {
    setResultForm((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }

  function handleDetailFormChange(fieldName, value) {
    setDetailForm((current) => {
      const nextForm = {
        ...current,
        [fieldName]: value,
      };

      if (fieldName === "cau_hoi_id") {
        const nextQuestionId = Number(value);
        const nextAnswers = answersByQuestionId.get(nextQuestionId) || [];
        const isSelectedAnswerValid = nextAnswers.some(
          (answer) => answer.id === Number(current.dap_an_da_chon_id),
        );

        if (!isSelectedAnswerValid) {
          nextForm.dap_an_da_chon_id = "";
        }
      }

      return nextForm;
    });
  }

  function resetResultForm() {
    setResultForm(createEmptyResultForm());
    setEditingResultId(null);
  }

  function resetDetailForm() {
    setDetailForm(createEmptyDetailForm());
    setEditingDetailId(null);
  }

  function handleEditResult(result) {
    setEditingResultId(result.id);
    setResultForm({
      bai_kiem_tra_id: result.bai_kiem_tra_id ? String(result.bai_kiem_tra_id) : "",
      diem_so: result.diem_so ?? "",
      ho_ten_hoc_sinh: result.ho_ten_hoc_sinh || "",
      so_cau_dung: result.so_cau_dung ?? "",
      ten_lop: result.ten_lop || "",
      ten_truong: result.ten_truong || "",
      tong_so_cau: result.tong_so_cau ?? "",
    });
    setMessage(`Đang sửa kết quả ID ${result.id}.`);
    setError("");
  }

  async function handleSubmitResult(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      bai_kiem_tra_id: resultForm.bai_kiem_tra_id ? Number(resultForm.bai_kiem_tra_id) : null,
      diem_so: resultForm.diem_so === "" ? null : Number(resultForm.diem_so),
      ho_ten_hoc_sinh: resultForm.ho_ten_hoc_sinh.trim() || null,
      so_cau_dung: resultForm.so_cau_dung === "" ? null : Number(resultForm.so_cau_dung),
      ten_lop: resultForm.ten_lop.trim() || null,
      ten_truong: resultForm.ten_truong.trim() || null,
      tong_so_cau: resultForm.tong_so_cau === "" ? null : Number(resultForm.tong_so_cau),
    };

    try {
      const successMessage = editingResultId
        ? "Đã cập nhật kết quả kiểm tra."
        : "Đã thêm kết quả kiểm tra mới.";
      const request = editingResultId
        ? supabase.from("ket_qua_kiem_tra").update(payload).eq("id", editingResultId)
        : supabase.from("ket_qua_kiem_tra").insert(payload);

      const { error: saveError } = await request;

      if (saveError) {
        throw new Error(saveError.message);
      }

      resetResultForm();
      await loadManagerData();
      setMessage(successMessage);
    } catch (submitError) {
      setError(submitError.message || "Không thể lưu kết quả kiểm tra.");
    }

    setSaving(false);
  }

  async function handleDeleteResult(result) {
    const confirmed = window.confirm(
      `Xóa kết quả ID ${result.id} và toàn bộ chi tiết kết quả liên quan?`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: detailDeleteError } = await supabase
      .from("chi_tiet_ket_qua_kiem_tra")
      .delete()
      .eq("ket_qua_id", result.id);

    if (detailDeleteError) {
      setError(detailDeleteError.message);
      return;
    }

    const { error: resultDeleteError } = await supabase
      .from("ket_qua_kiem_tra")
      .delete()
      .eq("id", result.id);

    if (resultDeleteError) {
      setError(resultDeleteError.message);
      return;
    }

    if (activeResult?.id === result.id) {
      setActiveResult(null);
    }

    await loadManagerData();
    setMessage(`Đã xóa kết quả ID ${result.id}.`);
  }

  async function syncResultSummary(resultId, quizId) {
    const [{ data: detailData, error: detailError }, { data: questionData, error: questionError }] =
      await Promise.all([
        supabase
          .from("chi_tiet_ket_qua_kiem_tra")
          .select("cau_hoi_id, la_dap_an_dung")
          .eq("ket_qua_id", resultId),
        supabase
          .from("cau_hoi_kiem_tra")
          .select("id, diem")
          .eq("bai_kiem_tra_id", quizId),
      ]);

    if (detailError) {
      throw new Error(detailError.message);
    }

    if (questionError) {
      throw new Error(questionError.message);
    }

    const details = detailData || [];
    const questionsForQuiz = questionData || [];
    const pointByQuestionId = new Map(
      questionsForQuiz.map((question) => [question.id, Number(question.diem) || 1]),
    );
    const totalPoints = questionsForQuiz.reduce(
      (total, question) => total + (Number(question.diem) || 1),
      0,
    );
    const correctCount = details.filter((detail) => detail.la_dap_an_dung).length;
    const earnedPoints = details.reduce((total, detail) => {
      if (!detail.la_dap_an_dung) return total;
      return total + (pointByQuestionId.get(detail.cau_hoi_id) || 1);
    }, 0);
    const tongSoCau = questionsForQuiz.length || details.length;
    const diemSo =
      totalPoints > 0
        ? Number(((earnedPoints / totalPoints) * 10).toFixed(2))
        : tongSoCau > 0
          ? Number(((correctCount / tongSoCau) * 10).toFixed(2))
          : 0;

    const { error: updateError } = await supabase
      .from("ket_qua_kiem_tra")
      .update({
        diem_so: diemSo,
        so_cau_dung: correctCount,
        tong_so_cau: tongSoCau,
      })
      .eq("id", resultId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  async function refreshActiveResultState(result = activeResult) {
    if (!result) return;

    const nextResults = await loadManagerData();
    const refreshedResult = nextResults.find((item) => item.id === result.id) || result;

    setActiveResult(refreshedResult);
    await loadDetailData(refreshedResult);
  }

  async function openDetailModal(result) {
    setActiveResult(result);
    setDetailSearchText("");
    setDetailStatusFilter("tat-ca");
    resetDetailForm();
    await loadDetailData(result);
  }

  function closeDetailModal() {
    setActiveResult(null);
    setQuestions([]);
    setAnswers([]);
    setDetailRows([]);
    setDetailSearchText("");
    setDetailStatusFilter("tat-ca");
    setDetailMessage("");
    setDetailError("");
    resetDetailForm();
  }

  function handleEditDetail(detail) {
    setEditingDetailId(detail.id);
    setDetailForm({
      cau_hoi_id: detail.cau_hoi_id ? String(detail.cau_hoi_id) : "",
      dap_an_da_chon_id: detail.dap_an_da_chon_id ? String(detail.dap_an_da_chon_id) : "",
      la_dap_an_dung: Boolean(detail.la_dap_an_dung),
    });
    setDetailMessage(`Đang sửa chi tiết ID ${detail.id}.`);
    setDetailError("");
  }

  async function handleSubmitDetail(event) {
    event.preventDefault();

    if (!activeResult) return;

    setDetailSaving(true);
    setDetailError("");
    setDetailMessage("");

    const payload = {
      cau_hoi_id: detailForm.cau_hoi_id ? Number(detailForm.cau_hoi_id) : null,
      dap_an_da_chon_id: detailForm.dap_an_da_chon_id ? Number(detailForm.dap_an_da_chon_id) : null,
      ket_qua_id: activeResult.id,
      la_dap_an_dung: Boolean(detailForm.la_dap_an_dung),
    };

    try {
      const successMessage = editingDetailId
        ? "Đã cập nhật chi tiết kết quả."
        : "Đã thêm chi tiết kết quả.";
      const request = editingDetailId
        ? supabase.from("chi_tiet_ket_qua_kiem_tra").update(payload).eq("id", editingDetailId)
        : supabase.from("chi_tiet_ket_qua_kiem_tra").insert(payload);

      const { error: saveError } = await request;

      if (saveError) {
        throw new Error(saveError.message);
      }

      await syncResultSummary(activeResult.id, activeResult.bai_kiem_tra_id);
      resetDetailForm();
      await refreshActiveResultState(activeResult);
      setDetailMessage(successMessage);
    } catch (submitError) {
      setDetailError(submitError.message || "Không thể lưu chi tiết kết quả.");
    }

    setDetailSaving(false);
  }

  async function handleDeleteDetail(detail) {
    if (!activeResult) return;

    const confirmed = window.confirm(`Xóa chi tiết kết quả ID ${detail.id}?`);

    if (!confirmed) return;

    setDetailError("");
    setDetailMessage("");

    const { error: deleteError } = await supabase
      .from("chi_tiet_ket_qua_kiem_tra")
      .delete()
      .eq("id", detail.id);

    if (deleteError) {
      setDetailError(deleteError.message);
      return;
    }

    try {
      const successMessage = `Đã xóa chi tiết ID ${detail.id}.`;
      await syncResultSummary(activeResult.id, activeResult.bai_kiem_tra_id);
      await refreshActiveResultState(activeResult);
      setDetailMessage(successMessage);
    } catch (syncError) {
      setDetailError(syncError.message);
    }
  }

  return (
    <section className="admin-quiz-builder admin-results-manager">
      <div className="admin-panel-title admin-panel-title-wide">
        <div>
          <h2>Kết quả kiểm tra và chi tiết</h2>
          <p>Quản lý kết quả làm bài và chỉnh sửa từng chi tiết đáp án ngay trong cùng một màn hình.</p>
        </div>

        <div className="admin-quiz-builder-actions">
          <button className="admin-secondary-button" type="button" onClick={loadManagerData}>
            Tải lại dữ liệu
          </button>
        </div>
      </div>

      <div className="admin-quiz-layout admin-results-layout">
        <form className="admin-form admin-results-form" onSubmit={handleSubmitResult}>
          <div className="admin-panel-title">
            <h2>{editingResultId ? "Sửa kết quả" : "Thêm kết quả"}</h2>
            {editingResultId ? (
              <button type="button" className="admin-text-button" onClick={resetResultForm}>
                Hủy sửa
              </button>
            ) : null}
          </div>

          <label className="admin-field">
            <span>Bài kiểm tra *</span>
            <select
              value={resultForm.bai_kiem_tra_id}
              onChange={(event) => handleResultFormChange("bai_kiem_tra_id", event.target.value)}
              required
            >
              <option value="">Chọn bài kiểm tra</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={String(quiz.id)}>
                  {quiz.tieu_de}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Họ tên học sinh</span>
            <input
              type="text"
              value={resultForm.ho_ten_hoc_sinh}
              onChange={(event) => handleResultFormChange("ho_ten_hoc_sinh", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>Tên lớp</span>
            <input
              type="text"
              value={resultForm.ten_lop}
              onChange={(event) => handleResultFormChange("ten_lop", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>Tên trường</span>
            <input
              type="text"
              value={resultForm.ten_truong}
              onChange={(event) => handleResultFormChange("ten_truong", event.target.value)}
            />
          </label>

          <div className="admin-results-meta-grid">
            <label className="admin-field">
              <span>Tổng số câu</span>
              <input
                type="number"
                value={resultForm.tong_so_cau}
                onChange={(event) => handleResultFormChange("tong_so_cau", event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Số câu đúng</span>
              <input
                type="number"
                value={resultForm.so_cau_dung}
                onChange={(event) => handleResultFormChange("so_cau_dung", event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Điểm số</span>
              <input
                type="number"
                step="0.01"
                value={resultForm.diem_so}
                onChange={(event) => handleResultFormChange("diem_so", event.target.value)}
              />
            </label>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : editingResultId ? "Cập nhật kết quả" : "Thêm kết quả"}
          </button>
        </form>

        <section className="admin-table-panel admin-results-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Danh sách kết quả</h2>
              <p>Bấm vào điểm số hoặc nút chi tiết để mở modal quản lý từng câu trả lời.</p>
            </div>
          </div>

          <div className="admin-results-controls">
            <label className="admin-field">
              <span>Tìm kiếm kết quả</span>
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm theo học sinh, lớp, trường, bài kiểm tra hoặc mã kết quả"
              />
            </label>

            <label className="admin-field">
              <span>Lọc theo bài kiểm tra</span>
              <select
                value={selectedQuizId}
                onChange={(event) => setSelectedQuizId(event.target.value)}
              >
                <option value="tat-ca">Tất cả bài kiểm tra</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={String(quiz.id)}>
                    {quiz.tieu_de}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {message ? <div className="admin-success">{message}</div> : null}
          {error ? <div className="admin-error">{error}</div> : null}

          {loading ? (
            <p className="admin-empty">Đang tải kết quả kiểm tra...</p>
          ) : filteredResults.length === 0 ? (
            <p className="admin-empty">Chưa có kết quả kiểm tra phù hợp với bộ lọc hiện tại.</p>
          ) : (
            <div className="admin-results-list">
              {filteredResults.map((result) => (
                <article key={result.id} className="admin-results-card">
                  <div className="admin-results-card-head">
                    <div>
                      <h3>{result.ho_ten_hoc_sinh || `Kết quả #${result.id}`}</h3>
                      <p>{result.quizTitle}</p>
                    </div>

                    <button
                      type="button"
                      className="admin-results-score-button"
                      onClick={() => openDetailModal(result)}
                    >
                      {formatScore(result.diem_so)}
                    </button>
                  </div>

                  <div className="admin-quiz-list-meta admin-results-meta">
                    <span>Lớp: {result.ten_lop || "Chưa có"}</span>
                    <span>Trường: {result.ten_truong || "Chưa có"}</span>
                    <span>
                      Đúng: {result.so_cau_dung ?? 0}/{result.tong_so_cau ?? 0}
                    </span>
                    <span>ID kết quả: {result.id}</span>
                  </div>

                  <div className="admin-quiz-inline-actions">
                    <button type="button" onClick={() => handleEditResult(result)}>
                      Sửa kết quả
                    </button>
                    <button type="button" onClick={() => openDetailModal(result)}>
                      Chi tiết kết quả
                    </button>
                    <button type="button" className="admin-danger" onClick={() => handleDeleteResult(result)}>
                      Xóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {activeResult ? (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeDetailModal}>
          <section
            className="admin-modal admin-results-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-results-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-panel-title admin-panel-title-wide">
              <div>
                <h2 id="admin-results-modal-title">Chi tiết kết quả #{activeResult.id}</h2>
                <p>
                  {activeResult.ho_ten_hoc_sinh || "Chưa có tên học sinh"} • {activeResult.quizTitle}
                </p>
              </div>

              <div className="admin-quiz-builder-actions">
                <span className="admin-status-chip">Điểm: {formatScore(activeResult.diem_so)}</span>
                <button type="button" className="admin-secondary-button" onClick={closeDetailModal}>
                  Đóng
                </button>
              </div>
            </div>

            <div className="admin-results-modal-layout">
              <form className="admin-form admin-results-detail-form" onSubmit={handleSubmitDetail}>
                <div className="admin-panel-title">
                  <h2>{editingDetailId ? "Sửa chi tiết" : "Thêm chi tiết"}</h2>
                  {editingDetailId ? (
                    <button type="button" className="admin-text-button" onClick={resetDetailForm}>
                      Hủy sửa
                    </button>
                  ) : null}
                </div>

                <label className="admin-field">
                  <span>Câu hỏi kiểm tra *</span>
                  <select
                    value={detailForm.cau_hoi_id}
                    onChange={(event) => handleDetailFormChange("cau_hoi_id", event.target.value)}
                    required
                  >
                    <option value="">Chọn câu hỏi</option>
                    {questions.map((question) => (
                      <option key={question.id} value={String(question.id)}>
                        {buildQuestionOptionLabel(question)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span>Đáp án đã chọn</span>
                  <select
                    value={detailForm.dap_an_da_chon_id}
                    onChange={(event) =>
                      handleDetailFormChange("dap_an_da_chon_id", event.target.value)
                    }
                    disabled={!detailForm.cau_hoi_id}
                  >
                    <option value="">Chưa chọn đáp án</option>
                    {availableAnswers.map((answer) => (
                      <option key={answer.id} value={String(answer.id)}>
                        {buildAnswerOptionLabel(answer)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span>Là đáp án đúng</span>
                  <select
                    value={String(detailForm.la_dap_an_dung)}
                    onChange={(event) =>
                      handleDetailFormChange("la_dap_an_dung", event.target.value === "true")
                    }
                  >
                    <option value="true">Có</option>
                    <option value="false">Không</option>
                  </select>
                </label>

                <small className="admin-field-help">
                  Sau khi lưu chi tiết, hệ thống sẽ tự đồng bộ lại số câu đúng, tổng số câu và điểm số của kết
                  quả này.
                </small>

                <button type="submit" disabled={detailSaving}>
                  {detailSaving ? "Đang lưu..." : editingDetailId ? "Cập nhật chi tiết" : "Thêm chi tiết"}
                </button>
              </form>

              <section className="admin-table-panel admin-results-detail-panel">
                <div className="admin-results-controls">
                  <label className="admin-field">
                    <span>Tìm trong chi tiết</span>
                    <input
                      type="search"
                      value={detailSearchText}
                      onChange={(event) => setDetailSearchText(event.target.value)}
                      placeholder="Tìm theo câu hỏi hoặc đáp án"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Lọc đúng / sai</span>
                    <select
                      value={detailStatusFilter}
                      onChange={(event) => setDetailStatusFilter(event.target.value)}
                    >
                      <option value="tat-ca">Tất cả</option>
                      <option value="dung">Đúng</option>
                      <option value="sai">Sai</option>
                    </select>
                  </label>
                </div>

                {detailMessage ? <div className="admin-success">{detailMessage}</div> : null}
                {detailError ? <div className="admin-error">{detailError}</div> : null}

                {detailLoading ? (
                  <p className="admin-empty">Đang tải chi tiết kết quả...</p>
                ) : filteredDetailRows.length === 0 ? (
                  <p className="admin-empty">Chưa có chi tiết kết quả phù hợp.</p>
                ) : (
                  <div className="admin-results-detail-list">
                    {filteredDetailRows.map((detail) => {
                      const selectedAnswer = answerById.get(detail.dap_an_da_chon_id);

                      return (
                        <article key={detail.id} className="admin-results-detail-card">
                          <div className="admin-results-detail-head">
                            <div>
                              <h3>{detail.questionText}</h3>
                              <p>
                                Đáp án đã chọn:{" "}
                                <strong>{selectedAnswer?.noi_dung_dap_an || "Chưa chọn đáp án"}</strong>
                              </p>
                            </div>
                            <span
                              className={
                                detail.la_dap_an_dung
                                  ? "admin-status-chip"
                                  : "admin-status-chip admin-status-chip-muted"
                              }
                            >
                              {detail.la_dap_an_dung ? "Đúng" : "Sai"}
                            </span>
                          </div>

                          <p className="admin-quiz-list-description">
                            Đáp án đúng hiện tại: {detail.correctAnswerText}
                          </p>

                          <div className="admin-quiz-inline-actions">
                            <button type="button" onClick={() => handleEditDetail(detail)}>
                              Sửa chi tiết
                            </button>
                            <button
                              type="button"
                              className="admin-danger"
                              onClick={() => handleDeleteDetail(detail)}
                            >
                              Xóa
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default AdminQuizResultsManager;
