import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Technician } from "../types";
import { RatingStars } from "./RatingStars";

export function TechnicianCard({
  technician,
  distanceKm,
  categoryLabels,
}: {
  technician: Technician;
  distanceKm: number | null;
  categoryLabels: string[];
}) {
  const featured = technician.plan === "premium";

  return (
    <Link
      to={`/tecnico/${technician.id}`}
      className={`group block border border-line bg-white/40 p-5 hover:border-charcoal transition-colors ${
        featured ? "corner-ticks" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <img
          src={technician.avatarUrl}
          alt={technician.name}
          className="w-14 h-14 object-cover grayscale-[15%]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-base truncate">{technician.name}</h3>
            {featured && (
              <span className="text-[10px] font-mono uppercase tracking-wide bg-copper-bright/20 text-copper px-1.5 py-0.5">
                destaque
              </span>
            )}
          </div>
          <p className="text-sm text-steel mt-0.5 flex items-center gap-1">
            <MapPin size={12} strokeWidth={1.5} />
            {technician.city}/{technician.state}
            {distanceKm !== null && <span className="font-mono">· {distanceKm.toFixed(1)} km</span>}
          </p>
          <RatingStars average={technician.rating.average} count={technician.rating.count} />
        </div>
      </div>

      <p className="text-sm text-charcoal-soft mt-3 line-clamp-2">{technician.bio}</p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {categoryLabels.map((label) => (
          <span key={label} className="text-[11px] font-mono text-steel border border-line px-1.5 py-0.5">
            {label}
          </span>
        ))}
      </div>
    </Link>
  );
}
