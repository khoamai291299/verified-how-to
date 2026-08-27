export default function DishLoading() {
  return (
    <main className="main-list" aria-busy="true">
      <span className="sr-only">Đang tải…</span>
      <div className="skeleton skeleton-hero-title" aria-hidden="true" />
      <div className="skeleton skeleton-hero-subtitle" aria-hidden="true" />
      {[0, 1].map((i) => (
        <div key={i} className="skeleton skeleton-row" aria-hidden="true" />
      ))}
    </main>
  );
}
