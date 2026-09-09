import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles/global.css";
import "./styles/themePages.css";
import "./styles/photoThemes.css";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) window.dispatchEvent(new Event("personal-system:update-available"));
        });
      });
    } catch (error) { console.error(error); }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>);
