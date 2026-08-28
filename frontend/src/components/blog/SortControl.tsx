import { ChevronDown } from 'lucide-react';

export type SortOption = 'latest' | 'oldest' | 'shortest' | 'longest';

interface SortControlProps {
  value: SortOption;
  onChange: (val: SortOption) => void;
}

const options: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'shortest', label: 'Shortest Read' },
  { value: 'longest', label: 'Longest Read' },
];

export default function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none pl-3 pr-7 py-1.5 text-[11px] font-medium uppercase tracking-wider border outline-none cursor-pointer"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      />
    </div>
  );
}
