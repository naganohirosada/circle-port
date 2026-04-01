import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingBag, User, Search } from 'lucide-react';

export default function FanLayout({ children }) {
    // Shared Props から cartCount と翻訳関数を取得
    const { cartCount, language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
                        Circle<span className="text-cyan-600">Port</span>
                    </Link>

                    {/* Menu Items */}
                    <div className="flex items-center gap-8">
                        {/* Search Link (例) */}
                        <Link href={route('fan.products.index')} className="text-sm font-bold text-slate-600 hover:text-cyan-600 transition-colors">
                            {__('Artworks')}
                        </Link>

                        {/* --- カートボタンここから --- */}
                        <Link 
                            href={route('fan.cart.index')} 
                            className="relative p-2 text-slate-600 hover:text-cyan-600 transition-all group"
                        >
                            <ShoppingBag size={24} strokeWidth={2} />
                            
                            {/* カートの個数バッジ (1個以上の時だけ表示) */}
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                            
                            {/* ホバー時にツールチップ風のテキスト（任意） */}
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold">
                                {__('Shopping Cart')}
                            </span>
                        </Link>
                        {/* --- カートボタンここまで --- */}

                        <Link href={route('fan.mypage.dashboard')} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:border-cyan-500 hover:text-cyan-600 transition-all">
                            <User size={20} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>
            
            {/* Footer etc... */}
        </div>
    );
}