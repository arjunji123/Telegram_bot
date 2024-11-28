// src/hooks/useKeyboard.js
import { useState, useEffect } from 'react';

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < document.documentElement.clientHeight) {
        const heightDifference = document.documentElement.clientHeight - window.innerHeight;
        setKeyboardHeight(heightDifference);
      } else {
        setKeyboardHeight(0);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return keyboardHeight;
};

export default useKeyboard;
