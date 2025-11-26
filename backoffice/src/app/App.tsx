import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "@/components/ui/sonner";

/**
 * Main App component
 * Provides routing to the entire application
 */
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
