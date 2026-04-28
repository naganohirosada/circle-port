import React from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';

export default function Index({ auth, products, categories, tags, filters }) {
    const { delete: destroy } = useForm();
    // 削除失敗時などのエラーを取得
    const { errors, flash } = usePage().props;
    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    // ステータスバッジの定義（Admin側と統一）
    const getStatusBadge = (status) => {
        const config = {
            1: { label: "下書き", style: "bg-gray-100 text-gray-500 border-gray-200" },
            2: { label: "公開中", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            3: { label: "非公開", style: "bg-gray-200 text-gray-600 border-gray-300" },
            5: { label: "承認待ち", style: "bg-amber-100 text-amber-700 border-amber-200 font-black animate-pulse" },
            6: { label: "却下済み", style: "bg-rose-50 text-rose-600 border-rose-100" },
            9: { label: "完売", style: "bg-black text-white border-black" },
        };
        const active = config[status] || { label: "不明", style: "bg-white" };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${active.style}`}>
                {active.label}
            </span>
        );
    };

    const handleDelete = (id, name) => {
        if (confirm(`作品「${name}」を削除しますか？\n※この操作は取り消せません。`)) {
            router.delete(route('creator.products.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const { data, setData, get } = useForm({
        keyword: filters.keyword || '',
        status: filters.status || '',
        category_id: filters.category_id || '',
        sub_category_id: filters.sub_category_id || '',
        product_type: filters.product_type || '',
        price_min: filters.price_min || '',
        price_max: filters.price_max || '',
        tag_id: filters.tag_id || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('creator.products.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        router.get(route('creator.products.index'));
    };

    return (
        <CreatorLayout user={auth.user} header="作品管理">
            <Head title="作品一覧" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* 削除失敗時などのエラー表示 (安全なアクセス) */}
                {errors?.delete_error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-sm animate-in fade-in slide-in-from-top-4">
                        <span className="text-xl">🚫</span> {errors.delete_error}
                    </div>
                )}

                {/* 成功メッセージ表示 (?. を使って flash が undefined でも落ちないように修正) */}
                {flash?.message && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-top-4">
                        <span className="text-xl">✅</span> {flash.message}
                    </div>
                )}
                {/* アクションエリア */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">作品一覧</h2>
                        <p className="text-sm text-gray-400 font-bold mt-1">
                            計 {products.total} 点の作品が登録されています
                        </p>
                    </div>
                    <Link
                        href={route('creator.products.create')}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        新しい作品を登録する
                    </Link>
                </div>

                {/* 検索パネル */}
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8">
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* キーワード */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block mb-1">キーワード</label>
                                <input type="text" value={data.keyword} onChange={e => setData('keyword', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-xl font-bold" placeholder="作品名・説明から検索" />
                            </div>

                            {/* ステータス */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block mb-1">ステータス</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-xl font-bold">
                                    <option value="">すべて</option>
                                    <option value="2">公開中</option>
                                    <option value="5">承認待ち</option>
                                </select>
                            </div>

                            {/* 作品形式 */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block mb-1">作品種別</label>
                                <select value={data.product_type} onChange={e => setData('product_type', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-xl font-bold">
                                    <option value="">すべて</option>
                                    <option value="1">📦 現物作品</option>
                                    <option value="2">💾 デジタル作品</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* カテゴリ */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block mb-1">カテゴリ</label>
                                <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-xl font-bold">
                                    <option value="">カテゴリを選択</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_ja}</option>)}
                                </select>
                            </div>

                            {/* 子カテゴリ */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block mb-1">サブカテゴリ</label>
                                <select value={data.sub_category_id} onChange={e => setData('sub_category_id', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-xl font-bold" disabled={!data.category_id}>
                                    <option value="">サブカテゴリ</option>
                                    {categories.find(c => c.id == data.category_id)?.sub_categories.map(sc => (
                                        <option key={sc.id} value={sc.id}>{sc.name_ja}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 価格範囲 */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block mb-1">販売金額(JPY)</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" value={data.price_min} onChange={e => setData('price_min', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-xl font-bold" placeholder="Min" />
                                    <span className="text-gray-300">~</span>
                                    <input type="number" value={data.price_max} onChange={e => setData('price_max', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-xl font-bold" placeholder="Max" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <button type="button" onClick={handleReset} className="text-[10px] font-black text-gray-400 uppercase hover:text-gray-600 transition-all">検索をクリア</button>
                            <button type="submit" className="bg-gray-900 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-gray-800 transition-all">
                                この条件で検索
                            </button>
                        </div>
                    </form>
                </section>

                {/* 作品リストカード */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">作品情報 / SKU</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">ステータス</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">価格 / 在庫</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.data.map((product) => (
                                <tr key={product.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-inner">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0].url || product.images[0].path} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-300">NO IMG</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-base font-black text-gray-800 leading-tight mb-1">
                                                    {product.translations?.[0]?.name || product.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">ID: {product.id}</span>
                                                    <span>SKU: {product.sku || '---'}</span>
                                                </div>
                                                {/* 却下理由がある場合のみ表示 */}
                                                {product.status === 6 && product.rejection_reason && (
                                                    <div className="mt-2 text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                                                        要修正: {product.rejection_reason.substring(0, 20)}...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        {getStatusBadge(product.status)}
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="text-lg font-black text-gray-900 font-mono">
                                            ¥{formatCurrency(product.price)}
                                        </div>
                                        <div className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-rose-500' : 'text-gray-400'}`}>
                                            在庫数: {product.stock}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={route('creator.products.edit', product.id)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="編集"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="削除"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* 空の状態 */}
                    {products.data.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4 text-gray-300">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <p className="text-gray-400 font-bold">まだ登録されている作品がありません</p>
                        </div>
                    )}
                </div>
            </div>
        </CreatorLayout>
    );
}