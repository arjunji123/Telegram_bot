// src/components/KeyboardPaddingFix.js
import React, { useState, useEffect } from "react";

const KeyboardPaddingFix = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const handleKeyboardShow = () => {
    setKeyboardHeight(300); // Adjust height based on your needs
  };

  const handleKeyboardHide = () => {
    setKeyboardHeight(0);
  };

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerHeight < document.documentElement.clientHeight) {
        handleKeyboardShow();
      } else {
        handleKeyboardHide();
      }
    });

    return () => window.removeEventListener("resize", handleKeyboardHide);
  }, []);

  return (
    <div style={{ paddingBottom: `${keyboardHeight}px` }} className="keyboard-padding-container">
      {/* The rest of the app content will go here */}
    </div>
  );
};

export default KeyboardPaddingFix;
