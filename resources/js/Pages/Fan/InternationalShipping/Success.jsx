import React from 'react';
import FanLayout from '@/Layouts/FanLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Success({ auth, shipping }) {
    const { translations = {} } = usePage().props;
    const __ = (key) => translations[key] || key;

    return (
        <FanLayout user={auth.user}>
            <Head title={__('Payment Completed')} />

            <div className="max-w-3xl mx-auto py-20 px-4">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden text-center">
                    {/* お祝いのアニメーション的な背景 */}
                    <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400"></div>
                    
                    <div className="p-10 md:p-16">
                        {/* 成功アイコン */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center animate-bounce">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 mb-4">
                            {__('Thank you for your payment!')}
                        </h1>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            {__('We have confirmed your payment for international shipping. Your items will be prepared for shipment shortly.')}
                        </p>

                        {/* 配送概要カード */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-10 inline-block text-left border border-gray-100 min-w-[300px]">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400 text-sm">{__('Shipping ID')}</span>
                                <span className="font-mono font-bold text-gray-900">#{shipping.id}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400 text-sm">{__('Carrier')}</span>
                                <span className="font-bold text-gray-900">{shipping.carrier?.name}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 mt-2 pt-2">
                                <span className="text-gray-400 text-sm">{__('Total Paid')}</span>
                                <span className="font-black text-indigo-600">￥{shipping.shipping_fee.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('fan.international-shippings.index')}
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                            >
                                {__('Back to Shipping List')}
                            </Link>
                            <Link
                                href={route('fan.mypage.dashboard')}
                                className="px-8 py-4 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                            >
                                {__('Go to Dashboard')}
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-400">
                    {__('A confirmation email has been sent to your registered email address.')}
                </p>
            </div>
        </FanLayout>
    );
}