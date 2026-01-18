// Mock Ethereum Wallet Provider for Simple Browser Testing
(function() {
  'use strict';
  
  console.log('🦊 Injecting mock wallet provider...');
  
  // Mock wallet address
  const MOCK_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const MOCK_CHAIN_ID = '0x1'; // Ethereum mainnet
  
  // Mock Ethereum provider
  class MockEthereumProvider {
    constructor() {
      this.isMetaMask = true;
      this.isConnected = () => true;
      this._isConnected = true;
      this.chainId = MOCK_CHAIN_ID;
      this.networkVersion = '1';
      this.selectedAddress = null;
      this._events = {};
      this._accounts = [];
    }
    
    // Event handling
    on(event, callback) {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(callback);
      return this;
    }
    
    removeListener(event, callback) {
      if (this._events[event]) {
        this._events[event] = this._events[event].filter(cb => cb !== callback);
      }
      return this;
    }
    
    emit(event, ...args) {
      if (this._events[event]) {
        this._events[event].forEach(callback => callback(...args));
      }
    }
    
    // Request method
    async request({ method, params = [] }) {
      console.log(`🔵 Wallet Request: ${method}`, params);
      
      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          this.selectedAddress = MOCK_ADDRESS;
          this._accounts = [MOCK_ADDRESS];
          setTimeout(() => {
            this.emit('accountsChanged', [MOCK_ADDRESS]);
          }, 100);
          return [MOCK_ADDRESS];
          
        case 'eth_chainId':
          return MOCK_CHAIN_ID;
          
        case 'net_version':
          return '1';
          
        case 'eth_getBalance':
          return '0x1bc16d674ec80000'; // 2 ETH
          
        case 'personal_sign':
          // Mock signature
          return '0x' + Array(130).fill('0').map((_, i) => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('');
          
        case 'eth_signTypedData_v4':
        case 'eth_signTypedData':
          // Mock signature
          return '0x' + Array(130).fill('0').map((_, i) => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('');
          
        case 'wallet_switchEthereumChain':
          this.chainId = params[0].chainId;
          this.emit('chainChanged', params[0].chainId);
          return null;
          
        case 'wallet_addEthereumChain':
          return null;
          
        case 'eth_sendTransaction':
          // Mock transaction hash
          return '0x' + Array(64).fill('0').map((_, i) => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('');
          
        case 'eth_getTransactionReceipt':
          return {
            status: '0x1',
            transactionHash: params[0],
            blockNumber: '0x' + Math.floor(Math.random() * 1000000).toString(16),
          };
          
        default:
          console.warn(`⚠️ Unhandled method: ${method}`);
          return null;
      }
    }
    
    // Legacy methods
    async enable() {
      return this.request({ method: 'eth_requestAccounts' });
    }
    
    async send(method, params) {
      return this.request({ method, params });
    }
    
    async sendAsync(payload, callback) {
      try {
        const result = await this.request({
          method: payload.method,
          params: payload.params
        });
        callback(null, { result, id: payload.id, jsonrpc: '2.0' });
      } catch (error) {
        callback(error);
      }
    }
  }
  
  // Inject the provider
  if (typeof window !== 'undefined') {
    const provider = new MockEthereumProvider();
    
    // Standard injection: only inject if a provider is not already present
    try {
      const existingDesc = Object.getOwnPropertyDescriptor(window, 'ethereum');
      if (typeof window.ethereum !== 'undefined') {
        console.warn('window.ethereum already present, skipping mock injection');
      } else if (existingDesc && (!existingDesc.writable || !existingDesc.configurable)) {
        // Some environments expose a getter-only ethereum property — avoid throwing
        // by not attempting to overwrite it. Instead expose the mock under a
        // non-conflicting name so tests can still access it if necessary.
        console.warn('window.ethereum exists as a non-writable property; exposing mock as window.__mockEthereum');
        (window as any).__mockEthereum = provider;
      } else {
        // Safe to assign directly
        window.ethereum = provider;
      }
    } catch (e) {
      // If any environment throws when inspecting or setting, fall back to
      // exposing the mock under a unique name to avoid breaking the page.
      try {
        (window as any).__mockEthereum = provider;
        console.warn('Failed to inject mock provider to window.ethereum; mock exposed as window.__mockEthereum', e);
      } catch (ee) {
        console.error('Failed to expose mock provider', ee);
      }
    }
    
    // Also set as web3 provider for compatibility
    if (typeof window.web3 === 'undefined') {
      window.web3 = {
        currentProvider: provider,
        eth: {
          defaultAccount: MOCK_ADDRESS
        }
      };
    }
    
    // Dispatch events to notify apps of wallet availability
    window.dispatchEvent(new Event('ethereum#initialized'));
    
    // Auto-connect after a short delay
    setTimeout(() => {
      console.log('🟢 Mock wallet ready!');
      console.log('📍 Address:', MOCK_ADDRESS);
      console.log('⛓️ Chain ID:', MOCK_CHAIN_ID);
      
      // Trigger any listeners waiting for wallet
      provider.emit('connect', { chainId: MOCK_CHAIN_ID });
    }, 500);
  }
  
  console.log('✅ Mock wallet injection complete');
})();
