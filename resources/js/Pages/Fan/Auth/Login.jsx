import React from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Sparkles, Globe } from 'lucide-react';

export default function Login() {
    // Middlewareから共有されたリアルタイムロケールと言語データを取得
    const { language, current_locale } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // 【17カ国多言語・完全補斉マトリクス】全体的な色はクリーンな白・ライトグレーのまま構成
    const visualMatrix = {
        en: {
            title: "Your Secure Passport to Japan's Indie Art",
            desc: "Log in to manage your active pre-orders, join community group orders, and support your favorite Vtuber artists directly.",
            badge: "GLOBAL FULFILLMENT PORT // US, CA, GB, AU, NZ, SG, MY",
            bgClass: "bg-gradient-to-br from-cyan-50/60 via-indigo-50/30 to-white",
            accentText: "text-indigo-600"
        },
        id: {
            title: "Selamat Datang Kembali, Penggemar Vtuber!",
            desc: "Periksa status Group Order komunitasmu, selesaikan pembayaran dua tahap, hemat ongkir internasional hingga 70%.",
            badge: "REGION INDONESIA & ASEAN SUPPORTED",
            bgClass: "bg-gradient-to-br from-emerald-50/50 via-teal-50/25 to-white",
            accentText: "text-emerald-600"
        },
        zh: {
            title: "歡迎回到官方原創集運特設港",
            desc: "登入您的海外專屬帳戶，追蹤二階段國際物流狀態，告別昂貴代購，直通日本即售會。",
            badge: "東亞、大中華區官方物流節點 // CN, TW, HK",
            bgClass: "bg-gradient-to-br from-purple-50/50 via-pink-50/25 to-white",
            accentText: "text-purple-600"
        },
        th: {
            title: "ยินดีต้อนรับกลับสู่คอมมูนิตี้ Vtuber!",
            desc: "เข้าสู่ระบบเพื่อจัดการใบสั่งซื้อล่วงหน้าและเข้าร่วม Group Order ประหยัดค่าส่งตรงจากญี่ปุ่นสูงสุด 70%",
            badge: "THAILAND REGION NODE // CONNECTED",
            bgClass: "bg-gradient-to-br from-amber-50/50 via-orange-50/20 to-white",
            accentText: "text-amber-600"
        },
        vi: {
            title: "Chào mừng trở lại trạm trung chuyển CirclePort!",
            desc: "Đăng nhập để theo dõi đơn đặt hàng trước, tham gia Group Order tiết kiệm chi phí vận chuyển quốc tế từ Nhật Bản.",
            badge: "VIETNAM OFFICIAL LOGISTICS NODE // VN",
            bgClass: "bg-gradient-to-br from-red-50/40 via-orange-50/20 to-white",
            accentText: "text-red-600"
        },
        ko: {
            title: "일본 버튜버 오리지널 굿즈 공식 직배송 포트",
            desc: "로그인하여 예약 주문 및 그룹 오더 상태를 확인하세요. 일본 동인지 즉매회에서 해외 팬의 집 앞까지 정식 통관 인보이스 자동 발송.",
            badge: "KOREA LIVE NODE // KR ONLINE",
            bgClass: "bg-gradient-to-br from-blue-50/50 via-slate-100/50 to-white",
            accentText: "text-blue-600"
        },
        fr: {
            title: "Votre passerelle directe vers la culture Vtuber",
            desc: "Connectez-vous pour suivre vos précommandes et rejoindre les commandes groupées de la communauté sans frais de proxy.",
            badge: "NODE EU / FRANCE // COMPLIANT",
            bgClass: "bg-gradient-to-br from-sky-50/50 via-rose-50/20 to-white",
            accentText: "text-sky-600"
        },
        de: {
            title: "Willkommen zurück am offiziellen Fulfillment-Knoten",
            desc: "Melden Sie sich an, um Vorbestellungen zu verwalten und an Group Orders teilzunehmen. Sicherer und zollkonformer Versand.",
            badge: "NODE EU / DEUTSCHLAND // DE ACTIVE",
            bgClass: "bg-gradient-to-br from-amber-50/40 via-slate-100/40 to-white",
            accentText: "text-amber-700"
        }
    };

    // 該当言語がない場合は世界共通の英語（en）を適用
    const currentVisual = visualMatrix[current_locale] || visualMatrix.en;

    const submit = (e) => {
        e.preventDefault();
        post(route('fan.login.store'));
    };

    const inputWrapperStyle = "relative group";
    const iconStyle = "absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors";
    const inputStyle = "w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100/70 rounded-2xl font-bold text-slate-900 outline-none focus:border-cyan-500 focus:bg-white transition-all placeholder:text-slate-300 font-sans";

    return (
        // 全体の色は以前と同じ白・ライトグレー（bg-slate-50）ベース
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 overflow-hidden">
            <Head title={__('Welcome Back!')} />

            {/* 左側：17カ国のロケール検知で自動で切り替わるクリーンなブランドエリア */}
            <div className={`hidden lg:flex lg:w-1/2 relative flex-col justify-between p-20 ${currentVisual.bgClass} border-r border-slate-100`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-70" />
                
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                        <span className="font-black text-white text-xl tracking-tighter">C</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-widest uppercase">circle-port</span>
                </div>

                <div className="relative max-w-xl space-y-6 my-auto">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-100 ${currentVisual.accentText} rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                        <Sparkles size={12} />
                        {currentVisual.badge}
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 leading-[1.15] tracking-tighter">
                        {currentVisual.title}
                    </h2>
                    <p className="text-slate-500 font-medium text-base leading-relaxed">
                        {currentVisual.desc}
                    </p>
                </div>

                <div className="relative text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-2">
                    <Globe size={14} className="text-slate-300" />
                    CirclePort Fullfillment Node // Supporting Japanese Creator Ecosystem Globally.
                </div>
            </div>

            {/* 右側：ログインフォーム（既存のクリーンな白ベースの構造を5:5で美しくマージ） */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white relative overflow-y-auto">
                <div className="w-full max-w-md space-y-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
                            {__('Welcome Back')}
                        </h1>
                        <p className="text-slate-400 font-bold mt-1 text-sm">
                            {__('Login to your passport to Japan\'s Indie Art')}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                                {__('Email Address')}
                            </label>
                            <div className={inputWrapperStyle}>
                                <Mail size={20} className={iconStyle} />
                                <input 
                                    type="email" 
                                    placeholder="you@example.com"
                                    value={data.email}
                                    className={inputStyle}
                                    onChange={e => setData('email', e.target.value)} 
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest ml-4">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-4 pr-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {__('Password')}
                                </label>
                                <Link href="#" className="text-[10px] font-bold text-cyan-600 hover:text-slate-900 transition-colors uppercase tracking-widest underline underline-offset-4 decoration-2">
                                    {__('Forgot Password?')}
                                </Link>
                            </div>
                            <div className={inputWrapperStyle}>
                                <Lock size={20} className={iconStyle} />
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={data.password}
                                    className={inputStyle}
                                    onChange={e => setData('password', e.target.value)} 
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest ml-4">{errors.password}</p>}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center ml-2 pt-2">
                            <label className="flex items-center cursor-pointer group select-none relative">
                                <input 
                                    type="checkbox" 
                                    id="remember" 
                                    checked={data.remember}
                                    className="sr-only"
                                    onChange={e => setData('remember', e.target.checked)} 
                                />
                                <div className={`w-5 h-5 rounded-md border-2 transition-all ${data.remember ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-50 border-slate-200 group-hover:border-cyan-300'}`}>
                                    {data.remember && <ShieldCheck size={14} className="text-white absolute top-0.5 left-0.5" />}
                                </div>
                                <span className="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                                    {__('Remember Me')}
                                </span>
                            </label>
                        </div>

                        <button 
                            disabled={processing} 
                            className="group w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-[0.2em] hover:bg-cyan-600 transition-all active:scale-[0.99] flex items-center justify-center gap-3 shadow-xl shadow-slate-100 mt-6"
                        >
                            {processing ? __('Processing...') : __('Log In')}
                            {!processing && <LogIn size={20} className="group-hover:translate-x-0.5 transition-transform" />}
                        </button>
                    </form>

                    {/* 【追加提案反映】日本国内への配送不可・BOOTH案内アナウンスの常設スロット */}
                    <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed font-sans">
                            🇯🇵 <span className="font-bold text-slate-500">【日本国内への配送をご希望の方へ】</span><br />
                            サークルポートは海外居住のファン専用インフラです。日本住所への発送はできません。国内配送をご希望のお客様は、各サークル様のBOOTHショップ等をご利用ください。
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-400 font-bold text-xs">
                            {__('New to CirclePort?')}
                            <Link href={route('fan.register')} className="ml-2 text-slate-900 hover:text-cyan-600 font-black underline decoration-2 underline-offset-4 transition-colors">
                                {__('Create Account!')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}