import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ auth, payment, order, shipping }) {
    // 返金処理用のフォーム
    const { post, processing } = useForm();
    
    const isPrimary = !!order;
    const isSecondary = !!shipping;
    const breakdowns = payment?.breakdowns || [];

    // ステータス定数
    const STATUS_PAID = 20;
    const STATUS_REFUNDED = 30;

    // payment_breakdown のタイプ定義
    const TYPE_LABELS = {
        1: { label: '商品代金合計 (税抜)', color: 'text-gray-700' },
        2: { label: '国内送料 (税抜)', color: 'text-gray-700' },
        3: { label: '国際送料 (税抜)', color: 'text-gray-700' },
        4: { label: 'システム利用料・手数料', color: 'text-indigo-600 font-bold' },
        5: { label: '商品代消費税', color: 'text-gray-400' },
        6: { label: '割引・クーポン', color: 'text-rose-500 font-bold' },
        7: { label: '送料消費税', color: 'text-gray-400' },
    };

    const getProductName = (product) => product?.translations?.[0]?.name || product?.name || '名称未設定';
    const getProductImage = (product) => product?.images?.[0]?.url || product?.images?.[0]?.path || null;

    const getDisplayPrice = (item) => {
        const orderItem = item?.order_item || item;
        const variantPrice = orderItem?.product_variant?.price;
        if (variantPrice && parseFloat(variantPrice) > 0) return parseFloat(variantPrice);
        const savedPrice = orderItem?.price;
        if (savedPrice && parseFloat(savedPrice) > 0) return parseFloat(savedPrice);
        const productPrice = orderItem?.product?.price;
        if (productPrice && parseFloat(productPrice) > 0) return parseFloat(productPrice);
        return 0;
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    // 返金実行ハンドラ
    const handleRefund = () => {
        if (confirm('【重要：返金処理の実行】\n\n本当にこの決済を全額返金しますか？\n・Stripeを通じて顧客に実際に返金されます。\n・クリエイターへの振込予定額からも自動的に差し引かれます。\n・この操作は取り消せません。')) {
            post(route('admin.payments.refund', payment.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header={`決済詳細 #${payment?.id}`}>
            <Head title={`決済詳細 #${payment?.id}`} />

            <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
                {/* ヘッダー操作 */}
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('admin.payments.index')} 
                        className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2 font-bold transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        決済一覧に戻る
                    </Link>

                    {/* 返金ボタン：ステータスが支払い済み(20)の場合のみ表示 */}
                    {payment?.status === STATUS_PAID && (
                        <button 
                            onClick={handleRefund}
                            disabled={processing}
                            className="bg-rose-50 text-rose-600 border border-rose-100 px-6 py-2 rounded-xl font-bold text-sm hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    返金処理中...
                                </>
                            ) : '全額返金を実行する'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* 左側：決済基本情報 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 tracking-widest">Summary / 決済概要</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">総支払額 (税込)</p>
                                    <p className="text-4xl font-black text-gray-900 tabular-nums">
                                        <span className="text-xl mr-1 font-medium">¥</span>
                                        {formatCurrency(payment?.total_amount)}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">決済ステータス</p>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                                        payment?.status === STATUS_PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                        payment?.status === STATUS_REFUNDED ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {payment?.status === STATUS_PAID ? 'SUCCESS' : 
                                         payment?.status === STATUS_REFUNDED ? 'REFUNDED' : 'PENDING'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Stripe Transaction ID</p>
                                    <p className="text-[11px] font-mono text-gray-400 break-all bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        {payment?.stripe_payment_intent_id || payment?.external_transaction_id || '---'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 返金済みの場合の追加情報 */}
                        {payment?.status === STATUS_REFUNDED && (
                            <div className="bg-gray-900 rounded-3xl p-8 text-white">
                                <h3 className="text-[11px] font-black text-rose-400 uppercase mb-4 tracking-widest">Refund Info</h3>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                    この決済は返金処理が完了しています。売上計上およびクリエイターへの振込予定は全て無効化されています。
                                </p>
                                <div className="text-[10px] text-gray-500 font-bold">UPDATED AT</div>
                                <div className="text-sm font-mono">{payment?.updated_at}</div>
                            </div>
                        )}
                    </div>

                    {/* 右側：支払い内訳 (Breakdown) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 tracking-widest">Payment Breakdown / 支払い内訳</h3>
                            <div className="space-y-4">
                                {breakdowns.length > 0 ? (
                                    breakdowns.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-1">
                                            <span className={`text-sm ${TYPE_LABELS[item.type]?.color || 'text-gray-600'}`}>
                                                {TYPE_LABELS[item.type]?.label || `その他 (Type:${item.type})`}
                                            </span>
                                            <span className="text-sm font-black text-gray-800 tabular-nums">
                                                {item.type === 6 ? '-' : ''}¥{formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">内訳データが登録されていません</p>
                                )}
                                <div className="pt-6 mt-2 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                                    <span className="text-base font-black text-gray-900">合計金額 (Total Payment)</span>
                                    <span className="text-2xl font-black text-indigo-600 tabular-nums">¥{formatCurrency(payment?.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                        <div className={`py-3 px-8 flex justify-between items-center ${payment?.status === STATUS_REFUNDED ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                            <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                                {payment?.status === STATUS_REFUNDED ? 'Refunded Record' : 'Official Transaction Record'}
                            </span>
                            <span className="text-[10px] text-white font-bold">{payment?.created_at}</span>
                        </div>
                    </div>
                </div>

                {/* 下部：商品・荷物明細 (Primary) */}
                {isPrimary && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="text-lg font-black text-gray-800 uppercase">1次決済対象：注文詳細 <span className="text-sm font-normal text-gray-400 ml-2 font-mono">#{order?.id}</span></h3>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">商品 / バリエーション</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-center">数量</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-right">単価 (税込)</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-right">小計</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(order?.order_items || []).map((item) => {
                                        const unitPrice = getDisplayPrice(item);
                                        const subtotal = unitPrice * (item?.quantity || 0);
                                        return (
                                            <tr key={item?.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                            {getProductImage(item?.product) ? (
                                                                <img src={getProductImage(item.product)} className="w-full h-full object-cover" alt="product" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 font-bold uppercase text-center p-1">No Image</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-gray-800 leading-tight mb-1">{getProductName(item?.product)}</div>
                                                            {item?.variation && (
                                                                <div className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                                                                    {item.variation.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-sm text-center font-bold text-gray-600 tabular-nums">× {item?.quantity}</td>
                                                <td className="p-6 text-sm text-right font-medium text-gray-400 tabular-nums">¥{formatCurrency(unitPrice)}</td>
                                                <td className="p-6 text-sm text-right font-black text-gray-800 tabular-nums font-mono text-lg">¥{formatCurrency(subtotal)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 下部：商品・荷物明細 (Secondary) */}
                {isSecondary && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
                            <h3 className="text-lg font-black text-gray-800 uppercase">2次決済対象：荷物詳細 <span className="text-sm font-normal text-gray-400 ml-2 font-mono">#{shipping?.id}</span></h3>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">商品 / バリエーション</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-center">配送数量</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-right">単価 (参照用)</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-right">小計</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(shipping?.items || []).map((item) => {
                                        const product = item?.order_item?.product;
                                        const variant = item?.order_item?.variation;
                                        const unitPrice = getDisplayPrice(item);
                                        const subtotal = unitPrice * (item?.quantity || 0);
                                        return (
                                            <tr key={item?.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                            {getProductImage(product) ? (
                                                                <img src={getProductImage(product)} className="w-full h-full object-cover" alt="product" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 font-bold uppercase text-center p-1">No Image</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-gray-800 leading-tight mb-1">{getProductName(product)}</div>
                                                            {variant && (
                                                                <div className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                                                                    {variant.name}
                                                                </div>
                                                            )}
                                                            <div className="mt-1 text-[9px] text-gray-400 font-bold">OrderRef: #{item?.order_item?.order_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-sm text-center font-bold text-gray-600 tabular-nums">× {item?.quantity}</td>
                                                <td className="p-6 text-sm text-right font-medium text-gray-400 tabular-nums">¥{formatCurrency(unitPrice)}</td>
                                                <td className="p-6 text-sm text-right font-black text-gray-800 tabular-nums font-mono text-lg">¥{formatCurrency(subtotal)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}