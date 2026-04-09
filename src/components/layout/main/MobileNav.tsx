import Link from "next/link";

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-zinc-950/80 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around items-center z-50">
      <Link href="#" className="flex flex-col items-center gap-1 text-zinc-500">
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      <Link href="#" className="flex flex-col items-center gap-1 text-zinc-500">
        <span className="material-symbols-outlined">explore</span>
        <span className="text-[10px] font-bold">Explore</span>
      </Link>
      <Link href="/library" className="flex flex-col items-center gap-1 text-red-500">
        <span className="material-symbols-outlined">payments</span>
        <span className="text-[10px] font-bold">Library</span>
      </Link>
      <Link href="#" className="flex flex-col items-center gap-1 text-zinc-500">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px] font-bold">Profile</span>
      </Link>
    </nav>
  );
}
