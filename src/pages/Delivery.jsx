import { useState, useEffect } from 'react';
import db from '../db';
import { formatCurrency } from '../utils';
import { HiTruck, HiCheck, HiPhone } from 'react-icons/hi2';

const Delivery = () => {
    const [deliveries, setDeliveries] = useState([]);

    const fetchDeliveries = async () => {
        const data = await db.sales.where('status').equals('Pending').reverse().toArray();
        setDeliveries(data);
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const markDelivered = async (id) => {
        await db.sales.update(id, { status: 'Delivered' });
        fetchDeliveries();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Delivery Tracker</h2>
                <p className="text-gray-500 text-sm">Manage pending home deliveries</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {deliveries.map(sale => (
                    <div key={sale.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:border-orange-300 transition">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <HiTruck className="text-6xl text-orange-500" />
                        </div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{sale.customer_name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><HiPhone className="text-xs" /> {sale.customer_phone}</p>
                            </div>
                            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">Pending</span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 h-24 overflow-y-auto">
                            <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-bold">Address</p>
                            {sale.customer_address}
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                            <div>
                                <p className="text-xs text-gray-400">Total Amount</p>
                                <p className="font-bold text-lg text-gray-800">{formatCurrency(sale.total_price)}</p>
                            </div>
                            <button onClick={() => markDelivered(sale.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-green-500/30 transition flex items-center gap-2">
                                <HiCheck /> Mark Delivered
                            </button>
                        </div>
                    </div>
                ))}
                {deliveries.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <HiCheck className="text-2xl text-green-500" />
                        </div>
                        <span className="font-medium">All deliveries completed!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Delivery;
