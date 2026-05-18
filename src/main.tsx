
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Note: leaflet CSS + icon shim are imported inside the map components
  // (PropertyMap.tsx, MapAreaSearchModal.tsx) so they ship in the lazy chunk
  // rather than the initial bundle.

  createRoot(document.getElementById("root")!).render(<App />);
