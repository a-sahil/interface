/**
 * Service for handling DCA-related API calls
 */

// Define the base API URL from environment variable or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface DCAPlanSubmission {
  token: string;
  amount: number;
  frequency: string;
  toAddress: string;
  riskLevel: string;
}

/**
 * Create a new DCA plan
 */
export const createDCAPlan = async (planData: DCAPlanSubmission, userAddress?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: planData.token,
        amount: Number(planData.amount),
        frequency: planData.frequency,
        toAddress: planData.toAddress,
        riskLevel: planData.riskLevel,
        userAddress: userAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating DCA plan:', error);
    throw error;
  }
};

/**
 * Get all DCA plans
 */
export const getDCAPlans = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching DCA plans:', error);
    throw error;
  }
};

/**
 * Get a specific DCA plan by ID
 */
export const getDCAPlan = async (planId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/plan/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching DCA plan ${planId}:`, error);
    throw error;
  }
};

/**
 * Get DCA plans for a specific user
 */
export const getUserDCAPlans = async (userAddress: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/plans/user/${userAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching DCA plans for user ${userAddress}:`, error);
    throw error;
  }
};

/**
 * Execute a DCA plan
 */
export const executeDCAPlan = async (planId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/execute/${planId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error executing DCA plan ${planId}:`, error);
    throw error;
  }
};

/**
 * Delete a DCA plan
 */
export const deleteDCAPlan = async (planId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dca/plan/${planId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting DCA plan ${planId}:`, error);
    throw error;
  }
};