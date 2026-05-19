
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { ErrorBoundary } from "./app/components/common/ErrorBoundary.tsx";
  import "./styles/index.css";

  // Note: leaflet CSS + icon shim are imported inside the map components
  // (PropertyMap.tsx, MapAreaSearchModal.tsx) so they ship in the lazy chunk
  // rather than the initial bundle.

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
