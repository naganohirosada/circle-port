import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';

export default function BarcodeScanner() {
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    // ページ表示時に自動でフォーカスを当てる（スキャン待ち状態）
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleScan = (e) => {
        e.preventDefault();
        if (!value) return;

        // 指定の番号で検索用エンドポイントへリクエスト
        router.get(route('admin.inspections.scan'), { number: value }, {
            preserveState: true,
            onError: (errors) => {
                alert(errors.scan || '配送が見つかりません');
                setValue('');
                inputRef.current?.focus();
            }
        });
    };

    return (
        <form onSubmit={handleScan} className="max-w-xl mx-auto">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="管理番号をスキャン (DS...)"
                    className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-indigo-100 rounded-2xl leading-5 focus:outline-none focus:ring-0 focus:border-indigo-500 sm:text-lg font-mono transition-all shadow-sm group-hover:shadow-md"
                    autoComplete="off"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Standby</span>
                </div>
            </div>
        </form>
    );
}