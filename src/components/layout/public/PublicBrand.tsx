import { Link } from "@/i18n/routing";
import { platformBrand } from "@/shared/navigation/branding";

interface PublicBrandProps {
  href?: string;
  subtitle?: string;
  emphasize?: boolean;
}

export function PublicBrand({
  href = "/",
  subtitle,
  emphasize = false,
}: PublicBrandProps) {
  return (
    <Link href={href} className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white text-black">
        <span className="material-symbols-outlined text-xl">{platformBrand.icon}</span>
      </div>
      <div className="flex flex-col">
        <span
          className={`font-headline text-xl font-black uppercase tracking-tight ${
            emphasize ? "text-foreground" : "text-red-600"
          }`}
        >
          {platformBrand.name}
        </span>
        {subtitle ? (
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
