import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "./app/providers/AppProviders";
import App from "./app/App";
import "./index.css";
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsx(AppProviders, { children: _jsx(App, {}) }) }));
