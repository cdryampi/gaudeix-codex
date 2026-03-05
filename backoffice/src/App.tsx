// import "./App.css";
import apiConfig from "./config/api";

function App() {
  return (
    <main className="card">
      <h1>Gaudeix Backoffice</h1>
      <p>Panel administrativo listo para conectar con la API del backend.</p>
      <p>
        API Base URL: <code>{apiConfig.baseUrl ?? "not set"}</code>
      </p>
      <p className="read-the-docs">
        Extiende este contenedor con vistas, listas y formularios de
        administración.
      </p>
    </main>
  );
}

export default App;
