import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Filter, Eye, AlertTriangle, Shield, Clock, CheckCircle, 
  XCircle, ExternalLink, MoreHorizontal, ArrowUpRight, Zap, 
  Target, RefreshCw, Download, SortAsc, SortDesc, Grid, List,
  TrendingUp, TrendingDown, Minus, X, Play, Pause
} from "lucide-react";
import { toast } from "sonner";

// TODO: Replace with real API calls to your backend
// Mock data for demonstration - in production, this would come from your backend API
// Integration points:
// - Replace mockAlerts with API call to /api/alerts
// - Replace mockPlatformStats with API call to /api/alerts/stats
// - Replace mockMetrics with API call to /api/alerts/metrics
// - Implement real-time WebSocket connection for live alert updates
// - Add CAMP Network queries for blockchain verification status
// - Integrate with platform APIs for actual content monitoring
// - Implement ML model calls for face recognition and similarity
// - Add automated takedown request generation and blockchain recording
// Enhanced mock data with more realistic scenarios
const mockAlerts = [
  {
    id: "1",
    platform: "tiktok",
    label: "deepfake",
    confidence: 95,
    status: "new",
    source_account: "@ai_fake_creator",
    source_url: "https://tiktok.com/@ai_fake_creator/video/456789",
    caption: "AI generated video using celebrity likeness for cryptocurrency scam",
    screenshot_url: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=300&h=300&fit=crop",
    detected_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    severity: "critical",
    platform_color: "bg-pink-500",
    risk_score: 98,
    estimated_reach: 45000,
    tags: ["scam", "crypto", "ai-generated"],
    action_priority: "urgent"
  },
  {
    id: "2", 
    platform: "youtube",
    label: "impersonation",
    confidence: 88,
    status: "reviewing",
    source_account: "Fake Celebrity Tutorials",
    source_url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    caption: "Unauthorized use of photos in fake tutorial series monetized with ads",
    screenshot_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: "high",
    platform_color: "bg-red-500",
    risk_score: 85,
    estimated_reach: 23000,
    tags: ["monetization", "tutorial", "unauthorized"],
    action_priority: "high"
  },
  {
    id: "3",
    platform: "twitter", 
    label: "name_mention",
    confidence: 72,
    status: "actioned",
    source_account: "@trending_topic",
    source_url: "https://twitter.com/trending_topic/status/789",
    caption: "Viral tweet mentioning your name in conspiracy theory context",
    screenshot_url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=300&fit=crop",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    severity: "medium",
    platform_color: "bg-blue-400",
    risk_score: 45,
    estimated_reach: 12000,
    tags: ["viral", "conspiracy"],
    action_priority: "medium"
  },
  {
    id: "4",
    platform: "instagram",
    label: "repost",
    confidence: 92,
    status: "ignored",
    source_account: "@content_thief_2024",
    source_url: "https://instagram.com/p/xyz123",
    caption: "Reposted original content without attribution, gaining 50k+ likes",
    screenshot_url: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=300&h=300&fit=crop",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    severity: "low",
    platform_color: "bg-pink-600",
    risk_score: 30,
    estimated_reach: 8500,
    tags: ["repost", "attribution"],
    action_priority: "low"
  },
  {
    id: "5",
    platform: "tiktok",
    label: "impersonation",
    confidence: 91,
    status: "actioned",
    source_account: "@celebrity_lookalike",
    source_url: "https://tiktok.com/@celebrity_lookalike/video/789",
    caption: "Using your photos to create fake motivational content",
    screenshot_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    severity: "high",
    platform_color: "bg-pink-500",
    risk_score: 78,
    estimated_reach: 34000,
    tags: ["motivational", "fake"],
    action_priority: "high"
  }
];

const mockPlatformStats = {
  total: mockAlerts.length,
  new: mockAlerts.filter(a => a.status === "new").length,
  reviewing: mockAlerts.filter(a => a.status === "reviewing").length,
  actioned: mockAlerts.filter(a => a.status === "actioned").length,
  ignored: mockAlerts.filter(a => a.status === "ignored").length
};

const mockMetrics = {
  avgConfidence: Math.round(mockAlerts.reduce((acc, alert) => acc + alert.confidence, 0) / mockAlerts.length),
  avgRiskScore: Math.round(mockAlerts.reduce((acc, alert) => acc + alert.risk_score, 0) / mockAlerts.length),
  totalEstimatedReach: mockAlerts.reduce((acc, alert) => acc + alert.estimated_reach, 0),
  criticalThreats: mockAlerts.filter(a => a.severity === "critical" || a.severity === "high").length
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

  const applyFilters = () => {
    let filtered = [...alerts];

    // Apply text search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.source_account?.toLowerCase().includes(search) ||
        a.source_url?.toLowerCase().includes(search) ||
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
    if (confidence >= 80) return "text-green-600 bg-green-50";
    if (confidence >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
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
      case "new": return <AlertTriangle className="h-4 w-4" />;
      case "reviewing": return <Eye className="h-4 w-4" />;
      case "actioned": return <CheckCircle className="h-4 w-4" />;
      case "ignored": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <Zap className="h-4 w-4 text-red-500" />;
      case "high": return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case "medium": return <Minus className="h-4 w-4 text-yellow-500" />;
      case "low": return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleBulkAction = (action: "action" | "ignore") => {
    const actionCount = selectedAlerts.size;
    if (actionCount === 0) {
      toast.error("Please select alerts first");
      return;
    }

    // Update alerts status
    const updatedAlerts = alerts.map(alert => {
      if (selectedAlerts.has(alert.id)) {
        return { ...alert, status: action === "action" ? "actioned" : "ignored" };
      }
      return alert;
    });

    setAlerts(updatedAlerts);
    setSelectedAlerts(new Set());
    toast.success(`Successfully ${action === "action" ? "actioned" : "ignored"} ${actionCount} alerts`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Scanning for threats...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Threat Detection Center</h1>
                <p className="text-purple-100">AI-powered monitoring across 15+ platforms</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {mockPlatformStats.total} Total Threats
                </Badge>
                <Badge variant="outline" className="bg-red-500/20 text-red-100 border-red-400">
                  {mockMetrics.criticalThreats} Critical
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-100 text-sm">Avg Confidence</p>
                <p className="text-2xl font-bold">{mockMetrics.avgConfidence}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-100 text-sm">Risk Score</p>
                <p className="text-2xl font-bold">{mockMetrics.avgRiskScore}/100</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-100 text-sm">Total Reach</p>
                <p className="text-2xl font-bold">{formatNumber(mockMetrics.totalEstimatedReach)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-100 text-sm">Success Rate</p>
                <p className="text-2xl font-bold">{Math.round((mockPlatformStats.actioned / mockPlatformStats.total) * 100)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters and Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Quick Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by account, caption, or tags..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Detailed Filters */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Select
                  value={filters.platform}
                  onValueChange={(value) => setFilters({ ...filters, platform: value })}
                >
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="actioned">Actioned</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.severity}
                  onValueChange={(value) => setFilters({ ...filters, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detected_at">Date</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="risk_score">Risk Score</SelectItem>
                    <SelectItem value="platform">Platform</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>

              {/* Stats and Bulk Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold">{filteredAlerts.length}</span> of{' '}
                    <span className="font-semibold">{alerts.length}</span> alerts
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-red-600">{mockPlatformStats.new}</span> new
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-yellow-600">{mockPlatformStats.reviewing}</span> reviewing
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-green-600">{mockPlatformStats.actioned}</span> resolved
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedAlerts.size > 0 && (
                    <>
                      <Badge variant="secondary">{selectedAlerts.size} selected</Badge>
                      <Button
                        size="sm"
                        onClick={() => handleBulkAction("action")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Bulk Action
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("ignore")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Bulk Ignore
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Display */}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">No threats detected</p>
                  <p className="text-muted-foreground">
                    {filters.search || filters.platform !== "all" || filters.status !== "all" 
                      ? "No alerts match your current filters" 
                      : "Your digital identity is currently protected"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <Checkbox
                        checked={selectedAlerts.has(alert.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedAlerts);
                          if (checked) {
                            newSelected.add(alert.id);
                          } else {
                            newSelected.delete(alert.id);
                          }
                          setSelectedAlerts(newSelected);
                        }}
                      />

                      {/* Screenshot */}
                      <img
                        src={alert.screenshot_url}
                        alt="Threat preview"
                        className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
                      />

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getPlatformColor(alert.platform)}>
                                {alert.platform}
                              </Badge>
                              <Badge variant="outline">{alert.label.replace("_", " ")}</Badge>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getPriorityIcon(alert.action_priority)}
                                <span className={`text-sm font-semibold px-2 py-1 rounded ${getConfidenceColor(alert.confidence)}`}>
                                  {alert.confidence}%
                                </span>
                              </div>
                            </div>
                            <h3 className="font-semibold text-lg">
                              {alert.source_account}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(alert.status)}
                            <Badge variant="outline" className="capitalize">
                              {alert.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Caption and Metadata */}
                        <div className="space-y-2">
                          <p className="text-muted-foreground line-clamp-2">
                            {alert.caption}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Risk: {alert.risk_score}/100</span>
                            <span>Reach: {formatNumber(alert.estimated_reach)}</span>
                            <span>Detected: {new Date(alert.detected_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {alert.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={alert.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:underline text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.status === "new" && (
                            <>
                              <Button size="sm" variant="outline">
                                <XCircle className="h-4 w-4 mr-1" />
                                Ignore
                              </Button>
                              {/* TODO: Implement automated takedown with blockchain integration */}
                              {/* 
                                Critical Implementation Points:
                                1. Generate automated cease-and-desist message
                                2. Send takedown request via platform API/contact forms
                                3. Record action on CAMP Network blockchain for legal proof
                                4. Create immutable audit trail of takedown request
                                5. Update alert status and send notifications
                                6. Track compliance and response times
                                7. Generate legal evidence document from blockchain data
                                8. Implement smart contract for automated takedown processing
                                
                                Example implementation:
                                
                                const initiateRebuke = async (alert: Alert) => {
                                  // Generate takedown message
                                  const takedownMessage = generateLegalNotice(alert);
                                  
                                  // Send via platform API
                                  const platformResponse = await sendTakedownRequest(
                                    alert.platform, 
                                    alert.source_url, 
                                    takedownMessage
                                  );
                                  
                                  // Record on CAMP Network blockchain
                                  const provider = new ethers.providers.JsonRpcProvider(process.env.CAMP_NETWORK_URL);
                                  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
                                  const contract = new ethers.Contract(process.env.CAMP_CONTRACT_ADDRESS, CAMP_ABI, wallet);
                                  
                                  const tx = await contract.recordTakedown(
                                    alert.id,
                                    userIdentityHash,
                                    alert.violationType,
                                    takedownMessage
                                  );
                                  
                                  const receipt = await tx.wait();
                                  
                                  // Update alert status
                                  await updateAlertStatus(alert.id, 'actioned', receipt.transactionHash);
                                  
                                  // Send confirmation
                                  toast.success('Takedown request sent and recorded on blockchain');
                                  
                                  return {
                                    success: true,
                                    blockchainHash: receipt.transactionHash,
                                    platformResponse: platformResponse.status
                                  };
                                };
                              */}
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  // TODO: Implement actual blockchain-backed takedown
                                  toast.success('Rebuke action initiated - blockchain recording coming soon!');
                                }}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Rebuke
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-0">
                  <img
                    src={alert.screenshot_url}
                    alt="Threat preview"
                    className="w-full h-48 object-cover rounded-t-lg"
                    onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
                  />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getPlatformColor(alert.platform)}>
                        {alert.platform}
                      </Badge>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <h3 className="font-semibold line-clamp-1">{alert.source_account}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{alert.caption}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${getConfidenceColor(alert.confidence)}`}>
                        {alert.confidence}%
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        <span className="text-sm text-muted-foreground">{alert.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {alert.status === "new" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1">
                          <Shield className="h-4 w-4 mr-1" />
                          Action
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
