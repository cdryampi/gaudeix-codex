import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./App.css";
import apiConfig from "./config/api";
function App() {
  return _jsxs("main", {
    className: "card",
    children: [
      _jsx("h1", { children: "Gaudeix Backoffice" }),
      _jsx("p", {
        children:
          "Panel administrativo listo para conectar con la API del backend.",
      }),
      _jsxs("p", {
        children: [
          "API Base URL: ",
          _jsx("code", { children: apiConfig.baseUrl ?? "not set" }),
        ],
      }),
      _jsx("p", {
        className: "read-the-docs",
        children:
          "Extiende este contenedor con vistas, listas y formularios de administraci\u00F3n.",
      }),
    ],
  });
}
export default App;
