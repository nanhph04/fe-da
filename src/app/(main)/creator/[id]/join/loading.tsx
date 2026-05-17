export default function JoinMembershipLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 pt-24 pb-24 lg:px-8 lg:pl-72">
      <section className="mb-16 h-[360px] animate-pulse rounded-lg border border-border/20 bg-card md:h-[400px]" />
      <div className="mb-12 space-y-3">
        <div className="h-9 w-80 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-96 animate-pulse rounded-lg border border-border/20 bg-card" />
        ))}
      </div>
    </main>
  );
}
