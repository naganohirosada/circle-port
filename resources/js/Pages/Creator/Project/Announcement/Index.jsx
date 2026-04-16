import React, { useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    Megaphone, 
    ArrowLeft, 
    Clock, 
    Image as ImageIcon, 
    X, 
    Plus,
    CheckCircle2
} from 'lucide-react';

export default function Index({ project, announcements }) {
    const fileInputRef = useRef();

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
        type: 'update',
        images: [], // 複数画像用の配列
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.project.announcement.store', project.id), {
            onSuccess: () => {
                reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    // 画像選択ハンドラ（既存の選択に追加）
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // 最大5枚制限
        const newImages = [...data.images, ...files].slice(0, 5);
        setData('images', newImages);
    };

    // 特定の画像をリストから削除
    const removeImage = (index) => {
        setData('images', data.images.filter((_, i) => i !== index));
    };

    return (
        <CreatorLayout>
            <Head title={`進捗報告 - ${project.translations[0]?.title}`} />

            <div className="p-8 max-w-[1100px] mx-auto space-y-10">
                {/* ヘッダー */}
                <header className="flex items-center gap-6 border-b-8 border-slate-900 pb-8">
                    <Link 
                        href={route('creator.project.index')} 
                        className="p-4 bg-white border-4 border-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
                            Project <span className="text-cyan-400">Announce</span>
                        </h1>
                        <p className="text-sm font-bold text-slate-500 uppercase italic mt-2 tracking-widest">支援者への進捗報告とギャラリー公開</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* 左側：新規投稿フォーム */}
                    <div className="lg:col-span-2">
                        <form onSubmit={submit} className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_#A5F3FC] space-y-6 sticky top-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Megaphone className="text-cyan-500" size={20} />
                                <h2 className="text-xs font-black uppercase tracking-widest italic">New Post / 新規投稿</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Title / 件名</label>
                                    <input 
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-cyan-400/20"
                                        placeholder="例：プロトタイプが完成！"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Type / カテゴリ</label>
                                    <select 
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-black appearance-none"
                                    >
                                        <option value="update">UPDATE / 進捗状況</option>
                                        <option value="report">REPORT / 完了報告</option>
                                        <option value="important">IMPORTANT / 重要</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Content / 本文</label>
                                    <textarea 
                                        rows="5"
                                        value={data.content}
                                        onChange={e => setData('content', e.target.value)}
                                        className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-cyan-400/20"
                                        placeholder="制作のこだわりを伝えましょう..."
                                    ></textarea>
                                </div>

                                {/* 複数画像アップロードセクション */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Gallery / 画像 (最大5枚)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* 選択済み画像のプレビュー */}
                                        {data.images.map((file, idx) => (
                                            <div key={idx} className="relative aspect-square border-2 border-slate-900 rounded-xl overflow-hidden group shadow-[2px_2px_0px_#000]">
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-pink-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} strokeWidth={4} />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {/* 画像追加ボタン */}
                                        {data.images.length < 5 && (
                                            <label className="aspect-square border-4 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:border-cyan-400 hover:text-cyan-400 cursor-pointer transition-all bg-slate-50/50">
                                                <Plus size={24} />
                                                <input 
                                                    type="file" 
                                                    multiple 
                                                    accept="image/*" 
                                                    onChange={handleFileChange} 
                                                    ref={fileInputRef}
                                                    className="hidden" 
                                                />
                                            </label>
                                        )}
                                    </div>
                                    {errors.images && <p className="text-pink-500 text-[10px] font-bold">{errors.images}</p>}
                                </div>

                                <button 
                                    disabled={processing}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-cyan-400 hover:text-slate-900 transition-all shadow-[6px_6px_0px_#A5F3FC] active:translate-y-1 active:shadow-none"
                                >
                                    {processing ? 'Posting...' : '報告を世界へ公開する'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* 右側：履歴一覧 */}
                    <div className="lg:col-span-3 space-y-8">
                        <h2 className="text-xs font-black uppercase tracking-widest italic text-slate-400 ml-4 flex items-center gap-2">
                            <Clock size={14} /> Update History / 投稿履歴
                        </h2>
                        
                        {announcements.length > 0 ? announcements.map(announcement => {
                            const translation = announcement.translations?.find(t => t.locale === 'ja') || {};
                            
                            return (
                                <div key={announcement.id} className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[10px_10px_0px_#000] space-y-6">
                                    {/* ヘッダー：タイプと日付 */}
                                    <div className="flex justify-between items-start">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 border-slate-900 
                                            ${announcement.type === 30 ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
                                            {announcement.type === 10 && 'UPDATE'}
                                            {announcement.type === 20 && 'REPORT'}
                                            {announcement.type === 30 && 'IMPORTANT'}
                                            {announcement.type === 40 && 'EXTENSION'}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-400 italic tracking-wider">
                                            {announcement.published_at}
                                        </span>
                                    </div>

                                    {/* タイトル */}
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                        {translation.title || 'Untitled'}
                                    </h3>
                                    
                                    {/* 📸 カスタム画像スライダー */}
                                    {announcement.images && announcement.images.length > 0 && (
                                        <div className="relative group">
                                            {/* スクロールコンテナ */}
                                            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_#cbd5e1]">
                                                {announcement.images.map((img, i) => (
                                                    <div key={img.id} className="flex-shrink-0 w-full snap-center aspect-video">
                                                        <img 
                                                            src={`/storage/${img.path}`} 
                                                            className="w-full h-full object-cover"
                                                            alt={`Slide ${i + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* 複数枚ある場合のインジケーター（右上の枚数表示） */}
                                            {announcement.images.length > 1 && (
                                                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest border-2 border-white/20">
                                                    {announcement.images.length} PHOTOS
                                                </div>
                                            )}

                                            {/* 下部のスナップドット（簡易表示） */}
                                            {announcement.images.length > 1 && (
                                                <div className="flex justify-center gap-1.5 mt-3">
                                                    {announcement.images.map((_, i) => (
                                                        <div key={i} className="w-2 h-2 rounded-full bg-slate-200 border border-slate-300" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 本文 */}
                                    <p className="text-base text-slate-600 font-medium whitespace-pre-wrap leading-relaxed border-l-4 border-slate-100 pl-6 italic">
                                        {translation.content || 'No content available.'}
                                    </p>
                                </div>
                            );
                        }) : (
                            <div className="py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
                                <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-black italic uppercase tracking-widest">まだ投稿された報告はありません</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CreatorLayout>
    );
}