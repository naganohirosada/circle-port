import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, creators }) {
    return (
        <AdminLayout user={auth.user} header="クリエータ管理">
            <Head title="クリエータ管理" />

            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-4">クリエイター名</th>
                                <th className="p-4">メールアドレス</th>
                                <th className="p-4 text-center">公開商品数</th>
                                <th className="p-4 text-center">総受注数</th>
                                <th className="p-4">登録日</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {creators.data.map((creator) => (
                                <tr key={creator.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {creator.name?.substring(0, 1)}
                                            </div>
                                            <span className="font-bold text-gray-900">{creator.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{creator.email}</td>
                                    <td className="p-4 text-center font-bold text-gray-700">{creator.products_count}</td>
                                    <td className="p-4 text-center font-bold text-gray-700">{creator.orders_count}</td>
                                    <td className="p-4 text-xs text-gray-400 font-mono">{creator.created_at}</td>
                                    <td className="p-4 text-right">
                                        <Link href={route('admin.creators.show', creator.id)} className="text-xs font-black text-indigo-600 hover:underline">
                                            詳細
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}