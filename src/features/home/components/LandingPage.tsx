import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/public/PublicHeader";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <PublicHeader currentPath="/landing" subtitle="Public Marketing" />

      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="Cinematic Background"
            src="/images/hero-bg.jpg"
            fill
            className="w-full h-full object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e]/20 via-[#0e0e0e]/80 to-[#0e0e0e]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,142,128,0.1)_0%,transparent_60%)]" />
        </div>

        {/* Badge */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-surface-variant/40 backdrop-blur-md px-4 py-1.5 rounded-full border-[0.5px] border-outline-variant/15">
          <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="text-xs font-medium text-yellow-400 tracking-wider uppercase">
            Premium Access Pass Now Live
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-12 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5rem] font-extrabold leading-[1.05] tracking-[-0.02em] max-w-4xl mb-6">
            The Velvet Gallery:
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
              Cinematic Immersion Redefined
            </span>
          </h1>

          <p className="font-body text-lg md:text-xl text-neutral-400 max-w-2xl mb-10 leading-relaxed">
            Step into the dark room. Experience decentralized, high-fidelity media powered by the Aura Coin economy.
            Where curation meets creator empowerment.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <Link
              href="/library"
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-gradient-to-br from-red-500 to-red-700 text-white font-semibold tracking-wide hover:brightness-110 shadow-[0_20px_40px_rgba(255,142,128,0.3)] transition-all duration-300 flex items-center justify-center space-x-2 relative overflow-hidden group"
            >
              <span className="relative z-10">Enter the Library</span>
              <span className="material-symbols-outlined text-xl relative z-10 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-white/10 backdrop-blur-xl border border-white/10 text-white font-semibold tracking-wide hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                movie
              </span>
              <span>Become a Creator</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#131315] relative">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-lg bg-[#19191c] hover:bg-[#2c2c2f] border border-white/5 hover:border-white/10 transition-colors duration-500 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <span className="material-symbols-outlined text-8xl text-yellow-500">local_activity</span>
              </div>
              <div>
                <div className="w-12 h-12 rounded-sm bg-yellow-500/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-yellow-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_activity
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold mb-4 tracking-[-0.01em]">
                  Exclusive Levels (Lv1-Lv3)
                </h3>
                <p className="font-body text-neutral-400 text-base leading-relaxed">
                  Unlock tiered access to premium content. Ascend from standard viewing to director&apos;s cut
                  exclusives and private screenings.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-lg bg-gradient-to-b from-[#19191c] to-[#0e0e0e] border border-yellow-500/20 hover:border-yellow-500/40 shadow-[0_10px_30px_rgba(253,192,3,0.05)] transition-all duration-500 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,192,3,0.1)_0%,transparent_70%)]" />
              <div>
                <div className="w-12 h-12 rounded-sm bg-yellow-500/20 flex items-center justify-center mb-6 relative z-10">
                  <span className="material-symbols-outlined text-yellow-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    monetization_on
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-yellow-400 mb-4 tracking-[-0.01em] relative z-10">
                  Aura Economy
                </h3>
                <p className="font-body text-neutral-400 text-base leading-relaxed relative z-10">
                  Transact securely with Aura Coins. Support creators directly, purchase viewing
                  rights, and participate in the decentralized economy.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-lg bg-[#19191c] hover:bg-[#2c2c2f] border border-white/5 hover:border-white/10 transition-colors duration-500 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <span className="material-symbols-outlined text-8xl text-red-500">movie</span>
              </div>
              <div>
                <div className="w-12 h-12 rounded-sm bg-red-500/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-red-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    movie
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold mb-4 tracking-[-0.01em]">
                  Creator Studio
                </h3>
                <p className="font-body text-neutral-400 text-base leading-relaxed">
                  Empowering the next generation of filmmakers with high-fidelity hosting,
                  transparent analytics, and direct audience engagement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="CTA Background"
            src="/images/cta-bg.jpg"
            fill
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[#0e0e0e]/80 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-[#0e0e0e]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.02em] mb-6">
            Join the Cinematic Revolution Today
          </h2>
          <p className="font-body text-lg text-neutral-400 mb-12 max-w-2xl">
            Secure your place in The Velvet Gallery. Claim your Aura wallet and start exploring a new era
            of decentralized entertainment.
          </p>
          <Link
            href="/register"
            className="px-10 py-5 rounded-sm bg-gradient-to-br from-red-500 to-red-700 text-white font-bold text-lg tracking-wide hover:brightness-110 shadow-[0_20px_50px_rgba(255,142,128,0.4)] transition-all duration-300"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 px-8 bg-neutral-950">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Logo & Copyright */}
          <div className="flex flex-col space-y-4 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center">
                <span className="material-symbols-outlined text-black text-xl">play_arrow</span>
              </div>
              <span className="text-lg font-bold text-neutral-200 font-headline uppercase tracking-tighter">
                Velvet Gallery
              </span>
            </div>
            <p className="text-sm text-neutral-500 max-w-md leading-relaxed">
              &copy; 2024 Velvet Gallery. The Velvet Gallery philosophy and branding are trademarks of
              Cinematic Immersion.
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col space-y-3">
            <span className="font-semibold text-white mb-2">Platform</span>
            <Link href="/landing" className="text-sm text-neutral-500 hover:text-red-500 transition-colors cursor-pointer w-fit">
              Discover
            </Link>
            <Link href="/library" className="text-sm text-neutral-500 hover:text-red-500 transition-colors cursor-pointer w-fit">
              Library
            </Link>
            <Link href="/onboarding" className="text-sm text-neutral-500 hover:text-red-500 transition-colors cursor-pointer w-fit">
              Creator Studio
            </Link>
          </div>

          {/* Account Links */}
          <div className="flex flex-col space-y-3">
            <span className="font-semibold text-white mb-2">Account</span>
            <Link href="/login" className="text-sm text-neutral-500 hover:text-red-500 transition-colors cursor-pointer w-fit">
              Sign In
            </Link>
            <Link href="/register" className="text-sm text-neutral-500 hover:text-red-500 transition-colors cursor-pointer w-fit">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
