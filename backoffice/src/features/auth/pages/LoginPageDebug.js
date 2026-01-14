import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export const LoginPageDebug = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("✅ SUBMIT FUNCIONA!", { username, password });
        alert(`Submit funciona! Usuario: ${username}`);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Login Debug" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 border p-4 rounded", children: [_jsxs("div", { children: [_jsx("label", { className: "block mb-2", children: "Usuario:" }), _jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full border p-2 rounded", placeholder: "Ingresa usuario" })] }), _jsxs("div", { children: [_jsx("label", { className: "block mb-2", children: "Contrase\u00F1a:" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full border p-2 rounded", placeholder: "Ingresa contrase\u00F1a" })] }), _jsx("button", { type: "submit", className: "w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600", onClick: () => console.log("🖱️ Button clicked"), children: "Login (HTML B\u00E1sico)" })] }), _jsxs("div", { className: "mt-4 text-sm", children: [_jsxs("p", { children: ["Usuario: ", username] }), _jsxs("p", { children: ["Password: ", password ? "***" : ""] })] })] }) }));
};
