interface ScoreBarProps {
  label: string;
  score: number;
  color: string;
}

export default function ScoreBar({ label, score, color }: ScoreBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs tracking-widest uppercase text-charcoal-muted">
          {label}
        </span>
        <span className="text-xs font-medium text-charcoal">
          {score}<span className="text-charcoal-muted">/10</span>
        </span>
      </div>
      <div className="h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full score-bar-fill"
          style={{
            width: `${score * 10}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
