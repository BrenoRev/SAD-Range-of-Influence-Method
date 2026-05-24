import { RotateCcw } from "lucide-react";
import { Banner } from "@/shared/components/ui/Banner";
import { Button } from "@/shared/components/ui/Button";

type ResumeBannerProps = {
  onResume: () => void;
};

export function ResumeBanner({ onResume }: ResumeBannerProps) {
  return (
    <div className="mt-6">
      <Banner
        tone="accent"
        icon={<RotateCcw size={16} strokeWidth={1.5} />}
        title="Você tem uma decisão salva"
        action={
          <Button variant="secondary" size="sm" onClick={onResume}>
            Continuar
          </Button>
        }
      >
        Retome de onde parou ou inicie uma nova decisão abaixo.
      </Banner>
    </div>
  );
}
