import { useState, useEffect, useMemo } from 'react';
import db from '../db';
import { formatCurrency } from '../utils';
import { HiMagnifyingGlass, HiPlus, HiTrash, HiShoppingCart } from 'react-icons/hi2';

const POS = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [orderType, setOrderType] = useState('Store'); // or 'Delivery'
    const [deliveryDetails, setDeliveryDetails] = useState({ name: '', phone: '', address: '' });
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        db.products.toArray().then(setProducts);
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'all' || p.source === filter;
            return matchesSearch && matchesFilter;
        });
    }, [products, search, filter]);

    const addToCart = (product) => {
        if (product.stock <= 0) return alert('Out of stock');

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock) {
                    alert('Max stock reached');
                    return prev;
                }
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id, change) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.qty + change;
                if (newQty <= 0) return null;
                if (newQty > item.stock) return item;
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Cart is empty');
        if (orderType === 'Delivery' && (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address)) {
            return alert('Please fill delivery details');
        }

        // Handle Date Logic
        const parts = saleDate.split('-').map(Number);
        const now = new Date();
        // Create date object with local time components but set hours/min to current to avoid default 00:00
        const finalDate = new Date(parts[0], parts[1] - 1, parts[2], now.getHours(), now.getMinutes()).toISOString();

        const sale = {
            date: finalDate, // Use selected date
            type: orderType === 'Delivery' ? 'Delivery' : 'Store Pickup',
            total_price: cartTotal,
            status: orderType === 'Delivery' ? 'Pending' : 'Completed',
            customer_name: deliveryDetails.name,
            customer_phone: deliveryDetails.phone,
            customer_address: deliveryDetails.address,
            items: cart
        };

        try {
            await db.transaction('rw', db.products, db.sales, async () => {
                await db.sales.add(sale);
                for (const item of cart) {
                    const product = await db.products.get(item.id);
                    if (product) {
                        await db.products.update(item.id, { stock: product.stock - item.qty });
                    }
                }
            });

            alert('Sale completed!');
            setCart([]);
            setDeliveryDetails({ name: '', phone: '', address: '' });
            // Refresh products to show new stock
            db.products.toArray().then(setProducts);
        } catch (e) {
            console.error(e);
            alert('Transaction failed');
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-2rem)]">
            <div className="flex-1 flex flex-col md:h-full md:overflow-hidden">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Point of Sale</h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <HiMagnifyingGlass className="absolute left-4 top-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'Own', 'Wholesale'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${filter === f ? 'bg-gray-100 font-bold' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                            >
                                {f === 'all' ? 'All' : (f === 'Own' ? 'Own Produced' : 'Wholesale')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map(p => (
                            <div key={p.id} onClick={() => addToCart(p)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer transition flex flex-col h-full group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">{p.source}</span>
                                    <span className="font-bold text-primary">{formatCurrency(p.price)}</span>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1 flex-1 group-hover:text-primary transition">{p.name}</h3>
                                <p className="text-xs text-gray-500 mb-3">{p.category || 'Mushroom Product'}</p>
                                <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-50">
                                    <span className={`text-xs ${p.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{p.stock} in stock</span>
                                    <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center transition shadow-lg shadow-emerald-500/30" style={{ backgroundColor: '#10b981' }}>
                                        <HiPlus />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full md:w-96 bg-white rounded-2xl shadow-xl flex flex-col h-full border border-gray-100 flex-shrink-0 z-10 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><HiShoppingCart className="text-primary" /> Current Order</h3>
                    <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <HiShoppingCart className="text-4xl mb-2" />
                            <span>Cart is empty</span>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-500 border border-gray-200 font-bold text-xs">
                                    {item.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} x {item.qty}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-xs text-white">-</button>
                                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-primary text-white hover:bg-emerald-600 flex items-center justify-center text-xs">+</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-4">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-bold">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(cartTotal)}</span>
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Transaction Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:ring-2 focus:outline-none focus:ring-primary/20 font-bold text-gray-700"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 bg-gray-200 p-1 rounded-xl">
                        <button
                            className={`py-2 text-sm font-bold rounded-lg transition ${orderType === 'Store' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                            onClick={() => setOrderType('Store')}
                        >
                            Store Pickup
                        </button>
                        <button
                            className={`py-2 text-sm font-bold rounded-lg transition ${orderType === 'Delivery' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                            onClick={() => setOrderType('Delivery')}
                        >
                            Home Delivery
                        </button>
                    </div>

                    {orderType === 'Delivery' && (
                        <div className="space-y-3 pt-2 animate-fade-in">
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:outline-none focus:ring-primary/20"
                                value={deliveryDetails.name}
                                onChange={e => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:outline-none focus:ring-primary/20"
                                value={deliveryDetails.phone}
                                onChange={e => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                            />
                            <textarea
                                placeholder="Delivery Address"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:outline-none focus:ring-primary/20"
                                rows="2"
                                value={deliveryDetails.address}
                                onChange={e => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                            ></textarea>
                        </div>
                    )}

                    <button onClick={handleCheckout} className="w-full py-4 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition flex justify-center items-center gap-2 group" style={{ backgroundColor: '#10b981' }}>
                        <span>Complete Sale</span>
                        <HiShoppingCart className="group-hover:translate-x-1 transition" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
