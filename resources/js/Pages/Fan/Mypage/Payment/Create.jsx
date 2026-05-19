import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ChevronLeft, CreditCard, Lock, ShieldCheck, AlertCircle, Wallet } from 'lucide-react';

// --- フォーム本体（PaymentElement対応） ---
const CheckoutForm = ({ clientSecret }) => {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;
    
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDefault, setIsDefault] = useState(false);

    const { data, setData, post } = useForm({
        payment_method_id: '',
        is_default: false
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;
        setIsSubmitting(true);
        setError(null);

        // 1. バリデーションと確定処理
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message);
            setIsSubmitting(false);
            return;
        }

        // 2. Stripeへのセットアップ確認
        // PayPal等のリダイレクトが必要な場合は、ここから自動的に外部の支払い画面へ遷移します
        const { error: setupError, setupIntent } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                // リダイレクト完了後に戻る自社URLを指定
                return_url: route('fan.mypage.payments.callback'),
            },
            redirect: 'if_required' 
        });

        if (setupError) {
            setError(setupError.message);
            setIsSubmitting(false);
            return;
        }

        // 3. クレジットカードなどの即時完了フロー（リダイレクトが不要だった場合）
        if (setupIntent && setupIntent.status === 'succeeded') {
            post(route('fan.mypage.payments.store'), {
                data: {
                    payment_method_id: setupIntent.payment_method,
                    is_default: isDefault
                },
                onBefore: (visit) => {
                    visit.data = {
                        payment_method_id: setupIntent.payment_method,
                        is_default: isDefault
                    };
                },
                onFinish: () => setIsSubmitting(false)
            });
        }
    };

    // UIカスタマイズ設定
    const paymentElementOptions = {
        layout: 'tabs', // 高級感のある洗練されたミニマルなタブレイアウト
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 transition-all">
                <div className="flex items-center gap-3 mb-6 text-slate-400">
                    <Wallet size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{__('Select Payment Method')}</span>
                </div>
                
                {/* 居住国に応じたマルチ決済（クレカ、PayPal、現地ウォレット等）がここに自動展開 */}
                <PaymentElement options={paymentElementOptions} />
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
                    checked={isDefault} 
                    onChange={e => setIsDefault(e.target.checked)}
                    className="w-6 h-6 text-cyan-600 rounded-lg border-slate-200 focus:ring-cyan-500"
                />
                <label htmlFor="is_default" className="text-sm font-bold text-slate-700 cursor-pointer">
                    {__('Set as Primary Payment Method')}
                </label>
            </div>

            <button 
                disabled={!stripe || isSubmitting}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-cyan-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-[0.98]"
            >
                <Lock size={18} />
                {isSubmitting ? __('Processing...') : __('Add Payment Method Securely')}
            </button>
        </form>
    );
};

// --- メインコンポーネント ---
export default function Create({ stripe_key, client_secret }) {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;
    
    const stripePromise = loadStripe(stripe_key);

    // テキストカラーなどのグローバルテーマカスタマイズ
    const options = {
        clientSecret: client_secret,
        appearance: {
            theme: 'none',
            variables: {
                colorPrimary: '#06b6d4', // cyan-500
                colorBackground: '#ffffff',
                colorText: '#0f172a',    // slate-900
                colorDanger: '#pink-500',
                fontFamily: 'Inter, system-ui, sans-serif',
                borderRadius: '16px',
            },
            rules: {
                '.Tab': {
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    boxShadow: 'none'
                },
                '.Tab--selected': {
                    border: '2px solid #06b6d4',
                    backgroundColor: '#ffffff',
                },
                '.Input': {
                    border: '1px solid #e2e8f0',
                    padding: '12px',
                    borderRadius: '12px'
                }
            }
        },
    };

    return (
        <FanLayout>
            <Head title={`${__('Add New Payment Method')} - CirclePort`} />

            <div className="max-w-[800px] mx-auto px-6 py-16">
                <Link 
                    href={route('fan.mypage.payments.index')} 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-600 mb-12 transition-colors"
                >
                    <ChevronLeft size={14} /> {__('Back to Payment Methods')}
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                        {__('Add Payment Method')}
                    </h1>
                    <div className="flex items-center gap-2 text-cyan-600 bg-cyan-50 px-4 py-2 rounded-full inline-flex">
                        <ShieldCheck size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{__('PCI-DSS Compliant Secure Connection')}</span>
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm clientSecret={client_secret} />
                    </Elements>
                </div>

                <p className="mt-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed max-w-[500px] mx-auto">
                    {__('Your billing data is sent directly to secure vaulting. We use multi-route secure gateways to encapsulation and fully shield sensitive target item data from payment networks.')}
                </p>
            </div>
        </FanLayout>
    );
}