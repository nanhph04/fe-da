import Link from "next/link";
import Image from "next/image";

const WATCH_HISTORY = [
  {
    id: 1,
    title: "Neon Dreams: Vol II",
    remaining: "24m remaining",
    quality: "4K HDR",
    progress: 75,
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBraWyxtIOyJ4X5MMdU1JszScFUpU9Z5ppJqB7ce16hwl1KfUMeEFVkuOUhnPUdgWqD8344tvFAXJWDc3OikRTxAB_0RCi-7QBHSNyDg38UCEQrmx7vslmRLgovPqrlm7pPz0cqSDrcIfB7FKAVUVE3jGLkBOBxZNHzsFSe02AIdx_Dt366Au9eSCaz2Y2gxVH6oPg6eu9-f4Kt5TP6e9vSo0do757sIfUjv_zaQTTsvRh-PUtS5GA4mklfhEG4oi_nXmlbns921MAr"
  },
  {
    id: 2,
    title: "The Architect's Silence",
    remaining: "1h 12m remaining",
    quality: "8K",
    progress: 40,
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-_ww0K4i5UW9K1vvlAYP-0PcyAusS2cROQfg0uLd70Z0UnQp30a6Bz_DfuqNJuJGd5gGZWaB5YmwFzQInYbwlU2Lltp3UIokNeIpZKxIVFvtwa8_ZiXB94two8d2xfjM4KHFI8IdnPRkoDXfOiOgOA2F9ZWJgYP3cMGNvEonvHiPtRnK5OwkSZZgyhndMnYdtYtkXih9MVmVjrs1zJyExZBC0YJzbV4DrwWGLz-lAu_-mbdLow97xOHC-AaXv1CRj6e645wJpeEoR"
  },
  {
    id: 3,
    title: "Void Horizon",
    remaining: "5m remaining",
    quality: "Dolby Vision",
    progress: 90,
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfxQAR7CXTp4p-sFYaB2Olz-gK1gZYmAO-noAkOOEEPHx2UOtnuVwopr6qZK2cmxkxtotI4_X7ZWmiU2tasrCRCSJuDKFOPGqBDp6YnChkoa4dTtM13kCr_2vWiykLA_r6E-HcBZMuIzQhzyYUlB1T4grdCbgB-U3oYL0VO6Ko72XKh3qmLQP0w7EzdW9LwQVPFXpV3iuptYP9ZIFA2brBSPw2DgiHXO7rCVINNy8sh_jMzJPfAr5kEdfmioy5iiY48nfKCx7R5i_U"
  }
];

export function RecentlyWatched() {
  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-headline font-bold text-[#f9f5f8]">Recently Watched</h2>
        <Link href="#" className="text-[#ff8e80] text-sm font-bold hover:underline">
          View All
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x">
        {WATCH_HISTORY.map((item) => (
          <div key={item.id} className="min-w-[320px] group cursor-pointer snap-start">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-[#19191c] mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                alt={item.title} 
                src={item.cover}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-800">
                <div className="h-full bg-[#ff8e80]" style={{ width: `${item.progress}%` }}></div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </div>
              </div>
            </div>
            
            <h3 className="font-headline font-bold text-lg group-hover:text-[#ff8e80] transition-colors">{item.title}</h3>
            <p className="text-zinc-500 text-sm">{item.remaining} &bull; {item.quality}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
