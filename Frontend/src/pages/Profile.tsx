import { useEffect, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Shield, Camera, Upload, Edit, CheckCircle, ExternalLink, 
  Settings, Bell, Lock, Globe, Eye, EyeOff, Copy, RefreshCw,
  Zap, Target, Users, BarChart3, Camera as CameraIcon, Image as ImageIcon,
  Plus, Trash2, AlertTriangle, Info, Star, Award, TrendingUp,
  Clock, Check, X, GitBranch, Database, Lock as LockIcon, 
  Copy as CopyIcon, Plus as PlusIcon, Download
} from "lucide-react";
import { toast } from "sonner";

// TODO: Replace with real API calls to your backend
// Mock data for demonstration - in production, this would come from your backend API
// Integration points:
// - Replace mockProfile with API call to /api/profile
// - Replace mockIdentity with API call to /api/profile/identity
// - Replace mockSocialHandles with API call to /api/profile/social-handles
// - Replace mockSecuritySettings with API call to /api/profile/security
// - Replace mockNotificationSettings with API call to /api/profile/notifications
// - Implement CAMP Network blockchain queries for identity verification
// - Add WebSocket connection for real-time settings updates
// - Implement actual file upload for profile avatar
// - Add blockchain transaction verification and proof generation
// Enhanced mock data for profile management
const mockProfile = {
  id: "user_123",
  email: "creator@example.com",
  full_name: "Jane Doe",
  display_name: "Jane Creative",
  bio: "Digital creator and content strategist. Protecting my digital identity with KARKA.",
  avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  verified: true,
  subscription_tier: "pro",
  joined_date: "2024-01-15",
  last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  security_score: 92,
  profile_completion: 85
};

const mockIdentity = {
  id: "identity_123",
  identity_hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
  camp_tx_hash: "0xabcdef1234567890abcdef1234567890abcdef12",
  camp_network: "CAMP Mainnet",
  blockchain_status: "verified",
  verification_date: "2024-01-16",
  confidence_score: 98,
  face_match_quality: 96,
  identity_photos_count: 5,
  last_hash_update: "2024-11-20",
  backup_status: "secured"
};

const mockSocialHandles = [
  {
    id: "1",
    platform: "tiktok",
    handle: "@janecreative",
    display_name: "Jane Creative",
    verified: true,
    follower_count: 125000,
    last_monitored: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    monitoring_enabled: true,
    risk_level: "low"
  },
  {
    id: "2",
    platform: "youtube",
    handle: "Jane Creative Official",
    display_name: "Jane Creative Official",
    verified: true,
    follower_count: 89000,
    last_monitored: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    monitoring_enabled: true,
    risk_level: "low"
  },
  {
    id: "3",
    platform: "twitter",
    handle: "@janecreates",
    display_name: "Jane Creative",
    verified: false,
    follower_count: 56000,
    last_monitored: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    monitoring_enabled: true,
    risk_level: "medium"
  },
  {
    id: "4",
    platform: "instagram",
    handle: "@janecreative",
    display_name: "Jane Creative",
    verified: true,
    follower_count: 203000,
    last_monitored: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    monitoring_enabled: true,
    risk_level: "low"
  }
];

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
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(mockProfile);
  const [identity, setIdentity] = useState(mockIdentity);
  const [socialHandles, setSocialHandles] = useState(mockSocialHandles);
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings);
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [newHandle, setNewHandle] = useState({ platform: "tiktok", handle: "", display_name: "" });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "tiktok": return "🎵";
      case "youtube": return "📺";
      case "twitter": return "🐦";
      case "instagram": return "📷";
      default: return "🌐";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "tiktok": return "bg-pink-500 text-white";
      case "youtube": return "bg-red-500 text-white";
      case "twitter": return "bg-blue-400 text-white";
      case "instagram": return "bg-pink-600 text-white";
      default: return "bg-gray-500 text-white";
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

  const handleUpdateProfile = () => {
    setEditingProfile(false);
    toast.success("Profile updated successfully");
  };

  const handleAddHandle = () => {
    if (!newHandle.handle.trim()) {
      toast.error("Please enter a handle");
      return;
    }

    const handle = {
      id: Date.now().toString(),
      platform: newHandle.platform,
      handle: newHandle.handle,
      display_name: newHandle.display_name || newHandle.handle,
      verified: false,
      follower_count: 0,
      last_monitored: new Date().toISOString(),
      monitoring_enabled: true,
      risk_level: "unknown"
    };

    setSocialHandles([...socialHandles, handle]);
    setNewHandle({ platform: "tiktok", handle: "", display_name: "" });
    toast.success("Social handle added successfully");
  };

  const handleRemoveHandle = (id: string) => {
    setSocialHandles(socialHandles.filter(h => h.id !== id));
    toast.success("Social handle removed");
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copied to clipboard");
  };

  const handleUpdateSecuritySetting = (key: string, value: boolean | string | number) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    toast.success("Security setting updated");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="relative z-10">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white/20">
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                  <AvatarFallback className="text-2xl bg-white/20 text-white">
                    {profile.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                  {profile.verified && (
                    <Badge className="bg-blue-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge className={getSubscriptionBadgeColor(profile.subscription_tier)}>
                    {profile.subscription_tier.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-purple-100 mb-2">{profile.bio}</p>
                <div className="flex items-center gap-4 text-sm text-purple-100">
                  <span>Joined {new Date(profile.joined_date).toLocaleDateString()}</span>
                  <span>Last seen {new Date(profile.last_login).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-100 text-sm">Security Score</p>
                <p className="text-2xl font-bold">{profile.security_score}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-100 text-sm">Profile Complete</p>
                <p className="text-2xl font-bold">{profile.profile_completion}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-100 text-sm">Social Handles</p>
                <p className="text-2xl font-bold">{socialHandles.length}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-100 text-sm">Total Reach</p>
                <p className="text-2xl font-bold">
                  {formatNumber(socialHandles.reduce((acc, h) => acc + h.follower_count, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="identity">Identity & Blockchain</TabsTrigger>
            <TabsTrigger value="social">Social Handles</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Identity & Blockchain Tab */}
          <TabsContent value="identity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
                      </div>
                      <div>
                        <Label>Display Name</Label>
                        <Input value={profile.display_name} onChange={(e) => setProfile({...profile, display_name: e.target.value})} />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateProfile}>
                          <Check className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingProfile(false)}>
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
                          <p className="font-semibold">{profile.full_name}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Display Name</p>
                        <p className="font-semibold">{profile.display_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bio</p>
                        <p className="font-semibold">{profile.bio}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blockchain Identity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    CAMP Network Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Blockchain Status</p>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {identity.blockchain_status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Confidence Score</p>
                      <p className="font-semibold text-green-600">{identity.confidence_score}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Identity Hash</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1 break-all">
                        {showHash ? identity.identity_hash : `${identity.identity_hash.substring(0, 20)}...${identity.identity_hash.substring(identity.identity_hash.length - 20)}`}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHash(!showHash)}
                      >
                        {showHash ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyHash(identity.identity_hash)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {identity.camp_tx_hash && (
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Hash</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1 break-all">
                          {identity.camp_tx_hash}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyHash(identity.camp_tx_hash)}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Network</p>
                      <p className="font-semibold">{identity.camp_network}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Date</p>
                      <p className="font-semibold">{new Date(identity.verification_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Identity Photos</p>
                      <p className="font-semibold">{identity.identity_photos_count} photos</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Face Match Quality</p>
                      <p className="font-semibold text-green-600">{identity.face_match_quality}%</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Blockchain Verification</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          Your identity is secured on the CAMP Network, providing immutable proof of ownership
                          and enabling automated takedown requests with legal backing.
                        </p>
                        {/* TODO: Implement CAMP Network blockchain integration */}
                        {/* 
                          This button should:
                          1. Connect to CAMP Network via Web3/ethers.js
                          2. Query the CAMP Network contract for identity data
                          3. Display transaction details and block information
                          4. Provide verifiable proof of identity ownership
                          5. Show real-time blockchain status and network info
                        */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 border-blue-300"
                          onClick={() => {
                            // TODO: Implement actual blockchain query
                            // const campProvider = new ethers.providers.JsonRpcProvider(process.env.CAMP_NETWORK_URL);
                            // const contract = new ethers.Contract(process.env.CAMP_CONTRACT_ADDRESS, CAMP_ABI, campProvider);
                            // const identityData = await contract.getIdentity(identityHash);
                            toast.info("Blockchain integration coming soon!");
                          }}
                        >
                          <GitBranch className="h-4 w-4 mr-1" />
                          View on Blockchain
                        </Button>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Add Social Handle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={newHandle.platform} onValueChange={(value) => setNewHandle({...newHandle, platform: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="twitter">X (Twitter)</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
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
                    <Button onClick={handleAddHandle}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Handle
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Handles List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {socialHandles.map((handle) => (
                  <Card key={handle.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getPlatformIcon(handle.platform)}</div>
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
                          <Badge className={getRiskColor(handle.risk_level)}>
                            {handle.risk_level} risk
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
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
                          <Switch checked={handle.monitoring_enabled} />
                          <span className="text-sm">Monitoring Active</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveHandle(handle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockIcon className="h-5 w-5" />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
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
                      Your security is strong! Consider enabling additional features for even better protection.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Blockchain Identity Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Two-Factor Authentication</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">SMS Alerts Disabled</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
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

              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Profile Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Download Blockchain Proof
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Security Report
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Account Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
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
      </div>
    </DashboardLayout>
  );
};

export default Profile;
