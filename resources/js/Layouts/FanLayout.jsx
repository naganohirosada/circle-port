import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingBag, User, Search, LogOut } from 'lucide-react';

export default function FanLayout({ children }) {
    // Shared Props から必要な情報を取得
    const { cartCount, language, auth } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // 「ファンとしてログインしているか」を判定
    const isFan = !!auth.fan;

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    
                    {/* Logo */}
                    <Link href={route('fan.products.index')} className="text-2xl font-black tracking-tighter text-slate-900">
                        Circle<span className="text-cyan-600">Port</span>
                    </Link>

                    {/* Menu Items */}
                    <div className="flex items-center gap-6 md:gap-8">
                        {/* カートボタン */}
                        <Link 
                            href={route('fan.cart.index')} 
                            className="relative p-2 text-slate-600 hover:text-cyan-600 transition-all group"
                        >
                            <ShoppingBag size={24} strokeWidth={2} />
                            
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                            
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold">
                                {__('Shopping Cart')}
                            </span>
                        </Link>

                        {/* マイページボタン */}
                        <Link 
                            href={route('fan.mypage.dashboard')} 
                            className="relative w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:border-cyan-500 hover:text-cyan-600 hover:bg-white transition-all group"
                        >
                            <User size={20} />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold">
                                {__('My Page')}
                            </span>
                        </Link>

                        {/* --- ログアウトボタン (Fanとして認証済みの場合のみ表示) --- */}
                        {isFan && (
                            <Link
                                href={route('fan.logout')}
                                method="post"
                                as="button"
                                className="flex items-center gap-2 ..."
                            >
                                <LogOut size={16} />
                                <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.15em]">
                                    {__('Logout')}
                                </span>
                            </Link>
                        )}

                        {/* --- 逆にログインしていない場合に「Login」ボタンを出すなら --- */}
                        {!isFan && (
                            <Link href={route('fan.login')} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-cyan-600">
                                {__('Login')}
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative">
                {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-100 py-12 mt-20">
                <div className="max-w-[1400px] mx-auto px-6 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        &copy; 2026 CirclePort Project. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}