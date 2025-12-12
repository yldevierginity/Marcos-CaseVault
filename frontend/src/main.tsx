import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { authService } from "./services/auth-service";

// Initialize auth service
authService.initialize().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
