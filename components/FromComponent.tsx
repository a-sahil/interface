'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import WalletConnect from '@/components/WalletConnect';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { createDCAPlan } from '@/services/dcaService';
import DCAPlans  from '@/components/DCAPlans';

const formSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  frequency_value: z.string().min(1, 'Frequency value is required'),
  frequency_unit: z.string().min(1, 'Frequency unit is required'),
  to_address: z.string().min(42, 'Invalid address').max(42, 'Invalid address'),
  token_symbol: z.string(),
  risk_level: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a risk level',
  }),
});

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address: userAddress, isConnected } = useAccount();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      frequency_value: '',
      frequency_unit: 'minutes',
      to_address: '',
      token_symbol: 'SONIC',
      risk_level: 'low',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format frequency string (e.g., "5 minutes", "2 hours")
      const frequency = `${values.frequency_value} ${values.frequency_unit}`;
      
      // Submit data to backend
      await createDCAPlan({
        token: values.token_symbol.toLowerCase(),
        amount: parseFloat(values.amount),
        frequency: frequency,
        toAddress: values.to_address,
        riskLevel: values.risk_level,
      }, userAddress);
      
      // In a production app, you might want to refresh the DCA plans list here
      
      toast.success('Transaction scheduled successfully!');
      
      // Reset form after successful submission
      form.reset({
        amount: '',
        frequency_value: '',
        frequency_unit: 'minutes',
        to_address: '',
        token_symbol: 'SONIC',
        risk_level: 'low',
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to schedule transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <WalletConnect />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-white">Schedule Transaction</h1>
            <p className="text-zinc-400">
              Set up your recurring transaction details below
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Amount per Transfer</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0.0" 
                          {...field} 
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="token_symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Token</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled
                          className="bg-zinc-800 border-zinc-700 text-white uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <FormField
                  control={form.control}
                  name="frequency_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Frequency</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field} 
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="risk_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Risk Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-zinc-500">
                        Choose your preferred risk level for this transaction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="to_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">To Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0x..." 
                          {...field} 
                          className="bg-zinc-800 border-zinc-700 text-white font-mono placeholder:text-zinc-500"
                        />
                      </FormControl>
                      <FormDescription className="text-zinc-500">
                        Enter the recipient's wallet address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting || !isConnected}
                  className={`w-full bg-white text-black hover:bg-zinc-200 transition-colors 
                    ${(!isConnected || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full mr-2"></span>
                      Processing...
                    </div>
                  ) : (
                    'Schedule Transaction'
                  )}
                </Button>
                {!isConnected && (
                  <p className="text-red-400 text-xs mt-2 text-center">
                    Please connect your wallet to schedule a transaction
                  </p>
                )}
              </motion.div>
            </form>
          </Form>
        </div>
        
        {/* Display user's DCA plans */}
        <DCAPlans />
      </motion.div>
    </div>
  );
}