import { Button } from "@/components/ui/button";

export function CheckoutOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-end">
      <div className="w-full max-w-md bg-accent h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-8 border-b border-border/20 flex justify-between items-center bg-background">
          <h2 className="font-headline text-2xl font-black uppercase tracking-tighter italic text-foreground">
            Checkout
          </h2>
          <button onClick={onClose} className="material-symbols-outlined text-muted-foreground hover:text-foreground transition-colors">
            close
          </button>
        </div>
        
        <div className="flex-grow p-8 overflow-y-auto">
          <div className="mb-8">
            <div className="text-xs font-headline font-bold text-primary tracking-[0.3em] uppercase mb-6">Subscription Details</div>
            <div className="flex gap-4 items-center bg-black/50 p-4 rounded-lg border border-border/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-16 h-16 rounded object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7rS_4KwJgKkuhOzsU1RdNubh4D6eWaZXo1I3W7KrmiLjuoRqVma56Zqilimt2V1pal4Xq01K3v0j6a3G_SWlws7l6mcWBK3EpNxjzip-sbeERFPb-rQ_MjUmhwG5e3qJZD8hwaDvpDQOnOD6gi7HY8PV7ukHCeYYPY7K3vSXqdc6uRDtHdDN7UtizDlJTurQZOas6rFIB6nGoprEd7KsoBoya2V8QDLlRYgNMNqfxaQqHihQUkjQf_B8x5ibeM70iB-N_RoamD6sq" 
                alt="CinemaLabs" 
              />
              <div>
                <div className="font-headline font-black text-foreground uppercase italic pb-1">CinemaLabs</div>
                <div className="text-primary font-bold text-sm">Level 2 Premium Membership</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Price per Month</span>
              <div className="flex items-center gap-1 font-headline font-bold text-foreground">
                <span>150</span>
                <span className="text-[#fdc003] text-xs">AC</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Platform Fee</span>
              <div className="flex items-center gap-1 font-headline font-bold text-foreground">
                <span>0</span>
                <span className="text-[#fdc003] text-xs">AC</span>
              </div>
            </div>

            <div className="pt-6 border-t border-border/20 flex justify-between items-center">
              <span className="font-headline font-bold text-lg text-foreground">Total Due Now</span>
              <div className="flex items-center gap-1">
                <span className="text-3xl font-headline font-black text-foreground">150</span>
                <span className="text-[#fdc003] font-headline font-bold">AC</span>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-card p-6 rounded-lg border border-border/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Wallet Balance</span>
              <span className="text-foreground font-headline font-bold">1,240 AC</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Balance After Purchase</span>
              <span className="text-[#fdc003] font-bold">1,090 AC</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-muted border-t border-border/30">
          <Button className="w-full h-14 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-headline font-black rounded-sm shadow-[0px_10px_30px_rgba(255,142,128,0.3)] uppercase tracking-[0.2em]">
            Confirm Subscription
          </Button>
          <p className="text-center text-[10px] text-muted-foreground mt-4 leading-relaxed">
            By clicking Confirm, you agree to the Velvet Gallery <a className="underline hover:text-foreground transition-colors" href="#">Terms of Service</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
