import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/public/PublicHeader";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader currentPath="/landing" />

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
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.12)_0%,transparent_60%)]" />
        </div>

        {/* Badge */}
        <div className="absolute top-32 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/15 bg-card/40 px-4 py-1.5 backdrop-blur-md">
          <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="text-xs font-medium tracking-wider text-secondary uppercase">
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

          <p className="font-body mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Step into the dark room. Experience decentralized, high-fidelity media powered by the Aura Coin economy.
            Where curation meets creator empowerment.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <Link
              href="/library"
              className="group relative flex w-full items-center justify-center space-x-2 overflow-hidden rounded-sm bg-gradient-to-br from-primary to-primary/75 px-8 py-4 font-semibold tracking-wide text-primary-foreground shadow-[0_20px_40px_rgba(229,9,20,0.25)] transition-all duration-300 hover:brightness-110 sm:w-auto"
            >
              <span className="relative z-10">Explore the Vault</span>
              <span className="material-symbols-outlined text-xl relative z-10 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/onboarding"
              className="flex w-full items-center justify-center space-x-2 rounded-sm border border-border/15 bg-card/40 px-8 py-4 font-semibold tracking-wide text-foreground backdrop-blur-xl transition-all duration-300 hover:bg-muted sm:w-auto"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
              <span>Watch Trailer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-card py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-lg border border-border/15 bg-card px-8 py-8 transition-colors duration-500 hover:bg-muted">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <span className="material-symbols-outlined text-8xl text-secondary">local_activity</span>
              </div>
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-sm bg-secondary/10">
                  <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_activity
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold mb-4 tracking-[-0.01em]">
                  Exclusive Levels (Lv1-Lv3)
                </h3>
                <p className="font-body text-base leading-relaxed text-muted-foreground">
                  Unlock tiered access to premium content. Ascend from standard viewing to director&apos;s cut
                  exclusives and private screenings.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-lg border border-secondary/20 bg-gradient-to-b from-card to-background shadow-[0_10px_30px_rgba(251,191,36,0.05)] transition-all duration-500 hover:border-secondary/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1)_0%,transparent_70%)]" />
              <div>
                <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-sm bg-secondary/20">
                  <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    monetization_on
                  </span>
                </div>
                <h3 className="relative z-10 mb-4 font-display text-2xl font-bold tracking-[-0.01em] text-secondary">
                  Aura Economy
                </h3>
                <p className="relative z-10 font-body text-base leading-relaxed text-muted-foreground">
                  Transact securely with Aura Coins. Support creators directly, purchase viewing
                  rights, and participate in the decentralized economy.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-lg border border-border/15 bg-card px-8 py-8 transition-colors duration-500 hover:bg-muted">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <span className="material-symbols-outlined text-8xl text-primary">movie</span>
              </div>
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                  <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    movie
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold mb-4 tracking-[-0.01em]">
                  Creator Studio
                </h3>
                <p className="font-body text-base leading-relaxed text-muted-foreground">
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
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.02em] mb-6">
            Join the Cinematic Revolution Today
          </h2>
          <p className="mb-12 max-w-2xl font-body text-lg text-muted-foreground">
            Secure your place in The Velvet Gallery. Claim your Aura wallet and start exploring a new era
            of decentralized entertainment.
          </p>
          <Link
            href="/register"
            className="rounded-sm bg-gradient-to-br from-primary to-primary/75 px-10 py-5 text-lg font-bold tracking-wide text-primary-foreground shadow-[0_20px_50px_rgba(229,9,20,0.3)] transition-all duration-300 hover:brightness-110"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-neutral-950/80 px-8 py-16 shadow-inner shadow-black">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Logo & Copyright */}
          <div className="flex flex-col space-y-4 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-white">
                <span className="material-symbols-outlined text-black text-xl">play_arrow</span>
              </div>
              <span className="text-lg font-bold text-neutral-200 font-headline uppercase tracking-tighter">
                Velvet Gallery
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-500">
              &copy; 2024 Velvet Gallery. The Velvet Gallery philosophy and branding are trademarks of
              Cinematic Immersion.
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col space-y-3">
            <span className="mb-2 font-semibold text-white">Platform</span>
            <Link href="/landing" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/onboarding" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              Creators
            </Link>
            <Link href="/login" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              Help Center
            </Link>
          </div>

          {/* Account Links */}
          <div className="flex flex-col space-y-3">
            <span className="mb-2 font-semibold text-white">Account</span>
            <Link href="/login" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/register" className="w-fit text-sm text-neutral-500 transition-colors hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
