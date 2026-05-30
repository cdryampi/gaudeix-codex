import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

/**
 * Main App component
 * Provides routing to the entire application
 */
function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
