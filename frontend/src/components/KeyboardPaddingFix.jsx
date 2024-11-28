// src/components/KeyboardPaddingFix.js
import React, { useState, useEffect } from "react";

const KeyboardPaddingFix = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      // iOS-specific keyboard handling
      if (window.innerHeight < document.documentElement.clientHeight) {
        // Keyboard is visible
        const heightDifference = document.documentElement.clientHeight - window.innerHeight;
        setKeyboardHeight(heightDifference);
      } else {
        // Keyboard is hidden
        setKeyboardHeight(0);
      }
    };

    // Add event listener for resize to detect keyboard appearance
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        paddingBottom: `${keyboardHeight}px`,
        transition: "padding-bottom 0.3s ease", // Smooth transition for padding
      }}
    />
  );
};

export default KeyboardPaddingFix;
