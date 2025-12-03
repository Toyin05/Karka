import { ethers } from 'ethers';

// Contract address - update after deployment
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Contract ABI
const CONTRACT_ABI = [
  // Identity management
  "function registerIdentity(bytes32 _identityHash) external",
  "function updateIdentity(bytes32 _newHash) external",
  "function verifyIdentity(address _user, bytes32 _providedHash) external view returns (bool)",
  "function revokeIdentity() external",
  "function getIdentity(address _user) external view returns (tuple(bytes32 identityHash, uint256 timestamp, bool isActive))",

  // Social handles
  "function addHandle(string memory _handleType, bytes32 _hashedHandle) external",
  "function removeHandle(string memory _handleType) external",
  "function getHandle(address _user, string memory _handleType) external view returns (bytes32)",

  // Violation logging
  "function logViolation(bytes32 _violationId) external",

  // Events
  "event IdentityRegistered(address indexed user, bytes32 identityHash, uint256 timestamp)",
  "event IdentityUpdated(address indexed user, bytes32 newHash, uint256 timestamp)",
  "event IdentityRevoked(address indexed user, uint256 timestamp)",
  "event HandleAdded(address indexed user, string handleType, bytes32 hashedHandle)",
  "event HandleRemoved(address indexed user, string handleType)",
  "event ViolationLogged(address indexed user, bytes32 violationId, uint256 timestamp)"
];

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Get Ethereum provider (MetaMask)
export const getProvider = (): ethers.BrowserProvider => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('Ethereum provider not found. Please install MetaMask.');
};

// Get signer
export const getSigner = async (): Promise<ethers.Signer> => {
  const provider = getProvider();
  await provider.send('eth_requestAccounts', []); // Request account access
  return provider.getSigner();
};

// Get contract instance
export const getContract = async (): Promise<ethers.Contract> => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Utility to connect wallet
export const connectWallet = async (): Promise<string> => {
  try {
    const signer = await getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

// Identity management functions
export const registerIdentity = async (identityHash: string): Promise<ethers.TransactionResponse> => {
  const contract = await getContract();
  const tx = await contract.registerIdentity(identityHash);
  await tx.wait();
  return tx;
};

export const updateIdentity = async (newHash: string): Promise<ethers.TransactionResponse> => {
  const contract = await getContract();
  const tx = await contract.updateIdentity(newHash);
  await tx.wait();
  return tx;
};

export const verifyIdentity = async (user: string, providedHash: string): Promise<boolean> => {
  const contract = await getContract();
  return await contract.verifyIdentity(user, providedHash);
};

export const revokeIdentity = async (): Promise<ethers.TransactionResponse> => {
  const contract = await getContract();
  const tx = await contract.revokeIdentity();
  await tx.wait();
  return tx;
};

export const getIdentity = async (user: string) => {
  const contract = await getContract();
  return await contract.getIdentity(user);
};

// Social handle functions
export const addHandle = async (handleType: string, hashedHandle: string): Promise<ethers.TransactionResponse> => {
  const contract = await getContract();
  const tx = await contract.addHandle(handleType, hashedHandle);
  await tx.wait();
  return tx;
};

export const removeHandle = async (handleType: string): Promise<ethers.TransactionResponse> => {
  const contract = await getContract();
  const tx = await contract.removeHandle(handleType);
  await tx.wait();
  return tx;
};

export const getHandle = async (user: string, handleType: string): Promise<string> => {
  const contract = await getContract();
  return await contract.getHandle(user, handleType);
};

// Violation logging
export const logViolation = async (violationId: string): Promise<ethers.TransactionResponse> => {
  const contract = await getContract();
  const tx = await contract.logViolation(violationId);
  await tx.wait();
  return tx;
};

// Utility to hash identity data (example implementation)
export const hashIdentity = (data: string): string => {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
};