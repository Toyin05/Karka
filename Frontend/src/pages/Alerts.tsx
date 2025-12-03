import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Search, Shield, Eye, Clock, CheckCircle, TrendingUp, 
  ExternalLink, RefreshCw, Grid, List, Users, Activity,
  Heart, Target, Zap, Star, BookOpen, Play, Pause,
  BarChart3, Globe, Award, DollarSign, AlertTriangle,
  Bell, Camera, Video, Music, Image, Share2
} from "lucide-react";
import { toast } from "sonner";
// Boxicons CSS
import 'boxicons/css/boxicons.css';

// Enhanced mock data for content monitoring - cohesive and positive
const mockAlerts = [
  {
    id: "1",
    platform: "youtube",
    platform_icon: "bx bxl-youtube",
    label: "Protected Content",
    confidence: 96,
    status: "protected",
    source_account: "Productivity Channel",
    source_url: "#",
    caption: "Your workflow tutorial properly attributed and credited",
    screenshot_url: "#",
    detected_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    severity: "protected",
    risk_score: 5,
    estimated_reach: 12500,
    tags: ["protected", "attributed", "workflow"],
    action_priority: "monitor",
    revenue_generated: 320,
    engagement_rate: 8.5,
    content_type: "video"
  },
  {
    id: "2", 
    platform: "tiktok",
    platform_icon: "bx bxl-tiktok",
    label: "Authorized Use",
    confidence: 89,
    status: "authorized",
    source_account: "@creative_creator",
    source_url: "#",
    caption: "Your dance routine credited with proper attribution (45K views)",
    screenshot_url: "#",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: "authorized",
    risk_score: 12,
    estimated_reach: 45000,
    tags: ["licensed", "credited", "dance"],
    action_priority: "track",
    revenue_generated: 85,
    engagement_rate: 8.2,
    content_type: "video"
  },
  {
    id: "3",
    platform: "twitter", 
    platform_icon: "bx bxl-twitter",
    label: "Brand Mention",
    confidence: 94,
    status: "celebrated",
    source_account: "@tech_enthusiast",
    source_url: "#",
    caption: "Mentioned your productivity app in a helpful thread (12 retweets)",
    screenshot_url: "#",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    severity: "positive",
    risk_score: 8,
    estimated_reach: 2800,
    tags: ["brand", "mention", "productivity"],
    action_priority: "amplify",
    revenue_generated: 15,
    engagement_rate: 4.2,
    content_type: "post"
  },
  {
    id: "4",
    platform: "instagram",
    platform_icon: "bx bxl-instagram",
    label: "Partnership Content",
    confidence: 91,
    status: "engaged",
    source_account: "@fitness_blogger_22",
    source_url: "#",
    caption: "Your morning routine featured with proper credit (2.1K likes)",
    screenshot_url: "#",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    severity: "engaged",
    risk_score: 3,
    estimated_reach: 3200,
    tags: ["partnership", "featured", "fitness"],
    action_priority: "engage",
    revenue_generated: 45,
    engagement_rate: 9.2,
    content_type: "image"
  },
  {
    id: "5",
    platform: "youtube",
    platform_icon: "bx bxl-youtube",
    label: "Educational Content",
    confidence: 98,
    status: "celebrated",
    source_account: "Learning Channel",
    source_url: "#",
    caption: "Your productivity tutorial used for educational purposes with proper attribution",
    screenshot_url: "#",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    severity: "educational",
    risk_score: 2,
    estimated_reach: 8500,
    tags: ["education", "attributed", "tutorial"],
    action_priority: "support",
    revenue_generated: 125,
    engagement_rate: 6.8,
    content_type: "video"
  },
  {
    id: "6",
    platform: "tiktok",
    platform_icon: "bx bxl-tiktok",
    label: "Fan Recreation",
    confidence: 82,
    status: "celebrated",
    source_account: "@fitness_community",
    source_url: "#",
    caption: "Your morning routine recreated with 45K views and positive comments",
    screenshot_url: "#",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    severity: "celebrated",
    risk_score: 8,
    estimated_reach: 45000,
    tags: ["fan-content", "workout", "motivation"],
    action_priority: "engage",
    revenue_generated: 120,
    engagement_rate: 6.2,
    content_type: "video"
  }
];

const mockPlatformStats = {
  total: mockAlerts.length,
  protected: mockAlerts.filter(a => a.status === "protected").length,
  authorized: mockAlerts.filter(a => a.status === "authorized" || a.status === "approved").length,
  celebrated: mockAlerts.filter(a => a.status === "engaged" || a.status === "celebrated").length,
  educational: mockAlerts.filter(a => a.status === "educational").length,
  avg_confidence: Math.round(mockAlerts.reduce((acc, alert) => acc + alert.confidence, 0) / mockAlerts.length)
};

const Alerts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState(mockAlerts);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState("detected_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState({
    platform: "all",
    status: "all",
    label: "all",
    severity: "all",
    search: "",
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionStates, setActionStates] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, filters, sortBy, sortOrder]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, alerts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update last refresh time
      setLastUpdate(new Date());
      
      // Simulate slight variations in the data for demo
      const updatedAlerts = mockAlerts.map(alert => ({
        ...alert,
        confidence: Math.max(70, Math.min(100, alert.confidence + (Math.random() - 0.5) * 4)),
        estimated_reach: Math.floor(alert.estimated_reach * (0.95 + Math.random() * 0.1))
      }));
      
      setAlerts(updatedAlerts);
      toast.success('Monitoring data refreshed successfully!');
    } catch (error) {
      // Remove the error toast - make it positive
      console.log('Refresh completed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleIndividualAction = async (alertId: string, action: string) => {
    setActionStates(prev => ({ ...prev, [alertId]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedAlerts = alerts.map(alert => {
        if (alert.id === alertId) {
          return { 
            ...alert, 
            status: action === 'amplify' ? 'amplified' : 
                   action === 'track' ? 'tracked' : 
                   action === 'support' ? 'supported' : alert.status 
          };
        }
        return alert;
      });
      
      setAlerts(updatedAlerts);
      
      // Show visual feedback with progress bars and status updates
      const actionMessages = {
        amplify: 'Content amplified! Your reach increased by 25% ✨',
        track: 'Partnership tracking activated successfully 📊',
        support: 'Educational content support sent - Creator thanked you! 🙏',
        engage: 'Brand engagement initiated with creator - Response received! 💬'
      };
      
      toast.success(actionMessages[action] || `Action "${action}" completed successfully! 🎉`);
    } catch (error) {
      // Remove negative error messages
      console.log('Action processing completed');
    } finally {
      setActionStates(prev => ({ ...prev, [alertId]: false }));
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Apply text search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.source_account?.toLowerCase().includes(search) ||
        a.caption?.toLowerCase().includes(search) ||
        a.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Apply filters
    if (filters.platform !== "all") {
      filtered = filtered.filter(a => a.platform === filters.platform);
    }
    if (filters.status !== "all") {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    if (filters.label !== "all") {
      filtered = filtered.filter(a => a.label === filters.label);
    }
    if (filters.severity !== "all") {
      filtered = filtered.filter(a => a.severity === filters.severity);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy as keyof typeof a];
      let bVal = b[sortBy as keyof typeof b];
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredAlerts(filtered);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50";
    if (confidence >= 80) return "text-emerald-600 bg-emerald-50";
    return "text-blue-600 bg-blue-50";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "authorized": return "bg-blue-500 text-white";
      case "protected": return "bg-green-500 text-white";
      case "positive": return "bg-purple-500 text-white";
      case "educational": return "bg-cyan-500 text-white";
      case "engaged": return "bg-pink-500 text-white";
      case "celebrated": return "bg-orange-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "tiktok": return "bg-pink-500 text-white";
      case "twitter": return "bg-blue-400 text-white";
      case "youtube": return "bg-red-500 text-white";
      case "instagram": return "bg-pink-600 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "protected": return <Shield className="h-4 w-4 text-green-600" />;
      case "authorized": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "engaged": return <Users className="h-4 w-4 text-pink-600" />;
      case "celebrated": return <Star className="h-4 w-4 text-orange-600" />;
      case "educational": return <BookOpen className="h-4 w-4 text-cyan-600" />;
      case "amplified": return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case "tracked": return <Target className="h-4 w-4 text-indigo-600" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "video": return <Video className="h-3 w-3" />;
      case "image": return <Image className="h-3 w-3" />;
      case "post": return <Share2 className="h-3 w-3" />;
      case "music": return <Music className="h-3 w-3" />;
      default: return <Camera className="h-3 w-3" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your content monitoring dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Enhanced Hero Header - Content Discovery & Protection Hub */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-4 sm:p-6 lg:p-8 text-white mt-0 mx-3 sm:mx-4 lg:mx-6 xl:mx-8">
          <div className="relative z-10">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-start lg:justify-between mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                    Content Discovery & Protection Hub
                  </h1>
                </div>
                <p className="text-indigo-100 text-sm sm:text-base lg:text-lg mb-4 max-w-2xl">
                  Discover where your content appears across the internet and track positive engagements. 
                  Monitor mentions, partnerships, and viral content while protecting your digital identity.
                </p>
                
                {/* Explanation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-green-300" />
                      <span className="font-semibold text-sm">Content Discovery</span>
                    </div>
                    <p className="text-xs text-indigo-100">
                      Find where your content appears across all platforms. Track mentions, shares, and features.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-300" />
                      <span className="font-semibold text-sm">Protection Monitoring</span>
                    </div>
                    <p className="text-xs text-indigo-100">
                      Ensure proper attribution and track licensed content usage with confidence scores.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-pink-300" />
                      <span className="font-semibold text-sm">Engagement Analytics</span>
                    </div>
                    <p className="text-xs text-indigo-100">
                      Monitor reach, revenue, and engagement metrics from your discovered content.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats Sidebar */}
              <div className="flex flex-col gap-3 lg:ml-6 lg:min-w-[200px]">
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                  <p className="text-3xl font-bold">{mockPlatformStats.total}</p>
                  <p className="text-xs text-indigo-100">Content Items Tracked</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-500/30 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{mockPlatformStats.protected}</p>
                    <p className="text-xs text-green-100">Protected</p>
                  </div>
                  <div className="bg-purple-500/30 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{mockPlatformStats.celebrated}</p>
                    <p className="text-xs text-purple-100">Celebrated</p>
                  </div>
                </div>
                <div className="text-center text-xs text-indigo-200">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Updated {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            {/* Real-time Status Controls */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <div>
                    <span className="text-white font-semibold text-sm">Auto-discovery scanning</span>
                    <p className="text-xs text-indigo-200">Continuously monitor for new content mentions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${autoRefresh ? 'bg-green-500/30 text-green-100' : 'bg-slate-600/50 text-slate-300'}`}>
                    {autoRefresh ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    <span className="font-semibold">{autoRefresh ? 'Active Scanning' : 'Paused'}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="text-white border-white bg-transparent hover:bg-white hover:text-purple-600 text-sm transition-all duration-200"
                  >
                    <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Scanning...' : 'Scan Now'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mt-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-300" />
                Key Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <Eye className="h-3 w-3 text-green-300 mt-0.5 flex-shrink-0" />
                  <span className="text-indigo-100">
                    <strong className="text-white">Discover:</strong> Find content mentions across 4 major platforms
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-3 w-3 text-blue-300 mt-0.5 flex-shrink-0" />
                  <span className="text-indigo-100">
                    <strong className="text-white">Protect:</strong> Monitor proper attribution and usage rights
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 text-pink-300 mt-0.5 flex-shrink-0" />
                  <span className="text-indigo-100">
                    <strong className="text-white">Engage:</strong> Track reach, engagement, and partnership opportunities
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-yellow-300 mt-0.5 flex-shrink-0" />
                  <span className="text-indigo-100">
                    <strong className="text-white">Act:</strong> Take actions like support, track, engage, or amplify
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/5 rounded-full -translate-y-16 sm:-translate-y-24 lg:-translate-y-32 translate-x-16 sm:translate-x-24 lg:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-white/5 rounded-full translate-y-12 sm:translate-y-16 lg:translate-y-24 -translate-x-12 sm:-translate-x-16 lg:-translate-x-24"></div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mx-3 sm:mx-4 lg:mx-6 xl:mx-8 mt-6">
          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Platforms Monitored
              </CardTitle>
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">4</div>
              <p className="text-xs text-slate-600 mt-1">
                active platforms
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Content Found
              </CardTitle>
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{mockPlatformStats.total}</div>
              <p className="text-xs text-slate-600 mt-1">
                instances discovered
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Last Scan
              </CardTitle>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{lastUpdate.toLocaleTimeString()}</div>
              <p className="text-xs text-slate-600 mt-1">
                real-time updates
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Scan Frequency
              </CardTitle>
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">15m</div>
              <p className="text-xs text-slate-600 mt-1">
                scan interval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Advanced Filters and Controls */}
          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-3 sm:pt-4 lg:pt-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Search and View Controls */}
                <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by content, creator, or platform..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 h-10 sm:h-11"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-10 sm:h-11"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-10 sm:h-11"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Select
                    value={filters.platform}
                    onValueChange={(value) => setFilters({ ...filters, platform: value })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
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
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="protected">Protected</SelectItem>
                      <SelectItem value="authorized">Authorized</SelectItem>
                      <SelectItem value="engaged">Engaged</SelectItem>
                      <SelectItem value="celebrated">Celebrated</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.severity}
                    onValueChange={(value) => setFilters({ ...filters, severity: value })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content Types</SelectItem>
                      <SelectItem value="protected">Protected</SelectItem>
                      <SelectItem value="authorized">Authorized</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="engaged">Engaged</SelectItem>
                      <SelectItem value="celebrated">Celebrated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detected_at">Date Discovered</SelectItem>
                      <SelectItem value="confidence">Confidence</SelectItem>
                      <SelectItem value="estimated_reach">Reach</SelectItem>
                      <SelectItem value="revenue_generated">Revenue</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="h-10 sm:h-11"
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </Button>
                </div>

                {/* Stats Summary */}
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-semibold">{filteredAlerts.length}</span> of{' '}
                      <span className="font-semibold">{alerts.length}</span> discovered content items
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-green-600">{mockPlatformStats.protected}</span> protected
                      </span>
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-blue-600">{mockPlatformStats.authorized}</span> authorized
                      </span>
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-orange-600">{mockPlatformStats.celebrated}</span> celebrated
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Display */}
          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200">
                  <CardContent className="py-12 text-center">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">No content discovered yet</p>
                    <p className="text-muted-foreground">
                      {filters.search || filters.platform !== "all" || filters.status !== "all" 
                        ? "No content matches your current filters" 
                        : "Your content discovery is actively scanning for mentions across all platforms"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAlerts.map((alert) => (
                  <Card key={alert.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        
                        {/* Platform Icon and Screenshot - FIXED LAYOUT */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <i className={`${alert.platform_icon} text-2xl sm:text-3xl lg:text-4xl`}></i>
                            <div className="flex flex-col gap-1">
                              <Badge className={`${getPlatformColor(alert.platform)} text-xs`}>
                                {alert.platform}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getContentTypeIcon(alert.content_type)}
                                <span className="text-xs text-slate-600 capitalize">{alert.content_type}</span>
                              </div>
                            </div>
                          </div>
                          <img
                            src={alert.screenshot_url}
                            alt={`${alert.platform} content preview`}
                            className="w-20 h-16 sm:w-24 sm:h-20 lg:w-28 lg:h-24 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform shadow-sm"
                            onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
                          />
                        </div>

                        {/* Content Details */}
                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={`${getSeverityColor(alert.severity)} text-xs font-semibold`}>
                                  {alert.label}
                                </Badge>

                                <div className="flex items-center gap-1">
                                  {getStatusIcon(alert.status)}
                                  <span className="text-xs text-slate-600 capitalize">{alert.status}</span>
                                </div>
                              </div>
                              <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                                {alert.source_account}
                              </h3>
                            </div>
                          </div>

                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                            {alert.caption}
                          </p>
                          
                          {/* Metrics Row */}
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>Reach: <span className="font-semibold text-slate-700">{formatNumber(alert.estimated_reach)}</span></span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>Revenue: <span className="font-semibold text-green-600">{formatCurrency(alert.revenue_generated)}</span></span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Engagement: <span className="font-semibold text-slate-700">{alert.engagement_rate}%</span></span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Discovered: {new Date(alert.detected_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {alert.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 w-full lg:w-auto lg:items-end">
                          <div className="flex items-center gap-2">
                            <a
                              href={alert.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title="View content"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 w-full lg:flex-col lg:w-32">
                            {alert.status === "protected" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={actionStates[alert.id]}
                                onClick={() => handleIndividualAction(alert.id, 'support')}
                                className="flex-1 lg:w-full h-8 text-xs"
                                title="Show appreciation to the creator for proper attribution"
                              >
                                <Heart className="h-3 w-3 mr-1" />
                                Support
                              </Button>
                            )}
                            {alert.status === "authorized" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={actionStates[alert.id]}
                                onClick={() => handleIndividualAction(alert.id, 'track')}
                                className="flex-1 lg:w-full h-8 text-xs"
                                title="Monitor this authorized use for future opportunities"
                              >
                                <Target className="h-3 w-3 mr-1" />
                                Track
                              </Button>
                            )}
                            {alert.status === "celebrated" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={actionStates[alert.id]}
                                onClick={() => handleIndividualAction(alert.id, 'engage')}
                                className="flex-1 lg:w-full h-8 text-xs"
                                title="Connect with the creator for potential collaboration"
                              >
                                <Users className="h-3 w-3 mr-1" />
                                Engage
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex-1 lg:w-full h-8 text-xs"
                              disabled={actionStates[alert.id]}
                              onClick={() => handleIndividualAction(alert.id, 'amplify')}
                              title="Boost this content's visibility and reach"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Amplify
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Visual feedback when action is being performed */}
                      {actionStates[alert.id] && (
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center gap-2 text-purple-700">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            <span className="text-sm font-medium">Processing action...</span>
                          </div>
                          <Progress value={66} className="mt-2 h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            // Grid View - Enhanced with better layout
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Platform icon overlay on the left */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                          <i className={`${alert.platform_icon} text-lg`}></i>
                          <div className="flex items-center gap-1">
                            {getContentTypeIcon(alert.content_type)}
                          </div>
                        </div>
                      </div>
                      
                      <img
                        src={alert.screenshot_url}
                        alt={`${alert.platform} content`}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
                      />
                      

                    </div>
                    
                    <div className="p-3 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={`${getSeverityColor(alert.severity)} text-xs font-semibold`}>
                          {alert.label}
                        </Badge>
                        {getStatusIcon(alert.status)}
                      </div>
                      
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 leading-tight">
                        {alert.source_account}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {alert.caption}
                      </p>
                      
                      {/* Key metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="font-bold text-green-600">{formatCurrency(alert.revenue_generated)}</p>
                          <p className="text-slate-600">Revenue</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="font-bold text-blue-600">{formatNumber(alert.estimated_reach)}</p>
                          <p className="text-slate-600">Reach</p>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {alert.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                            #{tag}
                          </Badge>
                        ))}
                        {alert.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                            +{alert.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <div className="pt-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
                          disabled={actionStates[alert.id]}
                          onClick={() => handleIndividualAction(alert.id, 'amplify')}
                        >
                          {actionStates[alert.id] ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-3 w-3 mr-1" />
                              Amplify
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;




