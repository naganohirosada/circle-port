import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';

export default function FanLayout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* --- Header: 洗練された一本線のナビゲーション --- */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                    
                    {/* Logo: 墨色でタイポグラフィ重視 */}
                    <Link href="/" className="text-2xl font-light tracking-[0.2em] uppercase">
                        Circle<span className="font-bold text-cyan-600">Port</span>
                    </Link>

                    {/* Desktop Menu: 余白を広く取った配置 */}
                    <div className="hidden md:flex items-center gap-12 text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500">
                        <Link href={route('fan.products.index')} className="hover:text-cyan-600 transition-colors">Artworks</Link>
                        <Link href="#" className="hover:text-cyan-600 transition-colors">Creators</Link>
                        <Link href="#" className="hover:text-cyan-600 transition-colors">About</Link>
                    </div>

                    {/* Action Icons: 記号的でスマートな配置 */}
                    <div className="flex items-center gap-6">
                        <button className="p-2 hover:text-cyan-600 transition-colors">
                            <Search size={20} strokeWidth={1.5} />
                        </button>
                        <Link href="#" className="p-2 hover:text-cyan-600 transition-colors relative">
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            {/* カートのバッジも最小限に */}
                            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                        </Link>
                        <Link href="#" className="hidden md:block p-2 hover:text-cyan-600 transition-colors">
                            <User size={20} strokeWidth={1.5} />
                        </Link>
                        
                        {/* Mobile Menu Button */}
                        <button 
                            className="md:hidden p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-24 px-8 space-y-8 text-2xl font-light">
                    <Link href={route('fan.products.index')} className="block border-b border-slate-100 pb-4">Artworks</Link>
                    <Link href="#" className="block border-b border-slate-100 pb-4">Creators</Link>
                    <Link href="#" className="block border-b border-slate-100 pb-4">About</Link>
                    <Link href="#" className="block border-b border-slate-100 pb-4">My Account</Link>
                </div>
            )}

            {/* --- Main Content: 背景にノイズや装飾を入れず、作品を主役にする --- */}
            <main className="relative">
                {children}
            </main>

            {/* --- Footer: 控えめで上品なフッター --- */}
            <footer className="border-t border-slate-100 py-20 bg-slate-50">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <p className="text-xl font-light tracking-wider mb-6">CirclePort</p>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            Connecting Japanese creators with fans worldwide. <br />
                            Experience the authentic culture, directly from the studio.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-6">Help</h4>
                        <ul className="text-sm text-slate-400 space-y-4 font-light">
                            <li><Link href="#">Shipping Policy</Link></li>
                            <li><Link href="#">Payment Methods</Link></li>
                            <li><Link href="#">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-6">Social</h4>
                        <ul className="text-sm text-slate-400 space-y-4 font-light">
                            <li><a href="#">Instagram</a></li>
                            <li><a href="#">X (Twitter)</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-[1400px] mx-auto px-6 mt-20 text-[10px] text-slate-300 font-bold tracking-widest uppercase">
                    &copy; 2026 CirclePort. All rights reserved.
                </div>
            </footer>
        </div>
    );
}