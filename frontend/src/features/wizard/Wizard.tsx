import { Navigate, Outlet, useLocation } from "react-router-dom";
import { TourProvider } from "./tour/TourContext";
import { TourOverlay } from "./tour/TourOverlay";
import { useWizard } from "./context";
import { step1Valid, step2Valid, step3Valid } from "./defaults";

export function Wizard() {
  const { pathname } = useLocation();
  const { alternatives, criteria, weights } = useWizard();

  const match = pathname.match(/\/wizard\/(\d+)/);
  const step = match ? Number(match[1]) : 1;

  let allowed = 1;
  if (step1Valid(alternatives).ok) allowed = 2;
  if (allowed === 2 && step2Valid(criteria).ok) allowed = 3;
  if (allowed === 3 && step3Valid(weights).ok) allowed = 4;

  return (
    <TourProvider>
      {step > allowed ? <Navigate to={`/wizard/${allowed}`} replace /> : <Outlet />}
      <TourOverlay />
    </TourProvider>
  );
}
