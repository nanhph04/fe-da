import { useTranslations } from "next-intl";

export default function AdminLoading() {
  const t = useTranslations("Admin.loading");

  return (
    <div className="flex-1 min-h-[calc(100vh-80px)] w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2">
          <div className="w-2 h-8 bg-red-600 animate-pulse delay-75"></div>
          <div className="w-2 h-8 bg-red-600 animate-pulse delay-150"></div>
          <div className="w-2 h-8 bg-input border border-red-600 animate-pulse delay-300"></div>
        </div>
        <div className="text-center">
           <p className="text-red-600 font-mono font-bold uppercase tracking-widest text-[10px]">{t("title")}</p>
           <p className="text-muted-foreground font-mono text-xs mt-1">{t("description")}</p>
        </div>
      </div>
    </div>
  );
}
