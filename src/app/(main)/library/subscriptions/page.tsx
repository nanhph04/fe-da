import { Subscriptions } from "@/features/library";

export default function SubscriptionsLibraryPage() {
  return (
    <main className="min-h-screen bg-background pt-20 md:pl-64">
      <div className="mx-auto max-w-7xl space-y-10 px-8 py-12 animate-in fade-in duration-500">
        <section className="overflow-hidden rounded-lg border border-border/20 bg-card">
          <div className="relative px-6 py-8 md:px-8 md:py-10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/5" />
            <div className="relative max-w-3xl space-y-3">
              <p className="font-headline text-xs font-black uppercase tracking-[0.28em] text-secondary">
                Membership Access
              </p>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Gói hội viên
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Theo dõi các kênh bạn đã tham gia, trạng thái gói, cấp hội viên và ngày hết hạn bằng API membership hiện có.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <Subscriptions />
          <div className="rounded-lg border border-border/20 bg-card p-6 lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined">info</span>
              </div>
              <div className="space-y-2">
                <h2 className="font-headline text-xl font-bold text-foreground">Chức năng hiện tại</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Trang này đang hiển thị dữ liệu đọc từ danh sách membership của người dùng. Các thao tác nâng cao như hủy, gia hạn trực tiếp hoặc nâng cấp trong trang sẽ được thêm khi backend có API mutation tương ứng.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
