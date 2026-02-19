import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/:tenantSlug" element={<App />} />
        <Route path="/:tenantSlug/producto/:productId" element={<App />} />
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
              <div className="text-center px-6">
                <h1 className="font-serif text-4xl text-stone-800 mb-3">
                  Changarros
                </h1>
                <p className="text-stone-500 text-sm">
                  Navega a{" "}
                  <span className="font-mono bg-stone-100 px-1 rounded">
                    /:nombre-de-tienda
                  </span>{" "}
                  para ver el catálogo.
                </p>
              </div>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
