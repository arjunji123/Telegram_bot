// src/hooks/useKeyboard.js
import { useState, useEffect } from 'react';

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < 500) { // You can adjust this threshold if needed
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
          setKeyboardHeight(100); // Set a fixed padding value or calculate dynamically
        }
      } else {
        setKeyboardHeight(0);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call it initially to check the screen height

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return keyboardHeight;
};

export default useKeyboard;
