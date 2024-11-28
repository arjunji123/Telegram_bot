import React, { useState, useEffect } from "react";

const KeyboardFix = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // Save original styles to restore later
      const originalBodyStyle = document.body.style;

      // Function to prevent content from being pushed up
      const preventKeyboardShift = () => {
        document.body.style.overflow = 'hidden'; // Disable scrolling while keyboard is open
        setKeyboardVisible(true);
      };

      // Function to restore scrolling behavior after the keyboard is closed
      const restoreScrolling = () => {
        document.body.style.overflow = 'auto'; // Re-enable scrolling
        setKeyboardVisible(false);
      };

      // Listen for the focus event (input fields gaining focus)
      const inputFocusHandler = () => {
        preventKeyboardShift();
      };

      // Listen for the blur event (input fields losing focus)
      const inputBlurHandler = () => {
        restoreScrolling();
      };

      // Add event listeners for the input fields
      document.querySelectorAll("input, textarea").forEach((element) => {
        element.addEventListener("focus", inputFocusHandler);
        element.addEventListener("blur", inputBlurHandler);
      });

      // Cleanup the event listeners on component unmount
      return () => {
        document.querySelectorAll("input, textarea").forEach((element) => {
          element.removeEventListener("focus", inputFocusHandler);
          element.removeEventListener("blur", inputBlurHandler);
        });

        // Restore original body styles
        document.body.style = originalBodyStyle;
      };
    }
  }, []);

  return null;
};

export default KeyboardFix;
