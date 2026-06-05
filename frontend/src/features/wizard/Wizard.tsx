import { Outlet } from "react-router-dom";
import { TourProvider } from "./tour/TourContext";
import { TourOverlay } from "./tour/TourOverlay";

export function Wizard() {
  return (
    <TourProvider>
      <Outlet />
      <TourOverlay />
    </TourProvider>
  );
}
