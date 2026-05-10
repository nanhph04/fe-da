export function PurchasedLibrary() {
  return (
    <section>
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-headline text-3xl font-bold text-foreground">Thư viện đã mua</h2>
      </div>

      <div className="rounded-lg border border-border/20 bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm bg-muted text-muted-foreground">
          <span className="material-symbols-outlined text-3xl">inventory_2</span>
        </div>
        <h3 className="font-headline text-xl font-bold text-foreground">Chức năng đang phát triển</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Cần API danh sách video đã mua của người dùng để hiển thị đúng quyền sở hữu, thời điểm mua và trạng thái truy cập.
        </p>
      </div>
    </section>
  );
}
