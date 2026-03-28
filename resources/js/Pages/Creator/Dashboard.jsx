import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Head title="Creator Studio" />

            {/* Sidebar (Pop Style) */}
            <aside className="w-72 bg-slate-950 text-white p-8 flex flex-col border-r-8 border-cyan-500">
                <div className="mb-12">
                    <div className="text-2xl font-black tracking-widest text-cyan-400 underline decoration-4 underline-offset-8 decoration-white/20">CP STUDIO.</div>
                </div>
                
                <nav className="flex-1 space-y-4">
                    <Link href={route('creator.dashboard')} className="block p-4 bg-slate-800 rounded-2xl font-black shadow-[4px_4px_0px_#06B6D4]">DASHBOARD</Link>
                    <Link href={route('creator.products.index')} className="block p-4 hover:bg-slate-800 rounded-2xl font-black transition-all hover:translate-x-2">商品管理</Link>
                    <Link href="#" className="block p-4 hover:bg-slate-800 rounded-2xl font-black transition-all hover:translate-x-2">ORDERS</Link>
                </nav>

                <Link href={route('creator.logout')} method="post" as="button" className="mt-auto text-left font-black text-slate-500 hover:text-cyan-400">
                    LOGOUT →
                </Link>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                            WELCOME TO YOUR STUDIO, <span className="text-cyan-500 italic">{auth.user.shop_name}</span>!
                        </h2>
                    </div>
                    <Link href={route('creator.products.create')} 
                        className="bg-cyan-500 text-white px-8 py-4 rounded-3xl font-black text-lg hover:bg-slate-950 hover:shadow-[8px_8px_0px_#A5F3FC] transition-all transform active:scale-95">
                        + NEW ITEM 🖊
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stats Card */}
                    <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_#E2E8F0]">
                        <div className="text-slate-400 font-black text-xs uppercase mb-1 tracking-widest">Total Sales</div>
                        <div className="text-3xl font-black text-slate-800">¥ 124,500</div>
                    </div>
                    {/* Stats Card */}
                    <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_#E2E8F0]">
                        <div className="text-slate-400 font-black text-xs uppercase mb-1 tracking-widest">Active GOs</div>
                        <div className="text-3xl font-black text-slate-800">12 Projects</div>
                    </div>
                </div>

                {/* Placeholder for Recent Activity */}
                <div className="mt-12 bg-white rounded-[2.5rem] border-4 border-slate-900 p-10 h-64 flex items-center justify-center border-dashed">
                    <p className="font-black text-slate-200 text-4xl italic uppercase">Recent Activity Coming Soon...</p>
                </div>
            </main>
        </div>
    );
}