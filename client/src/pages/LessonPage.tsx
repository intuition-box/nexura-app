import { useParams } from "wouter";
import { useState } from "react";
import { quiz } from "./quiz";
import { quiz as quiz2 } from "./quiz2";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Confetti from "react-confetti";


export default function LessonPage() {
  const [location, setLocation] = useLocation();
  const { id } = useParams();
  const walletAddress = "0x123";
const storageKey = `learn-progress-${walletAddress}`;
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    // track window size
  useEffect(() => {
    const updateSize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const title = "Introduction to Web3";

  const steps = [
    "The internet has evolved through three main stages: Web1 (read-only), Web2 (read-write), and now Web3 (read, write, and own).",
    "Web3 is a decentralized web powered by blockchain technology, where users control their data, identities, and assets instead of centralized platforms.",
    "While blockchain secures “what happened,” Web3 also needs a trust layer to verify “who and what can be trusted.” This is where Intuition comes in.",
    "It ensures credibility, transparency, and a more intelligent digital ecosystem.",

    "QUIZ_STEP",

    "Blockchain is a decentralized digital ledger where every participant holds the same record.",
    "Each block contains verified transactions and is permanently linked to previous blocks, ensuring transparency and immutability.",
    "Blockchain empowers individuals by removing intermediaries and allowing them to verify truth themselves.",
    "Tokens and wallets give users control over value and identity."
  ];

useEffect(() => {
  const data = JSON.parse(localStorage.getItem(storageKey)) || {};
  if (data[id]?.quizCompleted) {
    setQuizCompleted(true);
  }
}, [id, storageKey]);

const searchParams = new URLSearchParams(location.split("?")[1]);
const isReview = searchParams.get("review") === "1";

const [currentStep, setCurrentStep] = useState(() => {
  const data = JSON.parse(localStorage.getItem(storageKey)) || {};
  const saved = data[id];

  const searchParams = new URLSearchParams(window.location.search);
  const isReview = searchParams.get("review") === "1";

  if (isReview) return 0; // force review to step 1 visually
  return saved?.progress ? saved.progress - 1 : 0;
});
// Force review to step 1 visually
useEffect(() => {
  if (isReview) {
    setCurrentStep(0); // visual step
    setCurrentQuizIndex(0); // reset quiz display
    setShowBronze(true); // show bronze screen if applicable
    setShowCompletionSlide(false);
    setSelected(null);
    setStatus(null);
  }
}, [isReview]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null); // "correct" | "wrong"
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showCompletionSlide, setShowCompletionSlide] = useState(false);
  const [showBronze, setShowBronze] = useState(true);
  const [completionType, setCompletionType] = useState(null); // "silver" | "gold"
//   const [activeQuiz, setActiveQuiz] = useState(1);
const initialQuiz = currentStep >= 8 ? 2 : 1;
const [activeQuiz, setActiveQuiz] = useState(initialQuiz);
//   const isQuizStep = currentStep === 4;
const isQuiz1Step = currentStep === 4;
const isQuiz2Step = currentStep >= 8 && currentStep <= 12;
const isQuizStep = isQuiz1Step || isQuiz2Step;
const isWrongAnswer = status === "wrong";
const xpClaimed = quizCompleted || (() => {
  const data = JSON.parse(localStorage.getItem(storageKey)) || {};
  return data[id]?.quizCompleted || false;
})();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const [showXPModal, setShowXPModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [runConfetti, setRunConfetti] = useState(false);
  const [animate, setAnimate] = useState(false);
    const [startBounce, setStartBounce] = useState(false);
    const isGoldCompleted = showCompletionSlide && completionType === "gold";

  useEffect(() => {
    // Start bounce 1s after component mounts + fly-in duration (0.6s)
    const timer = setTimeout(() => setStartBounce(true), 1600); // 0.6s fly-in + 1s delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  if (currentStep >= 8) {
    setActiveQuiz(2);
  } else if (currentStep >= 4) {
    setActiveQuiz(1);
}
}, [currentStep]);

useEffect(() => {
  const data = JSON.parse(localStorage.getItem(storageKey)) || {};

  data[id] = {
    progress: currentStep + 1,
    quizCompleted: quizCompleted, // use real state
  };

  localStorage.setItem(storageKey, JSON.stringify(data));
  window.dispatchEvent(new Event("progress-update"));
}, [currentStep, quizCompleted]);


  ///////////////// local storage
  const handleClaimXP = () => {
  if (quizCompleted) return; // prevent double-clicks

  const data = JSON.parse(localStorage.getItem(storageKey)) || {};

  data[id] = {
    ...data[id],
    completed: true,
    quizCompleted: true,
  };

  localStorage.setItem(storageKey, JSON.stringify(data));
  window.dispatchEvent(new Event("progress-update"));

  setQuizCompleted(true);
  setShowXPModal(true);
};

const goNext = () => {
  if (isQuizStep) {
    const currentQuiz = activeQuiz === 1 ? quiz : quiz2;

    // Enter quiz from bronze screen
    if (showBronze) {
      setShowBronze(false);
      return;
    }

    // Completion slide handling
    if (showCompletionSlide) {
      const data = JSON.parse(localStorage.getItem(storageKey)) || {};

      if (!data[id]) data[id] = {};
      if (!data[id].quizState) data[id].quizState = {};

      const quizKey = `quiz-${activeQuiz}`;

    data[id].quizState[quizKey] = {
  ...data[id].quizState?.[quizKey],
  activeQuiz,
  currentQuizIndex,
  showBronze,
  showCompletionSlide,
  isQuizStep: true,
};

      localStorage.setItem(storageKey, JSON.stringify(data));

      setShowCompletionSlide(false);
      setShowBronze(true);

      if (completionType === "silver") {
        setActiveQuiz(2);
        setCurrentQuizIndex(0);
        setShowBronze(true);
        setCurrentStep((prev) => prev + 1);
      }

      if (completionType === "gold") {
        setCurrentStep((prev) => prev + 1);
      }

      return;
    }

    if (!selected) return;

    // SAVE current answer
    const data = JSON.parse(localStorage.getItem(storageKey)) || {};

    if (!data[id]) data[id] = {};
    if (!data[id].quizState) data[id].quizState = {};

    const quizKey = `quiz-${activeQuiz}`;

    if (!data[id].quizState[quizKey]) {
      data[id].quizState[quizKey] = { answers: {} };
    }

    if (!data[id].quizState[quizKey].answers) {
      data[id].quizState[quizKey].answers = {};
    }

    data[id].quizState[quizKey].answers[currentQuizIndex] = {
      selected,
      status,
    };

    localStorage.setItem(storageKey, JSON.stringify(data));

    // MOVE NEXT (DO NOT RESET STATE HERE)
    if (status === "correct") {
      if (currentQuizIndex < currentQuiz.length - 1) {
        setCurrentQuizIndex((prev) => prev + 1);

        // ⚠️ DO NOT clear blindly — let rehydration handle it
        // setSelected(null);
        // setStatus(null);
      } else {
        setCompletionType(activeQuiz === 1 ? "silver" : "gold");
        setShowCompletionSlide(true);
      }
    }

    return;
  }

  if (currentStep < steps.length - 1) {
    setCurrentStep((prev) => prev + 1);
  }
};

const goPrev = () => {
  // 🚨 If completion slide is showing, exit it first
if (showCompletionSlide) {
  setShowCompletionSlide(false);
  setShowBronze(true);

  // 🔥 CRITICAL RESET
  setCurrentQuizIndex(0);
  setSelected(null);
  setStatus(null);

  return;
}

  // 🚫 Outside quiz → normal step navigation
  if (!isQuizStep) {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
    return;
  }

  // 🚨 Inside quiz
  if (showBronze) {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
    return;
  }

  const quizList = activeQuiz === 1 ? quiz : quiz2;

  if (currentQuizIndex > 0) {
    const prevIndex = currentQuizIndex - 1;

    setCurrentQuizIndex(prevIndex);

    const data = JSON.parse(localStorage.getItem(storageKey)) || {};
    const quizKey = `quiz-${activeQuiz}`;
    const saved = data[id]?.quizState?.[quizKey];

    const savedAnswer = saved?.answers?.[prevIndex];

    if (savedAnswer) {
      setSelected(savedAnswer.selected);
      setStatus(savedAnswer.status);
    } else {
      setSelected(null);
      setStatus(null);
    }

    return;
  }

  if (currentQuizIndex === 0) {
    setShowBronze(true);
    setSelected(null);
    setStatus(null);
  }
};

useEffect(() => {
  const handleKeyDown = (e) => {
    // ignore if user is typing in an input/textarea
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (e.key === "ArrowRight") {
      // match exactly your button logic
      if (!isWrongAnswer && !isGoldCompleted) {
        goNext();
      }
    }

    if (e.key === "ArrowLeft") {
      if (currentStep > 0 && status !== "wrong") {
        goPrev();
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [currentStep, status, isWrongAnswer, isGoldCompleted, showCompletionSlide, showBronze, currentQuizIndex, activeQuiz, selected]);

// Called whenever user selects an answer
const handleAnswer = (option) => {
  const currentQuiz = activeQuiz === 1 ? quiz : quiz2;
  const currentQuestion = currentQuiz[currentQuizIndex];

  // Set local state for immediate feedback
  setSelected(option);
  const newStatus = option === currentQuestion.answer ? "correct" : "wrong";
  setStatus(newStatus);

  // Save in localStorage
  const data = JSON.parse(localStorage.getItem(storageKey)) || {};
  if (!data[id]) data[id] = {};
  if (!data[id].quizState) data[id].quizState = {};

  const quizKey = `quiz-${activeQuiz}`;

  if (!data[id].quizState[quizKey]) {
    data[id].quizState[quizKey] = { answers: {} };
  }

  data[id].quizState[quizKey].answers = {
    ...(data[id].quizState[quizKey].answers || {}),
    [currentQuizIndex]: {
      selected: option,
      status: newStatus,
    },
  };

  // Save quiz state as well for navigation
  data[id].quizState[quizKey] = {
    ...data[id].quizState[quizKey],
    activeQuiz,
    currentQuizIndex,
    showBronze,
    showCompletionSlide,
    answers: data[id].quizState[quizKey].answers,
  };

  localStorage.setItem(storageKey, JSON.stringify(data));
  window.dispatchEvent(new Event("progress-update"));
};

useEffect(() => {
  const handleKeyDown = (e) => {
    // ignore typing in inputs
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (!isQuizStep || showBronze || showCompletionSlide) return;

    const currentQuiz = activeQuiz === 1 ? quiz : quiz2;
    const currentQuestion = currentQuiz[currentQuizIndex];
    const optionCount = currentQuestion.options.length;

    // Map A/B/C/D to 0/1/2/3
    const key = e.key.toUpperCase();
    const keyCode = key.charCodeAt(0) - 65; // A → 0, B → 1, ...

    if (keyCode >= 0 && keyCode < optionCount) {
      const selectedOption = currentQuestion.options[keyCode];
      handleAnswer(selectedOption);
    }

    // Existing arrow navigation
    if (e.key === "ArrowRight" && !isWrongAnswer && !isGoldCompleted) {
      goNext();
    }

    if (e.key === "ArrowLeft" && currentStep > 0 && status !== "wrong") {
      goPrev();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [currentStep, status, isWrongAnswer, isGoldCompleted, showCompletionSlide, showBronze, currentQuizIndex, activeQuiz, selected]);

const resetLesson = () => {
  const data = JSON.parse(localStorage.getItem(storageKey)) || {};

  if (data[id]) {
    delete data[id];
  }

  localStorage.setItem(storageKey, JSON.stringify(data));
  window.dispatchEvent(new Event("progress-update"));

  // close modal FIRST (important)
  setShowXPModal(false);

  // hard reload for guaranteed clean state
  window.location.reload();
};
// Rehydrate answers on mount / when quiz index changes
useEffect(() => {
  const data = JSON.parse(localStorage.getItem(storageKey)) || {};
  const quizKey = `quiz-${activeQuiz}`;
  const saved = data[id]?.quizState?.[quizKey];

  if (!saved) {
    setSelected(null);
    setStatus(null);
    return;
  }

  const savedAnswer = saved.answers?.[currentQuizIndex];
  if (savedAnswer) {
    setSelected(savedAnswer.selected);
    setStatus(savedAnswer.status);
  } else {
    setSelected(null);
    setStatus(null);
  }
}, [currentQuizIndex, activeQuiz, id]);

useEffect(() => {
  if (showCompletionSlide && (completionType === "gold" || completionType === "silver")) {
    const audio = new Audio("/sounds/cheering.mp3");
    audio.play();

    // trigger confetti only for gold
    if (completionType === "gold") {
      setRunConfetti(false); // reset first (optional)
      setTimeout(() => setRunConfetti(true)); // tiny delay forces update
    }
  }
}, [showCompletionSlide, completionType]);


  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1500); // 1.5s delay
    return () => clearTimeout(timer);
  }, []);
  

  return (
    <div className="min-h-screen bg-black text-white space-y-3 flex flex-col items-center">

      {/* Header */}
<div className="w-full max-w-3xl space-y-1">
  <div className="flex items-center gap-1.5">
    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
    <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
      Learn
    </span>
  </div>
</div>

{/* Title */}
<h1 className="w-full max-w-3xl text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
  {title}
</h1>

{/* Progress */}
<div className="w-full max-w-3xl mt-1">
  <div className="w-full h-2 rounded-full overflow-hidden bg-white/20">
    <div
      className="h-full"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, #94E2FF, #8A3FFC)",
      }}
    />
  </div>

  <div className="flex justify-between text-[10px] text-white/60 mt-1">
    <span style={{ color: "#94E2FF" }}>{title.toUpperCase()}</span>
    <span>STEP {currentStep + 1}/{steps.length}</span>
  </div>
</div>

{/* Content */}
<div className="w-full max-w-3xl space-y-3">

  <div
    className="relative sm:p-6 rounded-2xl min-h-[300px] flex items-center justify-between gap-4 text-center"
    style={{
      background: "linear-gradient(135deg, #8B3EFE, #532598)",
    }}
  >

<button
  onClick={goPrev}
  disabled={currentStep === 0 || status === "wrong"}
  className="px-2 disabled:opacity-30 transition hover:scale-110"
>
  <img
    src="/prev-arrow.png"
    alt="Previous"
    className="w-12 h-14 object-contain"
  />
</button>

{/* Content */}
<div className="flex-1 px-2">
  {!isQuizStep ? (
    // STEP CONTENT
    <p className="text-lg sm:text-xl leading-relaxed">
      {steps[currentStep]}
    </p>
  ) : showCompletionSlide ? (
    // COMPLETION SLIDES
    completionType === "silver" ? (
      <div className="flex flex-col items-center space-y-4 text-center">
        <img src="/nexura-silver.png" className="w-20 h-20 animate-bounce-slow" />
    <h2 className="text-xl sm:text-2xl font-bold flex flex-wrap justify-center">
      {"You nailed this section!".split("").map((char, i) => (
        <span
          key={i}
          className={`letter ${animate ? "animate-letter" : ""} ${animate ? "letter-bounce" : ""}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h2>
        <p className="text-sm sm:text-base text-white/80 max-w-sm text-center">
  {"You have finished this part. Continue your learning with understanding blockchain.".split("").map((char, i) => {
    // random starting positions
    const xStart = `${Math.floor(Math.random() * 200 - 100)}px`; // -100px to +100px
    const yStart = `${Math.floor(Math.random() * 200 - 100)}px`;
    const rotateStart = `${Math.floor(Math.random() * 60 - 30)}deg`; // -30 to +30deg

    return (
      <span
        key={i}
        className="fly-letter"
        style={{
          "--x-start": xStart,
          "--y-start": yStart,
          "--rotate-start": rotateStart,
          animationDelay: `${i * 0.03}s`, 
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    );
  })}
</p>
      </div>
    ) : (
<div className="relative flex flex-col items-center space-y-4 text-center">
    {/* FULL SCREEN CONFETTI */}
{runConfetti && (
<Confetti
  width={window.innerWidth}
  height={window.innerHeight}
  numberOfPieces={200}    
  gravity={0.6}            
  initialVelocity={10}     
  friction={0.9}           
  wind={0.05}            
  recycle={false}
  run={true}
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 9999
  }}
/>
)}

        {/* GOLD BADGE */}
        <img src="/nexura-gold.png" className="w-20 h-20 animate-bounce-slow" />

    <h2 className="text-xl sm:text-2xl font-bold flex flex-wrap justify-center">
      {"CONGRATULATIONS".split("").map((char, i) => (
        <span
          key={i}
          className={`letter ${animate ? "animate-letter" : ""} ${animate ? "letter-bounce" : ""}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {char}
        </span>
      ))}
    </h2>
        <p className="text-sm sm:text-base text-white/80 max-w-sm text-center">
  {"You have mastered the basics of Web3 and blockchain. Your XP rewards are ready to be claimed.".split("").map((char, i) => {
    // random starting positions
    const xStart = `${Math.floor(Math.random() * 200 - 100)}px`; // -100px to +100px
    const yStart = `${Math.floor(Math.random() * 200 - 100)}px`;
    const rotateStart = `${Math.floor(Math.random() * 60 - 30)}deg`; // -30 to +30deg

    return (
      <span
        key={i}
        className="fly-letter"
        style={{
          "--x-start": xStart,
          "--y-start": yStart,
          "--rotate-start": rotateStart,
          animationDelay: `${i * 0.03}s`, 
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    );
  })}
</p>

        <button
          onClick={handleClaimXP}
          disabled={quizCompleted}
          className={`mt-3 px-5 py-2 rounded-md text-white ${quizCompleted ? "bg-gray-500 cursor-not-allowed" : "bg-[#8B3EFE] hover:bg-[#7A2FE0]"}`}
          style={{ animationDelay: "0.7s" }}
        >
          {quizCompleted ? "XP Claimed" : "Claim XP"}
        </button>
      </div>
    )
  ) : showBronze ? (
    // BRONZE SLIDE
    <div className="flex flex-col items-center space-y-4 text-center">
      <img src="/nexura-bronze.png" className="w-20 h-20 animate-badge" />
      <h2 className="text-xl sm:text-2xl font-bold">
        Test Your Knowledge
      </h2>
      <p className="text-sm sm:text-base text-white/80 max-w-sm text-center">
        Take a quiz to see how much you understand {activeQuiz === 1 ? "Web3" : "Blockchain"}.
      </p>
    </div>
  ) : (
    // QUIZ
    <div className="flex flex-col space-y-4 text-left">
      <h2 className="text-xl sm:text-2xl font-bold text-center">
        {(activeQuiz === 1 ? quiz : quiz2)[currentQuizIndex].question.toUpperCase()}
      </h2>

      <div className="space-y-3">
        {(activeQuiz === 1 ? quiz : quiz2)[currentQuizIndex].options.map((opt, i) => {
          let style = "flex justify-between items-center px-4 py-3 rounded-lg cursor-pointer border bg-[#181C2180]";

          if (selected === opt) {
            if (status === "correct") {
              style = "flex justify-between items-center px-4 py-3 rounded-lg border bg-[#00E1A233] border-[#00E1A2E5]";
            } else if (status === "wrong") {
              style = "flex justify-between items-center px-4 py-3 rounded-lg border bg-[#F43F5E33] border-[#F43F5E]";
            }
          }

          return (
            <div key={i} onClick={() => handleAnswer(opt)} className={style}>
              <span className="flex items-center gap-2">
                <span className="bg-[#31353B] px-2 py-1 rounded text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="capitalize">{opt}</span>
              </span>

              {selected === opt && status === "correct" && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#00E1A2] text-black font-bold">
                  ✓
                </span>
              )}
              {selected === opt && status === "wrong" && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#F43F5E] text-black font-bold">
                  ✕
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-white/70 mt-2">
        Question {currentQuizIndex + 1} of {(activeQuiz === 1 ? quiz : quiz2).length}
      </p>
    </div>
  )}
</div>

<button
  onClick={goNext}
  disabled={isWrongAnswer || isGoldCompleted}
  className="px-2 disabled:opacity-30 transition hover:scale-110"
>
  <img
    src="/next-arrow.png"
    alt="Next"
    className="w-12 h-14 object-contain"
  />
</button>

          {/* Ticker */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentStep ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Continue */}
          {!(showCompletionSlide && completionType === "gold") && (
<button
  onClick={goNext}
  disabled={isWrongAnswer}
  className={`absolute bottom-4 right-4 px-4 py-1.5 rounded-3xl text-sm text-white transition-all duration-200
    ${isWrongAnswer
      ? "bg-gray-500/50 blur-[1px] cursor-not-allowed opacity-60"
      : "bg-[#8B3EFE] hover:bg-[#7A2FE0]"
    }
  `}
>
  Continue
</button>
)}
        </div>

{/* XP Reward Button */}
<button
  className="flex items-center gap-2 px-4 py-3 rounded-lg border"
  style={{ 
    background: "#1D182E80",
    borderColor: "#D4BBFF1A",
    borderWidth: "1px"
  }}
>
  {/* XP Icon */}
  <img src="/xp-icon.png" alt="XP Icon" className="w-12 h-12 object-contain" />

  {/* Text */}
  <div className="flex flex-col leading-none">
    <span className="text-[15px] font-bold" style={{ color: "#94E2FF" }}>
      XP REWARDS
    </span>
    <span className="text-xl font-bold text-white">500</span>
  </div>
</button>
      </div>

      {showXPModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

    <div
      className="w-[90%] max-w-sm rounded-xl p-4 text-center space-y-3"
      style={{
        background: "linear-gradient(135deg, #8B3EFE, #532598)",
      }}
    >
      {/* Icon */}
      <img src="/claim500.png" className="w-14 h-14 mx-auto" />

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold">
        Lesson Complete!
      </h2>

      {/* Text */}
      <p className="text-xs text-white/80">
        You've successfully mastered the basics of web3 and blockchain
      </p>

      {/* XP */}
      <div className="flex items-center justify-center gap-2 text-lg font-extrabold">
        <span>+500 XP</span>
        <img src="/claimed.png" className="w-12 h-5" />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-3">

<button
  onClick={() => {
    handleClaimXP();
    setLocation("/learn");
  }}
  className="w-full py-2 text-sm rounded-md text-white"
  style={{ background: "#8A3FFC66" }}
>
  RETURN TO LESSONS
</button>

        <button
          onClick={resetLesson}
          className="w-full py-2 text-sm rounded-md text-white border border-white bg-transparent"
        >
          TAKE LESSON AGAIN
        </button>

      </div>
    </div>
  </div>
)}

    </div>
  );
}