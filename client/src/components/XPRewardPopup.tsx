import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";

type Props = {
  onClose?: () => void;
  forceShow?: boolean;
};

const XPRewardPopup: React.FC<Props> = ({ onClose, forceShow = false }) => {
  const [show, setShow] = useState(false);
const [location] = useLocation();
const TARGET_PAGE = "/portal-claims";
  const LOCAL_KEY = "xpPopupShownCount";

  useEffect(() => {
  if (location !== TARGET_PAGE) return;

  if (forceShow) {
    setShow(true);
    return;
  }

  const count = parseInt(localStorage.getItem(LOCAL_KEY) || "0");
  if (count < 2) {
    setShow(true);
    localStorage.setItem(LOCAL_KEY, (count + 1).toString());
  }
}, [forceShow, location]);
  if (!show) return null;

  return createPortal(
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
      <div className="bg-[#0a0a0a] border-2 border-purple-400 p-6 rounded-xl max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl animate-bounce-slow">
        <h2
          className="text-2xl font-extrabold mb-4 text-center text-purple-400 tracking-wide animate-pulse"
          style={{ letterSpacing: "1px" }}
        >
          🎉 XP Reward!
        </h2>
     <p className="mb-3 text-center text-white text-[16px] sm:text-[18px] leading-snug">
  Whenever you support or oppose a portal claim with <strong>200 TRUST</strong> or more, you earn <strong>50 XP</strong>.
  You can earn up to <strong>50 XP per day</strong>, <strong>350 XP per week</strong>, and <strong>1,400 XP per month</strong>.
</p>

<p className="text-center text-gray-400 text-[11px]">
  XP rewards reset every 24 hours at 12AM UTC.
</p>
        <div className="flex justify-center">
          <button
            onClick={() => {
              setShow(false);
              onClose?.();
            }}
            className="px-6 py-2 bg-purple-500 text-white border-2 border-purple-300 rounded-full hover:bg-purple-600 hover:border-purple-100 transition font-bold tracking-wider animate-bounce-short"
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default XPRewardPopup;