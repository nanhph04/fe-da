import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PACKAGES = [
  {
    id: 1,
    title: "Starter Pack",
    coins: "100 AC",
    price: "100,000 VND",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0FCj8wJqUyxKbeYSla_CwWKzMcvsuDI4T6U3FgKc_X59kZIRrNvxSDdCKSSdtgsE0ztZrZDDmzoTxrJwPkMWinXbrmdkjbG5pF9xrelbkHdXWqm5w-TZhOB6VbKvUTS7UdP2JuPd1bY3pggN7F8QO74Dx2DG9tp-PSOi3zWI74K_gotvrKX8k2geOjgKl_nX9W0yx1d6-DPMBuYEJiALz2H4neeICwJM7eEDphXxV3cljbaJHoncqDzGDodlfN_Dh2gIBlcBLqmJy"
  },
  {
    id: 2,
    title: "Standard Pack",
    coins: "500 AC",
    price: "450,000 VND",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCi9ZNVoS1-mSjX--6bET4jw0kN4gpUtE7udrgoNYg51Yz8bIKZt3NB0A-1i5tNgSfrkGopV8ryyqYly-dLRUspfWKnhbulBvHPlgRfz0qc0IbztidlMRNuXeNL0iLmueFzxBKkyEdGLjCctzAWzDBNqd-m8_9HDgVZ1SJ_MytvDXyoZV7fae6IqNBQuQoETS5Vcz35xu2M5dKW3bRSM6wyAhChOYJb3rHF7jFgRPLTfMv-FOVc6brodqiGFU0hjHkL7kuTTPWwsIz9"
  },
  {
    id: 3,
    title: "Pro Pack",
    coins: "1,000 AC",
    bonus: "+ 50 bonus",
    price: "900,000 VND",
    isPopular: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG_25MnVZ0OtuRZhCCYxz5PN0Gj-TGm1FfayEEuwryucVT7Hh-ntV_Z52KynInyNOLe8FEov2g033pD7Vszr0byFMJIJXlHOz1pot9ftwQ-nonAaof6_6w2QkAy6DoA-Oj1aRG6dTL30taH8CNwr9BNDERNjxlah_epf4mT-R-RIAf_dtEMs5QEoYdBxwPusNFSlWvVz5k-1FYHkqReKk8u8jFUlT06onAETaOFD_HiqU7rLfwPbkSfLYERzwohUIwEQRvTR42Cw-C"
  },
  {
    id: 4,
    title: "Elite Pack",
    coins: "2,500 AC",
    bonus: "+ 200 bonus",
    price: "2,200,000 VND",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcU60qGwWJm5LxjMFG6AqkmWO6wiCx0pjBr1NwVpLMFwcetB8Q-xxJBJ9Ji9MeiCgFzu49GtRQl25pEUG8lmZwO7x-kUG1zjJzclhx6KGGQujwdgwHSsKfpNV1ehbU2d7pG2rnr8rC0bVsVR6whZ7ZAj9DM3Qzr7Isdk2Kbywc6lRk0u7bl1W1Vi2Gok_J2Eu7TJQV4LEiuMa948_Sgr7xAGtfYuDWDN3N00Yl4HlgSFhNf3UV3Mvou2q024VhZoe0IEZ4lp1iF5zB"
  }
];

export function TopUpPackages() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mt-8">
        <h2 className="font-headline text-xl font-bold text-[#f9f5f8]">Top-up Packages</h2>
        <Badge className="bg-[#785900] text-[#fff6ec] rounded-full text-xs font-bold uppercase tracking-tight hover:bg-[#785900]/80">
          Best Value
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACKAGES.map((pkg) => (
          <Card key={pkg.id} className={`group bg-zinc-950/40 border-[#48474a]/20 hover:bg-[#19191c] transition-all duration-300 relative overflow-hidden ${pkg.isPopular ? 'border-[#fdc003]/30 ring-1 ring-[#fdc003]/20 shadow-[0px_10px_30px_rgba(253,192,3,0.1)]' : ''}`}>
            {pkg.isPopular && (
              <div className="absolute top-0 right-0 bg-[#fdc003] text-[#553e00] px-3 py-1 rounded-bl-lg text-[10px] font-black uppercase z-10">
                Most Popular
              </div>
            )}
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <h3 className="font-headline font-bold text-lg mb-1 text-white">{pkg.title}</h3>
              <p className="text-[#fdc003] font-bold text-2xl mb-4">
                {pkg.coins} 
                {pkg.bonus && <span className="text-xs text-[#adaaad] font-medium ml-1">{pkg.bonus}</span>}
              </p>
              
              <div className="mb-6 h-32 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  src={pkg.image} 
                  alt={pkg.title} 
                />
              </div>

              <div className="mt-auto w-full pt-4 border-t border-white/5 flex flex-col gap-4">
                <span className="font-headline font-bold text-lg text-white">{pkg.price}</span>
                <Button 
                  className={`w-full font-bold transition-colors active:scale-95 ${pkg.isPopular ? 'bg-[#fdc003] hover:bg-[#ecb200] text-[#553e00]' : 'bg-[#ff8e80] hover:bg-[#e80f16] text-[#650003]'}`}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
