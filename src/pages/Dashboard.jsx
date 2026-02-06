import { useState, useEffect } from 'react';
import db from '../db';
import { formatCurrency } from '../utils';
import { useNavigate } from 'react-router-dom';
import { HiWallet, HiArchiveBox, HiTruck, HiChartBar } from 'react-icons/hi2';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        salesToday: 0,
        transactions: 0,
        profitToday: 0,
        totalStock: 0,
        lowStock: 0,
        pendingDeliveries: 0,
        recentSales: []
    });

    useEffect(() => {
        const loadStats = async () => {
            const today = new Date().toDateString();
            const allSales = await db.sales.toArray();
            // Filter by date string matching local date
            const salesToday = allSales.filter(s => new Date(s.date).toDateString() === today);

            let revenue = 0;
            let profit = 0;

            salesToday.forEach(sale => {
                revenue += (parseFloat(sale.total_price) || 0);
                if (sale.items) {
                    sale.items.forEach(item => {
                        const cost = parseFloat(item.cost_price) || 0;
                        const price = parseFloat(item.price) || 0;
                        profit += (price - cost) * item.qty;
                    });
                }
            });

            const products = await db.products.toArray();
            const stock = products.reduce((sum, p) => sum + (parseFloat(p.stock) || 0), 0);
            const low = products.filter(p => p.stock < 10).length;

            const pending = await db.sales.where('status').equals('Pending').count();

            const recent = allSales.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

            setStats({
                salesToday: revenue,
                transactions: salesToday.length,
                profitToday: profit,
                totalStock: stock,
                lowStock: low,
                pendingDeliveries: pending,
                recentSales: recent
            });
        };

        loadStats();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                    <p className="text-gray-500 text-sm">Welcome back, Admin</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/inventory')} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 hover:bg-gray-50 transition text-sm font-medium rounded-lg shadow-sm flex items-center gap-2">
                        Add Stock
                    </button>
                    <button onClick={() => navigate('/pos')} className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg transition text-sm font-medium shadow-lg flex items-center gap-2" style={{backgroundColor: '#10b981'}}>
                        New Sale
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sales Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Sales Today</p>
                        <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.salesToday)}</h3>
                        <p className="text-xs text-secondary mt-2 font-medium">{stats.transactions} orders</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                        <HiWallet className="text-xl" />
                    </div>
                </div>

                {/* Profit Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Profit Today</p>
                        <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.profitToday)}</h3>
                        <p className="text-xs text-green-500 mt-2 font-medium">Net Profit</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                        <HiChartBar className="text-xl" />
                    </div>
                </div>

                {/* Stock Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Total Stock</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.totalStock}</h3>
                        <p className={`text-xs mt-2 font-medium ${stats.lowStock > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {stats.lowStock > 0 ? `${stats.lowStock} low stock` : 'Healthy'}
                        </p>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                        <HiArchiveBox className="text-xl" />
                    </div>
                </div>

                {/* Delivery Card */}
                <div
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between cursor-pointer hover:border-orange-200 transition"
                    onClick={() => navigate('/delivery')}
                >
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Pending Delivery</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.pendingDeliveries}</h3>
                        <p className="text-xs text-orange-500 mt-2 font-medium">View pending</p>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                        <HiTruck className="text-xl" />
                    </div>
                </div>
            </div>

            {/* Recent Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Details</th>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentSales.map(sale => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="text-sm font-bold text-gray-700">{new Date(sale.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                                        <div className="text-xs text-gray-400">{new Date(sale.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{sale.customer_name || 'Walk-in Customer'}</div>
                                        <div className="text-xs text-gray-500">{sale.type === 'Delivery' ? 'Home Delivery' : 'In-Store'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.type === 'Delivery' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {sale.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-800">{formatCurrency(sale.total_price)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${['Completed', 'Delivered'].includes(sale.status) ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {stats.recentSales.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No transactions yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
