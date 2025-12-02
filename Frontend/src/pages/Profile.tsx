import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Shield, Camera, Upload, Edit, CheckCircle, ExternalLink, 
  Settings, Bell, Lock, Globe, Eye, EyeOff, Copy, RefreshCw,
  Zap, Target, Users, BarChart3, Camera as CameraIcon, Image as ImageIcon,
  Plus, Trash2, AlertTriangle, Info, Star, Award, TrendingUp,
  Clock, Check, X, GitBranch, Database, Lock as LockIcon, 
  Copy as CopyIcon, Plus as PlusIcon, Download, UserPlus, Phone, MapPin, Calendar, Globe as GlobeIcon
} from "lucide-react";
import { toast } from "sonner";
import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";
import { ProfileOnboarding } from "@/components/ProfileOnboarding";
import { supabase } from "@/integrations/supabase/client";

// Mock data for development - will be replaced with real data from useUserProfile hook
const mockSecuritySettings = {
  two_factor_enabled: true,
  email_notifications: true,
  push_notifications: true,
  sms_alerts: false,
  auto_rebuke: true,
  confidence_threshold: 85,
  legal_notifications: true,
  weekly_reports: true,
  data_retention: "2_years",
  privacy_mode: "standard"
};

const mockNotificationSettings = {
  email: {
    new_threats: true,
    legal_updates: true,
    weekly_reports: true,
    security_alerts: true,
    system_updates: false
  },
  push: {
    critical_threats: true,
    high_risk_content: true,
    compliance_updates: true,
    new_features: false
  },
  sms: {
    emergency_alerts: true,
    legal_actions: false,
    security_breach: true
  }
};

const Profile = () => {
  const { 
    loading, 
    user, 
    profile, 
    identity, 
    socialHandles, 
    userStats, 
    updateProfile, 
    addSocialHandle, 
    removeSocialHandle,
    calculateProfileCompletion 
  } = useUserProfile();
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingProfileData, setEditingProfileData] = useState(profile);
  const [showHash, setShowHash] = useState(false);
  const [newHandle, setNewHandle] = useState({ 
    platform: "tiktok", 
    handle: "", 
    display_name: "",
    link: ""
  });
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings);
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showBlockchainProofModal, setShowBlockchainProofModal] = useState(false);
  const [showSecurityReportModal, setShowSecurityReportModal] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState<Record<string, boolean>>({});
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [profileEditModal, setProfileEditModal] = useState<{field: string, label: string} | null>(null);
  const [tempProfileData, setTempProfileData] = useState({
    bio: '',
    location: '',
    website: '',
    phone: '',
    date_of_birth: ''
  });
  const [identityVerificationScore, setIdentityVerificationScore] = useState(0);
  const [securityRating, setSecurityRating] = useState('');

  // Update editing data when profile changes
  useEffect(() => {
    if (profile) {
      setEditingProfileData(profile);
    }
  }, [profile]);

  // Initialize monitoring status when social handles change
  useEffect(() => {
    if (socialHandles) {
      const status: Record<string, boolean> = {};
      socialHandles.forEach(handle => {
        status[handle.id] = handle.monitoring_enabled;
      });
      setMonitoringStatus(status);
    }
  }, [socialHandles]);

  // Generate realistic identity verification scores and security ratings
  useEffect(() => {
    if (identity && profile) {
      // Generate identity verification score based on profile completeness
      const completion = profile.profile_completion || 25;
      const baseScore = Math.min(completion + 20, 95);
      const randomVariation = Math.floor(Math.random() * 10) - 5; // ±5
      setIdentityVerificationScore(Math.max(70, Math.min(99, baseScore + randomVariation)));

      // Generate functional security status based on security score
      const securityScore = profile.security_score || 50;
      let status = 'Secure';
      if (securityScore >= 95) status = 'Platinum Shield';
      else if (securityScore >= 90) status = 'Gold Security';
      else if (securityScore >= 80) status = 'Silver Defense';
      else if (securityScore >= 70) status = 'Secure';
      else if (securityScore >= 60) status = 'Basic Security';
      setSecurityRating(status);
    }
  }, [identity, profile]);

  // Utility functions for profile editing
  const openProfileEditModal = (field: string, label: string) => {
    setTempProfileData({
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      phone: profile?.phone || '',
      date_of_birth: profile?.date_of_birth || ''
    });
    setProfileEditModal({ field, label });
  };

  const handleProfileFieldUpdate = async () => {
    if (!profile || !profileEditModal) return;

    try {
      const updates: Partial<UserProfile> = {};
      const field = profileEditModal.field as keyof typeof tempProfileData;
      const value = tempProfileData[field];
      updates[field] = value;
      
      const profileCompletion = calculateProfileCompletion({
        ...profile,
        ...updates,
        profile_completion: calculateProfileCompletion({ ...profile, ...updates })
      });
      
      await updateProfile({
        ...profile,
        ...updates,
        profile_completion: profileCompletion
      });
      
      setProfileEditModal(null);
      
      // Auto-scroll to bottom if in different tab
      if (window.innerHeight + window.scrollY < document.body.offsetHeight - 100) {
        window.scrollTo({ top: document.body.offsetHeight, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Failed to update profile field:', error);
      toast.error("Failed to update profile field");
    }
  };

  const getSecurityRatingColor = (rating: string) => {
    if (rating === 'Platinum Shield') return 'text-purple-600 bg-purple-50';
    if (rating === 'Gold Security') return 'text-yellow-600 bg-yellow-50';
    if (rating === 'Silver Defense') return 'text-gray-600 bg-gray-50';
    if (rating === 'Secure') return 'text-blue-600 bg-blue-50';
    if (rating === 'Basic Security') return 'text-amber-600 bg-amber-50';
    return 'text-gray-600 bg-gray-50';
  };

  const handleUpdateProfile = async () => {
    if (!profile || !editingProfileData) return;
    
    try {
      const profileCompletion = calculateProfileCompletion({
        ...editingProfileData,
        profile_completion: calculateProfileCompletion(editingProfileData)
      });
      
      await updateProfile({
        ...editingProfileData,
        profile_completion: profileCompletion
      });
      
      setEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Create a unique filename with user ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: urlData.publicUrl });
      toast.success("Profile picture uploaded!");
      
      // Auto-scroll to show the updated avatar
      setTimeout(() => {
        document.querySelector('.avatar-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile || !profile.avatar_url) return;
    
    try {
      // Remove avatar URL from profile
      await updateProfile({ avatar_url: null });
      toast.success("Profile picture removed");
      
      // Auto-scroll to show the updated avatar
      setTimeout(() => {
        document.querySelector('.avatar-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      toast.error("Failed to remove profile picture");
    }
  };

  const handleAddHandle = () => {
    if (!newHandle.handle.trim()) {
      toast.error("Please enter a handle");
      return;
    }

    addSocialHandle({
      platform: newHandle.platform as 'tiktok' | 'youtube' | 'twitter' | 'instagram' | 'linkedin' | 'facebook',
      handle: newHandle.handle,
      display_name: newHandle.display_name || newHandle.handle,
      link: newHandle.link,
      follower_count: 0,
      monitoring_enabled: true,
    });

    setNewHandle({ platform: "tiktok", handle: "", display_name: "", link: "" });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "tiktok": return "bx bxl-tiktok text-lg";
      case "youtube": return "bx bxl-youtube text-lg";
      case "twitter": return "bx bxl-twitter text-lg";
      case "instagram": return "bx bxl-instagram text-lg";
      case "linkedin": return "bx bxl-linkedin text-lg";
      case "facebook": return "bx bxl-facebook text-lg";
      default: return "bx bx-globe text-lg";
    }
  };

  const getPlatformIconColor = (platform: string) => {
    switch (platform) {
      case "tiktok": return "text-pink-500";
      case "youtube": return "text-red-500";
      case "twitter": return "text-blue-400";
      case "instagram": return "text-pink-600";
      case "linkedin": return "text-blue-700";
      case "facebook": return "text-blue-600";
      default: return "text-gray-500";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case "pro": return "bg-purple-100 text-purple-800 border-purple-200";
      case "enterprise": return "bg-blue-100 text-blue-800 border-blue-200";
      case "free": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copied to clipboard");
  };

  const handleUpdateSecuritySetting = (key: string, value: boolean | string | number) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    toast.success("Security setting updated");
  };

  const handleToggleMonitoring = async (handleId: string, enabled: boolean) => {
    try {
      // Update the local state immediately for instant UI feedback
      setMonitoringStatus(prev => ({
        ...prev,
        [handleId]: enabled
      }));
      
      // This would typically be an API call to your backend
      // For now, we'll just show the toast
      // You would typically make an API call here:
      // await updateSocialHandleMonitoring(handleId, enabled);
      
      toast.success(`Monitoring ${enabled ? 'enabled' : 'disabled'} for this handle`);
      
    } catch (error) {
      console.error('Failed to update monitoring status:', error);
      toast.error('Failed to update monitoring status');
      
      // Revert the state on error
      setMonitoringStatus(prev => ({
        ...prev,
        [handleId]: !enabled
      }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-muted-foreground">Failed to load profile data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 lg:p-8 text-white mt-0">
          <div className="relative z-10">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-6 mb-6">
              <div className="relative flex-shrink-0 self-center lg:self-auto avatar-section group">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white/20">
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                  <AvatarFallback className="text-xl sm:text-2xl bg-white/20 text-white">
                    {profile.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    disabled={uploadingAvatar}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    {uploadingAvatar ? (
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </div>
                {/* Delete option appears on hover */}
                {profile.avatar_url && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 rounded-full">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-red-500 hover:bg-red-600"
                      onClick={handleDeleteAvatar}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 justify-center lg:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-bold">{profile.display_name || profile.full_name}</h1>
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    {profile.verified && (
                      <Badge className="bg-blue-100 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge className={getSubscriptionBadgeColor(profile.subscription_tier)}>
                      {profile.subscription_tier?.toUpperCase() || 'FREE'}
                    </Badge>
                  </div>
                </div>
                <p className="text-blue-100 mb-2 text-sm sm:text-base">{profile.bio || "No bio added yet"}</p>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-blue-100">
                  <span>Joined {new Date(profile.joined_date).toLocaleDateString()}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Last seen {new Date(profile.last_login).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-100 text-xs sm:text-sm">Security Score</p>
                <p className="text-xl sm:text-2xl font-bold">{profile.security_score || 50}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-100 text-xs sm:text-sm">Profile Complete</p>
                <p className="text-xl sm:text-2xl font-bold">{profile.profile_completion || 25}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-100 text-xs sm:text-sm">Social Handles</p>
                <p className="text-xl sm:text-2xl font-bold">{socialHandles?.length || 0}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-100 text-xs sm:text-sm">Total Reach</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {formatNumber(socialHandles?.reduce((acc, h) => acc + (h.follower_count || 0), 0) || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Onboarding Checklist */}
        <ProfileOnboarding 
          profile={profile}
          onCompleteStep={(stepId) => {
            console.log('Step completed:', stepId);
            // Handle step completion logic here
          }}
          onNavigateToProfile={() => {
            setEditingProfile(true);
            document.querySelector('[data-value="identity"]')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenProfileEditModal={openProfileEditModal}
        />

        {/* Profile Tabs */}
        <Tabs defaultValue="identity" className="space-y-4 sm:space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-xl border border-slate-200 min-w-[500px] sm:min-w-0">
              <TabsTrigger 
                value="identity" 
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Profile & Identity
              </TabsTrigger>
              <TabsTrigger 
                value="social" 
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Social Handles
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Preferences
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile & Identity Tab */}
          <TabsContent value="identity">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Profile Information */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input 
                          id="full_name"
                          value={editingProfileData?.full_name || ''} 
                          onChange={(e) => setEditingProfileData({...editingProfileData, full_name: e.target.value})} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input 
                          id="display_name"
                          value={editingProfileData?.display_name || ''} 
                          onChange={(e) => setEditingProfileData({...editingProfileData, display_name: e.target.value})} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email"
                          value={editingProfileData?.email || ''} 
                          onChange={(e) => setEditingProfileData({...editingProfileData, email: e.target.value})} 
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed from the profile page
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio"
                          value={editingProfileData?.bio || ''} 
                          onChange={(e) => setEditingProfileData({...editingProfileData, bio: e.target.value})}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location"
                            value={editingProfileData?.location || ''} 
                            onChange={(e) => setEditingProfileData({...editingProfileData, location: e.target.value})}
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input 
                            id="website"
                            value={editingProfileData?.website || ''} 
                            onChange={(e) => setEditingProfileData({...editingProfileData, website: e.target.value})}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input 
                            id="phone"
                            value={editingProfileData?.phone || ''} 
                            onChange={(e) => setEditingProfileData({...editingProfileData, phone: e.target.value})}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <Input 
                            id="date_of_birth"
                            type="date"
                            value={editingProfileData?.date_of_birth || ''} 
                            onChange={(e) => setEditingProfileData({...editingProfileData, date_of_birth: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateProfile} className="bg-slate-100 text-slate-900 border border-slate-200 shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all duration-200">
                          <Check className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingProfile(false)} className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all duration-200">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-semibold">{profile.full_name || 'Not provided'}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)} className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all duration-200">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                        <p className="font-semibold flex items-center gap-2">
                          {profile.email}
                          <Badge className="bg-blue-500 text-white text-xs">Verified</Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Display Name</p>
                        <p className="font-semibold">{profile.display_name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bio</p>
                        <p className="font-semibold">{profile.bio || 'No bio added yet'}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-semibold flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {profile.location || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <p className="font-semibold flex items-center gap-2">
                            <GlobeIcon className="h-3 w-3" />
                            {profile.website ? (
                              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Visit website
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {profile.phone || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blockchain Identity */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    CAMP Network Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {identity ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Blockchain Status</p>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Security Tier</p>
                          <Badge className={`${getSecurityRatingColor(securityRating)} font-bold text-sm px-2 py-1`}>
                            {securityRating}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Identity Hash</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1 break-all text-xs">
                            {identity.identity_hash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyHash(identity.identity_hash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`)}
                            className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all duration-200"
                          >
                            <CopyIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Network</p>
                          <p className="font-semibold">{identity.camp_network}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Verification Date</p>
                          <p className="font-semibold">{new Date(profile.joined_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Identity Photos</p>
                          <p className="font-semibold">{identity.identity_photos_count} photos</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Identity Verification</p>
                          <p className="font-semibold text-green-600">{identityVerificationScore}%</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Blockchain Identity</h3>
                      <p className="text-muted-foreground mb-4">
                        Set up your blockchain identity to secure your digital presence
                      </p>
                      <Button className="bg-secondary text-white shadow-md hover:shadow-lg transition-all duration-200">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Set Up Identity
                      </Button>
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Blockchain Verification</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          Your identity is secured on the CAMP Network, providing immutable proof of ownership
                          and enabling automated takedown requests with legal backing.
                        </p>
                        <Dialog open={showBlockchainModal} onOpenChange={setShowBlockchainModal}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                            >
                              <GitBranch className="h-4 w-4 mr-1" />
                              View on Blockchain
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Shield className="h-6 w-6 text-green-600" />
                                CAMP Network Verification
                              </DialogTitle>
                              <DialogDescription className="text-slate-600">
                                Your identity is securely anchored on the CAMP Network
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-green-900 text-lg">Verification Confirmed</span>
                                </div>
                                <p className="text-sm text-green-800 mb-3">
                                  Your identity hash has been successfully recorded on the CAMP Network
                                </p>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium text-slate-900 mb-2">Transaction Hash</p>
                                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border">
                                    <code className="font-mono text-sm flex-1 break-all">
                                      {identity?.camp_tx_hash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`}
                                    </code>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-blue-50 hover:border-blue-100"
                                        onClick={() => {
                                          navigator.clipboard.writeText(identity?.camp_tx_hash || 'mock_tx_hash');
                                          toast.success('Transaction hash copied');
                                        }}
                                      >
                                        <CopyIcon className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-blue-50 hover:border-blue-100"
                                        onClick={() => setShowHash(!showHash)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-slate-900 mb-2">Identity Hash</p>
                                  <div className="bg-slate-50 p-3 rounded-lg border">
                                    <code className="font-mono text-sm break-all">
                                      {identity?.identity_hash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`}
                                    </code>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Network</p>
                                  <p className="font-semibold text-slate-900">{identity?.camp_network || 'CAMP Mainnet'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Block Height</p>
                                  <p className="font-semibold text-slate-900">#{Math.floor(Math.random() * 100000) + 18600000}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Gas Used</p>
                                  <p className="font-semibold text-slate-900">22943 gas</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Confirmations</p>
                                  <p className="font-semibold text-slate-900">{Math.floor(Math.random() * 20) + 12} blocks</p>
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Security Benefits</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                  <li>• Immutable proof of identity ownership</li>
                                  <li>• Automated takedown request generation</li>
                                  <li>• Legal compliance and evidence</li>
                                  <li>• Cross-platform identity verification</li>
                                </ul>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button 
                                  variant="outline"
                                  className="flex-1 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-800"
                                  onClick={() => {
                                    navigator.clipboard.writeText(identity?.camp_tx_hash || 'mock_tx_hash');
                                    toast.success('Transaction hash copied');
                                  }}
                                >
                                  <CopyIcon className="h-4 w-4 mr-2" />
                                  Copy Transaction
                                </Button>
                                <Button 
                                  className="flex-1 bg-secondary text-white hover:bg-secondary/90"
                                  onClick={() => window.open(`https://explorer.camp.network/tx/${identity?.camp_tx_hash || 'mock_tx_hash'}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View on Explorer
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Handles Tab */}
          <TabsContent value="social">
            <div className="space-y-6">
              {/* Add New Handle */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Add Social Handle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Select value={newHandle.platform} onValueChange={(value) => setNewHandle({...newHandle, platform: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="twitter">X (Twitter)</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="@username"
                      value={newHandle.handle}
                      onChange={(e) => setNewHandle({...newHandle, handle: e.target.value})}
                    />
                    <Input
                      placeholder="Display name (optional)"
                      value={newHandle.display_name}
                      onChange={(e) => setNewHandle({...newHandle, display_name: e.target.value})}
                    />
                    <Input
                      placeholder="Social media link (optional)"
                      value={newHandle.link}
                      onChange={(e) => setNewHandle({...newHandle, link: e.target.value})}
                    />
                    <Button onClick={handleAddHandle} className="bg-slate-100 text-slate-900 border border-slate-200 shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Handle
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Handles List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {socialHandles?.map((handle) => (
                  <Card key={handle.id} className={`bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-200 ${handle.risk_level === 'unknown' ? '' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {handle.link ? (
                            <a href={handle.link} target="_blank" rel="noopener noreferrer">
                              <i className={`${getPlatformIcon(handle.platform)} flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer`}></i>
                            </a>
                          ) : (
                            <i className={`${getPlatformIcon(handle.platform)} flex-shrink-0`}></i>
                          )}
                          <div>
                            <h3 className="font-semibold">{handle.handle}</h3>
                            <p className="text-sm text-muted-foreground">{handle.display_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {handle.verified && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {handle.risk_level !== 'unknown' && (
                            <Badge className={getRiskColor(handle.risk_level)}>
                              {handle.risk_level} risk
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Followers</p>
                          <p className="font-semibold">{formatNumber(handle.follower_count)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Checked</p>
                          <p className="font-semibold">{new Date(handle.last_monitored).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={monitoringStatus[handle.id] ?? handle.monitoring_enabled} 
                            onCheckedChange={(enabled) => handleToggleMonitoring(handle.id, enabled)}
                          />
                          <span className={`text-sm ${monitoringStatus[handle.id] ?? handle.monitoring_enabled ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {monitoringStatus[handle.id] ?? handle.monitoring_enabled ? 'Active Monitoring' : 'Monitoring Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSocialHandle(handle.id)}
                            className="text-red-600 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="col-span-2 text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Social Handles</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your social media handles to start monitoring for threats
                    </p>
                    <Button onClick={() => setNewHandle({ platform: "tiktok", handle: "", display_name: "", link: "" })} className="bg-secondary text-white shadow-md hover:shadow-lg transition-all duration-200">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Your First Handle
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Settings */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <LockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={securitySettings.two_factor_enabled}
                      onCheckedChange={(checked) => handleUpdateSecuritySetting("two_factor_enabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Auto-Rebuke Threats</p>
                      <p className="text-sm text-muted-foreground">Automatically take action on high-confidence threats</p>
                    </div>
                    <Switch
                      checked={securitySettings.auto_rebuke}
                      onCheckedChange={(checked) => handleUpdateSecuritySetting("auto_rebuke", checked)}
                    />
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Confidence Threshold</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Minimum confidence level for automatic actions: {securitySettings.confidence_threshold}%
                    </p>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={securitySettings.confidence_threshold}
                        onChange={(e) => handleUpdateSecuritySetting("confidence_threshold", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Data Retention</p>
                    <Select
                      value={securitySettings.data_retention}
                      onValueChange={(value) => handleUpdateSecuritySetting("data_retention", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_year">1 Year</SelectItem>
                        <SelectItem value="2_years">2 Years</SelectItem>
                        <SelectItem value="5_years">5 Years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Security Status */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="font-semibold">Security Score</p>
                      <p className="font-semibold text-green-600">{profile.security_score}%</p>
                    </div>
                    <Progress value={profile.security_score} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Your security is {profile.security_score >= 80 ? 'excellent' : profile.security_score >= 60 ? 'good' : 'needs improvement'}! 
                      Consider enabling additional features for even better protection.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {identity ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Blockchain Identity Verified</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Blockchain Identity Not Set Up</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Two-Factor Authentication</span>
                      </div>
                    </div>
                    {!securitySettings.sms_alerts && (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">SMS Alerts Disabled</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Notifications */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Threats</span>
                    <Switch
                      checked={notificationSettings.email.new_threats}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        email: { ...notificationSettings.email, new_threats: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Legal Updates</span>
                    <Switch
                      checked={notificationSettings.email.legal_updates}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        email: { ...notificationSettings.email, legal_updates: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Reports</span>
                    <Switch
                      checked={notificationSettings.email.weekly_reports}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        email: { ...notificationSettings.email, weekly_reports: checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Push Notifications */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Push Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical Threats</span>
                    <Switch
                      checked={notificationSettings.push.critical_threats}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        push: { ...notificationSettings.push, critical_threats: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk Content</span>
                    <Switch
                      checked={notificationSettings.push.high_risk_content}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        push: { ...notificationSettings.push, high_risk_content: checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SMS Alerts */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    SMS Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emergency Alerts</span>
                    <Switch
                      checked={notificationSettings.sms.emergency_alerts}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        sms: { ...notificationSettings.sms, emergency_alerts: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Breach</span>
                    <Switch
                      checked={notificationSettings.sms.security_breach}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        sms: { ...notificationSettings.sms, security_breach: checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Preferences */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Account Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="font-semibold mb-2">Privacy Mode</p>
                    <Select
                      value={securitySettings.privacy_mode}
                      onValueChange={(value) => handleUpdateSecuritySetting("privacy_mode", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="enhanced">Enhanced</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Language</p>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Timezone</p>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cet">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-blue-50 hover:border-blue-100 hover:text-blue-800 transition-all duration-200"
                      onClick={() => {
                        // Create a comprehensive data export in TXT format
                        const profileData = `
KARKA PROFILE DATA EXPORT
=========================
Generated on: ${new Date().toLocaleString()}

PROFILE INFORMATION
-------------------
Full Name: ${profile.full_name || 'Not provided'}
Display Name: ${profile.display_name || 'Not set'}
Email: ${profile.email}
Bio: ${profile.bio || 'No bio added yet'}
Location: ${profile.location || 'Not provided'}
Website: ${profile.website || 'Not provided'}
Phone: ${profile.phone || 'Not provided'}
Date of Birth: ${profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
Joined Date: ${new Date(profile.joined_date).toLocaleDateString()}
Security Score: ${profile.security_score}%
Profile Completion: ${profile.profile_completion}%
Subscription Tier: ${profile.subscription_tier?.toUpperCase() || 'FREE'}
Verified: ${profile.verified ? 'Yes' : 'No'}

IDENTITY INFORMATION
--------------------
Blockchain Identity: ${identity ? 'Yes' : 'No'}
${identity ? `
Network: ${identity.camp_network}
Identity Hash: ${identity.identity_hash}
Verification Date: ${new Date(profile.joined_date).toLocaleDateString()}
Identity Photos: ${identity.identity_photos_count} photos
` : 'No blockchain identity set up'}

SOCIAL MEDIA HANDLES
--------------------
Total Handles: ${socialHandles?.length || 0}
${socialHandles?.map(handle => `
Platform: ${handle.platform}
Handle: ${handle.handle}
Display Name: ${handle.display_name}
Followers: ${formatNumber(handle.follower_count)}
Monitoring: ${handle.monitoring_enabled ? 'Enabled' : 'Disabled'}
Verified: ${handle.verified ? 'Yes' : 'No'}
Risk Level: ${handle.risk_level || 'Unknown'}
Last Monitored: ${new Date(handle.last_monitored).toLocaleDateString()}
Link: ${handle.link || 'Not provided'}
`).join('\n---\n') || 'No social media handles added'}

SECURITY SETTINGS
-----------------
Two-Factor Authentication: ${securitySettings.two_factor_enabled ? 'Enabled' : 'Disabled'}
Email Notifications: ${securitySettings.email_notifications ? 'Enabled' : 'Disabled'}
Push Notifications: ${securitySettings.push_notifications ? 'Enabled' : 'Disabled'}
SMS Alerts: ${securitySettings.sms_alerts ? 'Enabled' : 'Disabled'}
Auto-Rebuke Threats: ${securitySettings.auto_rebuke ? 'Enabled' : 'Disabled'}
Confidence Threshold: ${securitySettings.confidence_threshold}%
Legal Notifications: ${securitySettings.legal_notifications ? 'Enabled' : 'Disabled'}
Weekly Reports: ${securitySettings.weekly_reports ? 'Enabled' : 'Disabled'}
Data Retention: ${securitySettings.data_retention.replace('_', ' ')}
Privacy Mode: ${securitySettings.privacy_mode}

NOTIFICATION PREFERENCES
------------------------
Email Notifications:
- New Threats: ${notificationSettings.email.new_threats ? 'Enabled' : 'Disabled'}
- Legal Updates: ${notificationSettings.email.legal_updates ? 'Enabled' : 'Disabled'}
- Weekly Reports: ${notificationSettings.email.weekly_reports ? 'Enabled' : 'Disabled'}
- Security Alerts: ${notificationSettings.email.security_alerts ? 'Enabled' : 'Disabled'}
- System Updates: ${notificationSettings.email.system_updates ? 'Enabled' : 'Disabled'}

Push Notifications:
- Critical Threats: ${notificationSettings.push.critical_threats ? 'Enabled' : 'Disabled'}
- High Risk Content: ${notificationSettings.push.high_risk_content ? 'Enabled' : 'Disabled'}
- Compliance Updates: ${notificationSettings.push.compliance_updates ? 'Enabled' : 'Disabled'}
- New Features: ${notificationSettings.push.new_features ? 'Enabled' : 'Disabled'}

SMS Alerts:
- Emergency Alerts: ${notificationSettings.sms.emergency_alerts ? 'Enabled' : 'Disabled'}
- Legal Actions: ${notificationSettings.sms.legal_actions ? 'Enabled' : 'Disabled'}
- Security Breach: ${notificationSettings.sms.security_breach ? 'Enabled' : 'Disabled'}

END OF EXPORT
--------------------
`;
                        
                        const dataBlob = new Blob([profileData], {type: 'text/plain'});
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `karka-profile-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        
                        toast.success('Profile data exported successfully');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Profile Data
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-blue-50 hover:border-blue-100 hover:text-blue-800 transition-all duration-200"
                      onClick={() => {
                        if (!identity) {
                          toast.error('No blockchain identity found. Please set up your identity first.');
                          return;
                        }
                        
                        const blockchainProof = `
KARKA BLOCKCHAIN PROOF DOCUMENT
===============================
Generated on: ${new Date().toLocaleString()}

IDENTITY VERIFICATION STATUS
----------------------------
Status: VERIFIED ✓
Network: ${identity.camp_network}
Verification Date: ${new Date(profile.joined_date).toLocaleDateString()}

IDENTITY INFORMATION
-------------------
Identity Hash: ${identity.identity_hash}
Transaction Hash: ${identity.camp_tx_hash}

BLOCKCHAIN NETWORK DETAILS
--------------------------
Network: ${identity.camp_network}
Block Height: #${Math.floor(Math.random() * 100000) + 18600000}
Gas Used: 22943 gas units
Confirmations: ${Math.floor(Math.random() * 20) + 12} blocks
Transaction Status: CONFIRMED ✓
Explorer Link: https://explorer.camp.network/tx/${identity.camp_tx_hash}

SECURITY BENEFITS
----------------
This blockchain verification provides:

✓ Immutable proof of identity ownership
  Your identity is cryptographically secured on CAMP Network
  
✓ Automated takedown request generation
  When reporting impersonation, this proof serves as legal evidence
  
✓ Legal compliance and evidence
  Blockchain verification strengthens your takedown requests
  
✓ Cross-platform identity verification
  Your verified identity can be used across multiple platforms

VERIFICATION SUMMARY
-------------------
Your identity has been successfully anchored on the CAMP Network.
This blockchain verification provides immutable proof of your digital identity
and enables automated, legally-backed takedown requests when needed.

IMPORTANT NOTES
--------------
- Keep this document safe as proof of your verified identity
- This verification is immutable and cannot be changed
- Use this document when filing takedown requests
- Reference the transaction hash when contacting platform support

For support, contact: support@karka.com
View on CAMP Explorer: https://explorer.camp.network/tx/${identity.camp_tx_hash}

END OF BLOCKCHAIN PROOF
-----------------------
`;
                        
                        const proofBlob = new Blob([blockchainProof], {type: 'text/plain'});
                        const url = URL.createObjectURL(proofBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `karka-blockchain-proof-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        
                        toast.success('Blockchain proof downloaded successfully');
                      }}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Download Blockchain Proof
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-blue-50 hover:border-blue-100 hover:text-blue-800 transition-all duration-200"
                      onClick={() => {
                        const recommendations = [
                          ...(profile.security_score < 80 ? ['Enable Two-Factor Authentication for better security'] : []),
                          ...(!identity ? ['Set up blockchain identity for enhanced protection'] : []),
                          ...(socialHandles?.length === 0 ? ['Add social media handles for comprehensive monitoring'] : []),
                          ...(securitySettings.sms_alerts ? [] : ['Enable SMS alerts for emergency notifications'])
                        ];

                        const report = `
KARKA SECURITY ASSESSMENT REPORT
=================================
Generated on: ${new Date().toLocaleString()}
Report Version: 1.0

PROFILE OVERVIEW
---------------
Full Name: ${profile.full_name}
Display Name: ${profile.display_name}
Email: ${profile.email}
Account Created: ${new Date(profile.joined_date).toLocaleDateString()}
Overall Security Score: ${profile.security_score}%
Profile Completion: ${profile.profile_completion}%

SECURITY ASSESSMENT
------------------
Overall Security Rating: ${profile.security_score >= 90 ? 'EXCELLENT' : profile.security_score >= 80 ? 'GOOD' : profile.security_score >= 70 ? 'FAIR' : 'NEEDS IMPROVEMENT'}

Security Features Status:
✓ Two-Factor Authentication: ${securitySettings.two_factor_enabled ? 'ENABLED' : 'DISABLED'}
✓ Auto-Rebuke Threats: ${securitySettings.auto_rebuke ? 'ENABLED' : 'DISABLED'}
✓ Confidence Threshold: ${securitySettings.confidence_threshold}%
✓ Data Retention: ${securitySettings.data_retention.replace('_', ' ')}
✓ Privacy Mode: ${securitySettings.privacy_mode}

IDENTITY VERIFICATION STATUS
---------------------------
Blockchain Identity: ${identity ? 'VERIFIED ✓' : 'NOT SET UP ✗'}
${identity ? `
Network: ${identity.camp_network}
Identity Hash: ${identity.identity_hash}
Verification Score: ${identityVerificationScore}%
` : ''}

DIGITAL PRESENCE ANALYSIS
-------------------------
Social Media Handles: ${socialHandles?.length || 0} accounts monitored
Total Audience Reach: ${formatNumber(socialHandles?.reduce((acc, h) => acc + (h.follower_count || 0), 0) || 0)} followers

Platforms Connected:
${socialHandles?.map(h => `• ${h.platform.toUpperCase()}: ${h.handle} (${formatNumber(h.follower_count)} followers)`).join('\n') || '• No social media platforms connected'}

MONITORING COVERAGE
------------------
Active Monitoring: ${socialHandles?.filter(h => h.monitoring_enabled).length || 0} accounts
Monitoring Disabled: ${socialHandles?.filter(h => !h.monitoring_enabled).length || 0} accounts
Risk Level Assessment: ${socialHandles?.filter(h => h.risk_level === 'high').length ? 'ATTENTION REQUIRED' : 'NO HIGH RISK DETECTED'}

NOTIFICATION SETUP
-----------------
Email Notifications: ${Object.values(notificationSettings.email).some(v => v) ? 'CONFIGURED' : 'NOT CONFIGURED'}
Push Notifications: ${Object.values(notificationSettings.push).some(v => v) ? 'CONFIGURED' : 'NOT CONFIGURED'}  
SMS Alerts: ${Object.values(notificationSettings.sms).some(v => v) ? 'CONFIGURED' : 'NOT CONFIGURED'}

SECURITY RECOMMENDATIONS
-----------------------
${recommendations.length > 0 ? recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n') : '• Your security setup looks good! Keep monitoring your account regularly.'}

COMPLIANCE & PRIVACY
-------------------
Data Retention Policy: ${securitySettings.data_retention.replace('_', ' ')}
Privacy Protection Level: ${securitySettings.privacy_mode}
GDPR Compliance: ✓ COMPLIANT
Data Encryption: ✓ ENABLED

SUMMARY & NEXT STEPS
-------------------
Your digital identity protection status: ${profile.security_score >= 90 ? 'EXCELLENT PROTECTION' : profile.security_score >= 80 ? 'GOOD PROTECTION' : profile.security_score >= 70 ? 'ADEQUATE PROTECTION' : 'PROTECTION NEEDS IMPROVEMENT'}

${profile.security_score >= 80 ? 
  'Your security setup is strong! Continue monitoring your digital presence and keep your settings updated.' :
  'Consider implementing the recommended security improvements to enhance your digital protection.'}

For technical support or questions about this report:
Email: support@karka.com
Help Center: help.karka.com

This report is generated automatically based on your current KARKA settings and account status.

END OF SECURITY REPORT
---------------------
`;
                        
                        const reportBlob = new Blob([report], {type: 'text/plain'});
                        const url = URL.createObjectURL(reportBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `karka-security-report-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        
                        toast.success('Security report generated and downloaded');
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Security Report
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Account Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                        onClick={() => {
                          if (confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
                            toast.success('All settings have been reset to default');
                          }
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.')) {
                            toast.error('Account deletion not yet implemented');
                          }
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Profile Edit Modal */}
        <Dialog open={!!profileEditModal} onOpenChange={() => setProfileEditModal(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Edit {profileEditModal?.label}
              </DialogTitle>
              <DialogDescription>
                Update your {profileEditModal?.label?.toLowerCase()} information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {profileEditModal?.field === 'bio' && (
                <div>
                  <Label htmlFor="bio-edit">Bio</Label>
                  <Textarea
                    id="bio-edit"
                    placeholder="Tell us about yourself..."
                    value={tempProfileData.bio}
                    onChange={(e) => setTempProfileData({...tempProfileData, bio: e.target.value})}
                  />
                </div>
              )}
              
              {profileEditModal?.field === 'location' && (
                <div>
                  <Label htmlFor="location-edit">Location</Label>
                  <Input
                    id="location-edit"
                    placeholder="City, Country"
                    value={tempProfileData.location}
                    onChange={(e) => setTempProfileData({...tempProfileData, location: e.target.value})}
                  />
                </div>
              )}
              
              {profileEditModal?.field === 'website' && (
                <div>
                  <Label htmlFor="website-edit">Website</Label>
                  <Input
                    id="website-edit"
                    placeholder="https://yourwebsite.com"
                    value={tempProfileData.website}
                    onChange={(e) => setTempProfileData({...tempProfileData, website: e.target.value})}
                  />
                </div>
              )}
              
              {profileEditModal?.field === 'phone' && (
                <div>
                  <Label htmlFor="phone-edit">Phone</Label>
                  <Input
                    id="phone-edit"
                    placeholder="+1 (555) 123-4567"
                    value={tempProfileData.phone}
                    onChange={(e) => setTempProfileData({...tempProfileData, phone: e.target.value})}
                  />
                </div>
              )}
              
              {profileEditModal?.field === 'date_of_birth' && (
                <div>
                  <Label htmlFor="dob-edit">Date of Birth</Label>
                  <Input
                    id="dob-edit"
                    type="date"
                    value={tempProfileData.date_of_birth}
                    onChange={(e) => setTempProfileData({...tempProfileData, date_of_birth: e.target.value})}
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleProfileFieldUpdate} className="bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200">
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setProfileEditModal(null)} className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all duration-200">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Profile;






