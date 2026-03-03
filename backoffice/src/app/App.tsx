import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

/**
 * Main App component
 * Provides routing to the entire application
 */
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
