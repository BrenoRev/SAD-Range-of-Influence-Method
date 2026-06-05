import { Compass } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useTour } from "./TourContext";

export function TourButton() {
  const { start } = useTour();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={start}
      aria-label="Instruções de navegação"
      title="Instruções de navegação"
    >
      <Compass size={14} strokeWidth={1.5} /> Guia
    </Button>
  );
}
