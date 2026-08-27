export default function HowToDetailLoading() {
  return (
    <main className="main-detail" aria-busy="true">
      <span className="sr-only">Đang tải…</span>
      <div className="howto-layout">
        <div className="howto-main">
          <div className="skeleton skeleton-image" aria-hidden="true" />
          <div className="skeleton skeleton-hero-title" aria-hidden="true" />
          <div className="skeleton skeleton-line" aria-hidden="true" />
          <div className="skeleton skeleton-line" aria-hidden="true" />
        </div>
        <aside className="evidence-rail" aria-hidden="true">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </aside>
      </div>
    </main>
  );
}
