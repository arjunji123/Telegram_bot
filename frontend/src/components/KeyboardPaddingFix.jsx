// src/hooks/useKeyboard.js
import { useState, useEffect } from 'react';

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
        // If the window height is less than the document height, it means the keyboard is visible
        if (window.innerHeight < document.documentElement.clientHeight) {
          setKeyboardHeight(document.documentElement.clientHeight - window.innerHeight);
        } else {
          setKeyboardHeight(0); // Reset when the keyboard hides
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
