import { PurchasedLibrary } from "@/features/library";

export default function PurchasedLibraryPage() {
  return (
    <main className="min-h-screen bg-background pt-20 md:pl-64">
      <div className="mx-auto max-w-7xl space-y-10 px-8 py-12 animate-in fade-in duration-500">
        <section className="overflow-hidden rounded-lg border border-border/20 bg-card">
          <div className="relative px-6 py-8 md:px-8 md:py-10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5" />
            <div className="relative max-w-3xl space-y-3">
              <p className="font-headline text-xs font-black uppercase tracking-[0.28em] text-secondary">
                Viewer Library
              </p>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Video đã mua
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Truy cập nhanh các nội dung bạn đã mở khóa bằng Aura Coin. Dữ liệu lấy từ thư viện mua hiện có, chưa yêu cầu API nâng cao.
              </p>
            </div>
          </div>
        </section>

        <PurchasedLibrary />
      </div>
    </main>
  );
}
