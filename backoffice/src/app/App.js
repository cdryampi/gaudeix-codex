import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
/**
 * Main App component
 * Provides routing to the entire application
 */
function App() {
  return _jsx(_Fragment, {
    children: _jsx(RouterProvider, { router: router }),
  });
}
export default App;
