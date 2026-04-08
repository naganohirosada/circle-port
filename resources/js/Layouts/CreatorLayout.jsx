import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    CreditCard, 
    LogOut,
    ExternalLink,
    Settings
} from 'lucide-react';

export default function CreatorLayout({ children }) {
    const { auth } = usePage().props;

    // ナビゲーション項目
    const navItems = [
        { 
            label: 'ダッシュボード', 
            href: route('creator.dashboard'), 
            active: route().current('creator.dashboard'),
            icon: LayoutDashboard 
        },
        { 
            label: '商品管理', 
            href: route('creator.products.index'), 
            active: route().current('creator.products.*'),
            icon: Package 
        },
        { 
            label: '精算管理', 
            href: '#', // 後の実装用
            active: false,
            icon: CreditCard,
            soon: true
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* 固定サイドバー */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col border-r-8 border-cyan-400 sticky top-0 h-screen shadow-2xl">
                {/* ロゴエリア */}
                <div className="p-10">
                    <div className="text-3xl font-black tracking-tighter text-cyan-400 italic">
                        CP STUDIO<span className="text-white">.</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">
                        Creator Portal
                    </div>
                </div>
                
                {/* メインナビゲーション */}
                <nav className="flex-1 px-6 space-y-3">
                    {navItems.map((item) => (
                        <Link 
                            key={item.label}
                            href={item.href} 
                            className={`
                                group flex items-center gap-4 p-4 rounded-2xl font-black text-sm transition-all duration-200
                                ${item.active 
                                    ? 'bg-cyan-500 text-slate-900 shadow-[6px_6px_0px_rgba(255,255,255,1)] translate-x-1' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }
                                ${item.soon ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <item.icon size={20} strokeWidth={item.active ? 3 : 2} />
                            <span className="tracking-tight">{item.label}</span>
                            {item.soon && (
                                <span className="text-[8px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded ml-auto">
                                    SOON
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* 下部：ユーザー情報 & ログアウト */}
                <div className="p-8 mt-auto bg-slate-950/50 border-t border-slate-800">
                    <div className="mb-6">
                        <div className="text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">ログイン中のショップ</div>
                        <div className="font-black text-white truncate text-lg tracking-tight">
                            {auth.user.shop_name || auth.user.name}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link 
                            href="/" 
                            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            <ExternalLink size={14} /> サイトを表示
                        </Link>
                        
                        <Link 
                            href={route('creator.logout')} 
                            method="post" 
                            as="button" 
                            className="flex items-center gap-2 text-xs font-black text-rose-400 hover:text-rose-300 transition-colors mt-2"
                        >
                            <LogOut size={14} /> ログアウト
                        </Link>
                    </div>
                </div>
            </aside>

            {/* メインコンテンツエリア */}
            <main className="flex-1 overflow-y-auto">
                {/* ページ上部の装飾的なバー */}
                <div className="h-2 bg-white border-b border-slate-100"></div>
                <div className="p-2">
                    {children}
                </div>
            </main>
        </div>
    );
}