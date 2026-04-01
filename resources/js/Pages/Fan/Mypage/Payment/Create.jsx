import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ChevronLeft, CreditCard, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

// --- フォーム本体のコンポーネント ---
const CheckoutForm = ({ stripeKey }) => {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;
    
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);

    const { data, setData, post, processing } = useForm({
        id: '', // Stripeから発行されるPaymentMethod ID
        brand: '',
        last4: '',
        exp_month: '',
        exp_year: '',
        is_default: false,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);

        // 1. Stripe側で決済方法をトークン化（セキュア）
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setError(error.message);
            return;
        }

        // 2. 成功したら、必要な情報だけをLaravelへ送信
        post(route('fan.mypage.payments.store'), {
            onBefore: () => {
                // 送信直前にStripeからのデータをセット
                data.id = paymentMethod.id;
                data.brand = paymentMethod.card.brand;
                data.last4 = paymentMethod.card.last4;
                data.exp_month = paymentMethod.card.exp_month;
                data.exp_year = paymentMethod.card.exp_year;
            },
            preserveScroll: true,
        });
    };

    // Stripe Elements のスタイルカスタマイズ（憲法：和モダン・ミニマル）
    const cardElementOptions = {
        hidePostalCode: true,
        style: {
            base: {
                fontSize: '16px',
                color: '#0f172a', // slate-900
                fontFamily: 'Inter, system-ui, sans-serif',
                '::placeholder': { color: '#94a3b8' }, // slate-400
            },
            invalid: { color: '#ec4899' }, // pink-500
        },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-cyan-500 focus-within:bg-white">
                <div className="flex items-center gap-3 mb-6 text-slate-400">
                    <CreditCard size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{__('Card Information')}</span>
                </div>
                
                {/* Stripe提供のセキュアな入力フィールド */}
                <CardElement options={cardElementOptions} className="py-2" />
            </div>

            {error && (
                <div className="flex items-center gap-3 text-pink-500 bg-pink-50 p-5 rounded-2xl border border-pink-100">
                    <AlertCircle size={18} />
                    <p className="text-xs font-bold">{error}</p>
                </div>
            )}

            <div className="flex items-center gap-4 ml-2">
                <input 
                    type="checkbox" 
                    id="is_default"
                    checked={data.is_default} 
                    onChange={e => setData('is_default', e.target.checked)}
                    className="w-6 h-6 text-cyan-600 rounded-lg border-slate-200 focus:ring-cyan-500"
                />
                <label htmlFor="is_default" className="text-sm font-bold text-slate-700 cursor-pointer">
                    {__('Set as Primary Payment Method')}
                </label>
            </div>

            <button 
                disabled={!stripe || processing}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-cyan-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-[0.98]"
            >
                <Lock size={18} />
                {processing ? __('Processing...') : __('Add Card Securely')}
            </button>
        </form>
    );
};

// --- メインページコンポーネント ---
export default function Create({ stripe_key }) {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;
    
    // Stripeの初期化
    const stripePromise = loadStripe(stripe_key);

    return (
        <FanLayout>
            <Head title={`${__('Add New Card')} - CirclePort`} />

            <div className="max-w-[800px] mx-auto px-6 py-16">
                <Link 
                    href={route('fan.mypage.payments.index')} 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-600 mb-12 transition-colors"
                >
                    <ChevronLeft size={14} /> {__('Back to Payment Methods')}
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                        {__('Add New Card')}
                    </h1>
                    <div className="flex items-center gap-2 text-cyan-600 bg-cyan-50 px-4 py-2 rounded-full inline-flex">
                        <ShieldCheck size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{__('PCI-DSS Compliant Secure Connection')}</span>
                    </div>
                </div>

                {/* Stripe Elements のプロバイダーでラップ */}
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <Elements stripe={stripePromise}>
                        <CheckoutForm stripeKey={stripe_key} />
                    </Elements>
                </div>

                <p className="mt-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed max-w-[500px] mx-auto">
                    {__('Your card data is sent directly to Stripe for tokenization. We never store your full card number or CVC on our servers.')}
                </p>
            </div>
        </FanLayout>
    );
}