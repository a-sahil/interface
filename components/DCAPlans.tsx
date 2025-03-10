'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { getDCAPlans } from '@/services/dcaService';
import { executeDCA } from '@/services/dcaExecutor';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface DCAPlan {
  _id: string;
  token: string;
  amount: number;
  frequency: string;
  toAddress: string;
  riskLevel: string;
  userAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DCAPlans() {
  const [plans, setPlans] = useState<DCAPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executingPlan, setExecutingPlan] = useState<string | null>(null);
  const { address, isConnected } = useAccount();

  const fetchPlans = async () => {
    if (!isConnected || !address) {
      setPlans([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getDCAPlans();
      console.log("Fetched plans:", data);
      
      // Filter plans that belong to the current user
      const userPlans = Array.isArray(data) 
        ? data.filter(plan => plan.userAddress?.toLowerCase() === address.toLowerCase())
        : [];
        
      setPlans(userPlans);
    } catch (err) {
      console.error('Error fetching DCA plans:', err);
      setError('Failed to load your DCA plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [address, isConnected]);

  const handleExecute = async (planId: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      setExecutingPlan(planId);
      toast.info('Preparing transaction. Please confirm in your wallet...');
      
      // Execute the DCA plan using the connected wallet
      const result = await executeDCA(planId);
      
      console.log('DCA execution result:', result);
      toast.success('Transaction sent successfully!');
      
      // Refresh plans after execution
      fetchPlans();
    } catch (error) {
      console.error('Error executing DCA plan:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setExecutingPlan(null);
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="text-center p-8 mt-8 bg-zinc-900 rounded-lg border border-zinc-800">
        <p className="text-zinc-400">Connect your wallet to view your DCA plans</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-8 mt-8 bg-zinc-900 rounded-lg border border-zinc-800">
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <p className="text-zinc-400 mt-4">Loading your DCA plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 mt-8 bg-zinc-900 rounded-lg border border-zinc-800">
        <p className="text-red-400">{error}</p>
        <Button 
          onClick={fetchPlans} 
          className="mt-4 bg-blue-500 hover:bg-blue-600"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center p-8 mt-8 bg-zinc-900 rounded-lg border border-zinc-800">
        <p className="text-zinc-400">You don't have any DCA plans yet</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your DCA Plans</h2>
        <Button 
          onClick={fetchPlans}
          variant="outline"
          className="text-zinc-300 border-zinc-700 hover:bg-zinc-800"
        >
          Refresh
        </Button>
      </div>
      
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 rounded-lg border border-zinc-800 p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {plan.amount} {plan.token.toUpperCase()}
                </h3>
                <p className="text-zinc-400 mt-1">
                  <span className="px-2 py-1 bg-zinc-800 rounded text-xs mr-2">
                    {plan.frequency}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    plan.riskLevel === 'low' 
                      ? 'bg-green-900 text-green-300' 
                      : plan.riskLevel === 'medium'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {plan.riskLevel.charAt(0).toUpperCase() + plan.riskLevel.slice(1)} Risk
                  </span>
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-zinc-400 text-sm">
                  To: <span className="font-mono text-zinc-300">{plan.toAddress.slice(0, 6)}...{plan.toAddress.slice(-4)}</span>
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  Created: {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
              <Button
                onClick={() => handleExecute(plan._id)}
                disabled={executingPlan === plan._id}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {executingPlan === plan._id ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Executing...
                  </>
                ) : (
                  'Execute DCA'
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}