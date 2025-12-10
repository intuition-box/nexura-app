import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function OrgSignInButton() {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleSignIn = () => {
    setShowOverlay(true);
  };

  return (
    <>
      {/* Sign In Button */}
      <div className="fixed left-4 bottom-4 z-50 flex flex-col items-start gap-2">
        <p className="text-xs text-white/60">Are you an Organization?</p>
        <Button size="sm" onClick={handleSignIn}>
          Sign In
        </Button>
      </div>

      {/* Overlay */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowOverlay(false)}
        >
          <div 
            className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold">Coming Soon</h2>
            <p className="text-white/80 text-center">Organization sign in will be available soon!</p>
            <Button size="sm" onClick={() => setShowOverlay(false)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}
