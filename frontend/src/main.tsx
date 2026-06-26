import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";

export const authService =
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8000";
export const restaurantService =
  import.meta.env.VITE_RESTAURANT_SERVICE_URL || "http://localhost:8002";
export const utilsService =
  import.meta.env.VITE_UTILS_SERVICE_URL || "http://localhost:8003";

const clientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "928973722294-nlnaa96ddbkei6vouieh3p11efbp3atn.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
