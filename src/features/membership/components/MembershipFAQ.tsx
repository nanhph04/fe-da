import Link from "next/link";

export function MembershipFAQ() {
  return (
    <section className="mt-16 grid grid-cols-1 gap-16 border-t border-border/20 pt-16 md:grid-cols-2">
      <div>
        <h4 className="mb-4 font-headline text-xl font-bold text-foreground">Quy tắc membership</h4>
        <ul className="list-disc space-y-4 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Membership mới sẽ được bật tự động gia hạn theo chu kỳ 30 ngày.</li>
          <li>Bạn có thể tắt auto-renew trong thư viện gói hội viên của tài khoản.</li>
          <li>Quyền truy cập phụ thuộc vào tier hiện tại và trạng thái kênh do hệ thống kiểm soát.</li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 font-headline text-xl font-bold text-foreground">Cần thêm Aura Coins?</h4>
        <div className="flex flex-col justify-between gap-6 rounded-lg border border-border/20 bg-card p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                add_shopping_cart
              </span>
            </div>
            <div>
              <div className="font-bold text-foreground">Nạp ví</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Chọn gói nạp phù hợp để tiếp tục ủng hộ creator.
              </div>
            </div>
          </div>
          <Link
            href="/wallet"
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-foreground px-6 py-3 text-xs font-black uppercase tracking-widest text-background transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Top Up
          </Link>
        </div>
      </div>
    </section>
  );
}
