import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

export function Breadcrumbs() {
  const crumbs = useBreadcrumbs();
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-text-faint font-bold">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href || i} className="inline-flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-text-faint/40 select-none mx-0.5" aria-hidden="true">
                /
              </span>
            )}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-text">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
