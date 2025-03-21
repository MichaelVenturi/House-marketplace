import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase.config.ts";

// firebase doesn't initialize otherwise.  No idea why it worked for him in the course since he didnt do anything to trigger this to run
initializeApp(firebaseConfig);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
