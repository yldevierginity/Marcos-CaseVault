import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./config/amplify-config";
import { authService } from "./services/auth-service";

// Initialize auth after Amplify is configured
authService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
