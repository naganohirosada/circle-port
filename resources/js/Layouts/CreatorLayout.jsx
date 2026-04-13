import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    TrendingUp, 
    Truck, 
    Settings,
    LogOut,
    Menu
} from 'lucide-react';

export default function CreatorLayout({ children }) {
    const { url, component } = usePage();

    const navigation = [
        { 
            name: 'ダッシュボード', 
            href: route('creator.dashboard'), 
            icon: LayoutDashboard,
            active: url.startsWith('/creator/dashboard')
        },
        { 
            name: '作品管理', // 商品管理から名称変更（Inventoryに合わせる）
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
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* サイドバー */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col border-r-8 border-slate-800">
                <div className="p-8">
                    <div className="text-2xl font-black italic tracking-tighter text-cyan-400 mb-1">
                        CP <span className="text-white">STUDIO.</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Creator Portal
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm uppercase transition-all
                                ${item.active 
                                    ? 'bg-cyan-400 text-slate-900 shadow-[4px_4px_0px_#fff]' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            <item.icon size={20} strokeWidth={item.active ? 3 : 2} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/10 space-y-4">
                    <Link href="#" className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase">
                        <Settings size={16} /> 設定
                    </Link>
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="flex items-center gap-3 text-pink-500 hover:text-pink-400 transition-colors text-xs font-black uppercase"
                    >
                        <LogOut size={16} /> ログアウト
                    </Link>
                </div>
            </aside>

            {/* メインコンテンツ */}
            <main className="flex-1 h-screen overflow-y-auto bg-slate-50">
                {children}
            </main>
        </div>
    );
}