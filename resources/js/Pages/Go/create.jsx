import React, { useState, useEffect, useMemo } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
// パスをコンポーネントフォルダへ正しく修正
import BasicSection from '@/Components/models/go/GoCreateForm/BasicSection';
import ItemSection from '@/Components/models/go/GoCreateForm/ItemSection';

import { 
    Rocket, ChevronRight, ChevronLeft, Check, 
    ShieldCheck, AlertTriangle, Info, Package, 
    Settings, MessageSquare 
} from 'lucide-react';

export default function Create() {
    const { language, products, creators, selected_item_id } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const [currentStep, setCurrentStep] = useState(1);
    const [isAgreed, setIsAgreed] = useState(false);

    const initialItems = React.useMemo(() => {
        if (selected_item_id && products) {
            const item = products.find(p => p.id == selected_item_id);
            return item ? [item] : [];
        }
        return [];
    }, [selected_item_id, products]);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        creator_id: '',
        recruitment_start_date: '',
        recruitment_end_date: '',
        shipping_mode: 'bulk_to_gom',
        is_secondary_payment_required: true,
        is_private: false,
        max_participants: '',
        items: initialItems,
        allowed_fans: []
    });

    const steps = [
        { id: 1, name: __('Select Items'), icon: <Package size={18} /> },
        { id: 2, name: __('Project Goals'), icon: <Settings size={18} /> },
        { id: 3, name: __('Story & Details'), icon: <MessageSquare size={18} /> },
        { id: 4, name: __('Review & Launch'), icon: <ShieldCheck size={18} /> },
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isAgreed) return;

        // allowed_fans を ID の配列に変換して送信
        const payload = {
            ...data,
            allowed_fans: data.allowed_fans.map(fan => fan.id)
        };

        post(route('fan.go.store'), {
            data: payload
        });
    };

    useEffect(() => {
        if (initialItems.length > 0 && !data.creator_id) {
            setData('creator_id', initialItems[0].creator_id);
        }
    }, [initialItems]);

    return (
        <FanLayout>
            <Head title={`${__('Launch New Box')} - CirclePort`} />
            
            <div className="max-w-5xl mx-auto px-8 py-16">
                {/* ウィザード・プログレスバー */}
                <div className="mb-12">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                        <div 
                            className="absolute top-1/2 left-0 h-0.5 bg-cyan-500 -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((step) => (
                            <div key={step.id} className="relative z-10 flex flex-col items-center group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg 
                                    ${currentStep >= step.id ? 'bg-cyan-500 text-white scale-110' : 'bg-white text-slate-400 border-2 border-slate-100'}`}
                                >
                                    {currentStep > step.id ? <Check size={20} strokeWidth={3} /> : step.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors 
                                    ${currentStep >= step.id ? 'text-cyan-600' : 'text-slate-400'}`}
                                >
                                    {step.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-100/50">
                                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                    <Package className="text-cyan-500" /> {__('Step 1: Pick the items to GO')}
                                </h3>
                                <ItemSection data={data} setData={setData} errors={errors} products={products} creators={creators} />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-100/50">
                                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                    <Settings className="text-cyan-500" /> {__('Step 2: Set your campaign goals')}
                                </h3>
                                <BasicSection data={data} setData={setData} errors={errors} mode="goals_only" />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-100/50">
                                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                    <MessageSquare className="text-cyan-500" /> {__('Step 3: Tell your community why')}
                                </h3>
                                <BasicSection data={data} setData={setData} errors={errors} mode="content_only" />
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-100/50">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <ShieldCheck className="text-cyan-500" /> {__('Final Review')}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-10">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{__('Project Title')}</span>
                                        <span className="text-sm font-bold text-slate-900">{data.title || '---'}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{__('Total Items')}</span>
                                        <span className="text-sm font-bold text-slate-900">{data.items.length} {__('Items')}</span>
                                    </div>
                                </div>
                                <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 space-y-6">
                                    <div className="flex gap-4 text-amber-800">
                                        <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                                        <div className="text-[11px] font-bold leading-relaxed">
                                            {__('As a Manager, you handle coordination. CirclePort secures payments via escrow. International shipping is billed separately to participants.')}
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-amber-200 cursor-pointer hover:bg-amber-50 transition-all">
                                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isAgreed ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-amber-300'}`}>
                                            <input type="checkbox" className="hidden" checked={isAgreed} onChange={() => setIsAgreed(!isAgreed)} />
                                            {isAgreed && <Check size={18} strokeWidth={4} />}
                                        </div>
                                        <span className="text-xs font-black text-amber-900 uppercase">{__('I agree to the terms and understand my role as a GOM.')}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={prevStep}
                            className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all 
                                ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-white text-slate-400 border-2 border-slate-100 hover:bg-slate-50'}`}
                        >
                            <ChevronLeft size={16} /> {__('Back')}
                        </button>
                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-xl active:scale-95"
                            >
                                {__('Next Step')} <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={processing || !isAgreed}
                                className={`flex items-center gap-3 px-12 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95
                                    ${(!isAgreed || processing) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-slate-900'}`}
                            >
                                <Rocket size={18} /> {processing ? __('Launching...') : __('Launch Group Order')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </FanLayout>
    );
}