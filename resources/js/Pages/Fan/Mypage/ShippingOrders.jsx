import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { Truck, ChevronRight, Package, Calendar, MapPin, Box } from 'lucide-react';

export default function ShippingOrders({ orders }) {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;

    return (
        <FanLayout>
            <Head title={`${__('In Transit')} - CirclePort`} />

            <div className="max-w-6xl mx-auto px-8 py-16">
                <div className="mb-12 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <Truck className="text-blue-500" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                            {__('In Transit')}
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
                            {__('Items being shipped to the warehouse')}
                        </p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                        <Box className="mx-auto text-slate-300 mb-6" size={48} />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                            {__('No items in transit')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={route('fan.orders.show', order.id)}
                                className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-xl hover:border-blue-500 transition-all"
                            >
                                <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Items Preview */}
                                    <div className="flex -space-x-3">
                                        {order.orderItems.slice(0, 4).map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="w-16 h-16 rounded-xl border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm"
                                            >
                                                {item.product?.images?.[0]?.file_path ? (
                                                    <img
                                                        src={`/storage/${item.product.images[0].file_path}`}
                                                        alt={item.product.translations?.[0]?.name}
                                                        className="w-full h-full object-cover rounded-[9px]"
                                                    />
                                                ) : (
                                                    <Package size={20} className="text-slate-300" />
                                                )}
                                                <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[8px] px-1.5 font-black rounded-full">
                                                    x{item.quantity}
                                                </div>
                                            </div>
                                        ))}
                                        {order.orderItems.length > 4 && (
                                            <div className="w-16 h-16 rounded-xl border-2 border-white bg-slate-100 flex items-center justify-center font-black text-slate-500">
                                                +{order.orderItems.length - 4}
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Details */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h2 className="text-lg font-black text-slate-900 uppercase">
                                                Order #{order.id}
                                            </h2>
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {__('In Transit to Warehouse')}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-500 text-xs uppercase tracking-[0.2em] font-black">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-300" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-slate-300" />
                                                {order.shippingAddress?.country?.name || __('N/A')}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package size={14} className="text-slate-300" />
                                                {order.orderItems.length} {__('Items')}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                                                    {__('Total Amount')}
                                                </p>
                                                <p className="text-2xl font-black text-slate-900">
                                                    ¥{order.total_amount?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                <ChevronRight size={24} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </FanLayout>
    );
}
