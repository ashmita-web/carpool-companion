import React, { useState } from 'react';
import { Crown, Check, Star, Shield, Filter, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from '../hooks/usePremium';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

export default function Upgrade() {
  const { user } = useAuth();
  const { isPremium, upgradeToPremium } = usePremium();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { error } = await upgradeToPremium();
      if (error) {
        alert('Failed to upgrade. Please try again.');
      } else {
        alert('🎉 Welcome to Premium! You now have access to all premium features.');
      }
    } catch (error) {
      alert('Failed to upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const features = [
    {
      icon: Star,
      title: 'Priority Matching',
      description: 'Your rides appear first in search results',
      color: 'text-yellow-600'
    },
    {
      icon: Crown,
      title: 'Premium Badge',
      description: 'Stand out with a premium badge on your profile',
      color: 'text-yellow-600'
    },
    {
      icon: Filter,
      title: 'Advanced Filters',
      description: 'Filter by smoking, music, pets, and personality preferences',
      color: 'text-blue-600'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Get faster response times for any issues',
      color: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'Early Access',
      description: 'Be the first to try new features and updates',
      color: 'text-purple-600'
    }
  ];

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Premium! 🎉</h1>
            <p className="text-gray-600">Thank you for supporting CarpoolCompanion</p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Premium Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Go Premium</h1>
          <p className="text-gray-600">Unlock advanced features and get priority access</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pricing Card */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">₹50</div>
                <div className="text-gray-600">per month</div>
              </div>
              
              <Button
                onClick={handleUpgrade}
                loading={upgrading}
                className="w-full mb-4"
                size="lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
              
              <p className="text-xs text-gray-500">
                Cancel anytime. No hidden fees.
              </p>
            </Card>
          </div>

          {/* Features List */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Premium Features</h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg bg-white`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your premium subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What happens to my data if I cancel?</h3>
              <p className="text-gray-600">All your ride history and profile data remains intact. You'll just lose access to premium features.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Do premium users get better matches?</h3>
              <p className="text-gray-600">Premium users get priority placement in search results and access to advanced filters for better compatibility matching.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}