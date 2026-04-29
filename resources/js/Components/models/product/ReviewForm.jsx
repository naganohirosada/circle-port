// resources/js/Components/models/product/ReviewForm.jsx

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Star, Camera, X, Send, Loader2 } from 'lucide-react';

export default function ReviewForm({ productId, language }) {
    const __ = (key) => language?.[key] || key;
    const [previews, setPreviews] = useState([]);

    const { data, setData, post, processing, reset, errors } = useForm({
        rating: 5,
        comment: '',
        images: [],
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        // data.imagesを更新（Fileオブジェクトの配列）
        setData('images', [...data.images, ...files]);

        // 表示用プレビューURLを作成
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('fan.products.reviews.store', productId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPreviews([]);
            },
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="mb-6">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                    <Star className="text-cyan-400" fill="currentColor" size={20} />
                    Write a Review
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    あなたの感想をシェアしよう
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Rating */}
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => setData('rating', num)}
                            className={`transition-all transform hover:scale-110 ${data.rating >= num ? 'text-cyan-400' : 'text-slate-200'}`}
                        >
                            <Star fill={data.rating >= num ? "currentColor" : "none"} size={32} />
                        </button>
                    ))}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                    <textarea
                        value={data.comment}
                        onChange={e => setData('comment', e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 font-bold text-sm min-h-[120px] focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all resize-none"
                        placeholder={__('商品の感想を教えてください')}
                    />
                    {errors.comment && <p className="text-rose-500 text-[10px] font-black italic">{errors.comment}</p>}
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        {previews.map((url, index) => (
                            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-100 group">
                                <img src={url} className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="text-white" size={20} />
                                </button>
                            </div>
                        ))}
                        <label className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all group">
                            <Camera className="text-slate-400 group-hover:text-cyan-500" size={20} />
                            <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-tighter">Add Photo</span>
                            <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                </div>

                <button
                    disabled={processing}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-cyan-500 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    {processing ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    {processing ? __('Posting...') : __('Post Review')}
                </button>
            </form>
        </div>
    );
}