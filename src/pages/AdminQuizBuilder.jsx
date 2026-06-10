import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const DEFAULT_ANSWER_COUNT = 4;
const ANSWER_OPTION_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let tempIdCounter = 0;

function makeTempId(prefix) {
  tempIdCounter += 1;
  return `${prefix}-${Date.now()}-${tempIdCounter}`;
}

function createEmptyAnswer(index = 0) {
  return {
    id: null,
    la_dap_an_dung: index === 0,
    localId: makeTempId("answer"),
    noi_dung_dap_an: "",
    thu_tu_hien_thi: index + 1,
  };
}

function createEmptyQuestion(index = 0) {
  return {
    answers: Array.from({ length: DEFAULT_ANSWER_COUNT }, (_, answerIndex) =>
      createEmptyAnswer(answerIndex),
    ),
    diem: 1,
    duong_dan_anh_cau_hoi: "",
    giai_thich_dap_an: "",
    id: null,
    localId: makeTempId("question"),
    noi_dung_cau_hoi: "",
    thu_tu_hien_thi: index + 1,
  };
}

function createEmptyQuizForm() {
  return {
    chu_de_id: "",
    da_xuat_ban: true,
    id: null,
    mo_ta: "",
    questions: [createEmptyQuestion(0)],
    thoi_gian_lam_bai_phut: 15,
    tieu_de: "",
  };
}

function normalizeQuizForm(test, questions, answers) {
  const answersByQuestionId = new Map();

  answers.forEach((answer) => {
    const current = answersByQuestionId.get(answer.cau_hoi_id) || [];
    current.push({
      id: answer.id,
      la_dap_an_dung: Boolean(answer.la_dap_an_dung),
      localId: makeTempId("answer"),
      noi_dung_dap_an: answer.noi_dung_dap_an || "",
      thu_tu_hien_thi: answer.thu_tu_hien_thi ?? current.length + 1,
    });
    answersByQuestionId.set(answer.cau_hoi_id, current);
  });

  return {
    chu_de_id: test.chu_de_id ? String(test.chu_de_id) : "",
    da_xuat_ban: Boolean(test.da_xuat_ban),
    id: test.id,
    mo_ta: test.mo_ta || "",
    questions: questions.map((question, index) => {
      const questionAnswers = answersByQuestionId.get(question.id) || [];
      const paddedAnswers =
        questionAnswers.length >= 2
          ? questionAnswers
          : [
              ...questionAnswers,
              ...Array.from(
                { length: Math.max(2, DEFAULT_ANSWER_COUNT) - questionAnswers.length },
                (_, answerIndex) => createEmptyAnswer(questionAnswers.length + answerIndex),
              ),
            ];

      return {
        answers: paddedAnswers,
        diem: question.diem ?? 1,
        duong_dan_anh_cau_hoi: question.duong_dan_anh_cau_hoi || "",
        giai_thich_dap_an: question.giai_thich_dap_an || "",
        id: question.id,
        localId: makeTempId("question"),
        noi_dung_cau_hoi: question.noi_dung_cau_hoi || "",
        thu_tu_hien_thi: question.thu_tu_hien_thi ?? index + 1,
      };
    }),
    thoi_gian_lam_bai_phut: test.thoi_gian_lam_bai_phut ?? 15,
    tieu_de: test.tieu_de || "",
  };
}

function buildQuestionSummary(question) {
  const answerCount = question.answers.filter((answer) => answer.noi_dung_dap_an.trim()).length;
  return `${answerCount} đáp án`;
}

function getAnswerOptionLabel(index) {
  return ANSWER_OPTION_LABELS[index] || `D${index + 1}`;
}

function AdminQuizBuilder() {
  const [topics, setTopics] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [quizForm, setQuizForm] = useState(() => createEmptyQuizForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadQuizData() {
    setLoading(true);
    setError("");

    const [
      { data: topicsData, error: topicsError },
      { data: testsData, error: testsError },
    ] = await Promise.all([
      supabase.from("chu_de").select("id, ten_chu_de").order("ten_chu_de", { ascending: true }),
      supabase.from("bai_kiem_tra").select("*").order("id", { ascending: false }),
    ]);

    if (topicsError) {
      setError(topicsError.message);
      setLoading(false);
      return;
    }

    if (testsError) {
      setError(testsError.message);
      setLoading(false);
      return;
    }

    const testIds = (testsData || []).map((test) => test.id);

    let questionsData = [];
    if (testIds.length > 0) {
      const { data: loadedQuestions, error: questionsError } = await supabase
        .from("cau_hoi_kiem_tra")
        .select("*")
        .in("bai_kiem_tra_id", testIds)
        .order("thu_tu_hien_thi", { ascending: true })
        .order("id", { ascending: true });

      if (questionsError) {
        setError(questionsError.message);
        setLoading(false);
        return;
      }

      questionsData = loadedQuestions || [];

      const questionIds = questionsData.map((question) => question.id);

      if (questionIds.length > 0) {
        const { error: answersError } = await supabase
          .from("dap_an_kiem_tra")
          .select("*")
          .in("cau_hoi_id", questionIds)
          .order("thu_tu_hien_thi", { ascending: true })
          .order("id", { ascending: true });

        if (answersError) {
          setError(answersError.message);
          setLoading(false);
          return;
        }
      }
    }

    const questionsByTestId = new Map();
    const topicNameById = new Map((topicsData || []).map((topic) => [topic.id, topic.ten_chu_de]));

    questionsData.forEach((question) => {
      const current = questionsByTestId.get(question.bai_kiem_tra_id) || [];
      current.push(question);
      questionsByTestId.set(question.bai_kiem_tra_id, current);
    });

    setTopics(topicsData || []);
    setQuizList(
      (testsData || []).map((test) => {
        const testQuestions = questionsByTestId.get(test.id) || [];
        return {
          ...test,
          questionCount: testQuestions.length,
          topicName: topicNameById.get(test.chu_de_id) || "Chưa gắn chủ đề",
        };
      }),
    );

    setLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadQuizData();
    });
  }, []);

  const topicOptions = useMemo(
    () => topics.map((topic) => ({ label: topic.ten_chu_de, value: String(topic.id) })),
    [topics],
  );

  function updateQuizField(fieldName, value) {
    setQuizForm((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }

  function updateQuestion(questionLocalId, fieldName, value) {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.localId === questionLocalId
          ? {
              ...question,
              [fieldName]: value,
            }
          : question,
      ),
    }));
  }

  function updateAnswer(questionLocalId, answerLocalId, fieldName, value) {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.localId !== questionLocalId) return question;

        return {
          ...question,
          answers: question.answers.map((answer) =>
            answer.localId === answerLocalId
              ? {
                  ...answer,
                  [fieldName]: value,
                }
              : answer,
          ),
        };
      }),
    }));
  }

  function markCorrectAnswer(questionLocalId, answerLocalId) {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.localId !== questionLocalId) return question;

        return {
          ...question,
          answers: question.answers.map((answer) => ({
            ...answer,
            la_dap_an_dung: answer.localId === answerLocalId,
          })),
        };
      }),
    }));
  }

  function addQuestion() {
    setQuizForm((current) => ({
      ...current,
      questions: [...current.questions, createEmptyQuestion(current.questions.length)],
    }));
  }

  function duplicateQuestion(questionLocalId) {
    setQuizForm((current) => {
      const question = current.questions.find((item) => item.localId === questionLocalId);

      if (!question) return current;

      const duplicate = {
        ...question,
        answers: question.answers.map((answer, index) => ({
          ...answer,
          id: null,
          localId: makeTempId("answer"),
          thu_tu_hien_thi: index + 1,
        })),
        id: null,
        localId: makeTempId("question"),
        thu_tu_hien_thi: current.questions.length + 1,
      };

      return {
        ...current,
        questions: [...current.questions, duplicate],
      };
    });
  }

  function removeQuestion(questionLocalId) {
    setQuizForm((current) => {
      if (current.questions.length === 1) {
        return {
          ...current,
          questions: [createEmptyQuestion(0)],
        };
      }

      return {
        ...current,
        questions: current.questions.filter((question) => question.localId !== questionLocalId),
      };
    });
  }

  function addAnswer(questionLocalId) {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.localId === questionLocalId
          ? {
              ...question,
              answers: [...question.answers, createEmptyAnswer(question.answers.length)],
            }
          : question,
      ),
    }));
  }

  function removeAnswer(questionLocalId, answerLocalId) {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.localId !== questionLocalId) return question;

        if (question.answers.length <= 2) return question;

        const remainingAnswers = question.answers.filter((answer) => answer.localId !== answerLocalId);
        const hasCorrectAnswer = remainingAnswers.some((answer) => answer.la_dap_an_dung);

        return {
          ...question,
          answers: remainingAnswers.map((answer, index) => ({
            ...answer,
            la_dap_an_dung: hasCorrectAnswer
              ? answer.la_dap_an_dung
              : index === 0,
            thu_tu_hien_thi: index + 1,
          })),
        };
      }),
    }));
  }

  function startCreateQuiz() {
    setQuizForm(createEmptyQuizForm());
    setMessage("");
    setError("");
  }

  async function startEditQuiz(testId) {
    setError("");
    setMessage("");

    const [{ data: test, error: testError }, { data: questions, error: questionsError }] =
      await Promise.all([
        supabase.from("bai_kiem_tra").select("*").eq("id", testId).maybeSingle(),
        supabase
          .from("cau_hoi_kiem_tra")
          .select("*")
          .eq("bai_kiem_tra_id", testId)
          .order("thu_tu_hien_thi", { ascending: true })
          .order("id", { ascending: true }),
      ]);

    if (testError) {
      setError(testError.message);
      return;
    }

    if (questionsError) {
      setError(questionsError.message);
      return;
    }

    const questionIds = (questions || []).map((question) => question.id);
    let answers = [];

    if (questionIds.length > 0) {
      const { data: loadedAnswers, error: answersError } = await supabase
        .from("dap_an_kiem_tra")
        .select("*")
        .in("cau_hoi_id", questionIds)
        .order("thu_tu_hien_thi", { ascending: true })
        .order("id", { ascending: true });

      if (answersError) {
        setError(answersError.message);
        return;
      }

      answers = loadedAnswers || [];
    }

    setQuizForm(
      normalizeQuizForm(test, questions || [], answers).questions.length > 0
        ? normalizeQuizForm(test, questions || [], answers)
        : {
            ...normalizeQuizForm(test, questions || [], answers),
            questions: [createEmptyQuestion(0)],
          },
    );
  }

  function validateQuizForm() {
    if (!quizForm.tieu_de.trim()) {
      return "Vui lòng nhập tiêu đề bài kiểm tra.";
    }

    if (!quizForm.chu_de_id) {
      return "Vui lòng chọn chủ đề cho bài kiểm tra.";
    }

    if (quizForm.questions.length === 0) {
      return "Bài kiểm tra cần ít nhất một câu hỏi.";
    }

    for (const [questionIndex, question] of quizForm.questions.entries()) {
      if (!question.noi_dung_cau_hoi.trim()) {
        return `Câu hỏi ${questionIndex + 1} chưa có nội dung.`;
      }

      const filledAnswers = question.answers.filter((answer) => answer.noi_dung_dap_an.trim());

      if (filledAnswers.length < 2) {
        return `Câu hỏi ${questionIndex + 1} cần ít nhất 2 đáp án có nội dung.`;
      }

      const correctAnswers = filledAnswers.filter((answer) => answer.la_dap_an_dung);

      if (correctAnswers.length !== 1) {
        return `Câu hỏi ${questionIndex + 1} phải có đúng 1 đáp án đúng.`;
      }
    }

    return "";
  }

  async function handleSaveQuiz(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const validationError = validateQuizForm();

      if (validationError) {
        throw new Error(validationError);
      }

      const quizPayload = {
        chu_de_id: Number(quizForm.chu_de_id),
        da_xuat_ban: Boolean(quizForm.da_xuat_ban),
        mo_ta: quizForm.mo_ta.trim() || null,
        thoi_gian_lam_bai_phut: Number(quizForm.thoi_gian_lam_bai_phut) || 0,
        tieu_de: quizForm.tieu_de.trim(),
      };

      let quizId = quizForm.id;

      if (quizId) {
        const { error: updateQuizError } = await supabase
          .from("bai_kiem_tra")
          .update(quizPayload)
          .eq("id", quizId);

        if (updateQuizError) {
          throw new Error(updateQuizError.message);
        }
      } else {
        const { data: insertedQuiz, error: insertQuizError } = await supabase
          .from("bai_kiem_tra")
          .insert(quizPayload)
          .select("id")
          .single();

        if (insertQuizError) {
          throw new Error(insertQuizError.message);
        }

        quizId = insertedQuiz.id;
      }

      const { data: existingQuestions, error: existingQuestionsError } = await supabase
        .from("cau_hoi_kiem_tra")
        .select("id")
        .eq("bai_kiem_tra_id", quizId);

      if (existingQuestionsError) {
        throw new Error(existingQuestionsError.message);
      }

      const existingQuestionIds = (existingQuestions || []).map((question) => question.id);
      const keptQuestionIds = [];

      for (const [questionIndex, question] of quizForm.questions.entries()) {
        const questionPayload = {
          bai_kiem_tra_id: quizId,
          diem: Number(question.diem) || 1,
          duong_dan_anh_cau_hoi: question.duong_dan_anh_cau_hoi.trim() || null,
          giai_thich_dap_an: question.giai_thich_dap_an.trim() || null,
          noi_dung_cau_hoi: question.noi_dung_cau_hoi.trim(),
          thu_tu_hien_thi: questionIndex + 1,
        };

        let questionId = question.id;

        if (questionId) {
          const { error: updateQuestionError } = await supabase
            .from("cau_hoi_kiem_tra")
            .update(questionPayload)
            .eq("id", questionId);

          if (updateQuestionError) {
            throw new Error(updateQuestionError.message);
          }
        } else {
          const { data: insertedQuestion, error: insertQuestionError } = await supabase
            .from("cau_hoi_kiem_tra")
            .insert(questionPayload)
            .select("id")
            .single();

          if (insertQuestionError) {
            throw new Error(insertQuestionError.message);
          }

          questionId = insertedQuestion.id;
        }

        keptQuestionIds.push(questionId);

        const { data: existingAnswers, error: existingAnswersError } = await supabase
          .from("dap_an_kiem_tra")
          .select("id")
          .eq("cau_hoi_id", questionId);

        if (existingAnswersError) {
          throw new Error(existingAnswersError.message);
        }

        const existingAnswerIds = (existingAnswers || []).map((answer) => answer.id);
        const keptAnswerIds = [];
        const filledAnswers = question.answers.filter((answer) => answer.noi_dung_dap_an.trim());

        for (const [answerIndex, answer] of filledAnswers.entries()) {
          const answerPayload = {
            cau_hoi_id: questionId,
            la_dap_an_dung: Boolean(answer.la_dap_an_dung),
            noi_dung_dap_an: answer.noi_dung_dap_an.trim(),
            thu_tu_hien_thi: answerIndex + 1,
          };

          let answerId = answer.id;

          if (answerId) {
            const { error: updateAnswerError } = await supabase
              .from("dap_an_kiem_tra")
              .update(answerPayload)
              .eq("id", answerId);

            if (updateAnswerError) {
              throw new Error(updateAnswerError.message);
            }
          } else {
            const { data: insertedAnswer, error: insertAnswerError } = await supabase
              .from("dap_an_kiem_tra")
              .insert(answerPayload)
              .select("id")
              .single();

            if (insertAnswerError) {
              throw new Error(insertAnswerError.message);
            }

            answerId = insertedAnswer.id;
          }

          keptAnswerIds.push(answerId);
        }

        const answerIdsToDelete = existingAnswerIds.filter((answerId) => !keptAnswerIds.includes(answerId));

        if (answerIdsToDelete.length > 0) {
          const { error: deleteAnswersError } = await supabase
            .from("dap_an_kiem_tra")
            .delete()
            .in("id", answerIdsToDelete);

          if (deleteAnswersError) {
            throw new Error(deleteAnswersError.message);
          }
        }
      }

      const questionIdsToDelete = existingQuestionIds.filter(
        (questionId) => !keptQuestionIds.includes(questionId),
      );

      if (questionIdsToDelete.length > 0) {
        const { error: deleteOrphanAnswersError } = await supabase
          .from("dap_an_kiem_tra")
          .delete()
          .in("cau_hoi_id", questionIdsToDelete);

        if (deleteOrphanAnswersError) {
          throw new Error(deleteOrphanAnswersError.message);
        }

        const { error: deleteQuestionsError } = await supabase
          .from("cau_hoi_kiem_tra")
          .delete()
          .in("id", questionIdsToDelete);

        if (deleteQuestionsError) {
          throw new Error(deleteQuestionsError.message);
        }
      }

      setMessage(quizForm.id ? "Đã cập nhật bài kiểm tra." : "Đã tạo bài kiểm tra mới.");
      setQuizForm(createEmptyQuizForm());
      await loadQuizData();
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu bài kiểm tra.");
    }

    setSaving(false);
  }

  async function handleDeleteQuiz(quizId) {
    const confirmed = window.confirm("Xóa bài kiểm tra này cùng toàn bộ câu hỏi và đáp án?");

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { data: existingQuestions, error: questionsError } = await supabase
      .from("cau_hoi_kiem_tra")
      .select("id")
      .eq("bai_kiem_tra_id", quizId);

    if (questionsError) {
      setError(questionsError.message);
      return;
    }

    const questionIds = (existingQuestions || []).map((question) => question.id);

    if (questionIds.length > 0) {
      const { error: deleteAnswersError } = await supabase
        .from("dap_an_kiem_tra")
        .delete()
        .in("cau_hoi_id", questionIds);

      if (deleteAnswersError) {
        setError(deleteAnswersError.message);
        return;
      }

      const { error: deleteQuestionsError } = await supabase
        .from("cau_hoi_kiem_tra")
        .delete()
        .in("id", questionIds);

      if (deleteQuestionsError) {
        setError(deleteQuestionsError.message);
        return;
      }
    }

    const { error: deleteQuizError } = await supabase
      .from("bai_kiem_tra")
      .delete()
      .eq("id", quizId);

    if (deleteQuizError) {
      setError(deleteQuizError.message);
      return;
    }

    if (quizForm.id === quizId) {
      setQuizForm(createEmptyQuizForm());
    }

    setMessage(`Đã xóa bài kiểm tra ID ${quizId}.`);
    await loadQuizData();
  }

  return (
    <section className="admin-quiz-builder">
      <div className="admin-panel-title admin-panel-title-wide">
        <div>
          <h2>Bài kiểm tra + câu hỏi + đáp án</h2>
          <p>Tạo trọn bộ bài kiểm tra theo chủ đề trong một màn hình duy nhất.</p>
        </div>
        <div className="admin-quiz-builder-actions">
          <button type="button" className="admin-secondary-button" onClick={loadQuizData}>
            Tải lại
          </button>
          <button type="button" className="admin-text-button" onClick={startCreateQuiz}>
            Tạo bài kiểm tra mới
          </button>
        </div>
      </div>

      {message ? <div className="admin-success">{message}</div> : null}
      {error ? <div className="admin-error">{error}</div> : null}

      <div className="admin-quiz-layout">
        <form className="admin-form admin-quiz-form" onSubmit={handleSaveQuiz}>
          <div className="admin-panel-title">
            <h2>{quizForm.id ? `Sửa bài kiểm tra #${quizForm.id}` : "Tạo bài kiểm tra"}</h2>
          </div>

          <label className="admin-field">
            <span>Tiêu đề bài kiểm tra *</span>
            <input
              type="text"
              value={quizForm.tieu_de}
              onChange={(event) => updateQuizField("tieu_de", event.target.value)}
              required
            />
          </label>

          <div className="admin-quiz-meta-grid">
            <label className="admin-field">
              <span>Chủ đề *</span>
              <select
                value={quizForm.chu_de_id}
                onChange={(event) => updateQuizField("chu_de_id", event.target.value)}
                required
              >
                <option value="">Chọn chủ đề</option>
                {topicOptions.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Thời gian làm bài (phút)</span>
              <input
                type="number"
                min="0"
                value={quizForm.thoi_gian_lam_bai_phut}
                onChange={(event) =>
                  updateQuizField("thoi_gian_lam_bai_phut", event.target.value)
                }
              />
            </label>

            <label className="admin-field">
              <span>Trạng thái xuất bản</span>
              <select
                value={String(quizForm.da_xuat_ban)}
                onChange={(event) => updateQuizField("da_xuat_ban", event.target.value === "true")}
              >
                <option value="true">Đã xuất bản</option>
                <option value="false">Chưa xuất bản</option>
              </select>
            </label>
          </div>

          <label className="admin-field">
            <span>Mô tả bài kiểm tra</span>
            <textarea
              value={quizForm.mo_ta}
              onChange={(event) => updateQuizField("mo_ta", event.target.value)}
              rows={3}
            />
          </label>

          <div className="admin-quiz-question-list">
            {quizForm.questions.map((question, questionIndex) => (
              <article key={question.localId} className="admin-quiz-question-card">
                <div className="admin-quiz-question-header">
                  <div>
                    <h3>Câu hỏi {questionIndex + 1}</h3>
                    <p>{buildQuestionSummary(question)}</p>
                  </div>
                  <div className="admin-quiz-inline-actions">
                    <button
                      type="button"
                      className="admin-text-button"
                      onClick={() => duplicateQuestion(question.localId)}
                    >
                      Nhân bản
                    </button>
                    <button
                      type="button"
                      className="admin-text-button admin-danger-text"
                      onClick={() => removeQuestion(question.localId)}
                    >
                      Xóa câu
                    </button>
                  </div>
                </div>

                <label className="admin-field">
                  <span>Nội dung câu hỏi *</span>
                  <textarea
                    value={question.noi_dung_cau_hoi}
                    onChange={(event) =>
                      updateQuestion(question.localId, "noi_dung_cau_hoi", event.target.value)
                    }
                    rows={3}
                    required
                  />
                </label>

                <div className="admin-quiz-meta-grid">
                  <label className="admin-field">
                    <span>Ảnh minh họa câu hỏi</span>
                    <input
                      type="text"
                      value={question.duong_dan_anh_cau_hoi}
                      onChange={(event) =>
                        updateQuestion(
                          question.localId,
                          "duong_dan_anh_cau_hoi",
                          event.target.value,
                        )
                      }
                      placeholder="Dán link ảnh nếu có"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Điểm</span>
                    <input
                      type="number"
                      min="1"
                      value={question.diem}
                      onChange={(event) =>
                        updateQuestion(question.localId, "diem", event.target.value)
                      }
                    />
                  </label>
                </div>

                <label className="admin-field">
                  <span>Giải thích đáp án</span>
                  <textarea
                    value={question.giai_thich_dap_an}
                    onChange={(event) =>
                      updateQuestion(question.localId, "giai_thich_dap_an", event.target.value)
                    }
                    rows={2}
                  />
                </label>

                <div className="admin-quiz-answer-list">
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answer.localId} className="admin-quiz-answer-row">
                      <span className="admin-quiz-answer-option">
                        {getAnswerOptionLabel(answerIndex)}
                      </span>

                      <label className="admin-quiz-answer-correct">
                        <input
                          type="radio"
                          name={`correct-answer-${question.localId}`}
                          checked={answer.la_dap_an_dung}
                          onChange={() => markCorrectAnswer(question.localId, answer.localId)}
                        />
                        <span>Đúng</span>
                      </label>

                      <input
                        type="text"
                        value={answer.noi_dung_dap_an}
                        onChange={(event) =>
                          updateAnswer(
                            question.localId,
                            answer.localId,
                            "noi_dung_dap_an",
                            event.target.value,
                          )
                        }
                        placeholder={`Đáp án ${answerIndex + 1}`}
                      />

                      <button
                        type="button"
                        className="admin-text-button admin-danger-text"
                        onClick={() => removeAnswer(question.localId, answer.localId)}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="admin-text-button"
                  onClick={() => addAnswer(question.localId)}
                >
                  + Thêm đáp án
                </button>
              </article>
            ))}
          </div>

          <div className="admin-quiz-builder-actions">
            <button type="button" className="admin-secondary-button" onClick={addQuestion}>
              + Thêm câu hỏi
            </button>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Đang lưu bài kiểm tra..." : quizForm.id ? "Cập nhật bài kiểm tra" : "Tạo bài kiểm tra"}
          </button>
        </form>

        <section className="admin-table-panel admin-quiz-list-panel">
          <div className="admin-panel-title">
            <h2>Danh sách bài kiểm tra</h2>
            <p>{loading ? "Đang tải..." : `${quizList.length} bài kiểm tra`}</p>
          </div>

          {loading ? (
            <p className="admin-empty">Đang tải dữ liệu bài kiểm tra...</p>
          ) : quizList.length === 0 ? (
            <p className="admin-empty">Chưa có bài kiểm tra nào.</p>
          ) : (
            <div className="admin-quiz-list">
              {quizList.map((quiz) => (
                <article key={quiz.id} className="admin-quiz-list-item">
                  <div className="admin-quiz-list-item-head">
                    <div>
                      <h3>{quiz.tieu_de}</h3>
                      <p>{quiz.topicName}</p>
                    </div>
                    <span className={quiz.da_xuat_ban ? "admin-status-chip" : "admin-status-chip admin-status-chip-muted"}>
                      {quiz.da_xuat_ban ? "Đã xuất bản" : "Nháp"}
                    </span>
                  </div>

                  <div className="admin-quiz-list-meta">
                    <span>{quiz.questionCount} câu hỏi</span>
                    <span>{quiz.thoi_gian_lam_bai_phut || 0} phút</span>
                  </div>

                  {quiz.mo_ta ? <p className="admin-quiz-list-description">{quiz.mo_ta}</p> : null}

                  <div className="admin-quiz-inline-actions">
                    <button type="button" className="admin-text-button" onClick={() => startEditQuiz(quiz.id)}>
                      Sửa nhanh
                    </button>
                    <button
                      type="button"
                      className="admin-text-button admin-danger-text"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminQuizBuilder;
