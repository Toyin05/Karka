import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Auth } from '@campnetwork/origin';

// Origin Context
interface OriginContextType {
  auth: Auth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  linkTwitter: () => void;
  linkTikTok: (handle: string) => Promise<void>;
  linkSpotify: () => void;
  unlinkTwitter: () => Promise<void>;
  unlinkTikTok: () => Promise<void>;
  unlinkSpotify: () => Promise<void>;
  linkedSocials: {
    twitter: boolean;
    tiktok: boolean;
    spotify: boolean;
  };
}

const OriginContext = createContext<OriginContextType | undefined>(undefined);

// Origin Provider Props
interface OriginProviderProps {
  children: ReactNode;
  clientId: string;
  environment?: 'DEVELOPMENT' | 'PRODUCTION';
  redirectUri?: string | { twitter?: string; spotify?: string; tiktok?: string };
}

// Custom Origin Provider
export const OriginProvider: React.FC<OriginProviderProps> = ({
  children,
  clientId,
  environment = 'DEVELOPMENT',
  redirectUri
}) => {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [linkedSocials, setLinkedSocials] = useState({
    twitter: false,
    tiktok: false,
    spotify: false
  });

  // Initialize Auth instance
  useEffect(() => {
    const initAuth = async () => {
      try {
        const authInstance = new Auth({
          clientId,
          environment,
          redirectUri
        });

        // Listen for auth state changes
        authInstance.on('state', (state: string) => {
          setIsAuthenticated(state === 'authenticated');
          setIsLoading(false);
        });

        setAuth(authInstance);

        // Check initial auth state
        // Note: In a real implementation, you'd check local storage or session
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize Origin auth:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clientId, environment, redirectUri]);

  // Update linked socials when authenticated
  useEffect(() => {
    if (auth && isAuthenticated) {
      const updateLinkedSocials = async () => {
        try {
          const socials = await auth.getLinkedSocials();
          setLinkedSocials({
            twitter: socials.twitter ?? false,
            tiktok: socials.tiktok ?? false,
            spotify: socials.spotify ?? false,
          });
        } catch (error) {
          console.error('Failed to get linked socials:', error);
        }
      };
      updateLinkedSocials();
    }
  }, [auth, isAuthenticated]);

  const connect = async () => {
    if (!auth) throw new Error('Auth not initialized');
    await auth.connect();
  };

  const disconnect = () => {
    if (!auth) return;
    auth.disconnect();
  };

  const linkTwitter = () => {
    if (!auth) throw new Error('Auth not initialized');
    auth.linkTwitter();
  };

  const linkTikTok = async (handle: string) => {
    if (!auth) throw new Error('Auth not initialized');
    await auth.linkTikTok(handle);
  };

  const linkSpotify = () => {
    if (!auth) throw new Error('Auth not initialized');
    auth.linkSpotify();
  };

  const unlinkTwitter = async () => {
    if (!auth) throw new Error('Auth not initialized');
    await auth.unlinkTwitter();
  };

  const unlinkTikTok = async () => {
    if (!auth) throw new Error('Auth not initialized');
    await auth.unlinkTikTok();
  };

  const unlinkSpotify = async () => {
    if (!auth) throw new Error('Auth not initialized');
    await auth.unlinkSpotify();
  };

  const value: OriginContextType = {
    auth,
    isAuthenticated,
    isLoading,
    connect,
    disconnect,
    linkTwitter,
    linkTikTok,
    linkSpotify,
    unlinkTwitter,
    unlinkTikTok,
    unlinkSpotify,
    linkedSocials
  };

  return (
    <OriginContext.Provider value={value}>
      {children}
    </OriginContext.Provider>
  );
};

// Custom hook to use Origin context
export const useOrigin = () => {
  const context = useContext(OriginContext);
  if (context === undefined) {
    throw new Error('useOrigin must be used within an OriginProvider');
  }
  return context;
};

// Simple Origin Modal Component
export const OriginModal: React.FC = () => {
  const { isAuthenticated, isLoading, connect, disconnect } = useOrigin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading Origin...</span>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Origin SDK Integration</h3>

      {!isAuthenticated ? (
        <button
          onClick={connect}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Connect to Origin
        </button>
      ) : (
        <div className="space-y-4">
          <div className="text-green-600 font-medium">✓ Connected to Origin</div>
          <button
            onClick={disconnect}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};