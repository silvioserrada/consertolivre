import { useState } from "react";
import { Flag } from "lucide-react";

export function ReportButton({
  targetLabel,
  onReport,
}: {
  targetLabel: string;
  onReport: () => Promise<void>;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (state === "sent") {
    return <span className="text-xs font-mono text-steel">Denúncia enviada — obrigado</span>;
  }

  return (
    <button
      onClick={async () => {
        setState("sending");
        try {
          await onReport();
          setState("sent");
        } catch {
          setState("error");
        }
      }}
      disabled={state === "sending"}
      title={`Denunciar ${targetLabel}`}
      className="inline-flex items-center gap-1 text-xs font-mono text-steel hover:text-signal transition-colors disabled:opacity-50"
    >
      <Flag size={12} strokeWidth={1.5} />
      {state === "error" ? "erro, tentar de novo" : "denunciar"}
    </button>
  );
}
