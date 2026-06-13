'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''
);

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: plans } = useQuery('billing-plans', () =>
    api.get('/billing/plans').then((res) => res.data)
  );

  const { data: subscription } = useQuery('subscription', () =>
    api.get('/users/subscription').then((res) => res.data)
  );

  const handleCheckout = async (planId: string) => {
    if (planId === 'free') {
      toast.error('You are already on the Free plan');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/billing/checkout', { planId });
      window.location.href = response.data.url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={null} onLogout={() => {}} />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-white mb-2">Billing & Plans</h1>
              <p className="text-gray-400">
                Current Plan: <span className="font-semibold text-primary">{subscription?.plan || 'free'}</span>
              </p>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {plans &&
                plans.map((plan: any) => (
                  <div
                    key={plan.id}
                    className={`rounded-lg p-8 border-2 transition ${
                      subscription?.plan === plan.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <p className="text-4xl font-bold text-white">
                        ${plan.price}
                        {plan.price > 0 && <span className="text-lg text-gray-400">/mo</span>}
                      </p>
                    </div>

                    <div className="mb-8 space-y-3 text-sm">
                      <p className="text-gray-300">
                        📦 {plan.projects === -1 ? 'Unlimited' : plan.projects} Projects
                      </p>
                      <p className="text-gray-300">✨ AI Code Generation</p>
                      <p className="text-gray-300">🤖 Multiple AI Agents</p>
                      <p className="text-gray-300">📊 Analytics Dashboard</p>
                      <p className="text-gray-300">🚀 Priority Deployment</p>
                    </div>

                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loading || subscription?.plan === plan.id}
                      className={`w-full py-2 rounded font-semibold transition ${
                        subscription?.plan === plan.id
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                    >
                      {subscription?.plan === plan.id
                        ? '✓ Current Plan'
                        : 'Upgrade'}
                    </button>
                  </div>
                ))}
            </div>

            {/* FAQ */}
            <div className="bg-dark-card rounded-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Can I change my plan anytime?
                  </h3>
                  <p className="text-gray-400">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-gray-400">
                    We accept all major credit cards through Stripe. Your payment information is secure and encrypted.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Can I get a refund?
                  </h3>
                  <p className="text-gray-400">
                    We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
