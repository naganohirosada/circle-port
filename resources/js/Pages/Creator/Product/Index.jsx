import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import CreatorLayout from '@/Layouts/CreatorLayout';

export default function Index({ products, filters }) {
    
    const handleSearch = debounce((value) => {
        router.get(route('creator.products.index'), { search: value }, {
            preserveState: true,
            replace: true
        });
    }, 300);

    return (
    <CreatorLayout>
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
            <Head title="Artworks Manager" />
            
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
                <h1 className="text-5xl font-black italic text-slate-900 tracking-tighter">
                    STOCK ROOM <span className="text-cyan-400">.</span>
                </h1>
                <Link href={route('creator.products.create')} 
                      className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-[6px_6px_0px_#22D3EE] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    + ADD NEW PIECE
                </Link>
            </header>

            {/* 検索バー */}
            <div className="max-w-7xl mx-auto mb-10">
                <input 
                    type="text" 
                    placeholder="Search by title..." 
                    defaultValue={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full max-w-md p-4 border-4 border-slate-900 rounded-2xl font-bold shadow-[6px_6px_0px_#DDD]"
                />
            </div>

            {/* 商品一覧 */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.data.map(product => (
                    <div key={product.id} className="bg-white border-4 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-[10px_10px_0px_#000] group">
                        <div className="h-48 bg-slate-200 border-b-4 border-slate-900 overflow-hidden">
                            {product.media[0] ? (
                                <img src={product.media[0].original_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300 font-black italic">NO VISUALS</div>
                            )}
                        </div>
                        <div className="p-6">
                            <h2 className="text-lg font-black truncate mb-4">{product.translations[0]?.name || 'Untitled'}</h2>
                            <div className="flex gap-2">
                                <Link href={route('creator.products.edit', product.id)} 
                                      className="flex-1 text-center py-2 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-cyan-400 transition-colors">
                                    EDIT
                                </Link>
                                <button 
                                    onClick={() => confirm('Really delete?') && router.delete(route('creator.products.destroy', product.id))}
                                    className="px-3 border-2 border-slate-200 rounded-xl hover:text-red-500 hover:border-red-500 transition-all">
                                    🗑
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ペジネーション：ここがエラーの修正箇所です！ */}
            <div className="mt-16 flex justify-center gap-2">
                {products.links.map((link, i) => {
                    // urlがnullの場合はLinkではなくspanで描画することで、toString()エラーを回避
                    if (link.url === null) {
                        return (
                            <span 
                                key={i} 
                                className="px-4 py-2 rounded-xl font-black border-4 border-slate-200 text-slate-300 cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }
                    
                    return (
                        <Link 
                            key={i} 
                            href={link.url} 
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-4 py-2 rounded-xl font-black border-4 border-slate-900 transition-all ${
                                link.active ? 'bg-cyan-400 shadow-[4px_4px_0px_#000]' : 'bg-white hover:bg-slate-100'
                            }`}
                        />
                    );
                })}
            </div>
        </div>
    </CreatorLayout>

    );
}