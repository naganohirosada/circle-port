import React from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, shippings = [] }) {
    // ステータスに応じた色設定
    const statusColors = {
        'preparing': 'bg-amber-100 text-amber-800',
        'shipped': 'bg-blue-100 text-blue-800',
        'arrived': 'bg-indigo-100 text-indigo-800',
        'received': 'bg-emerald-100 text-emerald-800',
        'inspecting': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-gray-100 text-gray-800',
    };

    return (
        <CreatorLayout user={auth.user}>
            <Head title="国内配送管理" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">国内配送管理</h2>
                        
                        <div className="flex space-x-3">

                            {/* 【追加】新規作品の倉庫一括納品登録ボタン */}
                            <Link href={route('creator.shipping.stock_in')}>
                                <button className="bg-indigo-600 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                    ✨ 新規作品・追加在庫の納品登録
                                </button>
                            </Link>

                            {/* 通常注文用の登録ボタン */}
                            <Link href={route('creator.shipping.regular')}>
                                <SecondaryButton>
                                    通常注文の配送登録
                                </SecondaryButton>
                            </Link>

                            {/* GO注文用の登録ボタン */}
                            <Link href={route('creator.shipping.go')}>
                                <PrimaryButton>
                                    GO注文の配送登録
                                </PrimaryButton>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配送ID / 日付</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">送り先倉庫</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配送業者 / 追跡番号</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {shippings && shippings.length > 0 ? (
                                            shippings.map((shipping) => (
                                                <tr key={shipping.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">#{shipping.id}</div>
                                                        <div className="text-xs text-gray-500">{shipping.shipping_date}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {/* 【修正】stock_in 納品プラン用の条件分岐表示 */}
                                                        {shipping.shipping_type === 30 || shipping.type === 'stock_in' ? (
                                                            <span className="px-3 py-1 inline-flex text-[10px] leading-5 font-black rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
                                                                📦 倉庫への納品
                                                            </span>
                                                        ) : (
                                                            <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black rounded-full uppercase tracking-wider ${shipping.type === 'go' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                                {shipping.type === 'go' ? 'GO注文発送' : '通常注文発送'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {shipping.warehouse?.name || '未指定'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div>{shipping.carrier?.name}</div>
                                                        <div className="text-xs text-indigo-600 font-mono">{shipping.tracking_number || '(番号なし)'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[shipping.status] || 'bg-gray-100'}`}>
                                                            {shipping.status_label || shipping.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Link href={route('creator.shipping.show', shipping.id)} className="text-indigo-600 hover:text-indigo-900">
                                                            詳細
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                                    配送データが見つかりません。
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CreatorLayout>
    );
}