import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Show({ auth, product }) {
    // 処理中のローディング状態を管理するために useForm を保持
    const { processing } = useForm();

    // 通貨フォーマットヘルパー
    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    /**
     * ステータスバッジの定義
     * 商品ステータスの数値(1,2,3,5,6,9)をラベルと色に変換します
     */
    const getStatusBadge = (status) => {
        const config = {
            1: { label: "下書き", style: "bg-gray-100 text-gray-500 border-gray-200" },
            2: { label: "公開中", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            3: { label: "非公開", style: "bg-gray-200 text-gray-600 border-gray-300" },
            5: { label: "承認待ち", style: "bg-amber-100 text-amber-700 border-amber-200 font-black animate-pulse" },
            6: { label: "却下済み", style: "bg-rose-50 text-rose-600 border-rose-100" },
            9: { label: "完売", style: "bg-black text-white border-black" },
        };
        const active = config[status] || { label: `不明(${status})`, style: "bg-white text-gray-400 border-gray-100" };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-sm ${active.style}`}>
                {active.label}
            </span>
        );
    };

    /**
     * ステータス更新処理
     * router.patch を使用して、リクエストボディにデータを載せて送信します。
     * これによりコントローラー側で $request->status / $request->reason が正しく受け取れます。
     */
    const handleStatusUpdate = (newStatus, reason = '') => {
        const actionLabel = newStatus === 2 ? '承認して公開' : '却下（差し戻し）';
        
        if (confirm(`この商品を${actionLabel}してもよろしいですか？`)) {
            router.patch(route('admin.products.update-status', product.id), {
                status: newStatus,
                reason: reason
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // 完了時の追加処理が必要な場合はここに記述
                }
            });
        }
    };

    return (
        <AdminLayout user={auth.user} header="商品検品・承認">
            <Head title={`商品検品 - ${product.translations?.[0]?.name || product.name}`} />
            
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
                
                {/* 戻るナビゲーション & アクションボタン */}
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('admin.products.index')} 
                        className="text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        商品一覧に戻る
                    </Link>
                    
                    {/* ステータスが「5: 承認待ち」の時だけアクションを表示 */}
                    {product.status === 5 && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleStatusUpdate(2)} 
                                disabled={processing}
                                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                商品を承認して公開する
                            </button>
                            <button 
                                onClick={() => {
                                    const reason = prompt('却下（差し戻し）の理由を入力してください:');
                                    if(reason) handleStatusUpdate(6, reason);
                                }}
                                disabled={processing}
                                className="bg-white text-rose-600 border border-rose-100 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-rose-50 transition-all disabled:opacity-50"
                            >
                                修正を依頼する
                            </button>
                        </div>
                    )}
                </div>

                {/* 却下理由の表示 (却下済み(6)の場合、または承認待ちだが前回却下理由がある場合) */}
                {(product.status === 6 || (product.status === 5 && product.rejection_reason)) && product.rejection_reason && (
                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex gap-4 items-start shadow-sm shadow-rose-100/50">
                        <div className="bg-rose-500 text-white p-2 rounded-lg flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-rose-700 text-[10px] font-black uppercase tracking-widest mb-1">
                                Rejection Reason / 却下理由（差し戻し内容）
                            </h3>
                            <p className="text-rose-600 text-sm font-bold whitespace-pre-wrap leading-relaxed">
                                {product.rejection_reason}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* 左側カラム：商品画像ギャラリー */}
                    <div className="lg:col-span-1 space-y-4">
                        {product.images && product.images.length > 0 ? (
                            product.images.map((img, i) => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner group relative">
                                    <img 
                                        src={img.url || img.path} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt={`Product Image ${i + 1}`} 
                                    />
                                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded font-black tracking-widest">
                                        IMG {String(i + 1).padStart(2, '0')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="aspect-square bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 gap-2">
                                <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">No Image Data</span>
                            </div>
                        )}
                    </div>

                    {/* 右側カラム：メイン情報とバリエーション */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 基本情報カード */}
                        <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                            {/* ステータスバッジを表示 */}
                            <div className="absolute top-10 right-10">
                                {getStatusBadge(product.status)}
                            </div>

                            <div className="mb-10">
                                <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight leading-tight">
                                    {product.translations?.[0]?.name || product.name}
                                </h2>
                                <p className="text-indigo-600 font-black text-sm flex items-center gap-2">
                                    <span className="text-gray-300 font-bold tracking-widest uppercase text-[10px]">Creator</span>
                                    <span className="hover:underline cursor-pointer">{product.creator?.name}</span>
                                </p>
                            </div>
                            
                            <div className="space-y-10">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-4 h-px bg-gray-200"></span>
                                        Description / 商品説明
                                    </p>
                                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-8 rounded-3xl border border-gray-50">
                                        {product.translations?.[0]?.description || '商品説明が登録されていません。'}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Base Sales Price</p>
                                        <p className="text-3xl font-black text-gray-900 font-mono tabular-nums">
                                            ¥{formatCurrency(product.price)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Master SKU</p>
                                        <p className="text-sm font-mono font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-xl inline-block border border-gray-200">
                                            {product.sku || 'NOT_SET'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* バリエーションリストカード */}
                        <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                            <div className="px-10 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    Variation List / 展開バリエーション
                                </h3>
                                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                                    {product.variants?.length || 0} TOTAL OPTIONS
                                </span>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-gray-50">
                                    {product.variants && product.variants.length > 0 ? (
                                        product.variants.map((v) => (
                                            <tr key={v.id} className="hover:bg-gray-50/30 transition-colors group">
                                                <td className="p-6 px-10">
                                                    <div className="text-base font-black text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                                        {v.translations?.[0]?.name || v.name}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                                                        SKU: {v.sku || '---'}
                                                    </div>
                                                </td>
                                                <td className="p-6 px-10 text-right font-black text-gray-900 tabular-nums text-lg">
                                                    ¥{formatCurrency(v.price || product.price)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="p-12 text-center text-xs text-gray-400 italic">
                                                バリエーションの設定はありません。基本商品のみ販売されます。
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}