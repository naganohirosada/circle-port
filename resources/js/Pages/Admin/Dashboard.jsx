import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react'; // routerをインポート
import BarcodeScanner from '@/Components/Admin/BarcodeScanner'; // 作成したコンポーネントをインポート

export default function Dashboard({ auth }) {
    const handleScan = (code) => {
        router.get(route('admin.inspections.scan'), { code: code });
    };

    return (
        <AdminLayout user={auth.user} header="ダッシュボード">
            <Head title="管理者ダッシュボード" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* クイック検品スキャナー */}
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

                {/* 他の統計カードなど... */}
            </div>
        </AdminLayout>
    );
}