import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types";

export function Pagination({
  meta,
  onPage,
}: {
  meta: PaginationMeta;
  onPage: (page: number) => void;
}) {
  if (meta.totalPages < 2) return null;
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 border-t pt-4"
    >
      <Button
        type="button"
        variant="outline"
        disabled={meta.page <= 1}
        onClick={() => onPage(meta.page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {meta.page} of {meta.totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPage(meta.page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
