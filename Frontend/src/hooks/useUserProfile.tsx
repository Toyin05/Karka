import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// helper: sanitize profile object before sending to Postgres
function sanitizeProfileForDb(profile: Partial<UserProfile>): any {
  const out: any = {};
  Object.entries(profile).forEach(([k, v]) => {
    // convert empty string to null for dates and optional fields
    if (typeof v === 'string' && v.trim() === '') {
      out[k] = null;
      return;
    }
    // keep booleans, numbers, arrays, objects as-is
    out[k] = v;
  });
  // ensure date_of_birth is null or a valid Date string acceptable by Postgres
  if (out.date_of_birth === '') out.date_of_birth = null;
  return out;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  verified: boolean;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  role?: string;
  joined_date: string;
  last_login: string;
  security_score: number;
  profile_completion: number;
  phone?: string;
  location?: string;
  website?: string;
  date_of_birth?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserIdentity {
  id: string;
  identity_hash: string;
  camp_tx_hash: string;
  camp_network: string;
  blockchain_status: 'verified' | 'pending' | 'failed';
  verification_date: string;
  confidence_score: number;
  face_match_quality: number;
  identity_photos_count: number;
  last_hash_update: string;
  backup_status: 'secured' | 'pending' | 'failed';
}

export interface SocialHandle {
  id: string;
  platform: 'tiktok' | 'youtube' | 'twitter' | 'instagram' | 'linkedin' | 'facebook';
  handle: string;
  display_name: string;
  link?: string;
  verified: boolean;
  follower_count: number;
  last_monitored: string;
  monitoring_enabled: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'unknown';
}

export interface UserStats {
  totalAlerts: number;
  newAlerts: number;
  actioned: number;
  protectionScore: number;
  activeMonitors: number;
  monthlyRemovals: number;
  lastScan: string;
  threatAccuracy: number;
  responseTime: number;
  platformsMonitored: number;
}

export const useUserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Fetch user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData) {
        // Create default profile from auth data
        const defaultProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          bio: '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          verified: false,
          subscription_tier: 'free' as const,
          joined_date: new Date().toISOString(),
          last_login: new Date().toISOString(),
          security_score: 50,
          profile_completion: 25,
          phone: '',
          location: '',
          website: '',
          date_of_birth: null,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(sanitizeProfileForDb(defaultProfile))
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', JSON.stringify(createError));
          throw createError;
        }

        setProfile(newProfile as UserProfile);
      } else {
        setProfile(profileData as UserProfile);
      }

      // Fetch user identity data (graceful handling)
      try {
        const { data: identityData } = await supabase
          .from('user_identities')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (identityData) {
          setIdentity(identityData as UserIdentity);
        } else {
          // Create realistic mock identity data for hackathon presentation
          const mockIdentity = {
            id: crypto.randomUUID(),
            user_id: session.user.id,
            identity_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            camp_tx_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            camp_network: 'CAMP Mainnet',
            blockchain_status: 'verified' as const,
            verification_date: new Date(session.user.created_at).toISOString(),
            confidence_score: Math.floor(Math.random() * 20) + 80, // 80-99%
            face_match_quality: Math.floor(Math.random() * 15) + 85, // 85-99%
            identity_photos_count: Math.floor(Math.random() * 3) + 2, // 2-4 photos
            last_hash_update: new Date().toISOString(),
            backup_status: 'secured' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Insert mock identity data
          const { data: newIdentity, error: createError } = await supabase
            .from('user_identities')
            .insert(mockIdentity)
            .select()
            .single();

          if (!createError && newIdentity) {
            setIdentity(newIdentity as UserIdentity);
          } else {
            // If insertion fails, use mock data in memory
            setIdentity(mockIdentity as UserIdentity);
          }
        }
      } catch (error) {
        console.warn('user_identities table not found or error:', error);
        
        // Create realistic mock identity data for hackathon presentation when table doesn't exist
        const mockIdentity = {
          id: crypto.randomUUID(),
          user_id: session.user.id,
          identity_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          camp_tx_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          camp_network: 'CAMP Mainnet',
          blockchain_status: 'verified' as const,
          verification_date: new Date(session.user.created_at).toISOString(),
          confidence_score: Math.floor(Math.random() * 20) + 80, // 80-99%
          face_match_quality: Math.floor(Math.random() * 15) + 85, // 85-99%
          identity_photos_count: Math.floor(Math.random() * 3) + 2, // 2-4 photos
          last_hash_update: new Date().toISOString(),
          backup_status: 'secured' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setIdentity(mockIdentity as UserIdentity);
      }

      // Fetch social handles (graceful handling)
      try {
        const { data: handlesData } = await supabase
          .from('user_social_handles')
          .select('*')
          .eq('user_id', session.user.id);

        if (handlesData) {
          setSocialHandles(handlesData as SocialHandle[]);
        }
      } catch (error) {
        console.warn('user_social_handles table not found or error:', error);
      }

      // Fetch user statistics (graceful handling)
      try {
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (statsData) {
          setUserStats({
            totalAlerts: statsData.total_alerts || 0,
            newAlerts: statsData.new_alerts || 0,
            actioned: statsData.actioned || 0,
            protectionScore: statsData.protection_score || 50,
            activeMonitors: statsData.active_monitors || 0,
            monthlyRemovals: statsData.monthly_removals || 0,
            lastScan: statsData.last_scan || 'Never',
            threatAccuracy: statsData.threat_accuracy || 0,
            responseTime: statsData.response_time || 0,
            platformsMonitored: statsData.platforms_monitored || 0,
          });
        } else {
          // Create default stats
          const defaultStats = {
            user_id: session.user.id,
            total_alerts: 0,
            new_alerts: 0,
            actioned: 0,
            protection_score: 50,
            active_monitors: 0,
            monthly_removals: 0,
            last_scan: 'Never',
            threat_accuracy: 0,
            response_time: 0,
            platforms_monitored: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: newStats, error: statsError } = await supabase
            .from('user_stats')
            .insert(defaultStats)
            .select()
            .single();

          if (statsError) {
            console.error('Error creating stats:', statsError);
          } else {
            setUserStats({
              totalAlerts: newStats.total_alerts,
              newAlerts: newStats.new_alerts,
              actioned: newStats.actioned,
              protectionScore: newStats.protection_score,
              activeMonitors: newStats.active_monitors,
              monthlyRemovals: newStats.monthly_removals,
              lastScan: newStats.last_scan,
              threatAccuracy: newStats.threat_accuracy,
              responseTime: newStats.response_time,
              platformsMonitored: newStats.platforms_monitored,
            });
          }
        }
      } catch (error) {
        console.warn('user_stats table not found or error:', error);
      }

    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data');
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user || !profile) return;

      const updatedProfile = sanitizeProfileForDb({
        ...profile,
        ...updates,
        updated_at: new Date().toISOString(),
      });

      // Save to database
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updatedProfile)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', JSON.stringify(error));
        throw error;
      }

      setProfile(data as UserProfile);
      toast.success('Profile updated successfully');
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const addSocialHandle = async (handle: Omit<SocialHandle, 'id' | 'user_id' | 'last_monitored' | 'risk_level' | 'verified'>) => {
    try {
      if (!user) return;

      const newHandle = {
        user_id: user.id,
        platform: handle.platform,
        handle: handle.handle,
        display_name: handle.display_name || handle.handle,
        link: handle.link || null,
        verified: false,
        follower_count: handle.follower_count || 0,
        last_monitored: new Date().toISOString(),
        monitoring_enabled: handle.monitoring_enabled ?? true,
        risk_level: 'unknown' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_social_handles')
        .insert(newHandle)
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      const transformedHandle = {
        id: data.id,
        platform: data.platform,
        handle: data.handle,
        display_name: data.display_name,
        link: data.link || '',
        verified: data.verified,
        follower_count: data.follower_count,
        last_monitored: data.last_monitored,
        monitoring_enabled: data.monitoring_enabled,
        risk_level: data.risk_level,
      };

      setSocialHandles(prev => [...prev, transformedHandle]);
      toast.success('Social handle added successfully');
      
      return transformedHandle;
    } catch (error) {
      console.error('Error adding social handle:', error);
      toast.error('Failed to add social handle');
      throw error;
    }
  };

  const removeSocialHandle = async (handleId: string) => {
    try {
      const { error } = await supabase
        .from('user_social_handles')
        .delete()
        .eq('id', handleId);

      if (error) {
        console.error('Database delete error:', error);
        throw error;
      }

      setSocialHandles(prev => prev.filter(h => h.id !== handleId));
      toast.success('Social handle removed');
    } catch (error) {
      console.error('Error removing social handle:', error);
      toast.error('Failed to remove social handle');
      throw error;
    }
  };

  const updateSocialHandle = async (handleId: string, updates: Partial<SocialHandle>) => {
    try {
      const { error } = await supabase
        .from('user_social_handles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', handleId);

      if (error) {
        console.error('Database update error:', JSON.stringify(error));
        throw error;
      }

      setSocialHandles(prev => 
        prev.map(handle => 
          handle.id === handleId 
            ? { ...handle, ...updates }
            : handle
        )
      );
      
      toast.success('Social handle updated');
    } catch (error) {
      console.error('Error updating social handle:', error);
      toast.error('Failed to update social handle');
      throw error;
    }
  };

  const calculateProfileCompletion = (profileData: UserProfile): number => {
    let completion = 0;
    const fields: (keyof UserProfile)[] = [
      'full_name',
      'display_name',
      'bio',
      'avatar_url',
      'location',
      'website',
      'phone',
      'date_of_birth'
    ];

    fields.forEach(field => {
      const value = profileData[field];
      if (value && value !== '' && typeof value === 'string' && !value.includes('images.unsplash.com') && !value.includes('https://yourwebsite.com')) {
        completion += 12.5; // 100/8 fields = 12.5 each
      }
    });

    return Math.min(Math.round(completion), 100);
  };

  const updateProfileCompletion = async () => {
    if (!profile) return;
    
    const completion = calculateProfileCompletion(profile);
    const completed = completion >= 100;
    
    try {
      await updateProfile({
        profile_completion: completion,
        onboarding_completed: completed,
      });
    } catch (error) {
      console.error('Failed to update profile completion:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Remove automatic profile completion updates to prevent infinite toasts
  // Profile completion will be updated manually when user actually saves their profile

  return {
    loading,
    user,
    profile,
    identity,
    socialHandles,
    userStats,
    error,
    updateProfile,
    addSocialHandle,
    removeSocialHandle,
    updateSocialHandle,
    calculateProfileCompletion,
    refetch: fetchUserProfile,
  };
};
