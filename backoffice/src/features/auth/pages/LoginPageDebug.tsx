import { useState } from "react";

export const LoginPageDebug = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("✅ SUBMIT FUNCIONA!", { username, password });
    alert(`Submit funciona! Usuario: ${username}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login Debug</h1>
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
          <div>
            <label className="block mb-2">Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Ingresa usuario"
            />
          </div>

          <div>
            <label className="block mb-2">Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Ingresa contraseña"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={() => console.log("🖱️ Button clicked")}
          >
            Login (HTML Básico)
          </button>
        </form>

        <div className="mt-4 text-sm">
          <p>Usuario: {username}</p>
          <p>Password: {password ? "***" : ""}</p>
        </div>
      </div>
    </div>
  );
};
