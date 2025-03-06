import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ethers, Contract } from "ethers";
// import { BrowserProvider, parseUnits } from "ethers";

// import { ExternalProvider } from "@ethersproject/providers";

// interface window {
//   ethereum?: ExternalProvider;
// }

// Declare the ethereum property on the Window object
declare global {
  interface Window {
    ethereum?: any; // Use `any` for simplicity, or a more specific type
  }
}

// Contract ABI and address - would normally be in a separate file
const COUNTER_CONTRACT_ADDRESS = '0xc187c62D3119A61432E7758D32716FbE62dDA9c8'; // Replace with actual deployed address

const COUNTER_ABI = [
  "function increment()",
  "function decrement()",
  "function getCount() view returns (uint256)",
  "function resetCounter()",
  "function owner() view returns (address)",
  "event CounterIncreased(uint256 newValue, address incrementor)"
];

// This would be the main component used in the app
const CounterApp = () => {
  const [contract, setContract] = useState<Contract | null>(null); // Explicit type
  const [account, setAccount] = useState('');
  const [count, setCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Connect wallet function
  const connectWallet = async () => {
    setIsLoading(true);
    setError('');

  

    
    try {
      // Corrected MetaMask detection logic
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Initialize provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Create contract instance
      const counterContract = new ethers.Contract(
        COUNTER_CONTRACT_ADDRESS, 
        COUNTER_ABI, 
        signer
      );
      

        setContract(counterContract);
        setAccount(address);
        setIsConnected(true);
        
        // Get initial count
        // const initialCount = await counterContract.getCount();
        // setCount(initialCount.toNumber());
      } catch (error) {
        console.error('Connection failed', error);
        setError('Failed to connect wallet. Please try again.');
      } finally {
        setIsLoading(false);
      }
      // }
    
  };

const increment = async () => {
  if (!contract) return;
  setIsLoading(true);
  try {
    const tx = await contract.increment();
    await tx.wait();
    // await fetchCount(contract); // Refresh count
  } catch (error) {
    setError("Failed to increment");
  } finally {
    setIsLoading(false);
  }
};

  const decrement = async () => {
    if (!contract) return;
    try {
      const tx = await contract.decrement(); // Calls contract's decrement()
      await tx.wait();
      const newCount = await contract.getCount();
      setCount(newCount.toNumber());
    } catch (error) {
      setError('Transaction failed. Please try again.');
    }
  };

  const resetCounter = async () => {
    if (!contract) return;
    try {
      const tx = await contract.resetCounter(); // Calls contract's resetCounter()
      await tx.wait();
      const newCount = await contract.getCount();
      setCount(newCount.toNumber());
      const initialCount = await contract.getCount();
      setCount(initialCount.toNumber());
    } catch (error) {
      setError('Reset failed. You may not be the contract owner.');
    }
  };

 

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // User is already connected, initialize contract
            connectWallet();
          }
        } catch (error) {
          console.error('Connection check failed', error);
        }
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Counter DApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <Button 
                onClick={connectWallet} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </>
          ) : (
            <>
              <div className="text-center text-4xl font-bold">
                Count: {count}
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={increment} 
                  className="flex-1"
                  variant="secondary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Increment'}
                </Button>
                <Button 
                  onClick={decrement} 
                  className="flex-1"
                  variant="secondary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Decrement'}
                </Button>
              </div>
              <Button 
                onClick={resetCounter} 
                className="w-full"
                variant="secondary"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Reset Counter'}
              </Button>
              <div className="text-sm text-gray-500 text-center truncate">
                Connected: {account}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CounterApp;