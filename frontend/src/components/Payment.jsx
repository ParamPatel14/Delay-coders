import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Loader2 } from 'lucide-react';

const Payment = ({ onSuccess }) => {
    const { user } = useAuth();
    const [amount, setAmount] = useState(500); // Default 500 INR
    const [contact, setContact] = useState("9999999999");
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState('Shopping');
    const [subcategory, setSubcategory] = useState('');

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        
        // 1. Load Razorpay Script
        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            // 2. Get Key ID from backend
            const { data: { key } } = await api.get('/payments/key');

            // 3. Create Order by Category
            const { data: orderData } = await api.post('/payments/order-by-category', {
                amount: amount,
                currency: "INR",
                category,
                subcategory: subcategory || null
            });

            // 4. Configure Options
            const options = {
                key: key, 
                amount: orderData.amount,
                currency: orderData.currency,
                name: "GreenZaction",
                description: "Add Funds",
                order_id: orderData.order_id,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            category,
                            subcategory: subcategory || null
                        });
                        alert('Payment successful');
                        if (onSuccess) onSuccess(); // Refresh dashboard
                    } catch (error) {
                        console.error(error);
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: user?.full_name || "GreenZaction User",
                    email: user?.email || "user@example.com",
                    contact: contact
                },
                theme: {
                    color: "#10B981" // Green-500
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay via UPI",
                                instruments: [{ method: "upi" }]
                            },
                            other: {
                                name: "Other Payment Modes",
                                instruments: [
                                    { method: "card" },
                                    { method: "netbanking" }
                                ]
                            }
                        },
                        sequence: ["block.upi", "block.other"],
                        preferences: {
                            show_default_blocks: true
                        }
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Payment Error: ", error);
            alert("Something went wrong during payment initialization.");
        } finally {
            setLoading(false);
        }
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        className="block w-full border-gray-300 rounded-md py-2 px-3 border"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setSubcategory('');
                        }}
                    >
                        <option value="Gas">Gas</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Travel">Travel</option>
                        <option value="Sustainable Travel">Sustainable Travel</option>
                        <option value="Others">Others</option>
                    </select>
                </div>

                {category === 'Shopping' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shopping Type
                        </label>
                        <select
                            className="block w-full border-gray-300 rounded-md py-2 px-3 border"
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                        >
                            <option value="">Select</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                        </select>
                    </div>
                )}

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
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
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
                    Secured by Razorpay
                </p>
            </div>
        </div>
    );
};

export default Payment;
