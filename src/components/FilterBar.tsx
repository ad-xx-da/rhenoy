import type { Category, Material } from "@/data/products";
import { CATEGORIES, MATERIALS } from "@/data/products";

interface FilterBarProps {
  activeCategories: Category[];
  activeMaterials: Material[];
  onToggleCategory: (c: Category) => void;
  onToggleMaterial: (m: Material) => void;
  onClearAll: () => void;
  resultCount: number;
}

export default function FilterBar({
  activeCategories,
  activeMaterials,
  onToggleCategory,
  onToggleMaterial,
  onClearAll,
  resultCount,
}: FilterBarProps) {
  const hasFilters = activeCategories.length > 0 || activeMaterials.length > 0;

  return (
    <div className="border-b border-charcoal/10 py-5">
      <div className="max-w-6xl mx-auto px-6">
        {/* Row 1 — labels + clear */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs tracking-widest uppercase text-charcoal-muted">
            Filter
          </span>
          <span className="text-xs text-charcoal-muted">
            {resultCount} piece{resultCount !== 1 ? "s" : ""}
            {hasFilters && (
              <button
                onClick={onClearAll}
                className="ml-3 underline underline-offset-2 hover:text-charcoal transition-colors"
              >
                Clear all
              </button>
            )}
          </span>
        </div>

        {/* Row 2 — filter chips */}
        <div className="flex flex-wrap gap-2">
          {/* Category divider label */}
          <span className="text-[10px] tracking-widest uppercase text-charcoal/40 self-center pr-1">
            Category
          </span>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={activeCategories.includes(cat)}
              onClick={() => onToggleCategory(cat)}
            />
          ))}

          <span className="mx-2 self-center text-charcoal/20">|</span>

          {/* Material divider label */}
          <span className="text-[10px] tracking-widest uppercase text-charcoal/40 self-center pr-1">
            Material
          </span>
          {MATERIALS.map((mat) => (
            <FilterChip
              key={mat}
              label={mat}
              active={activeMaterials.includes(mat)}
              onClick={() => onToggleMaterial(mat)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs tracking-wide transition-colors border ${
        active
          ? "bg-charcoal text-cream border-charcoal"
          : "bg-transparent text-charcoal border-charcoal/20 hover:border-charcoal/50"
      }`}
    >
      {label}
    </button>
  );
}
