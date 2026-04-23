import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, products }) {
    const getStatusBadge = (status) => {
        const config = {
            1: { label: "下書き", style: "bg-gray-100 text-gray-500 border-gray-200" },
            5: { label: "承認待ち", style: "bg-amber-100 text-amber-700 border-amber-200 font-black animate-pulse" },
            2: { label: "公開中", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            3: { label: "非公開", style: "bg-gray-200 text-gray-600 border-gray-300" },
            6: { label: "却下済み", style: "bg-rose-50 text-rose-600 border-rose-100" },
            9: { label: "完売", style: "bg-black text-white border-black" },
        };
        const active = config[status] || { label: `不明(${status})`, style: "bg-white" };
        return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${active.style}`}>{active.label}</span>;
    };

    return (
        <AdminLayout user={auth.user} header="商品承認・管理">
            <Head title="商品管理" />
            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-4">商品名 / クリエイター</th>
                                <th className="p-4">SKU / カテゴリ</th>
                                <th className="p-4 text-center">ステータス</th>
                                <th className="p-4">登録日</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="text-sm font-black text-gray-900">{product.translations?.[0]?.name || product.name}</div>
                                        <div className="text-[10px] text-indigo-500 font-bold">{product.creator?.name}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-[10px] font-mono text-gray-400">{product.sku}</div>
                                        <div className="text-xs text-gray-500">CATEGORY_ID: {product.category_id}</div>
                                    </td>
                                    <td className="p-4 text-center">{getStatusBadge(product.status)}</td>
                                    <td className="p-4 text-xs text-gray-400 font-mono">{product.created_at}</td>
                                    <td className="p-4 text-right">
                                        <Link href={route('admin.products.show', product.id)} className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                                            詳細・承認
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