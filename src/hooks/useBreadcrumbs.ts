import { useMatches } from "react-router-dom";

export interface Crumb {
  label: string;
  href?: string;
}

export function useBreadcrumbs(): Crumb[] {
  const matches = useMatches();
  return matches
    .filter((m) => (m.handle as { crumb?: () => string })?.crumb)
    .map((m, i, arr) => {
      const crumb = (m.handle as { crumb: () => string }).crumb();
      const isLast = i === arr.length - 1;
      return { label: crumb, href: isLast ? undefined : m.pathname };
    });
}
