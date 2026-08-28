interface CategoryNavProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategoryNav({ categories, selected, onSelect }: CategoryNavProps) {
  return (
    <div
      className="flex gap-0 mb-8 border-b overflow-x-auto"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px"
          style={{
            color:
              selected === cat ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderColor: selected === cat ? 'var(--color-accent)' : 'transparent',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            if (selected !== cat) e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          onMouseLeave={(e) => {
            if (selected !== cat) e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
