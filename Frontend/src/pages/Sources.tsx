import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Trash2, CheckCircle, XCircle, Search, Filter, MoreHorizontal, 
  Edit, Shield, AlertTriangle, Globe, Target, ExternalLink, 
  Users, Activity, TrendingUp, TrendingDown, Copy, Star, Ban,
  Settings, RefreshCw, Download, Upload, Eye, EyeOff, Clock
} from "lucide-react";
import { toast } from "sonner";

// TODO: Replace with real API calls to your backend
// Mock data for demonstration - in production, this would come from your backend API
// Integration points:
// - Replace mockWhitelistedSources with API call to /api/sources/whitelist
// - Replace mockBlocklistedSources with API call to /api/sources/blocklist
// - Replace mockAnalytics with API call to /api/sources/analytics
// - Add CAMP Network queries for blockchain-based source verification
// - Implement real-time reputation scoring from blockchain data
// - Add smart contract integration for decentralized source management
// - Integrate with platform APIs for actual account verification
// - Implement ML-based automatic source classification
// Enhanced mock data for comprehensive source management
const mockWhitelistedSources = [
  {
    id: "1",
    platform: "tiktok",
    handle: "@official_creator",
    displayName: "Official Creator Channel",
    domain: "tiktok.com",
    notes: "Verified official account with blue checkmark",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    trust_score: 98,
    verification_status: "verified",
    follower_count: 125000,
    engagement_rate: 4.2,
    status: "active",
    categories: ["official", "verified"]
  },
  {
    id: "2",
    platform: "youtube",
    handle: "Official Creator Channel",
    displayName: "Official Creator Channel",
    domain: "youtube.com",
    notes: "Main YouTube channel with monetization enabled",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    last_seen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    trust_score: 95,
    verification_status: "verified",
    follower_count: 89000,
    engagement_rate: 6.1,
    status: "active",
    categories: ["official", "monetized"]
  },
  {
    id: "3",
    platform: "instagram",
    handle: "@creator_official",
    displayName: "Creator Official",
    domain: "instagram.com",
    notes: "Personal brand account, no commercial use",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    last_seen: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    trust_score: 92,
    verification_status: "verified",
    follower_count: 156000,
    engagement_rate: 8.7,
    status: "active",
    categories: ["official", "personal"]
  }
];

const mockBlocklistedSources = [
  {
    id: "4",
    platform: "tiktok",
    handle: "@fake_creator_scam",
    displayName: "Fake Creator Scam Account",
    domain: "tiktok.com",
    notes: "Impersonating account running cryptocurrency scams",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    last_seen: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    violation_type: "impersonation_scam",
    threat_level: "high",
    reports_count: 47,
    follower_count: 23000,
    status: "active",
    categories: ["scam", "impersonation", "fraudulent"]
  },
  {
    id: "5",
    platform: "youtube",
    handle: "Content Thief 2024",
    displayName: "Content Thief 2024",
    domain: "youtube.com",
    notes: "Regular reposting of original content without attribution",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    last_seen: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    violation_type: "content_theft",
    threat_level: "medium",
    reports_count: 23,
    follower_count: 5600,
    status: "active",
    categories: ["repost", "unauthorized"]
  },
  {
    id: "6",
    platform: "twitter",
    handle: "@ai_deepfake_bot",
    displayName: "AI Deepfake Bot",
    domain: "twitter.com",
    notes: "Automated account generating deepfake content",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    last_seen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    violation_type: "deepfake",
    threat_level: "critical",
    reports_count: 156,
    follower_count: 8900,
    status: "active",
    categories: ["ai-generated", "deepfake", "automated"]
  }
];

const mockAnalytics = {
  totalWhitelisted: mockWhitelistedSources.length,
  totalBlocklisted: mockBlocklistedSources.length,
  totalViolationsPrevented: 847,
  trustedAccountsReach: 125000 + 89000 + 156000,
  averageTrustScore: 95,
  blockingSuccessRate: 94,
  activeMonitors: 12,
  lastUpdated: "2 minutes ago"
};

const Sources = () => {
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<null | {
    id: string;
    platform: string;
    handle: string;
    displayName: string;
    domain: string;
    notes: string;
  }>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [formData, setFormData] = useState({
    sourceType: "whitelist" as "whitelist" | "blocklist",
    platform: "tiktok",
    handle: "",
    displayName: "",
    domain: "",
    notes: "",
    autoMonitoring: true,
    confidenceThreshold: 85
  });

  // Use mock data for demonstration
  const [whitelistedSources, setWhitelistedSources] = useState(mockWhitelistedSources);
  const [blocklistedSources, setBlocklistedSources] = useState(mockBlocklistedSources);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredWhitelisted = whitelistedSources
    .filter(source => 
      (filterPlatform === "all" || source.platform === filterPlatform) &&
      (source.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      return sortOrder === "asc" ? 
        (aVal > bVal ? 1 : -1) : 
        (aVal < bVal ? 1 : -1);
    });

  const filteredBlocklisted = blocklistedSources
    .filter(source => 
      (filterPlatform === "all" || source.platform === filterPlatform) &&
      (source.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      return sortOrder === "asc" ? 
        (aVal > bVal ? 1 : -1) : 
        (aVal < bVal ? 1 : -1);
    });

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

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleAddSource = () => {
    const baseSource = {
      id: Date.now().toString(),
      platform: formData.platform,
      handle: formData.handle,
      displayName: formData.displayName || formData.handle,
      domain: formData.domain || `${formData.platform}.com`,
      notes: formData.notes,
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      follower_count: 0,
      status: "active" as const
    };

    if (formData.sourceType === "whitelist") {
      const whitelistSource = {
        ...baseSource,
        trust_score: 100,
        verification_status: "verified" as const,
        engagement_rate: 0,
        categories: ["trusted"] as string[]
      };
      setWhitelistedSources([...whitelistedSources, whitelistSource]);
      toast.success("Source added to whitelist");
    } else {
      const blocklistSource = {
        ...baseSource,
        violation_type: "manual_block" as const,
        threat_level: "medium" as const,
        reports_count: 0,
        categories: ["blocked"] as string[]
      };
      setBlocklistedSources([...blocklistedSources, blocklistSource]);
      toast.success("Source added to blocklist");
    }

    setShowAddDialog(false);
    setFormData({
      sourceType: "whitelist",
      platform: "tiktok",
      handle: "",
      displayName: "",
      domain: "",
      notes: "",
      autoMonitoring: true,
      confidenceThreshold: 85
    });
  };

  const handleDeleteSource = (id: string, type: "whitelist" | "blocklist") => {
    if (type === "whitelist") {
      setWhitelistedSources(whitelistedSources.filter(s => s.id !== id));
      toast.success("Source removed from whitelist");
    } else {
      setBlocklistedSources(blocklistedSources.filter(s => s.id !== id));
      toast.success("Source removed from blocklist");
    }
  };

  const handleBulkAction = (action: "enable" | "disable" | "delete", type: "whitelist" | "blocklist") => {
    toast.success(`Bulk ${action} completed for ${type} sources`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading source management...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Source Management Center</h1>
                <p className="text-green-100">Manage trusted and blocked sources across all platforms</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {mockAnalytics.totalWhitelisted + mockAnalytics.totalBlocklisted} Total Sources
                </Badge>
                <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-400">
                  {mockAnalytics.blockingSuccessRate}% Success Rate
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-100 text-sm">Trusted Sources</p>
                <p className="text-2xl font-bold">{mockAnalytics.totalWhitelisted}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-100 text-sm">Blocked Sources</p>
                <p className="text-2xl font-bold">{mockAnalytics.totalBlocklisted}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-100 text-sm">Avg Trust Score</p>
                <p className="text-2xl font-bold">{mockAnalytics.averageTrustScore}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-100 text-sm">Violations Prevented</p>
                <p className="text-2xl font-bold">{formatNumber(mockAnalytics.totalViolationsPrevented)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sources by handle, name, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">X (Twitter)</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Date Added</SelectItem>
                      <SelectItem value="handle">Handle</SelectItem>
                      <SelectItem value="follower_count">Followers</SelectItem>
                      <SelectItem value="trust_score">Trust Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{filteredWhitelisted.length + filteredBlocklisted.length}</span> sources found
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-green-600">{filteredWhitelisted.length}</span> trusted
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-red-600">{filteredBlocklisted.length}</span> blocked
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Source
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Source</DialogTitle>
                        <DialogDescription>
                          Add an account to your whitelist or blocklist
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Source Type</Label>
                          <Select
                            value={formData.sourceType}
                            onValueChange={(value: "whitelist" | "blocklist") => setFormData({ ...formData, sourceType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="whitelist">Whitelist (Trusted)</SelectItem>
                              <SelectItem value="blocklist">Blocklist (Blocked)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Platform</Label>
                          <Select
                            value={formData.platform}
                            onValueChange={(value) => setFormData({ ...formData, platform: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="twitter">X (Twitter)</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Handle/Username *</Label>
                          <Input
                            placeholder="@username"
                            value={formData.handle}
                            onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Display Name</Label>
                          <Input
                            placeholder="Display name (optional)"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Domain</Label>
                          <Input
                            placeholder="platform.com"
                            value={formData.domain}
                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Input
                            placeholder="Additional information..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={formData.autoMonitoring}
                            onCheckedChange={(checked) => setFormData({ ...formData, autoMonitoring: checked })}
                          />
                          <Label className="text-sm">Enable automatic monitoring</Label>
                        </div>
                        <Button
                          onClick={handleAddSource}
                          className="w-full"
                          disabled={!formData.handle.trim()}
                        >
                          Add Source
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sources Tabs */}
        <Tabs defaultValue="whitelist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whitelist" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Trusted Sources ({filteredWhitelisted.length})
            </TabsTrigger>
            <TabsTrigger value="blocklist" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Blocked Sources ({filteredBlocklisted.length})
            </TabsTrigger>
          </TabsList>

          {/* Whitelisted Sources */}
          <TabsContent value="whitelist">
            <div className="space-y-4">
              {filteredWhitelisted.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">No trusted sources found</p>
                    <p className="text-muted-foreground">
                      {searchTerm || filterPlatform !== "all" 
                        ? "No sources match your current filters" 
                        : "Add your first trusted source to get started"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredWhitelisted.map((source) => (
                  <Card key={source.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-2xl">{getPlatformIcon(source.platform)}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getPlatformColor(source.platform)}>
                                {source.platform}
                              </Badge>
                              <span className="font-semibold text-lg">{source.handle}</span>
                              {getVerificationIcon(source.verification_status)}
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                Trust: {source.trust_score}%
                              </Badge>
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                {formatNumber(source.follower_count)} followers
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Added: {new Date(source.created_at).toLocaleDateString()}</span>
                              <span>Last seen: {new Date(source.last_seen).toLocaleDateString()}</span>
                              <span>Engagement: {source.engagement_rate}%</span>
                            </div>
                            <p className="text-sm">{source.notes}</p>
                            <div className="flex flex-wrap gap-1">
                              {source.categories.map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSource(source.id, "whitelist")}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Blocklisted Sources */}
          <TabsContent value="blocklist">
            <div className="space-y-4">
              {filteredBlocklisted.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Ban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">No blocked sources found</p>
                    <p className="text-muted-foreground">
                      {searchTerm || filterPlatform !== "all" 
                        ? "No sources match your current filters" 
                        : "No sources have been blocked yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredBlocklisted.map((source) => (
                  <Card key={source.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-2xl">{getPlatformIcon(source.platform)}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getPlatformColor(source.platform)}>
                                {source.platform}
                              </Badge>
                              <span className="font-semibold text-lg">{source.handle}</span>
                              <Badge className={getThreatLevelColor(source.threat_level)}>
                                {source.threat_level.toUpperCase()} THREAT
                              </Badge>
                              <Badge variant="outline" className="text-red-600 border-red-200">
                                {source.violation_type.replace("_", " ")}
                              </Badge>
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {source.reports_count} reports
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Added: {new Date(source.created_at).toLocaleDateString()}</span>
                              <span>Last seen: {new Date(source.last_seen).toLocaleDateString()}</span>
                              <span>Followers: {formatNumber(source.follower_count)}</span>
                            </div>
                            <p className="text-sm">{source.notes}</p>
                            <div className="flex flex-wrap gap-1">
                              {source.categories.map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs bg-red-50 text-red-700">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Source
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSource(source.id, "blocklist")}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Sources;

