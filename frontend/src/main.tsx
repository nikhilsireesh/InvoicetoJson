import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* reducedMotion="user" makes every framer-motion animation in the app
        honor the OS-level prefers-reduced-motion setting automatically,
        matching the CSS-level support already in index.css. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>
);
