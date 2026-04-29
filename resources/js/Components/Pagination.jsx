import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // リンクがない、またはページ数が1つだけの場合は何も表示しない
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-wrap justify-center gap-2">
            {links.map((link, key) => {
                // ラベル（&laquo; Previous など）を適切に変換
                const label = link.label
                    .replace('&laquo; Previous', '←')
                    .replace('Next &raquo;', '→');

                return link.url === null ? (
                    // URLがない場合（現在のページの前後がない時など）
                    <div
                        key={key}
                        className="px-4 py-2 text-slate-300 text-xs font-black uppercase border border-transparent"
                    >
                        {label}
                    </div>
                ) : (
                    // 有効なリンク
                    <Link
                        key={key}
                        href={link.url}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all border ${
                            link.active
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-cyan-500 hover:text-cyan-600'
                        }`}
                        // Inertiaのスクロール保持（ページ移動しても今の位置をキープ）
                        preserveScroll
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}