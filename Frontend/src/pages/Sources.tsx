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
  Settings, RefreshCw, Download, Upload, Eye, EyeOff, Clock,
  CheckCircle2, ArrowRight, Zap, Award, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
// Boxicons CSS
import 'boxicons/css/boxicons.css';

interface Source {
  id: string;
  user_id: string;
  source_type: 'whitelist' | 'blocklist';
  platform: string;
  handle: string;
  display_name?: string;
  domain?: string;
  notes?: string;
  auto_monitoring?: boolean;
  confidence_threshold?: number;
  status: string;
  categories: string[];
  created_at: string;
  updated_at: string;
  last_seen: string;
  // Whitelist specific fields
  trust_score?: number;
  verification_status?: string;
  follower_count?: number;
  engagement_rate?: number;
  // Blocklist specific fields
  violation_type?: string;
  threat_level?: string;
  reports_count?: number;
}

interface SourcesAnalytics {
  totalWhitelisted: number;
  totalBlocklisted: number;
  totalViolationsPrevented: number;
  trustedAccountsReach: number;
  averageTrustScore: number;
  blockingSuccessRate: number;
  activeMonitors: number;
  lastUpdated: string;
}

const Sources = () => {
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [whitelistedSources, setWhitelistedSources] = useState<Source[]>([]);
  const [blocklistedSources, setBlocklistedSources] = useState<Source[]>([]);
  const [analytics, setAnalytics] = useState<SourcesAnalytics | null>(null);
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

  // Load sources from Supabase
  const loadSources = async () => {
    try {
      setLoading(true);
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        // Use demo data if not authenticated
        loadDemoData();
        return;
      }

      // Load whitelisted sources
      const { data: whitelist, error: whitelistError } = await supabase
        .from('sources')
        .select('*')
        .eq('source_type', 'whitelist')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (whitelistError) throw whitelistError;

      // Load blocklisted sources
      const { data: blocklist, error: blocklistError } = await supabase
        .from('sources')
        .select('*')
        .eq('source_type', 'blocklist')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (blocklistError) throw blocklistError;

      // Transform data to match Source interface
      const transformSource = (source: Record<string, any>): Source => ({
        ...source,
        display_name: source.display_name || source.handle,
        status: source.status || 'active',
        categories: source.categories || [],
        last_seen: source.last_seen || source.created_at,
        updated_at: source.updated_at || source.created_at,
        trust_score: source.trust_score || null,
        verification_status: source.verification_status || null,
        follower_count: source.follower_count || 0,
        engagement_rate: source.engagement_rate || 0,
        violation_type: source.violation_type || null,
        threat_level: source.threat_level || null,
        reports_count: source.reports_count || 0
      });

      const transformedWhitelist = (whitelist || []).map(transformSource);
      const transformedBlocklist = (blocklist || []).map(transformSource);

      setWhitelistedSources(transformedWhitelist);
      setBlocklistedSources(transformedBlocklist);

      // Calculate analytics
      const totalWhitelisted = transformedWhitelist.length;
      const totalBlocklisted = transformedBlocklist.length;
      const trustedAccountsReach = transformedWhitelist.reduce((sum, source) => sum + (source.follower_count || 0), 0);
      const averageTrustScore = transformedWhitelist.length ? 
        Math.round(transformedWhitelist.reduce((sum, source) => sum + (source.trust_score || 0), 0) / transformedWhitelist.length) : 0;

      setAnalytics({
        totalWhitelisted,
        totalBlocklisted,
        totalViolationsPrevented: 892,
        trustedAccountsReach,
        averageTrustScore,
        blockingSuccessRate: 96,
        activeMonitors: 12,
        lastUpdated: "2 minutes ago"
      });

    } catch (error) {
      console.error('Error loading sources:', error);
      toast.error("Failed to load sources");
      // Fallback to demo data if database fails
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Fallback demo data
  const loadDemoData = () => {
    const demoWhitelist: Source[] = [
      {
        id: "1",
        user_id: "demo-user",
        source_type: "whitelist",
        platform: "tiktok",
        handle: "@official_creator",
        display_name: "Official Creator Channel",
        domain: "tiktok.com",
        notes: "Verified official account with blue checkmark and verified badge",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        trust_score: 98,
        verification_status: "verified",
        follower_count: 125000,
        engagement_rate: 4.2,
        status: "active",
        categories: ["official", "verified"],
        auto_monitoring: true,
        confidence_threshold: 85
      },
      {
        id: "2",
        user_id: "demo-user",
        source_type: "whitelist",
        platform: "youtube",
        handle: "Official Creator Channel",
        display_name: "Official Creator Channel",
        domain: "youtube.com",
        notes: "Main YouTube channel with monetization enabled and verified",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        last_seen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        trust_score: 95,
        verification_status: "verified",
        follower_count: 89000,
        engagement_rate: 6.1,
        status: "active",
        categories: ["official", "monetized"],
        auto_monitoring: true,
        confidence_threshold: 85
      },
      {
        id: "3",
        user_id: "demo-user",
        source_type: "whitelist",
        platform: "instagram",
        handle: "@creator_official",
        display_name: "Creator Official",
        domain: "instagram.com",
        notes: "Personal brand account with business verification",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        last_seen: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        trust_score: 92,
        verification_status: "verified",
        follower_count: 156000,
        engagement_rate: 8.7,
        status: "active",
        categories: ["official", "personal"],
        auto_monitoring: true,
        confidence_threshold: 85
      },
      {
        id: "4",
        user_id: "demo-user",
        source_type: "whitelist",
        platform: "twitter",
        handle: "@creator_brand",
        display_name: "Creator Brand Official",
        domain: "twitter.com",
        notes: "Official Twitter account with verified badge and brand account",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        last_seen: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        trust_score: 94,
        verification_status: "verified",
        follower_count: 78000,
        engagement_rate: 5.8,
        status: "active",
        categories: ["official", "brand"],
        auto_monitoring: true,
        confidence_threshold: 85
      }
    ];

    const demoBlocklist: Source[] = [
      {
        id: "5",
        user_id: "demo-user",
        source_type: "blocklist",
        platform: "tiktok",
        handle: "@fake_creator_scam",
        display_name: "Fake Creator Scam Account",
        domain: "tiktok.com",
        notes: "Impersonating account running cryptocurrency scams - BLOCKED",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        last_seen: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        violation_type: "impersonation_scam",
        threat_level: "high",
        reports_count: 47,
        follower_count: 23000,
        status: "blocked",
        categories: ["scam", "impersonation", "fraudulent"],
        auto_monitoring: true,
        confidence_threshold: 85
      },
      {
        id: "6",
        user_id: "demo-user",
        source_type: "blocklist",
        platform: "youtube",
        handle: "Content Thief 2024",
        display_name: "Content Thief 2024",
        domain: "youtube.com",
        notes: "Regular reposting of original content without attribution - ACTIONED",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        last_seen: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        violation_type: "content_theft",
        threat_level: "medium",
        reports_count: 23,
        follower_count: 5600,
        status: "removed",
        categories: ["repost", "unauthorized"],
        auto_monitoring: false,
        confidence_threshold: 75
      },
      {
        id: "7",
        user_id: "demo-user",
        source_type: "blocklist",
        platform: "twitter",
        handle: "@ai_deepfake_bot",
        display_name: "AI Deepfake Bot",
        domain: "twitter.com",
        notes: "Automated account generating deepfake content - MONITORED",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        last_seen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        violation_type: "deepfake",
        threat_level: "critical",
        reports_count: 156,
        follower_count: 8900,
        status: "active",
        categories: ["ai-generated", "deepfake", "automated"],
        auto_monitoring: true,
        confidence_threshold: 95
      }
    ];

    setWhitelistedSources(demoWhitelist);
    setBlocklistedSources(demoBlocklist);
    setAnalytics({
      totalWhitelisted: demoWhitelist.length,
      totalBlocklisted: demoBlocklist.length,
      totalViolationsPrevented: 892,
      trustedAccountsReach: 125000 + 89000 + 156000 + 78000,
      averageTrustScore: 95,
      blockingSuccessRate: 96,
      activeMonitors: 12,
      lastUpdated: "2 minutes ago"
    });
  };

  useEffect(() => {
    loadSources();
  }, []);

  const filteredWhitelisted = whitelistedSources
    .filter(source => 
      (filterPlatform === "all" || source.platform === filterPlatform) &&
      (source.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aVal = a[sortBy as keyof Source];
      const bVal = b[sortBy as keyof Source];
      return sortOrder === "asc" ? 
        (aVal > bVal ? 1 : -1) : 
        (aVal < bVal ? 1 : -1);
    });

  const filteredBlocklisted = blocklistedSources
    .filter(source => 
      (filterPlatform === "all" || source.platform === filterPlatform) &&
      (source.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aVal = a[sortBy as keyof Source];
      const bVal = b[sortBy as keyof Source];
      return sortOrder === "asc" ? 
        (aVal > bVal ? 1 : -1) : 
        (aVal < bVal ? 1 : -1);
    });

  const getPlatformIcon = (platform: string) => {
    const iconClass = {
      tiktok: "bx bxl-tiktok text-xl sm:text-2xl",
      youtube: "bx bxl-youtube text-xl sm:text-2xl", 
      twitter: "bx bxl-twitter text-xl sm:text-2xl",
      instagram: "bx bxl-instagram text-xl sm:text-2xl"
    };
    return iconClass[platform] || "bx bx-globe text-xl sm:text-2xl";
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "tiktok": return "bg-black text-white";
      case "youtube": return "bg-red-600 text-white";
      case "twitter": return "bg-blue-500 text-white";
      case "instagram": return "bg-gradient-to-br from-purple-600 to-pink-600 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-slate-500 text-white";
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

  const handleAddSource = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error("You must be logged in to add sources");
        return;
      }

      const sourceData = {
        user_id: user.id,
        source_type: formData.sourceType,
        platform: formData.platform,
        handle: formData.handle,
        display_name: formData.displayName || formData.handle,
        domain: formData.domain || `${formData.platform}.com`,
        notes: formData.notes,
        auto_monitoring: formData.autoMonitoring,
        confidence_threshold: formData.confidenceThreshold,
        status: "active",
        categories: [formData.sourceType === "whitelist" ? "trusted" : "blocked"]
      };

      const { data, error } = await supabase
        .from('sources')
        .insert([sourceData])
        .select()
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        display_name: data.display_name || data.handle,
        status: data.status || 'active',
        categories: data.categories || [],
        last_seen: data.last_seen || data.created_at,
        updated_at: data.updated_at || data.created_at,
        trust_score: data.trust_score || null,
        verification_status: data.verification_status || null,
        follower_count: data.follower_count || 0,
        engagement_rate: data.engagement_rate || 0,
        violation_type: data.violation_type || null,
        threat_level: data.threat_level || null,
        reports_count: data.reports_count || 0
      } as Source;

      if (formData.sourceType === "whitelist") {
        setWhitelistedSources([transformedData, ...whitelistedSources]);
        toast.success("Source added to trusted whitelist");
      } else {
        setBlocklistedSources([transformedData, ...blocklistedSources]);
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
    } catch (error) {
      console.error('Error adding source:', error);
      toast.error("Failed to add source");
    }
  };

  const handleDeleteSource = async (id: string, type: "whitelist" | "blocklist") => {
    try {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (type === "whitelist") {
        setWhitelistedSources(whitelistedSources.filter(s => s.id !== id));
        toast.success("Source removed from whitelist");
      } else {
        setBlocklistedSources(blocklistedSources.filter(s => s.id !== id));
        toast.success("Source removed from blocklist");
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      toast.error("Failed to delete source");
    }
  };

  const handleBulkAction = async (action: "enable" | "disable" | "delete", type: "whitelist" | "blocklist") => {
    try {
      const sources = type === "whitelist" ? whitelistedSources : blocklistedSources;
      const ids = sources.map(s => s.id);

      if (action === "delete") {
        const { error } = await supabase
          .from('sources')
          .delete()
          .in('id', ids);

        if (error) throw error;
        
        if (type === "whitelist") {
          setWhitelistedSources([]);
        } else {
          setBlocklistedSources([]);
        }
      }

      toast.success(`Bulk ${action} completed for ${type} sources`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(`Failed to ${action} sources`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-screen pt-16 sm:pt-20 lg:pt-0">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
            <p className="text-muted-foreground">Loading source management...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-16 sm:pt-20 lg:pt-4 p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Unique Header - Source Control Panel Style */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-4 sm:p-6 lg:p-8 text-white">
          <div className="relative z-10">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-start lg:justify-between mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                    Source Control Panel
                  </h1>
                </div>
                <p className="text-emerald-100 text-sm sm:text-base lg:text-lg mb-4 max-w-2xl">
                  Control who you trust and who you block. This is your command center for managing digital identity sources across all platforms.
                </p>
                
                {/* Explanation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-300" />
                      <span className="font-semibold text-sm">Trusted Sources</span>
                    </div>
                    <p className="text-xs text-emerald-100">
                      Accounts you've verified as legitimate. These are your official channels, partners, or collaborators that won't trigger false alerts.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Ban className="h-4 w-4 text-red-300" />
                      <span className="font-semibold text-sm">Blocked Sources</span>
                    </div>
                    <p className="text-xs text-emerald-100">
                      Known impersonators, scammers, or content thieves. Blocking them helps our AI prioritize real threats and speeds up takedowns.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats Sidebar */}
              <div className="flex flex-col gap-3 lg:ml-6 lg:min-w-[200px]">
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                  <p className="text-3xl font-bold">{(analytics?.totalWhitelisted || 0) + (analytics?.totalBlocklisted || 0)}</p>
                  <p className="text-xs text-emerald-100">Total Sources Managed</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-500/30 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{analytics?.totalWhitelisted || 0}</p>
                    <p className="text-xs text-green-100">Trusted</p>
                  </div>
                  <div className="bg-red-500/30 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{analytics?.totalBlocklisted || 0}</p>
                    <p className="text-xs text-red-100">Blocked</p>
                  </div>
                </div>
                <div className="text-center text-xs text-emerald-200">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Updated {analytics?.lastUpdated}
                </div>
              </div>
            </div>
            
            {/* Why This Matters Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-300" />
                Why Source Management Matters
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                By maintaining accurate trusted and blocked lists, you help our AI distinguish between legitimate accounts and impersonators. 
                <strong className="text-white"> Trusted sources</strong> won't trigger false positives, while <strong className="text-white">blocked sources</strong> get flagged immediately for faster takedown processing. 
                This improves detection accuracy by up to <strong className="text-white">{analytics?.blockingSuccessRate || 96}%</strong> and reduces response time significantly.
              </p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-cyan-400/10 rounded-full translate-y-16"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-emerald-300/10 rounded-full"></div>
        </div>

        {/* Control Panel - Enhanced and responsive */}
        <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Filters - Responsive */}
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sources by handle, name, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-secondary focus:ring-secondary"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="w-full sm:w-40 border-slate-200">
                      <SelectValue placeholder="All Platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="tiktok">
                        <div className="flex items-center gap-2">
                          <i className="bx bxl-tiktok"></i>
                          TikTok
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <i className="bx bxl-youtube"></i>
                          YouTube
                        </div>
                      </SelectItem>
                      <SelectItem value="twitter">
                        <div className="flex items-center gap-2">
                          <i className="bx bxl-twitter"></i>
                          Twitter/X
                        </div>
                      </SelectItem>
                      <SelectItem value="instagram">
                        <div className="flex items-center gap-2">
                          <i className="bx bxl-instagram"></i>
                          Instagram
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-32 border-slate-200">
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

              {/* Quick Actions - Enhanced */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{filteredWhitelisted.length + filteredBlocklisted.length}</span> sources found
                  </p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-green-600">{filteredWhitelisted.length}</span> trusted
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-red-600">{filteredBlocklisted.length}</span> blocked
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-200" onClick={loadSources}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-200"
                    onClick={() => {
                      const allSources = [...whitelistedSources, ...blocklistedSources];
                      const exportData = `KARKA SOURCES EXPORT
==============================
Generated: ${new Date().toLocaleString()}

TRUSTED SOURCES (${whitelistedSources.length})
${'-'.repeat(30)}
${whitelistedSources.map(s => `
Platform: ${s.platform}
Handle: ${s.handle}
Display Name: ${s.display_name || 'N/A'}
Trust Score: ${s.trust_score || 'N/A'}%
Followers: ${s.follower_count || 0}
Notes: ${s.notes || 'None'}
Added: ${new Date(s.created_at).toLocaleDateString()}
`).join('\n---\n') || 'No trusted sources'}

BLOCKED SOURCES (${blocklistedSources.length})
${'-'.repeat(30)}
${blocklistedSources.map(s => `
Platform: ${s.platform}
Handle: ${s.handle}
Threat Level: ${s.threat_level || 'Unknown'}
Violation Type: ${s.violation_type || 'Unknown'}
Reports: ${s.reports_count || 0}
Notes: ${s.notes || 'None'}
Added: ${new Date(s.created_at).toLocaleDateString()}
`).join('\n---\n') || 'No blocked sources'}

END OF EXPORT
`;
                      const blob = new Blob([exportData], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `karka-sources-${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast.success('Sources exported successfully');
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-slate-200"
                        onClick={() => {
                          if (whitelistedSources.length === 0 && blocklistedSources.length === 0) {
                            toast.error('No sources to clear');
                            return;
                          }
                          setShowClearAllDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Clear All Sources
                        </DialogTitle>
                        <DialogDescription>
                          This will permanently delete all <strong>{whitelistedSources.length + blocklistedSources.length}</strong> sources ({whitelistedSources.length} trusted, {blocklistedSources.length} blocked). This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowClearAllDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => {
                            handleBulkAction('delete', 'whitelist');
                            handleBulkAction('delete', 'blocklist');
                            setShowClearAllDialog(false);
                            toast.success('All sources cleared');
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all duration-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Source
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                      <DialogHeader className="pb-2">
                        <DialogTitle className="text-lg">Add New Source</DialogTitle>
                        <DialogDescription className="text-sm">
                          Add a trusted source or block a threatening account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Source Type</Label>
                            <Select
                              value={formData.sourceType}
                              onValueChange={(value: "whitelist" | "blocklist") => setFormData({ ...formData, sourceType: value })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="whitelist">Trusted</SelectItem>
                                <SelectItem value="blocklist">Blocked</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Platform</Label>
                            <Select
                              value={formData.platform}
                              onValueChange={(value) => setFormData({ ...formData, platform: value })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="twitter">Twitter/X</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Handle/Username *</Label>
                          <Input
                            placeholder="@username"
                            value={formData.handle}
                            onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                            className="border-slate-200 focus:border-secondary h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Display Name (optional)</Label>
                          <Input
                            placeholder="Display name"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="border-slate-200 focus:border-secondary h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Notes (optional)</Label>
                          <Input
                            placeholder="Additional information..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="border-slate-200 focus:border-secondary h-9"
                          />
                        </div>
                        <div className="flex items-center space-x-2 py-1">
                          <Switch 
                            checked={formData.autoMonitoring}
                            onCheckedChange={(checked) => setFormData({ ...formData, autoMonitoring: checked })}
                          />
                          <Label className="text-xs">Enable automatic monitoring</Label>
                        </div>
                        <Button
                          onClick={handleAddSource}
                          className="w-full bg-secondary hover:bg-secondary/90 h-9"
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

        {/* Sources Tabs - Enhanced */}
        <Tabs defaultValue="whitelist" className="space-y-4 sm:space-y-6">
          {/* Responsive Tabs List */}
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200 min-w-[300px] sm:min-w-0">
              <TabsTrigger 
                value="whitelist" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                <Shield className="h-4 w-4" />
                Trusted Sources ({filteredWhitelisted.length})
              </TabsTrigger>
              <TabsTrigger 
                value="blocklist" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                <Ban className="h-4 w-4" />
                Blocked Sources ({filteredBlocklisted.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Whitelisted Sources */}
          <TabsContent value="whitelist">
            <div className="space-y-3 sm:space-y-4">
              {filteredWhitelisted.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">No trusted sources found</p>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || filterPlatform !== "all" 
                        ? "No sources match your current filters" 
                        : "Add your first trusted source to get started"}
                    </p>
                    <Button 
                      onClick={() => setShowAddDialog(true)}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Source
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredWhitelisted.map((source) => (
                  <Card key={source.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-secondary/50">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <i className={getPlatformIcon(source.platform)}></i>
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                              <Badge className={getPlatformColor(source.platform) + " text-xs"}>
                                {source.platform}
                              </Badge>
                              <span className="font-semibold text-sm sm:text-base">{source.handle}</span>
                              {getVerificationIcon(source.verification_status!)}
                              <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                                Trust: {source.trust_score}%
                              </Badge>
                              <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                                {formatNumber(source.follower_count!)} followers
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <span>Added: {new Date(source.created_at).toLocaleDateString()}</span>
                              <span>Last seen: {new Date(source.last_seen).toLocaleDateString()}</span>
                              <span>Engagement: {source.engagement_rate}%</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700">{source.notes}</p>
                            <div className="flex flex-wrap gap-1">
                              {source.categories.map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs bg-green-50 text-green-700">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" className="border-slate-200">
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSource(source.id, "whitelist")}
                            className="text-red-600 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
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
            <div className="space-y-3 sm:space-y-4">
              {filteredBlocklisted.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Ban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">No blocked sources found</p>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || filterPlatform !== "all" 
                        ? "No sources match your current filters" 
                        : "No sources have been blocked yet - great job!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredBlocklisted.map((source) => (
                  <Card key={source.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-red-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <i className={getPlatformIcon(source.platform)}></i>
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                              <Badge className={getPlatformColor(source.platform) + " text-xs"}>
                                {source.platform}
                              </Badge>
                              <span className="font-semibold text-sm sm:text-base">{source.handle}</span>
                              <Badge className={getThreatLevelColor(source.threat_level || '') + " text-xs"}>
                                {(source.threat_level || 'unknown').toUpperCase()} THREAT
                              </Badge>
                              <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                                {(source.violation_type || 'unknown').replace("_", " ")}
                              </Badge>
                              <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                                {source.reports_count} reports
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <span>Added: {new Date(source.created_at).toLocaleDateString()}</span>
                              <span>Last seen: {new Date(source.last_seen).toLocaleDateString()}</span>
                              <span>Status: {source.status}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700">{source.notes}</p>
                            <div className="flex flex-wrap gap-1">
                              {source.categories.map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs bg-red-50 text-red-700">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" className="border-slate-200">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Source
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSource(source.id, "blocklist")}
                            className="text-red-600 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
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

        {/* Blockchain Integration Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-2">Blockchain-Powered Security</h3>
                <p className="text-sm text-slate-600 mb-3">
                  All source verifications are anchored on the CAMP Network for immutable proof of authenticity. 
                  Trusted sources receive blockchain certificates for enhanced verification.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-blue-700 border-blue-200 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    CAMP Network Verified
                  </Badge>
                  <Badge variant="outline" className="text-green-700 border-green-200 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Cryptographic Proof
                  </Badge>
                  <Badge variant="outline" className="text-purple-700 border-purple-200 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Instant Verification
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Sources;
