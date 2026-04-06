import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { Package, ChevronRight, Calendar, ShoppingBag, Image as ImageIcon } from 'lucide-react';

export default function Index({ orders }) {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // ステータスに応じたバッジの色分け
    const getStatusStyle = (status) => {
        const styles = {
            'pending': 'bg-amber-50 text-amber-600 border-amber-100',           // 10: 支払い待ち
            'paid': 'bg-cyan-50 text-cyan-600 border-cyan-100',                 // 20: 支払い完了
            'shipped_to_warehouse': 'bg-blue-50 text-blue-600 border-blue-100',  // 30: 倉庫へ発送中
            'arrived_at_warehouse': 'bg-indigo-50 text-indigo-600 border-indigo-100', // 40: 倉庫到着
            'completed': 'bg-emerald-50 text-emerald-600 border-emerald-100',   // 50: 完了
            'cancelled': 'bg-slate-50 text-slate-400 border-slate-100',         // 90: キャンセル
        };
        return styles[status] || 'bg-slate-50 text-slate-500 border-slate-100';
    };

    return (
        <FanLayout>
            <Head title={`${__('Order History')} - CirclePort`} />
            
            <div className="max-w-[1000px] mx-auto px-6 py-16">
                <h1 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-4">
                    <Package size={32} className="text-cyan-600" />
                    {__('Order History')}
                </h1>

                <div className="space-y-8">
                    {orders.data && orders.data.length > 0 ? (
                        orders.data.map((order) => {
                            // ★ 憲法第1条：名前の不一致（Camel vs Snake）を完全に防ぐ
                            // キャメルケースでもスネークケースでも、存在する方を採用する
                            const currentItems = order.orderItems || order.order_items || [];

                            return (
                                <Link 
                                    key={order.id} 
                                    href={route('fan.orders.show', order.id)}
                                    className="block bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-cyan-200 transition-all group"
                                >
                                    <div className="flex flex-col gap-8">
                                        
                                        {/* 1. オーダーヘッダー */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-slate-900 text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em]">
                                                    ORDER #{order.id}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                    <Calendar size={14} className="text-slate-300" />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full tracking-widest border shadow-sm ${getStatusStyle(order.status_key)}`}>
                                                {__(order.status_key)}
                                            </span>
                                        </div>

                                        {/* 2. 商品プレビューと金額 */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                                            
                                            {/* 購入商品リスト */}
                                            <div className="flex-1 space-y-6">
                                                {/* ★ currentItems を map する。?. を付けることで undefined 時のクラッシュを完全に防ぐ */}
                                                {currentItems?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-5">
                                                        <div className="w-14 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm relative">
                                                            {item.display_image ? (
                                                                <img 
                                                                    src={item.display_image} 
                                                                    alt={item.display_product_name}
                                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                                    <ImageIcon size={24} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                                                                {item.display_product_name}
                                                            </h4>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2 py-0.5 rounded">
                                                                    {item.display_variation_name}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                                    QTY: {item.quantity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* データがない場合の保険 */}
                                                {currentItems.length === 0 && (
                                                    <p className="text-xs text-slate-400 italic">No item data found.</p>
                                                )}
                                            </div>

                                            {/* 金額・矢印セクション */}
                                            <div className="flex items-center gap-10 self-end md:self-center bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-all duration-300">
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-widest">
                                                        {__('Total Amount')}
                                                    </span>
                                                    <span className="text-2xl font-light text-slate-900 tracking-tighter">
                                                        ¥{order.total_amount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-300 shadow-sm group-hover:bg-cyan-600 group-hover:text-white group-hover:rotate-90 transition-all duration-500">
                                                    <ChevronRight size={20} strokeWidth={3} />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-6" />
                            <p className="text-slate-400 mb-8 font-medium">{__('You have no orders yet.')}</p>
                            <Link href={route('fan.products.index')} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                                {__('Start Shopping')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* ページネーション */}
                {orders.links && orders.links.length > 3 && (
                    <div className="mt-16 flex justify-center gap-2">
                        {orders.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${
                                    link.active ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'
                                } ${!link.url && 'opacity-30 cursor-not-allowed'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </FanLayout>
    );
}