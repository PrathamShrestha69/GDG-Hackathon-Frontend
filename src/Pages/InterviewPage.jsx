import React, { useEffect, useRef, useState } from "react";
import { geminiApi } from "../services/api";

const InterviewPage = () => {
  const localVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [prompt, setPrompt] = useState("Give me a product design question");
  const [aiResponse, setAiResponse] = useState("");
  const [status, setStatus] = useState("");
  const [working, setWorking] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash"
  );
  const [modelUsed, setModelUsed] = useState("");
  const [topic, setTopic] = useState("JavaScript");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [recognizing, setRecognizing] = useState(false);
  const supportsSpeech =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const startCall = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(userStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userStream;
      }
      setStatus("Camera on. Warm up with a prompt.");
    } catch (err) {
      setStatus("Camera access blocked. Enable permissions to practice.");
    }
  };

  const stopCall = () => {
    stream?.getTracks()?.forEach((t) => t.stop());
    setStream(null);
  };

  useEffect(() => {
    return () => {
      stream?.getTracks()?.forEach((t) => t.stop());
    };
  }, [stream]);

  const askGemini = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setStatus("Add VITE_GEMINI_API_KEY in .env to enable prompts.");
      return;
    }
    setWorking(true);
    setStatus("Generating mock question...");
    try {
      const result = await geminiApi({ prompt, apiKey, model: selectedModel });
      setAiResponse(result?.text || "No response yet.");
      setModelUsed(result?.modelUsed || selectedModel);
      setStatus(
        `Ready. Practice your response out loud. Using: ${
          result?.modelUsed || selectedModel
        }`
      );
    } catch (err) {
      setStatus(err.message || "Gemini request failed");
    } finally {
      setWorking(false);
    }
  };

  const speakText = (text) => {
    try {
      if (!("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => /en-US|en-GB/.test(v.lang));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus("Speech recognition not supported in this browser.");
      return;
    }
    const recog = new SR();
    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = false;
    setRecognizing(true);
    let transcript = "";
    recog.onresult = (e) => {
      transcript = Array.from(e.results)
        .map((r) => r[0]?.transcript || "")
        .join(" ");
    };
    recog.onerror = (e) => {
      setRecognizing(false);
      setStatus(e.message || "Speech recognition error");
    };
    recog.onend = () => {
      setRecognizing(false);
      if (transcript.trim()) {
        setAnswers((prev) => {
          const next = [...prev];
          next[questionIndex] = transcript.trim();
          return next;
        });
        setStatus("Captured answer. You can proceed to the next question.");
      } else {
        setStatus("No speech captured. Try again.");
      }
    };
    try {
      recog.start();
      setStatus("Listening...");
    } catch (err) {
      setStatus(err.message || "Unable to start recognition");
      setRecognizing(false);
    }
  };

  const generateQuestion = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setStatus("Add VITE_GEMINI_API_KEY in .env to enable prompts.");
      return;
    }
    setWorking(true);
    setStatus("Generating question...");
    const qPrompt = `Ask one concise ${topic} interview question suitable for spoken delivery. Do not include the answer. Limit to one question.`;
    try {
      const result = await geminiApi({
        prompt: qPrompt,
        apiKey,
        model: selectedModel,
      });
      const questionText = (result?.text || "").trim();
      setModelUsed(result?.modelUsed || selectedModel);
      if (questionText) {
        setQuestions((prev) => {
          const next = [...prev];
          next[questionIndex] = questionText;
          return next;
        });
        speakText(questionText);
        setStatus(
          `Question ${
            questionIndex + 1
          }/${numQuestions}: Listening when you are ready.`
        );
      } else {
        setStatus("No question returned. Try again.");
      }
    } catch (err) {
      setStatus(err.message || "Gemini request failed");
    } finally {
      setWorking(false);
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= numQuestions) {
      summarizeFeedback();
      return;
    }
    setQuestionIndex((i) => i + 1);
    setStatus("Generating next question...");
    generateQuestion();
  };

  const summarizeFeedback = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setStatus("Add VITE_GEMINI_API_KEY in .env to enable prompts.");
      return;
    }
    setWorking(true);
    setStatus("Analyzing your answers...");
    const pairs = questions
      .map(
        (q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "(no answer)"}`
      )
      .join("\n\n");
    const fPrompt = `You are an interview coach. Topic: ${topic}.
Here are the spoken answers:
${pairs}

Provide concise, constructive feedback:
- 4-6 bullet points on improvements
- 2 actionable resources
- A short summary and an overall readiness score out of 10.`;
    try {
      const result = await geminiApi({
        prompt: fPrompt,
        apiKey,
        model: selectedModel,
      });
      const feedbackText = result?.text || "No feedback.";
      setAiResponse(feedbackText);
      setModelUsed(result?.modelUsed || selectedModel);
      speakText(feedbackText);
      setStatus("Feedback ready.");
    } catch (err) {
      setStatus(err.message || "Gemini feedback failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 items-start">
      <div className="hidden md:block glass-panel rounded-3xl p-5 border border-[rgba(250,203,181,0.35)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-sm">Mock call</p>
            <h2 className="text-2xl font-semibold">Interview room</h2>
          </div>
          <div className="pill-badge">Gemini</div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <div className="aspect-video glass-panel border border-[rgba(250,203,181,0.25)] rounded-2xl flex items-center justify-center overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!stream && (
              <span className="text-muted text-sm">Your camera preview</span>
            )}
          </div>
          <div className="aspect-video glass-panel border border-[rgba(250,203,181,0.15)] rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-4xl">🎤</div>
              <p className="text-muted">
                Speak your answer; record with any tool you like.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <button className="primary-btn" onClick={startCall}>
            Start mock call
          </button>
          <button className="ghost-btn" onClick={stopCall}>
            Stop camera
          </button>
          <div className="pill-badge">
            {supportsSpeech ? "Voice ready" : "Voice unsupported"}
          </div>
        </div>
        <div className="text-muted text-sm">
          {status || "Turn on your camera and pull a prompt to begin."}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-[rgba(250,203,181,0.35)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="panel-title">Gemini prompt lab</h3>
          <div className="pill-badge">Prompt</div>
        </div>
        <div className="space-y-3">
          <label className="text-sm text-muted">
            Ask Gemini for a question
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              className="input-base"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              <option value="gemini-1.0-pro">gemini-1.0-pro</option>
              <option value="gemini-pro">gemini-pro</option>
            </select>
            <div className="input-base flex items-center">
              {modelUsed ? `Resolved: ${modelUsed}` : ""}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              className="input-base"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option>JavaScript</option>
              <option>React</option>
              <option>Python</option>
              <option>Django</option>
              <option>Data Structures</option>
              <option>System Design</option>
              <option>Behavioral</option>
            </select>
            <input
              className="input-base"
              type="number"
              min="1"
              max="8"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value) || 5)}
            />
            <div className="input-base flex items-center">
              Round {questionIndex + 1}/{numQuestions}
            </div>
          </div>
          <textarea
            className="input-base min-h-30"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask for a behavioral, system design, or coding prompt"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              className="primary-btn"
              onClick={generateQuestion}
              disabled={working}
            >
              {working ? "Generating..." : "Ask question (voice)"}
            </button>
            <button
              className="ghost-btn"
              onClick={startListening}
              disabled={recognizing || !supportsSpeech}
            >
              {recognizing ? "Listening..." : "Listen answer"}
            </button>
            <button className="ghost-btn" onClick={nextQuestion}>
              {questionIndex + 1 >= numQuestions
                ? "Finish & feedback"
                : "Next question"}
            </button>
          </div>
        </div>
        {aiResponse ? (
          <div className="glass-panel border border-[rgba(250,203,181,0.25)] rounded-xl p-4 space-y-2">
            <p className="text-muted text-sm">AI question</p>
            <p className="whitespace-pre-line leading-relaxed">{aiResponse}</p>
          </div>
        ) : null}
        <div className="space-y-3">
          <h4 className="panel-title">Your session</h4>
          <div className="glass-panel border border-[rgba(250,203,181,0.2)] rounded-xl p-4">
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="glass-panel border border-[rgba(250,203,181,0.15)] rounded-lg p-3"
                >
                  <div className="text-sm text-muted">Q{i + 1}</div>
                  <div className="font-semibold mb-2">{q}</div>
                  <div className="text-sm text-muted">Answer</div>
                  <div>
                    {answers[i] || (
                      <span className="text-muted">(no answer yet)</span>
                    )}
                  </div>
                </div>
              ))}
              {questions.length === 0 ? (
                <div className="text-muted">No questions yet.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
