import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useToast } from "@/shared/components/ui/Toast";
import { TourProvider } from "./tour/TourContext";
import { TourOverlay } from "./tour/TourOverlay";
import { useWizard } from "./context";
import { step1Valid, step2Valid, step3Valid } from "./defaults";

export function Wizard() {
  const { pathname } = useLocation();
  const toast = useToast();
  const { alternatives, criteria, weights } = useWizard();

  const match = pathname.match(/\/wizard\/(\d+)/);
  const step = match ? Number(match[1]) : 1;

  let allowed = 1;
  if (step1Valid(alternatives).ok) allowed = 2;
  if (allowed === 2 && step2Valid(criteria).ok) allowed = 3;
  if (allowed === 3 && step3Valid(weights).ok) allowed = 4;

  const redirect = step > allowed;
  const toastedRef = useRef(false);

  // ref-guard: um toast por redirect (evita o disparo duplo do StrictMode em dev).
  useEffect(() => {
    if (!redirect) {
      toastedRef.current = false;
      return;
    }
    if (toastedRef.current) return;
    toastedRef.current = true;
    toast("Conclua as etapas anteriores para acessar este passo.", "info");
  }, [redirect, toast]);

  return (
    <TourProvider>
      {redirect ? <Navigate to={`/wizard/${allowed}`} replace /> : <Outlet />}
      <TourOverlay />
    </TourProvider>
  );
}
