// resources/js/Pages/Creator/Reviews/Index.jsx

import React from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head } from '@inertiajs/react';
import { Star, MessageCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function Index({ reviews }) {
    return (
        <CreatorLayout>
            <Head title="レビュー確認" />

            <div className="p-8 max-w-5xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                        <Star className="text-cyan-400" size={24} fill="currentColor" />
                        Customer Reviews
                    </h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        海外ファンから届いた感想（自動日本語訳）
                    </p>
                </div>

                <div className="space-y-6">
                    {reviews.data.length > 0 ? (
                        reviews.data.map((review) => (
                            <ReviewItem key={review.id} review={review} />
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                            <MessageCircle className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">まだレビューはありません</p>
                        </div>
                    )}
                </div>
                
                {/* ページネーション（必要に応じて追加） */}
            </div>
        </CreatorLayout>
    );
}

function ReviewItem({ review }) {
    // クリエイター向けに日本語翻訳を優先取得
    const japaneseTranslation = review.translations?.find(t => t.locale === 'ja')?.comment;
    
    // 商品名（クリエイターは日本語設定を想定）
    const productName = review.product.translations?.find(t => t.locale === 'ja')?.name || review.product.translations?.[0]?.name;

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:border-cyan-200 transition-all">
            <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* 左側：商品・ユーザー情報 */}
                    <div className="w-full md:w-40 flex-shrink-0 space-y-4">
                        <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative group">
                            {review.product.images?.[0] ? (
                                <img 
                                    src={`/storage/${review.product.images[0].file_path}`} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon /></div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate leading-tight">
                                {productName}
                            </p>
                            <div className="flex text-cyan-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右側：レビュー内容 */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.fan?.name || 'F')}&background=random`} alt="" />
                                </div>
                                <span className="text-sm font-black text-slate-800">{review.fan?.name || 'Anonymous'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 italic">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {/* メインコメント（日本語） */}
                        <div className="relative bg-slate-50 rounded-2xl p-6 border border-slate-50 group">
                            <div className="absolute -top-2 left-6 px-2 bg-cyan-500 text-white text-[8px] font-black uppercase tracking-widest rounded">
                                JP Translation
                            </div>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                {japaneseTranslation ? `"${japaneseTranslation}"` : "（コメントなし）"}
                            </p>
                        </div>

                        {/* 写真がある場合 */}
                        {review.images?.length > 0 && (
                            <div className="flex gap-2 mt-4">
                                {review.images.map(img => (
                                    <div key={img.id} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-105">
                                        <img src={`/storage/${img.image_path}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 原文の確認（必要な場合のみ開く） */}
                        {review.translations?.length > 1 && (
                            <details className="mt-6 group">
                                <summary className="text-[9px] font-black text-slate-300 uppercase cursor-pointer hover:text-slate-500 transition-colors list-none flex items-center gap-1">
                                    <ExternalLink size={10} /> View Original Comment
                                </summary>
                                <div className="mt-2 p-4 bg-white border border-slate-50 rounded-xl">
                                    {review.translations.filter(t => t.locale !== 'ja').map(t => (
                                        <p key={t.locale} className="text-xs text-slate-400 italic">
                                            <span className="font-black uppercase mr-2 text-[8px]">{t.locale}:</span>
                                            {t.comment}
                                        </p>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}