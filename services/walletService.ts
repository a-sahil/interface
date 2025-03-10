/**
 * Service for handling wallet-related API calls
 */

// Define the base API URL from environment variable or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Register a wallet address with the backend
 */
export const registerWalletAddress = async (address: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering wallet address:', error);
    throw error;
  }
};

/**
 * Get wallet details by address
 */
export const getWalletDetails = async (address: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/${address}`, {
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
    console.error('Error fetching wallet details:', error);
    throw error;
  }
};