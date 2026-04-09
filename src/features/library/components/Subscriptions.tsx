const SUBSCRIPTIONS = [
  {
    id: 1,
    name: "CinemaLabs",
    tier: "Premium Tier",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFEMizfktfwtc0ddlEiJGSbcae6BGNqXFqvHDQGnjfFxoBRuIyrfzysaWkNAUTqWY94CdV0P_5_pWIOzqb0Ghp1tjajOcsZzMlEZylzsyK4ouExJ_Le-yKLrRxJPHU4X8OwPv7HSPTKZDESTFTYRKnQ8GGrXfUEA3lGTGtfRaCLDrnuhou9U9eEw4ixXc4yW15iJA1fZlaYe46v7bd7zT7LC9YMFv7svTnyJctnjT9MGmUm2JO2Jx0a0Ul70na4-2tNQuz98JEZJby"
  },
  {
    id: 2,
    name: "Vivid Motion",
    tier: "Standard Tier",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuArxfb3_GX3x1V3LBlMOhcVntFvkCPyMzwWFjvWjLaTv5bVTkoB4p3jNCzQHLkVZTMreYMvrke3dEAG687fhQ4SxCC-xzDr3QNM4lE-AI__qsStiXmMobNxknRErstQvEBb3m8fMtdEbhgQnZBRRx07YZ6DBDe-qPkSZA-tSgl4wIrHk6oUtOM8-CnCfvVoaonLSTTJtXG7yGDXijcHPDihlQfIWA5deM2DAcL0l3yVLsRVR9oS4O6ATHCz_GthXFL6LSOFvZDL3rtQ"
  },
  {
    id: 3,
    name: "Wanderlust POV",
    tier: "Free Tier",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDATo0Lu26xDzbaSv2cHmbB96t90mpFa-b9swI4OP8JLBxZGubr5vMKuA0oj1iRBV5CTr9tSAlN_VNOoqlLslAmLJTEQrRNloYXRJ_m8p8O_qWDKZpiOhxoAV1HPSntGXYrNfY9sRWUr5xJ2eC0zgVlkx-4w59qVatfTdJLKt0FJHMiwo1Mf13j692lhikNy7zBKhnLRdUjE3Z5IH9MYmCjUmQeV0bmTZy6c_mYhnhMDZoJs2IOrToJCRd05SNyjmanmdz3PNJom-wf"
  }
];

export function Subscriptions() {
  return (
    <div className="lg:col-span-1 space-y-6">
      <h2 className="text-2xl font-headline font-bold text-[#f9f5f8]">Subscriptions</h2>
      <div className="space-y-4">
        {SUBSCRIPTIONS.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-4 bg-[#19191c] rounded-xl hover:bg-[#2c2c2f] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ff8e80]/20 group-hover:border-[#ff8e80] transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  alt={sub.name} 
                  src={sub.avatar}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-headline font-bold text-sm text-[#f9f5f8]">{sub.name}</h4>
                <p className="text-xs text-zinc-500">{sub.tier}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-zinc-600 group-hover:text-zinc-400 transition-colors">more_vert</span>
          </div>
        ))}
      </div>
    </div>
  );
}
