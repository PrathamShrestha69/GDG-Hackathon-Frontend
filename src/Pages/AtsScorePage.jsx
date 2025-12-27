import React, { useMemo, useState } from "react";
import { extractTextFromPdf } from "../utils/pdf";
import { geminiApi } from "../services/api";

const scoreText = (resume, role) => {
  if (!resume || !role)
    return { score: 0, summary: "Paste both resume and role to score." };
  const resumeWords = new Set(
    resume.toLowerCase().split(/\W+/).filter(Boolean)
  );
  const roleWords = role.toLowerCase().split(/\W+/).filter(Boolean);
  const hits = roleWords.filter((word) => resumeWords.has(word));
  const ratio = Math.min(
    100,
    Math.round((hits.length / Math.max(roleWords.length, 1)) * 100)
  );
  const missing = roleWords.filter((w) => !resumeWords.has(w)).slice(0, 6);
  return {
    score: ratio,
    summary: missing.length
      ? `Add context for: ${missing.join(", ")}`
      : "Great alignment. Consider quantifying impact.",
  };
};

const AtsScorePage = () => {
  const [resume, setResume] = useState("");
  const [role, setRole] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const insights = useMemo(() => scoreText(resume, role), [resume, role]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setAiStatus("Please upload a PDF file.");
      return;
    }
    setPdfName(file.name);
    setPdfLoading(true);
    setAiStatus("");
    try {
      const text = await extractTextFromPdf(file);
      setResume(text);
    } catch (err) {
      setAiStatus(err.message || "Failed to parse PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setAiStatus("Add VITE_GEMINI_API_KEY in .env to enable AI analysis.");
      return;
    }
    if (!resume || !role) {
      setAiStatus("Paste resume & role (or upload PDF) first.");
      return;
    }
    setAiStatus("Analyzing with ATS criteria...");
    try {
      const prompt = `You are an ATS analyzer. Given the resume text and job description, produce:\n- ATS compliance score (0-100)\n- Missing or weak keywords (list)\n- Formatting issues for ATS (bulleted)\n- Actionable improvements (bulleted)\n- Final verdict: PASS or FLAG\n\nResume:\n${resume}\n\nJob Description:\n${role}\n`;
      const res = await geminiApi({ prompt, apiKey });
      const text = res?.text || (typeof res === "string" ? res : "");
      setAiFeedback(text || "No feedback returned.");
      setAiStatus("AI feedback ready.");
    } catch (err) {
      setAiStatus(err.message || "AI analysis failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-sm">ATS lens</p>
          <h1 className="text-3xl font-semibold">Score your resume</h1>
        </div>
        <div className="pill-badge">Beta</div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-[rgba(250,203,181,0.3)] space-y-3">
          <div className="grid sm:grid-cols-2 gap-2 items-center">
            <label className="text-sm text-muted">Upload resume PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
            />
          </div>
          {pdfName ? (
            <div className="text-sm text-muted">
              {pdfLoading ? "Reading..." : `Loaded: ${pdfName}`}
            </div>
          ) : null}
          <label className="text-sm text-muted">Paste your resume text</label>
          <textarea
            className="input-base min-h-40 sm:min-h-56"
            placeholder="Include summary, experience bullets, and skills"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-[rgba(250,203,181,0.3)] space-y-3">
          <label className="text-sm text-muted">
            Paste the job description
          </label>
          <textarea
            className="input-base min-h-40 sm:min-h-56"
            placeholder="Paste the role overview and requirements"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[rgba(250,203,181,0.35)] flex flex-wrap gap-3 sm:gap-4 items-center justify-between">
        <div>
          <p className="text-muted text-sm">Match score</p>
          <p className="text-4xl font-semibold">{insights.score}%</p>
        </div>
        <div className="max-w-xl text-lg">{insights.summary}</div>
        <div className="pill-badge">Local + AI scoring</div>
      </div>
      <div className="glass-panel rounded-2xl p-5 border border-[rgba(250,203,181,0.35)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="panel-title">AI ATS analysis</h3>
          <div className="pill-badge">Gemini</div>
        </div>
        <button className="primary-btn w-fit" onClick={analyzeWithAI}>
          Analyze with AI
        </button>
        {aiStatus ? <div className="text-muted text-sm">{aiStatus}</div> : null}
        {aiFeedback ? (
          <div className="glass-panel border border-[rgba(250,203,181,0.25)] rounded-xl p-4 whitespace-pre-line">
            {aiFeedback}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AtsScorePage;
