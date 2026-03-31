import React from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ products, categories, hs_codes, filters }) {
    const { data, setData, get, processing } = useForm({
        name: filters.name || '',
        sku: filters.sku || '',
        category_id: filters.category_id || '',
        hs_code_id: filters.hs_code_id || '',
        status: filters.status || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('creator.products.index'), { preserveState: true });
    };

    const getTranslation = (product, locale, field) => {
        if (!product.translations) return '-';
        return product.translations.find(t => t.locale === locale)?.[field] || '-';
    };

    const getThumbnailUrl = (product) => {
        if (!product.images || product.images.length === 0) return null;
        const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
        return primaryImage.url;
    };

    return (
        <CreatorLayout>
            <Head title="作品管理 - CirclePort" />
            
            <div className="p-8 max-w-[1400px] mx-auto space-y-8">
                <header className="flex justify-between items-end border-b-4 border-slate-900 pb-6">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                            My <span className="text-cyan-400">Inventory</span>
                        </h1>
                        <p className="text-sm font-bold mt-1 text-slate-400 uppercase italic tracking-widest">作品管理・在庫調整</p>
                    </div>
                    <Link 
                        href={route('creator.products.create')}
                        className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-[6px_6px_0px_#A5F3FC] hover:translate-y-1 hover:shadow-none"
                    >
                        + 作品登録
                    </Link>
                </header>

                {/* 検索エリア */}
                <form 
                    onSubmit={handleSearch} 
                    className="bg-white p-6 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_#000] space-y-6"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3">
                            <label className="block text-[10px] font-black uppercase mb-1 italic text-slate-400">作品名キーワード</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border-2 border-slate-100 rounded-xl p-3 font-bold text-sm focus:border-cyan-400 outline-none" placeholder="検索..." />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-black uppercase mb-1 italic text-slate-400">商品コード</label>
                            <input type="text" value={data.sku} onChange={e => setData('sku', e.target.value)} className="w-full border-2 border-slate-100 rounded-xl p-3 font-bold text-sm focus:border-cyan-400 outline-none" placeholder="P-XXXX" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="border-2 border-slate-100 rounded-xl p-3 font-bold text-sm bg-slate-50">
                            <option value="">カテゴリー</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name_ja}</option>)}
                        </select>
                        <select value={data.hs_code_id} onChange={e => setData('hs_code_id', e.target.value)} className="border-2 border-slate-100 rounded-xl p-3 font-bold text-sm bg-slate-50">
                            <option value="">HSコード</option>
                            {hs_codes.map(hs => <option key={hs.id} value={hs.id}>{hs.code}: {hs.name_ja}</option>)}
                        </select>
                        <select value={data.status} onChange={e => setData('status', e.target.value)} className="border-2 border-slate-100 rounded-xl p-3 font-bold text-sm bg-slate-50">
                            <option value="">ステータス</option>
                            <option value="1">下書き</option>
                            <option value="2">公開中</option>
                            <option value="3">非公開</option>
                        </select>
                        <button type="submit" disabled={processing} className="bg-slate-900 text-white h-[46px] rounded-xl font-black text-sm hover:bg-cyan-400 hover:text-slate-900 transition-all shadow-[4px_4px_0px_#A5F3FC]">
                            検索 🔍
                        </button>
                    </div>
                </form>

                {/* テーブルエリア */}
                <div className="bg-white rounded-[2rem] border-4 border-slate-900 shadow-[12px_12px_0px_#000] overflow-hidden">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-slate-900 text-white text-[10px] uppercase italic tracking-widest">
                            <tr>
                                <th className="p-4 w-[120px] text-center">メイン画像</th>
                                <th className="p-4 w-[110px] text-center">商品コード</th>
                                <th className="p-4">作品タイトル</th>
                                <th className="p-4 w-[130px] text-center">カテゴリー</th>
                                <th className="p-4 w-[80px] text-center">在庫</th>
                                <th className="p-4 w-[120px] text-center">価格 (JPY)</th>
                                <th className="p-4 w-[120px] text-center">状態</th>
                                <th className="p-4 w-[120px] text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                    {/* 画像 */}
                                    <td className="p-4 text-center">
                                        <div className="w-20 h-20 rounded-xl border-2 border-slate-900 overflow-hidden bg-slate-100 mx-auto shadow-[3px_3px_0px_#DDD]">
                                            {getThumbnailUrl(product) ? (
                                                <img src={getThumbnailUrl(product)} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-[8px] text-slate-400 font-black">NO IMAGE</div>
                                            )}
                                        </div>
                                    </td>
                                    
                                    {/* SKU */}
                                    <td className="p-4 text-center">
                                        <div className="text-[10px] text-slate-400 font-black italic">{product.sku || '---'}</div>
                                    </td>

                                    {/* タイトル */}
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <p className="font-black text-sm text-slate-900 leading-tight line-clamp-2">
                                                {getTranslation(product, 'ja', 'name')}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 italic truncate">
                                                {getTranslation(product, 'en-us', 'name')}
                                            </p>
                                        </div>
                                    </td>

                                    {/* カテゴリー - 巨大な影が出ないよう修正 */}
                                    <td className="p-4 text-center">
                                        <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black border-2 border-slate-200">
                                            {product.category?.name_ja || '未分類'}
                                        </span>
                                    </td>

                                    {/* 在庫 */}
                                    <td className="p-4 text-center font-black text-lg italic">
                                        {product.has_variants ? (
                                            <span className="text-[9px] text-cyan-500 border border-cyan-500 px-2 py-0.5 rounded uppercase">可変</span>
                                        ) : (
                                            <span className={product.stock_quantity <= 5 ? "text-pink-500" : "text-slate-900"}>
                                                {product.stock_quantity ?? 0}
                                            </span>
                                        )}
                                    </td>

                                    {/* 価格 */}
                                    <td className="p-4 text-center">
                                        <div className="font-black text-sm">¥{Number(product.price).toLocaleString()}</div>
                                        <div className="text-[8px] text-slate-400 font-bold uppercase italic">込</div>
                                    </td>

                                    {/* ステータス */}
                                    <td className="p-4 text-center">
                                        {product.status === 2 ? (
                                            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full border-2 border-green-400 shadow-[2px_2px_0px_#BBF7D0]">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                <span className="text-[9px] font-black uppercase">公開</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center bg-slate-50 text-slate-300 px-3 py-1 rounded-full border-2 border-slate-100">
                                                <span className="text-[9px] font-black uppercase italic">下書</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* 操作 */}
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Link 
                                                href={route('creator.products.edit', product.id)} 
                                                className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-900 rounded-lg hover:bg-cyan-400 transition-all shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none"
                                            >
                                                ✏️
                                            </Link>
                                            <button className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-900 rounded-lg hover:bg-pink-500 transition-all shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* ページネーション */}
                    {products.links && products.links.length > 3 && (
                        <div className="p-6 bg-slate-50 border-t-2 border-slate-900 flex justify-center gap-2">
                            {products.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 border-2 border-slate-900 font-black text-xs rounded-lg transition-all ${
                                        link.active ? 'bg-cyan-400' : 'bg-white shadow-[2px_2px_0px_#000]'
                                    } ${!link.url && 'opacity-30'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CreatorLayout>
    );
}