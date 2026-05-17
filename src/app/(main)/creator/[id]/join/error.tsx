"use client";

interface JoinMembershipErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function JoinMembershipError({ error, reset }: JoinMembershipErrorProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 pt-24 pb-24 lg:pl-72">
      <section className="w-full rounded-lg border border-destructive/30 bg-card p-8 text-center shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-destructive">Membership checkout</p>
        <h1 className="mt-3 font-headline text-3xl font-black tracking-tight text-foreground">
          Không thể tải trang thanh toán
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {error.message || "Dữ liệu kênh hoặc gói membership hiện chưa khả dụng. Vui lòng thử lại sau."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all hover:opacity-90 active:scale-95"
        >
          Thử lại
        </button>
      </section>
    </main>
  );
}
