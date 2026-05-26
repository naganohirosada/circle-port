// resources/js/Pages/Creator/Product/BoothImport.jsx

import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { UploadCloud, AlertCircle, ArrowLeft, CheckCircle, FileText } from 'lucide-react';

export default function BoothImport({ status = null, error = null }) {
    const { data, setData, post, processing, errors } = useForm({
        csv_file: null,
    });

    const [fileName, setFileName] = React.useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('csv_file', file);
            setFileName(file.name);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.products.booth.import.store'));
    };

    return (
        <CreatorLayout>
            <Head title="BOOTH Artworks Importer - CirclePort" />

            <div className="max-w-[800px] mx-auto px-6 py-12 font-sans text-slate-800">
                <Link href={route('creator.products.index')} className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Catalog
                </Link>

                <div className="space-y-2 mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">BOOTH Artworks Importer</h1>
                    <p className="text-sm text-slate-500 font-medium">BOOTHの商品管理CSVをアップロードするだけで、海外特化・免税出品仕様へ一括自動変換します。</p>
                </div>

                {status && (
                    <div className="mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4 text-emerald-800">
                        <CheckCircle className="flex-shrink-0 text-emerald-500" />
                        <p className="text-sm font-bold">{status}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 text-rose-800">
                        <AlertCircle className="flex-shrink-0 text-rose-500" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <form onSubmit={submit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/40 space-y-8">
                    
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-slate-500">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <AlertCircle size={14} className="text-cyan-500" />
                            インポート時の自動コンバート仕様
                        </h4>
                        <ul className="text-xs list-disc pl-5 space-y-1.5 font-medium text-slate-400">
                            <li>配送方法はすべて海外ファン向け一括発送の<strong>「倉庫一括配送（WAREHOUSE）」</strong>に統一されます。</li>
                            <li>商品は自動的に<strong>「免税輸出対象（日本の消費税は非課税）」</strong>としてグローバル市場へ展開されます。</li>
                            <li>インポート直後は「下書き」保存されます。多言語翻訳を確認後、ワンクリックで世界へ公開できます。</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select BOOTH CSV File</label>
                        
                        <div className="relative group border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-3xl p-12 text-center transition-all bg-slate-50/50 hover:bg-white cursor-pointer">
                            <input 
                                type="file" 
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="space-y-4 relative z-10 pointer-events-none">
                                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <UploadCloud size={32} className="text-cyan-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-800">
                                        {fileName ? fileName : 'Click to browse or drag CSV file here'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">BOOTH商品管理メニュー ➔ 「商品一覧CSVをダウンロード」したファイル</p>
                                </div>
                            </div>
                        </div>
                        {errors.csv_file && <div className="text-rose-500 text-xs mt-2 ml-2 font-bold">{errors.csv_file}</div>}
                    </div>

                    {fileName && (
                        <div className="p-4 bg-cyan-50/40 rounded-xl flex items-center gap-3 border border-cyan-100 text-cyan-700 animate-fadeIn">
                            <FileText size={18} />
                            <span className="text-xs font-black uppercase tracking-tight">{fileName} is ready to process</span>
                        </div>
                    )}

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={processing || !data.csv_file}
                            className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all shadow-xl ${
                                (processing || !data.csv_file) 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                    : 'bg-slate-900 text-white hover:bg-cyan-600 shadow-slate-100 active:scale-[0.99]'
                            }`}
                        >
                            {processing ? 'Processing CSV...' : 'Start One-Click Import'}
                        </button>
                    </div>
                </form>
            </div>
        </CreatorLayout>
    );
}