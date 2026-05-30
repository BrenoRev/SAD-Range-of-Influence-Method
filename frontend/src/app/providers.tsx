import type { ReactNode } from "react";
import { ToastProvider } from "@/shared/components/ui/Toast";
import { WizardProvider } from "@/features/wizard/context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <WizardProvider>{children}</WizardProvider>
    </ToastProvider>
  );
}
