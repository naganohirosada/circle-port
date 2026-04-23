import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, creator }) {
    const getProductName = (product) => product?.translations?.[0]?.name || product?.name || '名称未設定';
    const getProductImage = (product) => product?.images?.[0]?.url || product?.images?.[0]?.path || null;

    return (
        <AdminLayout user={auth.user} header={`クリエイター詳細: ${creator.name}`}>
            <Head title={`クリエイター詳細 - ${creator.name}`} />

            <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
                {/* ヘッダー・戻るナビ */}
                <div className="flex justify-between items-center">
                    <Link href={route('admin.creators.index')} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2 font-bold transition-colors">
                        ← クリエイター一覧に戻る
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左カラム: プロフィール概要 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 text-3xl font-black mb-4 border-4 border-white shadow-sm">
                                    {creator.name?.substring(0, 1)}
                                </div>
                                <h2 className="text-xl font-black text-gray-900">{creator.name}</h2>
                                <p className="text-sm text-gray-400 font-medium mb-6">{creator.email}</p>
                                
                                <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">公開商品</p>
                                        <p className="text-xl font-black text-gray-900">{creator.products_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">総販売数</p>
                                        <p className="text-xl font-black text-indigo-600">{creator.order_items_count}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-3xl p-8 text-white">
                            <h3 className="text-[11px] font-black text-gray-500 uppercase mb-4 tracking-widest">Account Info</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">クリエイターID</p>
                                    <p className="text-sm font-mono">#{creator.id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">登録日時</p>
                                    <p className="text-sm">{creator.created_at}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右カラム: 商品リスト */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Products / 登録商品リスト</h4>
                                <span className="text-[10px] font-bold text-gray-400">最新10件を表示</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {creator.products && creator.products.length > 0 ? (
                                    creator.products.map((product) => (
                                        <div key={product.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                    {getProductImage(product) ? (
                                                        <img src={getProductImage(product)} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 font-black">NO IMG</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-800 leading-tight">
                                                        {getProductName(product)}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                                                        SKU: {product.sku || '---'} | ¥{new Intl.NumberFormat('ja-JP').format(product.price)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {/* ここに商品の承認状態などを表示可能 */}
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${product.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {product.status === 1 ? '公開中' : '非公開'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-sm text-gray-400 italic">
                                        登録されている商品はありません
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}