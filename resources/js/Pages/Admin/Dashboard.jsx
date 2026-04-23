import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import BarcodeScanner from '@/Components/Admin/BarcodeScanner';

// サマリーカード用の小コンポーネント（コードをスッキリさせるため）
const StatCard = ({ title, value, colorClass, iconPath }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-gradient-to-br from-white to-${colorClass}-50/30`}>
        <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs font-bold text-${colorClass}-900 uppercase tracking-wider`}>{title}</h3>
            <span className={`p-1.5 bg-${colorClass}-600 rounded-lg text-white`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                </svg>
            </span>
        </div>
        <p className="text-2xl font-black text-gray-800">¥{new Intl.NumberFormat('ja-JP').format(value)}</p>
    </div>
);

export default function Dashboard({ auth, stats }) {
    const handleScan = (code) => {
        router.get(route('admin.inspections.scan'), { code: code });
    };

    return (
        <AdminLayout user={auth.user} header="ダッシュボード">
            <Head title="管理者ダッシュボード" />

            {/* 統計セクション */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="総売上 (流通額)" 
                    value={stats.totalGross} 
                    colorClass="emerald" 
                    iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <StatCard 
                    title="システム収益" 
                    value={stats.platformProfit} 
                    colorClass="blue" 
                    iconPath="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
                <StatCard 
                    title="クリエイター分配額" 
                    value={stats.creatorPayout} 
                    colorClass="purple" 
                    iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <StatCard 
                    title="決済手数料(Stripe)" 
                    value={stats.stripeFee} 
                    colorClass="slate" 
                    iconPath="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* クイック検品スキャナー（既存） */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
                    <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        </span>
                        クイック検品スキャン
                    </h3>
                    <BarcodeScanner onScan={handleScan} placeholder="国内配送番号をスキャン..." />
                    <p className="mt-3 text-[10px] text-indigo-400 font-medium text-center">
                        スキャンすると自動的に検品ワークベンチへ移動します
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}