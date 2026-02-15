import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Loader2, ShoppingCart, Car, Plane, Leaf, Package } from 'lucide-react';

const Payment = ({ onSuccess }) => {
    const { user } = useAuth();
    const [amount, setAmount] = useState(500);
    const [contact, setContact] = useState("9999999999");
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState('Shopping');
    const [subcategory, setSubcategory] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        try {
            const { data: orderData } = await api.post('/payments/order-by-category', {
                amount,
                currency: "INR",
                category,
                subcategory: subcategory || null
            });

            await api.post('/payments/verify', {
                order_id: orderData.order_id,
                category,
                subcategory: subcategory || null
            });

            alert('Payment successful');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Payment Error: ", error);
            alert("Something went wrong while processing the payment.");
        } finally {
            setLoading(false);
        }
    };

    const presetMap = {
        Gas: [500, 1000, 2000],
        Shopping: {
            Groceries: [500, 800, 1200],
            Electronics: [5000, 10000, 20000],
            Clothing: [1000, 2500, 4000]
        },
        Travel: [2000, 5000, 10000],
        Others: [300, 700, 1500]
    };

    const CategoryTile = ({ value, icon: Icon }) => (
        <button
            type="button"
            className={`flex items-center justify-center border rounded-md px-3 py-2 text-sm w-full ${category === value ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 bg-white'}`}
            onClick={() => {
                setCategory(value);
                setSubcategory('');
                const presets = Array.isArray(presetMap[value]) ? presetMap[value] : presetMap[value]?.[subcategory] || [];
                if (presets && presets.length) setAmount(presets[0]);
            }}
        >
            <Icon className="h-4 w-4 mr-2" />
            {value}
        </button>
    );

    const renderPresets = () => {
        let presets = [];
        if (category === 'Shopping') {
            if (subcategory && presetMap.Shopping[subcategory]) {
                presets = presetMap.Shopping[subcategory];
            }
        } else {
            presets = Array.isArray(presetMap[category]) ? presetMap[category] : [];
        }
        if (!presets || presets.length === 0) return null;
        return (
            <div className="flex space-x-2">
                {presets.map((p) => (
                    <button
                        key={p}
                        type="button"
                        className={`px-3 py-1 rounded-md border text-sm ${amount === p ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 bg-white'}`}
                        onClick={() => setAmount(p)}
                    >
                        ₹{p}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                    <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Pay by Category</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                        <CategoryTile value="Gas" icon={Car} />
                        <CategoryTile value="Shopping" icon={ShoppingCart} />
                        <CategoryTile value="Travel" icon={Plane} />
                        <CategoryTile value="Others" icon={Package} />
                    </div>
                </div>

                {category === 'Shopping' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shopping Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Groceries', 'Electronics', 'Clothing'].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    className={`px-3 py-2 rounded-md border text-sm ${subcategory === opt ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 bg-white'}`}
                                    onClick={() => {
                                        setSubcategory(opt);
                                        const presets = presetMap.Shopping[opt];
                                        if (presets && presets.length) setAmount(presets[0]);
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {category === 'Travel' && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Sustainable option</span>
                        <button
                            type="button"
                            className={`px-3 py-1 rounded-full border text-xs ${subcategory === 'Sustainable' ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 bg-white'}`}
                            onClick={() => {
                                const next = subcategory === 'Sustainable' ? '' : 'Sustainable';
                                setSubcategory(next);
                                const presets = presetMap.Travel;
                                if (presets && presets.length) setAmount(next ? 1500 : presets[0]);
                            }}
                        >
                            {subcategory === 'Sustainable' ? 'Enabled' : 'Enable'}
                        </button>
                    </div>
                )}

                <div>{renderPresets()}</div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (INR)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="contact"
                        id="contact"
                        className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        placeholder="9999999999"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                    />
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Processing...
                        </>
                    ) : (
                        'Pay Now'
                    )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">
                    Processed by GreenZaction Pay
                </p>
            </div>
        </div>
    );
};

export default Payment;
