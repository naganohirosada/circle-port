import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function CreatorLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* 固定サイドバー */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col border-r-8 border-cyan-400 sticky top-0 h-screen">
                <div className="p-8">
                    <div className="text-2xl font-black tracking-widest text-cyan-400 underline decoration-4 underline-offset-8">
                        CP STUDIO.
                    </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-2">
                    <Link href={route('creator.dashboard')} 
                          className={`block p-4 rounded-2xl font-black transition-all ${route().current('creator.dashboard') ? 'bg-cyan-500 text-slate-900 shadow-[4px_4px_0px_#fff]' : 'hover:bg-slate-800'}`}>
                        DASHBOARD
                    </Link>
                    <Link href={route('creator.products.index')} 
                          className={`block p-4 rounded-2xl font-black transition-all ${route().current('creator.products.*') ? 'bg-cyan-500 text-slate-900 shadow-[4px_4px_0px_#fff]' : 'hover:bg-slate-800'}`}>
                        MY PRODUCTS
                    </Link>
                    <Link href="#" className="block p-4 hover:bg-slate-800 rounded-2xl font-black text-slate-500">
                        ORDERS (Soon)
                    </Link>
                </nav>

                <div className="p-8 mt-auto border-t border-slate-800">
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Logged in as</div>
                    <div className="font-black text-cyan-400 truncate mb-4">{auth.user.shop_name}</div>
                    <Link href={route('creator.logout')} method="post" as="button" className="text-slate-400 hover:text-white font-black text-sm">
                        LOGOUT →
                    </Link>
                </div>
            </aside>

            {/* メインコンテンツエリア */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}