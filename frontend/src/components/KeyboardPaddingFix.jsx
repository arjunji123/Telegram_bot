// src/hooks/useKeyboard.js
import { useState, useEffect } from 'react';

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
       // Function to detect if it's iPhone
       const isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

       const handleKeyboardChange = () => {
      if (isIphone) {
        const height = window.innerHeight;
        const bodyHeight = document.body.clientHeight;
        
        // If window height is less than the body height, the keyboard is visible
        if (height < bodyHeight) {
          // Adjust keyboard height (this value can be dynamic)
          setKeyboardHeight(bodyHeight - height);
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    window.addEventListener("resize", handleKeyboardChange);
    handleKeyboardChange(); // Call it initially to check the screen height

    return () => {
      window.removeEventListener("resize", handleKeyboardChange);
    };
  }, []);

  return keyboardHeight;
};

export default useKeyboard;
