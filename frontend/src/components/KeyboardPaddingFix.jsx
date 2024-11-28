// src/components/KeyboardPaddingFix.js

import React, { useState, useEffect } from "react";

const KeyboardPaddingFix = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      // Check if the keyboard is showing
      if (window.innerHeight < document.documentElement.clientHeight) {
        // The keyboard is likely visible, calculate the height
        setKeyboardHeight(document.documentElement.clientHeight - window.innerHeight);
      } else {
        // Keyboard is hidden
        setKeyboardHeight(0);
      }
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // We apply the keyboard height dynamically as padding
  return <div style={{ paddingBottom: `${keyboardHeight}px` }} />;
};

export default KeyboardPaddingFix;
