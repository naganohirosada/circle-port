import React, { useState } from 'react'; // useStateを追加
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    TrendingUp, 
    Truck, 
    Settings,
    LogOut,
    Layers,
    Menu,
    ChevronDown,    // 追加
    UserCircle,     // 追加
    CreditCard,
    Star
} from 'lucide-react';

export default function CreatorLayout({ children }) {
    const { url } = usePage();
    // 設定メニューの開閉状態（初期値はURLが設定関連なら開いておく）
    const [isSettingsOpen, setIsSettingsOpen] = useState(url.startsWith('/creator/settings'));

    const navigation = [
        { 
            name: 'ダッシュボード', 
            href: route('creator.dashboard'), 
            icon: LayoutDashboard,
            active: url.startsWith('/creator/dashboard')
        },
        { 
            name: 'プロジェクト管理', 
            href: route('creator.project.index'), 
            icon: Layers,
            active: url.startsWith('/creator/project') || route().current('creator.project.*')
        },
        { 
            name: '作品管理', 
            href: route('creator.products.index'), 
            active: route().current('creator.products.*'),
            icon: Package 
        },
        { 
            name: '製作管理', 
            href: route('creator.production.index'), 
            icon: Package, 
            active: url.startsWith('/creator/production')
        },
        { 
            name: '売上管理', 
            href: route('creator.sales.index'), 
            icon: TrendingUp,
            active: url.startsWith('/creator/sales')
        },
        { 
            name: '配送管理', 
            href: route('creator.shipping.index'), 
            icon: Truck,
            active: url.startsWith('/creator/shipping')
        },
        { 
            name: 'レビュー管理', 
            href: route('creator.reviews.index'), 
            icon: Star, 
            active: url.startsWith('/creator/reviews') || route().current('creator.reviews.*')
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            <aside className="w-72 bg-slate-900 text-white flex flex-col border-r-8 border-slate-800 shrink-0">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#fff]">
                            <Package className="text-slate-900" size={24} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-tighter">Creator</h1>
                            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase transition-all
                                ${item.active 
                                    ? 'bg-cyan-400 text-slate-900 shadow-[4px_4px_0px_#fff] translate-x-1' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            <item.icon size={20} strokeWidth={item.active ? 3 : 2} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* 下部設定セクション：既存の p-8 border-t 構造を維持 */}
                <div className="p-8 border-t border-white/10 space-y-2">
                    {/* 設定親ボタン：他のメニューと高さを合わせる */}
                    <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`
                            flex items-center justify-between w-full px-6 py-4 rounded-2xl text-xs font-black uppercase transition-all
                            ${isSettingsOpen ? 'text-white bg-white/5' : 'text-slate-500 hover:text-white'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={16} /> 
                            <span>設定</span>
                        </div>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* サブメニュー：展開時にリストを表示 */}
                    {isSettingsOpen && (
                        <div className="pl-4 space-y-1 animate-in fade-in slide-in-from-top-1">
                            <Link 
                                href={route('creator.settings.profile')} 
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${url.startsWith('/creator/settings/profile') ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-white'}`}
                            >
                                <UserCircle size={14} /> プロフィール編集
                            </Link>
                            <Link 
                                href={route('creator.settings.bank')} 
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${url.startsWith('/creator/settings/bank') ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-white'}`}
                            >
                                <CreditCard size={14} /> 振込先設定
                            </Link>
                        </div>
                    )}

                    {/* ログアウト：既存のスタイルを維持 */}
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="flex items-center gap-3 text-pink-500 hover:text-pink-400 transition-colors text-xs font-black uppercase w-full text-left px-6 py-4"
                    >
                        <LogOut size={16} /> ログアウト
                    </Link>
                </div>
            </aside>

            <main className="flex-1 h-screen overflow-y-auto bg-slate-50">
                {children}
            </main>
        </div>
    );
}