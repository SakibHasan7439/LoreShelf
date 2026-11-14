export function formatPrice(value?: number): string | null {
  if (value === undefined) {
    return null;
  }
  return `$${value.toFixed(2)}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatPageCount(currentPage?: number, pageCount?: number): string | null {
  if (!pageCount) {
    return null;
  }
  if (!currentPage) {
    return `${pageCount} pages`;
  }
  return `${currentPage} / ${pageCount} pages`;
}
