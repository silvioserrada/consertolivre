import { Star } from "lucide-react";

export function RatingStars({
  average,
  count,
  size = 14,
}: {
  average: number;
  count: number;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-charcoal-soft">
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            strokeWidth={1.5}
            className={
              i < Math.round(average)
                ? "fill-copper-bright text-copper-bright"
                : "fill-transparent text-line-dark/40"
            }
          />
        ))}
      </span>
      <span className="text-steel">
        {average.toFixed(1)} · {count}
      </span>
    </span>
  );
}
