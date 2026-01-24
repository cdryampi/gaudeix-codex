import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toast } from "flowbite-react";

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
