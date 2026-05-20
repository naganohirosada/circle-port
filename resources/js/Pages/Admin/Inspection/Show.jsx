import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Show({ auth, shipping }) {
    const { post, processing } = useForm();
    
    // 全ての商品にチェックが入っているか管理
    const [checkedItems, setCheckedItems] = useState({});

    const handleCheck = (id) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isAllChecked = shipping.items.length > 0 && shipping.items.every(item => checkedItems[item.id]);

    const isStockIn = shipping.shipping_type === 30;

    const submit = (e) => {
        e.preventDefault();
        const confirmMessage = isStockIn
            ? '新規作品・追加在庫の受領および検品を完了しますか？\n完了すると倉庫の実在庫が確定し、ショップへ自動的に【公開中】として公開・販売開始されます。🚀'
            : '受領および検品を完了しますか？\n完了すると在庫化（at_warehouse）が行われ、国際配送用の梱包スロットデータが生成されます。';

        if (confirm(confirmMessage)) {
            post(route('admin.inspections.complete', shipping.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header={`検品ワークベンチ - 配送 #${shipping.id}`}>
            <Head title={`配送 #${shipping.id} 検品`} />

            <div className="w-full flex flex-col lg:flex-row gap-8">
                {/* 左カラム: 配送概要 */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">配送・入庫プラン情報</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">発送元クリエイター</label>
                                <p className="font-bold text-gray-900">{shipping.creator?.name}</p>
                            </div>
                            {/* 【コア拡張】コンテキスト表示の3パターン出し分け */}
                            <div>
                                <label className="text-[10px] text-gray-400 block uppercase font-black tracking-wider">対象コンテキスト</label>
                                {isStockIn ? (
                                    <p className="font-black text-indigo-600 mt-0.5 bg-indigo-50 px-3 py-1.5 rounded-xl inline-block text-xs border border-indigo-100">
                                        📦 新規作品の倉庫納品プラン
                                    </p>
                                ) : shipping.order_id ? (
                                    <p className="font-black text-orange-600 mt-0.5 bg-orange-50 px-3 py-1.5 rounded-xl inline-block text-xs border border-orange-100">
                                        🛒 通常注文: #{shipping.order_id}
                                    </p>
                                ) : (
                                    <p className="font-black text-purple-600 mt-0.5 bg-purple-50 px-3 py-1.5 rounded-xl inline-block text-xs border border-purple-100">
                                        🔮 GO注文: {shipping.group_order?.title || '共同購入プロジェクト'}
                                    </p>
                                )}
                            </div>

                            {/* 注文コンテキストの表示 */}
                            <div>
                                <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">対象注文</label>
                                {shipping.order_id ? (
                                    <p className="font-medium text-indigo-600">通常注文: #{shipping.order_id}</p>
                                ) : (
                                    <p className="font-medium text-purple-600">GO注文: {shipping.group_order?.title}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">配送業者</label>
                                    <p className="font-medium">{shipping.carrier?.name || '未設定'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">追跡番号</label>
                                    <p className="font-mono text-indigo-600 font-bold">{shipping.tracking_number || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">送り先倉庫</label>
                                <p className="font-medium text-gray-700">{shipping.warehouse?.name}</p>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100">
                            {shipping.status === 20 ? ( // STATUS_SHIPPED
                                <PrimaryButton 
                                    onClick={submit} 
                                    disabled={processing || !isAllChecked} 
                                    className={`w-full justify-center py-4 text-lg rounded-xl shadow-lg transition-all ${!isAllChecked ? 'opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                                >
                                    検品・受領を完了する
                                </PrimaryButton>
                            ) : (
                                <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 font-bold border border-dashed border-gray-300">
                                    この配送は処理済みです
                                </div>
                            )}
                            {!isAllChecked && shipping.status === 20 && (
                                <p className="mt-3 text-xs text-red-500 text-center font-semibold">
                                    ※全ての内容物の現物確認チェックを入れてください
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 右カラム: 内容物リスト */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">現物内容物 照合パッキングリスト ({shipping.items.length} 項目)</h3>
                            {/* 【コア拡張】照合見出しバッジの3分岐 */}
                            <span className={`text-[10px] px-4 py-1.5 rounded-full font-black border uppercase tracking-wider ${isStockIn ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : shipping.order_id ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                                タイプ: {isStockIn ? '新規作品入庫' : shipping.order_id ? '通常注文分' : 'GO同梱分'}
                            </span>
                        </div>
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-3 text-left">商品名・バリエーション</th>
                                    <th className="px-6 py-3 text-center">予定数量</th>
                                    <th className="px-6 py-3 text-center">現物確認</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {shipping.items.map((item) => {
                                    const primaryImage = item.product?.images?.[0]?.file_path;

                                    return (
                                        <tr key={item.id} className={`transition-colors ${checkedItems[item.id] ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                                                        {primaryImage ? (
                                                            <img 
                                                                src={`/storage/${primaryImage}`} 
                                                                className="w-full h-full object-cover" 
                                                                alt="Preview"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 font-black bg-gray-100 uppercase tracking-tighter">
                                                                NO IMAGE
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {/* 商品名 */}
                                                        <div className="font-black text-gray-900 text-sm leading-snug">
                                                            {item.product?.translations?.[0]?.name || '名称未設定の作品'}
                                                        </div>
                                                        {/* バリエーション名称 */}
                                                        {item.variation && (
                                                            <div className="text-[10px] text-indigo-600 mt-1 font-black uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                                                バリエーション: {item.variation.translations?.[0]?.variant_name || 'Default Title'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-2xl font-black text-slate-800 font-mono">{item.quantity}</div>
                                                <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">items</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleCheck(item.id)}
                                                    disabled={shipping.status !== 20}
                                                    className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${checkedItems[item.id] ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white border-gray-200 text-gray-200 hover:border-indigo-400 hover:text-indigo-500 active:scale-90 disabled:opacity-50'}`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}