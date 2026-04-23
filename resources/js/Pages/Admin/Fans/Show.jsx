import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, fan }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    return (
        <AdminLayout user={auth.user} header={`ファン詳細: ${fan.name}`}>
            <Head title={`ファン詳細 - ${fan.name}`} />

            <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
                <div className="flex justify-between items-center">
                    <Link href={route('admin.fans.index')} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2 font-bold transition-colors">
                        ← ファン一覧に戻る
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左カラム: ユーザープロフ & 統計 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-2xl font-black mb-4 border-2 border-rose-100">
                                    {fan.name?.substring(0, 1)}
                                </div>
                                <h2 className="text-xl font-black text-gray-900">{fan.name}</h2>
                                <p className="text-sm text-gray-400 font-medium">{fan.email}</p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">注文回数</p>
                                    <p className="text-xl font-black text-gray-900">{fan.orders_count}回</p>
                                </div>
                                <div className="text-center border-l">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">累計利用額</p>
                                    <p className="text-xl font-black text-rose-500">¥{formatCurrency(fan.orders_sum_total_amount)}</p>
                                </div>
                            </div>
                        </div>

                        {/* 登録住所一覧 */}
                        <div className="bg-gray-900 rounded-3xl p-8 text-white">
                            <h3 className="text-[11px] font-black text-gray-500 uppercase mb-6 tracking-widest">Saved Addresses / 配送先住所</h3>
                            <div className="space-y-4">
                                {fan.shipping_addresses?.map((addr) => (
                                    <div key={addr.id} className="text-xs p-4 bg-gray-800 rounded-2xl border border-gray-700">
                                        <p className="font-bold text-gray-300 mb-1">{addr.name} 宛</p>
                                        <p className="text-gray-500">{addr.postal_code}</p>
                                        <p className="text-gray-400 leading-relaxed">{addr.country} {addr.state} {addr.city} {addr.address1}</p>
                                    </div>
                                ))}
                                {(!fan.shipping_addresses || fan.shipping_addresses.length === 0) && (
                                    <p className="text-xs text-gray-500 italic text-center">住所の登録はありません</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 右カラム: 最近の注文履歴 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Order History / 注文履歴</h4>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Latest 10 orders</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {fan.orders?.map((order) => (
                                    <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                        <div>
                                            <Link href={route('admin.orders.show', order.id)} className="text-sm font-black text-indigo-600 hover:underline">
                                                #{order.id}
                                            </Link>
                                            <div className="text-[10px] text-gray-400 font-mono mt-1">{order.created_at}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-gray-800">¥{formatCurrency(order.total_amount)}</div>
                                            <div className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full border inline-block ${order.status === 50 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400'}`}>
                                                STATUS: {order.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!fan.orders || fan.orders.length === 0) && (
                                    <div className="p-12 text-center text-sm text-gray-400 italic">注文履歴はありません</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}