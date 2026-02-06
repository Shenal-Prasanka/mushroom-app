import { useState, useEffect } from 'react';
import db from '../db';
import { formatCurrency } from '../utils';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi2';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        const data = await db.products.toArray();
        setProducts(data);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await db.products.delete(id);
            fetchProducts();
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            category: formData.get('category'),
            source: formData.get('source'),
            cost_price: parseFloat(formData.get('cost_price')),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock'))
        };

        if (editingProduct) {
            await db.products.update(editingProduct.id, data);
        } else {
            await db.products.add(data);
        }

        setIsModalOpen(false);
        fetchProducts();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
                    <p className="text-gray-500 text-sm">Manage stock, prices, and sources</p>
                </div>
                <button onClick={handleAdd} className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center gap-2" style={{ backgroundColor: '#10b981' }}>
                    <HiPlus /> Add New Batch
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">Product Name</th>
                                <th className="px-6 py-3 font-medium">Category</th>
                                <th className="px-6 py-3 font-medium">Source</th>
                                <th className="px-6 py-3 font-medium text-right">Cost</th>
                                <th className="px-6 py-3 font-medium text-right">Price (Retail)</th>
                                <th className="px-6 py-3 font-medium text-center">Stock</th>
                                <th className="px-6 py-3 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{p.category || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${p.source === 'Own' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {p.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500">{formatCurrency(p.cost_price || 0)}</td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-800">{formatCurrency(p.price)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700 p-2"><HiPencil /></button>
                                            <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 p-2"><HiTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400">No products in inventory</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative z-10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Batch'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input type="text" name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select name="category" defaultValue={editingProduct?.category} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="Mushrooms">Mushrooms</option>
                                        <option value="Seeds">Seeds</option>
                                        <option value="Equipment">Equipment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                                    <select name="source" defaultValue={editingProduct?.source} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="Own">Own Production</option>
                                        <option value="Wholesale">Wholesale Purchase</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                                    <input type="number" name="cost_price" defaultValue={editingProduct?.cost_price} step="0.01" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price</label>
                                    <input type="number" name="price" defaultValue={editingProduct?.price} step="0.01" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                <input type="number" name="stock" defaultValue={editingProduct?.stock} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>

                            <button type="submit" className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-emerald-500/30 transition">
                                {editingProduct ? 'Update Product' : 'Save Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
