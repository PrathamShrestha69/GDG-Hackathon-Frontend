import React, { useEffect, useMemo, useState } from "react";
import { quizApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const QuizPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await quizApi.categories();
        setCategories(data?.categories || []);
      } catch (err) {
        setStatus(`Unable to load categories: ${err.message}`);
      }
    };
    loadCategories();
  }, []);

  const handleSelectCategory = async (cat) => {
    setSelectedCategory(cat);
    setStatus("");
    setLoading(true);
    try {
      const qs = await quizApi.questionsByCategory(
        cat._id || cat.id || cat.value || cat
      );
      setQuestions(qs?.questions || []);
      setAnswers({});
    } catch (err) {
      setStatus(`Unable to load questions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qid, option) => {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  const unanswered = useMemo(
    () => questions.filter((q) => !answers[q._id || q.id]),
    [questions, answers]
  );

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    setStatus("");
    const payload = {
      categoryId:
        selectedCategory._id || selectedCategory.id || selectedCategory.value,
      answers: questions.map((q) => ({
        questionId: q._id || q.id,
        selectedOption: answers[q._id || q.id] || "",
      })),
    };
    try {
      const res = await quizApi.submit(payload, token);
      const result = res?.result;
      if (result) {
        setStatus(
          `Submitted: ${result.score}/${result.totalQuestions} (${
            result.percentage
          }%). ${result.passed ? "Passed" : "Keep practicing"}.`
        );
      } else {
        setStatus(res?.message || "Quiz submitted. Check stats for feedback.");
      }
    } catch (err) {
      setStatus(err.message || "Unable to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:gap-6 items-start">
      <div className="glass-panel rounded-2xl p-5 border border-[rgba(250,203,181,0.3)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="panel-title">Categories</h2>
          <span className="pill-badge">{categories.length} tracks</span>
        </div>
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto pr-1">
          {categories.map((cat) => (
            <button
              key={cat._id || cat.id || cat.value || cat.name}
              onClick={() => handleSelectCategory(cat)}
              className={`text-left glass-panel border rounded-xl p-3 hover:border-[rgba(250,203,181,0.5)] transition ${
                (selectedCategory?._id || selectedCategory?.id) ===
                (cat._id || cat.id)
                  ? "border-[rgba(250,203,181,0.6)]"
                  : "border-[rgba(250,203,181,0.2)]"
              }`}
            >
              <p className="font-semibold">
                {cat.name || cat.title || "Category"}
              </p>
              <p className="text-muted text-sm">
                {cat.description || "Curated practice set"}
              </p>
            </button>
          ))}
          {categories.length === 0 ? (
            <p className="text-muted text-sm">No categories yet.</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-[rgba(250,203,181,0.35)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted text-sm">Quiz workspace</p>
              <h2 className="text-2xl font-semibold">
                {selectedCategory?.name || "Choose a category"}
              </h2>
            </div>
            <div className="pill-badge">Protected</div>
          </div>
          {loading ? (
            <div className="text-muted">Loading questions...</div>
          ) : questions.length === 0 ? (
            <p className="text-muted">Pick a category to start a timed quiz.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const qid = q._id || q.id;
                const options = q.options || q.choices || [];
                return (
                  <div
                    key={qid}
                    className="glass-panel rounded-xl p-3 sm:p-4 border border-[rgba(250,203,181,0.2)]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">
                        Q{idx + 1}. {q.text || q.question || q.prompt}
                      </p>
                      <span className="pill-badge">
                        {q.difficulty || "Practice"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {options.map((opt) => (
                        <label
                          key={opt?.text || opt}
                          className={`cursor-pointer glass-panel border rounded-lg p-3 text-sm flex items-center gap-2 ${
                            answers[qid] === (opt?.text || opt)
                              ? "border-[rgba(250,203,181,0.6)]"
                              : "border-[rgba(250,203,181,0.2)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${qid}`}
                            value={opt?.text || opt}
                            checked={answers[qid] === (opt?.text || opt)}
                            onChange={() => handleAnswer(qid, opt?.text || opt)}
                            className="accent-[#864e7a]"
                          />
                          <span>{opt?.text || opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-muted text-sm">
            {unanswered.length > 0
              ? `${unanswered.length} question${
                  unanswered.length > 1 ? "s" : ""
                } left`
              : "All questions answered"}
          </div>
          <button
            className="primary-btn"
            disabled={!selectedCategory || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit quiz"}
          </button>
        </div>
        {status ? <div className="text-peach">{status}</div> : null}
      </div>
    </div>
  );
};

export default QuizPage;
