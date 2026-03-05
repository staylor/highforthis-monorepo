import cn from 'classnames';

import Link from '#/components/Link';

interface SectionHeaderProps {
  label: string;
  viewAllLink?: string;
  viewAllText?: string;
}

export default function SectionHeader({
  label,
  viewAllLink,
  viewAllText = 'View All →',
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between md:mb-10">
      <h2 className="font-display text-xl font-bold md:text-2xl dark:text-white">{label}</h2>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="text-muted hover:text-pink dark:text-muted-dark text-sm font-medium tracking-wide uppercase transition-colors"
        >
          {viewAllText}
        </Link>
      )}
    </div>
  );
}

export function AccentLine({ className }: { className?: string }) {
  return (
    <div
      className={cn('my-8 h-px flex-1 md:my-12', className)}
      style={{
        background: 'linear-gradient(90deg, transparent, #e50082, transparent)',
      }}
    />
  );
}
