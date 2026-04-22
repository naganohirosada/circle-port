import React from 'react';
import { Link } from '@inertiajs/react';

export default function AdminLayout({ user, children, header }) {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* サイドバー */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 shadow-xl">
                <div className="p-6 text-xl font-bold bg-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-xs">CP</div>
                    Admin Portal
                </div>
                <nav className="mt-4">
                    <Link href={route('admin.dashboard')} className={`block py-3 px-6 hover:bg-slate-700 ${route().current('admin.dashboard') ? 'bg-slate-700 border-l-4 border-indigo-500' : ''}`}>
                        ダッシュボード
                    </Link>

                    <div className="px-6 py-2 mt-4 text-xs text-slate-500 uppercase font-bold tracking-wider">物流・検品</div>
                    {/* ↓ 検品画面へのリンクを追加 */}
                    <Link href={route('admin.inspections.index')} className={`block py-3 px-6 hover:bg-slate-700 ${route().current('admin.inspections.*') ? 'bg-slate-700 border-l-4 border-indigo-500' : ''}`}>
                        検品・受領管理
                    </Link>
                    <Link href={route('admin.international-shippings.index')} className={`block py-3 px-6 hover:bg-slate-700 ${route().current('admin.international-shippings.*') ? 'bg-slate-700 border-l-4 border-indigo-500' : ''}`}>
                        国際配送管理
                    </Link>

                    <div className="px-6 py-2 mt-4 text-xs text-slate-500 uppercase font-bold tracking-wider">マスタ管理</div>
                    <Link href={route('admin.warehouses.index')} className={`block py-3 px-6 hover:bg-slate-700 ${route().current('admin.warehouses.*') ? 'bg-slate-700 border-l-4 border-indigo-500' : ''}`}>
                        倉庫管理
                    </Link>
                    <Link href={route('admin.carriers.index')} className={`block py-3 px-6 hover:bg-slate-700 ${route().current('admin.carriers.*') ? 'bg-slate-700 border-l-4 border-indigo-500' : ''}`}>
                        配送業者管理
                    </Link>
                </nav>
            </aside>

            {/* メインエリア */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
                    <h2 className="text-xl font-bold text-gray-800">{header}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900">{user.name}</span>
                            <span className="text-xs text-gray-500">システム管理者</span>
                        </div>
                        <Link href={route('admin.logout')} method="post" as="button" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                            ログアウト
                        </Link>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}