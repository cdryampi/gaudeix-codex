import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "@/components/ui/sonner";
/**
 * Main App component
 * Provides routing to the entire application
 */
function App() {
    return (_jsxs(_Fragment, { children: [_jsx(RouterProvider, { router: router }), _jsx(Toaster, {})] }));
}
export default App;
