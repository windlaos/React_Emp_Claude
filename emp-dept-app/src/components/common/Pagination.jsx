const PAGE_SIZES = [5, 10, 20];

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  if (total > 1) pages.push(total);

  return pages;
}

function Pagination({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  const btnBase = 'min-w-[2rem] h-8 px-2 rounded text-sm font-medium transition-colors';
  const btnActive  = `${btnBase} bg-indigo-600 text-white`;
  const btnDefault = `${btnBase} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700`;
  const btnDisabled = `${btnBase} bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      {/* 표시 범위 + 페이지 크기 선택 */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>{start} – {end} / 전체 {totalItems}개</span>
        <span className="mx-1">·</span>
        <label className="shrink-0">페이지당</label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s}개</option>
          ))}
        </select>
      </div>

      {/* 페이지 버튼 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? btnDisabled : btnDefault}
          aria-label="이전 페이지"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="min-w-[2rem] h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={p === currentPage ? btnActive : btnDefault}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={currentPage === totalPages ? btnDisabled : btnDefault}
          aria-label="다음 페이지"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default Pagination;
