export function Subscriptions() {
  return (
    <div className="space-y-6 lg:col-span-1">
      <h2 className="font-headline text-2xl font-bold text-foreground">Gói hội viên</h2>

      <div className="rounded-lg border border-border/20 bg-card p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-muted-foreground">
          <span className="material-symbols-outlined text-3xl">subscriptions</span>
        </div>
        <h3 className="font-headline text-lg font-bold text-foreground">Chức năng đang phát triển</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Cần API danh sách membership đang hoạt động để hiển thị kênh, tier, ngày hết hạn và quyền gia hạn.
        </p>
      </div>
    </div>
  );
}
