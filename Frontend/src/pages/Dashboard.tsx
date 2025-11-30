import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2, Clock, Shield, Eye, Activity, TrendingUp, Users, Zap, Globe, Target, ArrowUpRight, ExternalLink, Play, Pause, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// TODO: Replace with real API calls to your backend
// Mock data for demonstration - in production, this would come from your backend API
// Integration points:
// - Replace mockStats with API call to /api/dashboard/stats
// - Replace mockAlerts with API call to /api/dashboard/recent-alerts
// - Replace mockPlatformStats with API call to /api/dashboard/platform-performance
// - Implement real-time WebSocket connection for live updates
// - Add CAMP Network blockchain queries for identity verification status
const mockStats = {
  totalAlerts: 47,
  newAlerts: 12,
  actioned: 35,
  protectionScore: 92,
  activeMonitors: 8,
  monthlyRemovals: 156,
  lastScan: "2 minutes ago"
};

const mockAlerts = [
  {
    id: "1",
    platform: "tiktok",
    label: "deepfake",
    confidence: 95,
    status: "new",
    source_account: "@fake_creator123",
    source_url: "https://tiktok.com/@fake_creator123/video/123",
    caption: "AI generated content using celebrity likeness",
    screenshot_url: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=300&h=300&fit=crop",
    detected_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    severity: "high"
  },
  {
    id: "2", 
    platform: "youtube",
    label: "impersonation",
    confidence: 88,
    status: "reviewing",
    source_account: "Fake Channel Name",
    source_url: "https://youtube.com/watch?v=123",
    caption: "Unauthorized use of photos for monetization",
    screenshot_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: "medium"
  },
  {
    id: "3",
    platform: "twitter", 
    label: "name_mention",
    confidence: 72,
    status: "actioned",
    source_account: "@content_sharer",
    source_url: "https://twitter.com/content_sharer/status/123",
    caption: "Mentioning your name in viral tweet",
    screenshot_url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=300&fit=crop",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    severity: "low"
  }
];

const mockPlatformStats = [
  { platform: "TikTok", alerts: 23, removals: 89, confidence: 94 },
  { platform: "YouTube", alerts: 12, removals: 45, confidence: 91 },
  { platform: "Twitter", alerts: 8, removals: 18, confidence: 88 },
  { platform: "Instagram", alerts: 4, removals: 4, confidence: 85 }
];

const mockActivityData = [
  { day: "Mon", alerts: 8, actioned: 5 },
  { day: "Tue", alerts: 12, actioned: 8 },
  { day: "Wed", alerts: 15, actioned: 12 },
  { day: "Thu", alerts: 6, actioned: 4 },
  { day: "Fri", alerts: 9, actioned: 7 },
  { day: "Sat", alerts: 3, actioned: 2 },
  { day: "Sun", alerts: 2, actioned: 1 }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasIdentity, setHasIdentity] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [crawlerActive, setCrawlerActive] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPlatformIcon = (platform: string) => {
    const iconClass = {
      tiktok: "bx bxl-tiktok text-xl sm:text-2xl",
      youtube: "bx bxl-youtube text-xl sm:text-2xl", 
      twitter: "bx bxl-twitter text-xl sm:text-2xl",
      instagram: "bx bxl-instagram text-xl sm:text-2xl"
    };
    return iconClass[platform] || "bx bx-globe text-xl sm:text-2xl";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-screen pt-16 sm:pt-20 lg:pt-0">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your protection dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-16 sm:pt-20 lg:pt-4 p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Header with Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-4 sm:p-6 lg:p-8 text-white mt-0">
          <div className="relative z-10">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 leading-tight">
                  Protection Dashboard
                </h1>
                <p className="text-slate-200 text-sm sm:text-base lg:text-lg">
                  Active monitoring of your digital identity across the web
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                <div className="text-left sm:text-right">
                  <p className="text-slate-300 text-xs sm:text-sm">Last scan</p>
                  <p className="text-white font-semibold text-sm sm:text-base">{stats.lastScan}</p>
                </div>
                <div className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm ${crawlerActive ? 'bg-secondary' : 'bg-slate-600'}`}>
                  {crawlerActive ? <Play className="h-3 w-3 sm:h-4 sm:w-4" /> : <Pause className="h-3 w-3 sm:h-4 sm:w-4" />}
                  <span className="font-semibold">{crawlerActive ? 'Active' : 'Paused'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={crawlerActive}
                  onCheckedChange={setCrawlerActive}
                />
                <span className="text-slate-200 text-sm">Live Monitoring</span>
              </div>
              <Button variant="outline" size="sm" className="text-white border-white bg-transparent hover:bg-slate-100 hover:text-black hover:border-slate-300 w-full sm:w-auto text-sm transition-all duration-200">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-secondary/10 rounded-full -translate-y-16 sm:-translate-y-24 lg:-translate-y-32 translate-x-16 sm:translate-x-24 lg:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-white/5 rounded-full translate-y-12 sm:translate-y-16 lg:translate-y-24 -translate-x-12 sm:-translate-x-16 lg:-translate-x-24"></div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Threats Detected
              </CardTitle>
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.totalAlerts}</div>
              <p className="text-xs text-slate-600 mt-1">
                +{stats.newAlerts} this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Successfully Removed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.actioned}</div>
              <p className="text-xs text-slate-600 mt-1">
                {Math.round((stats.actioned / stats.totalAlerts) * 100)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Protection Score
              </CardTitle>
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.protectionScore}%</div>
              <Progress value={stats.protectionScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Active Monitors
              </CardTitle>
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.activeMonitors}</div>
              <p className="text-xs text-slate-600 mt-1">
                platforms watched
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          {/* Responsive Tabs List */}
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl border border-slate-200 min-w-[400px] sm:min-w-0">
              <TabsTrigger 
                value="overview" 
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="platforms"
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Platforms
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="recent"
                className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Recent Threats
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Platform Performance */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                    Platform Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                  {mockPlatformStats.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between p-3 sm:p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <i className={`${getPlatformIcon(platform.platform.toLowerCase())} flex-shrink-0`}></i>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">{platform.platform}</p>
                          <p className="text-xs sm:text-sm text-slate-600">{platform.alerts} alerts detected</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">{platform.removals} removals</p>
                        <p className="text-xs sm:text-sm text-slate-600">{platform.confidence}% accuracy</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-3 sm:px-4 lg:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                  <Button 
                    className="w-full justify-start bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm h-10 sm:h-11" 
                    onClick={() => navigate("/dashboard/alerts")}
                  >
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Review New Alerts ({stats.newAlerts})
                  </Button>
                  <Button 
                    className="w-full justify-start bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm h-10 sm:h-11" 
                    onClick={() => navigate("/dashboard/sources")}
                  >
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Manage Sources
                  </Button>
                  <Button 
                    className="w-full justify-start bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm h-10 sm:h-11" 
                    onClick={() => navigate("/dashboard/profile")}
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Update Profile
                  </Button>
                  <Button 
                    className="w-full justify-start bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm h-10 sm:h-11" 
                    onClick={() => navigate("/dashboard/history")}
                  >
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    View Actions History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platforms">
            <Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <CardHeader className="px-3 sm:px-4 lg:px-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  Platform Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {mockPlatformStats.map((platform) => (
                    <div key={platform.platform} className="p-4 sm:p-6 border border-slate-200 rounded-xl space-y-3 sm:space-y-4 hover:shadow-md transition-shadow bg-slate-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <i className={`${getPlatformIcon(platform.platform.toLowerCase())} flex-shrink-0`}></i>
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-slate-900">{platform.platform}</h3>
                            <p className="text-xs sm:text-sm text-slate-600">Active monitoring</p>
                          </div>
                        </div>
                        <Badge className={`${getConfidenceColor(platform.confidence)} bg-white border border-slate-200 text-xs sm:text-sm w-fit`}>
                          {platform.confidence}% accuracy
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-slate-200">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{platform.alerts}</p>
                          <p className="text-xs sm:text-sm text-slate-600">Threats</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-slate-200">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary">{platform.removals}</p>
                          <p className="text-xs sm:text-sm text-slate-600">Removed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <CardHeader className="px-3 sm:px-4 lg:px-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                <div className="space-y-3 sm:space-y-4">
                  {mockActivityData.map((day) => (
                    <div key={day.day} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors gap-4">
                      <span className="font-medium w-8 sm:w-12 text-slate-900 text-sm sm:text-base flex-shrink-0">{day.day}</span>
                      <div className="flex-1 mx-2 sm:mx-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-secondary h-2 rounded-full" 
                              style={{ width: `${(day.alerts / 20) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs sm:text-sm text-slate-600 w-6 sm:w-8 flex-shrink-0">{day.alerts}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="bg-slate-200 rounded-full h-2 w-12 sm:w-20">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(day.actioned / day.alerts) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-600 w-6 sm:w-8">{day.actioned}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-slate-900">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  Recent Threats
                </CardTitle>
                <Button 
                  className="bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm h-8 sm:h-10 w-full sm:w-auto"
                  size="sm"
                  onClick={() => navigate("/dashboard/alerts")}
                >
                  View All <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                <div className="space-y-3 sm:space-y-4">
                  {mockAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
                    >
                      <img
                        src={alert.screenshot_url}
                        alt="Threat preview"
                        className="w-16 h-16 rounded object-cover flex-shrink-0 self-start"
                      />
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                          <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                            <i className={`${getPlatformIcon(alert.platform)} mr-1`}></i>
                            {alert.platform}
                          </Badge>
                          <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs">{alert.label}</Badge>
                          <Badge className={`${getSeverityColor(alert.severity)} text-xs`}>
                            {alert.severity}
                          </Badge>
                          <span className={`text-xs sm:text-sm font-semibold ${getConfidenceColor(alert.confidence)}`}>
                            {alert.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mb-1">
                          {alert.source_account} • {new Date(alert.detected_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs sm:text-sm line-clamp-1 text-slate-700 break-words">
                          {alert.caption}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 w-full sm:w-auto sm:mt-0">
                        <Badge
                          className={
                            alert.status === "new"
                              ? "bg-secondary text-white"
                              : alert.status === "actioned"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }
                        >
                          {alert.status}
                        </Badge>
                        <a
                          href={alert.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs sm:text-sm text-secondary hover:underline mt-1 sm:mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Source <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

