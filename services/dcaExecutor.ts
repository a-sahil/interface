/**
 * Frontend service for DCA execution
 * This file handles DCA operations using the connected wallet
 */

// Define the base API URL from environment variable or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Execute a DCA plan by plan ID
 * Uses the connected wallet to perform the transaction
 */
export const executeDCA = async (planId: string) => {
  try {
    console.log(`Initiating DCA execution for plan ${planId}`);
    
    // First, fetch the plan details with adjusted amount based on risk analysis
    const preparationResponse = await fetch(`${API_BASE_URL}/api/dca/prepareDCA/${planId}`);
    
    if (!preparationResponse.ok) {
      throw new Error(`Error preparing DCA execution: ${preparationResponse.status} ${preparationResponse.statusText}`);
    }
    
    const preparation = await preparationResponse.json();
    console.log(`Plan preparation data:`, preparation);
    
    if (!preparation.success || !preparation.planDetails) {
      throw new Error('Failed to prepare DCA execution');
    }
    
    const { planDetails, adjustedAmount } = preparation;
    
    // Check if MetaMask or similar wallet is available
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet detected. Please install MetaMask.');
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }
    
    const fromAddress = accounts[0];
    console.log(`Sending from wallet: ${fromAddress}`);
    
    // Make sure the connected wallet matches the plan's user address
    if (planDetails.userAddress && 
        planDetails.userAddress.toLowerCase() !== fromAddress.toLowerCase()) {
      throw new Error('Connected wallet does not match the plan owner');
    }
    
    // Convert amount to wei (assuming the amount is in ETH/SONIC)
    // For ERC20 tokens you would need to call the token contract instead
    const amountInWei = `0x${(adjustedAmount * 1e18).toString(16)}`;
    
    // Prepare the transaction
    const txParams = {
      from: fromAddress,
      to: planDetails.toAddress, // Use address from plan
      value: amountInWei, // Amount in wei
      gas: '0x5208', // 21000 gas (standard ETH transfer)
    };
    
    console.log(`Preparing transaction with params:`, txParams);
    console.log(`Requesting user confirmation...`);
    
    // Send transaction using the connected wallet
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    });
    
    console.log(`Transaction sent successfully. Hash: ${txHash}`);
    
    // Notify backend about successful transaction
    await notifyBackendAboutTransaction(planId, txHash);
    
    return {
      success: true,
      txHash,
      message: 'DCA plan executed successfully',
      executionTime: new Date(),
    };
    
  } catch (error) {
    console.error(`Error executing DCA plan ${planId}:`, error);
    
    // Handle user rejection specifically
    if ((error as any).code === 4001) { // User rejected transaction
      throw new Error('Transaction was rejected by the user');
    }
    
    throw error;
  }
};

/**
 * Notify backend about successful transaction
 */
const notifyBackendAboutTransaction = async (planId: string, txHash: string) => {
  try {
    // Record the execution on the backend
    const execResponse = await fetch(`${API_BASE_URL}/api/dca/recordExecution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        txHash,
        executedAt: new Date().toISOString(),
      }),
    });
    
    if (!execResponse.ok) {
      console.warn('Failed to record execution on backend, but transaction was sent');
    }
    
    // Also notify the transaction confirmation endpoint for backward compatibility
    const response = await fetch(`${API_BASE_URL}/api/dca/transaction/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        txHash,
        executedAt: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      console.warn('Failed to notify backend about transaction, but transaction was sent');
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Error notifying backend about transaction:', error);
    // Non-critical error, so we just log it
  }
};

/**
 * Get execution history for a DCA plan
 */
export const getDCAExecutionHistory = async (planId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/history/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching execution history: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching execution history for plan ${planId}:`, error);
    throw error;
  }
};

/**
 * Schedule a DCA plan for recurring execution
 */
export const scheduleDCA = async (planId: string, frequency: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        frequency
      }),
    });

    if (!response.ok) {
      throw new Error(`Error scheduling DCA plan: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      message: result.message || `DCA plan ${planId} scheduled with frequency ${frequency}`,
      ...result
    };
  } catch (error) {
    console.error(`Error scheduling DCA plan ${planId}:`, error);
    throw error;
  }
};

/**
 * Stop a scheduled DCA plan
 */
export const stopDCA = async (planId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/stop/${planId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error stopping DCA plan: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error stopping DCA plan ${planId}:`, error);
    throw error;
  }
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}