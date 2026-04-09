import Link from "next/link";
import Image from "next/image";

export function TopNav() {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-zinc-950/40 backdrop-blur-xl bg-gradient-to-b from-zinc-900 to-transparent">
      <div className="text-2xl font-black text-red-600 tracking-tighter font-headline">
        Velvet Gallery
      </div>
      <div className="flex items-center gap-8">
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/library" className="text-zinc-400 font-headline tracking-tight font-bold hover:text-white transition-colors duration-300">
            Library
          </Link>
          <Link href="#" className="text-red-500 font-bold font-headline tracking-tight hover:text-white transition-colors duration-300">
            Purchased
          </Link>
          <Link href="#" className="text-zinc-400 font-headline tracking-tight font-bold hover:text-white transition-colors duration-300">
            Subscriptions
          </Link>
          <Link href="#" className="text-zinc-400 font-headline tracking-tight font-bold hover:text-white transition-colors duration-300">
            Wallet
          </Link>
          <Link href="#" className="text-zinc-400 font-headline tracking-tight font-bold hover:text-white transition-colors duration-300 ml-2">
            Switch to Creator
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-zinc-400 hover:text-white cursor-pointer transition-colors">toll</span>
          <span className="material-symbols-outlined text-zinc-400 hover:text-white cursor-pointer transition-colors">notifications</span>
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20">
            {/* Using a placeholder online image URL to match the design faithfully */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="User profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDikpv5v0hj6EMVs8YVv1uB55c3gzdDU6S0z3PLdAvH5sAgG3PBb-0hQIoDQk7iEc3z7X-bkYTnbFi1IOIsYmePNofnXWxQGabvXF9n49k1Rlt26Ncsn4ef1xJv5POM0x0bolheMH0gojxK8VxTFSRVUnK_tphvu3qiHDzK2AebMixAkjpSP3QoD3dDHH52gwg4yh0tcFw0ZTPNZOO3ZP2XSoVzj08NNmQc87iUcZPk457GH6cVhGZXFTlEb6PAvV7N0Zc2WLM4Uo0f" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
