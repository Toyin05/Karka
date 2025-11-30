import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, Filter, ExternalLink, CheckCircle, XCircle, Clock, 
  AlertTriangle, Shield, Download, Calendar, TrendingUp, 
  TrendingDown, Activity, Eye, RefreshCw, Share, Flag,
  MessageSquare, FileText, Zap, Target, BarChart3,
  Gavel, Copy, Star, MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

// TODO: Replace with real API calls to your backend
// Mock data for demonstration - in production, this would come from your backend API
// Integration points:
// - Replace mockActions with API call to /api/actions
// - Replace mockAnalytics with API call to /api/actions/analytics
// - Implement real blockchain queries for takedown verification
// - Add WebSocket for real-time action status updates
// - Integrate with CAMP Network for immutable action records
// - Implement actual takedown automation via platform APIs
// - Add legal document generation and blockchain timestamping
// Comprehensive mock data for Actions history
const mockActions = [
  {
    id: "1",
    type: "rebuke",
    title: "Deepfake Content Takedown",
    description: "Automated cease-and-desist sent to @fake_creator for AI-generated deepfake content",
    platform: "tiktok",
    source_url: "https://tiktok.com/@fake_creator/video/123",
    source_account: "@fake_creator",
    status: "completed",
    priority: "high",
    confidence: 95,
    action_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completed_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    response_time: "1.5 hours",
    compliance_status: "removed",
    threat_level: "critical",
    estimated_reach: 45000,
    legal_action_required: false,
    blockchain_hash: "0x1234567890abcdef",
    blockchain_network: "CAMP Network",
    takedown_method: "automated_dm",
    platform_response: "Content removed within 24 hours",
    success_metrics: {
      removal_time: "1.5 hours",
      platform_cooperation: 95,
      legal_risk_reduced: 98
    }
  },
  {
    id: "2",
    type: "legal_notice",
    title: "Impersonation Legal Action",
    description: "Formal legal notice sent via certified mail to impersonation channel",
    platform: "youtube",
    source_url: "https://youtube.com/watch?v=abc123",
    source_account: "Fake Tutorial Channel",
    status: "in_progress",
    priority: "high",
    confidence: 88,
    action_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    completed_date: null,
    response_time: "24 hours",
    compliance_status: "pending_response",
    threat_level: "high",
    estimated_reach: 23000,
    legal_action_required: true,
    blockchain_hash: "0xabcdef1234567890",
    blockchain_network: "CAMP Network",
    takedown_method: "legal_notice",
    platform_response: "Awaiting legal team review",
    success_metrics: {
      removal_time: null,
      platform_cooperation: 60,
      legal_risk_reduced: 85
    }
  },
  {
    id: "3",
    type: "ignore",
    title: "Name Mention Review",
    description: "Reviewed and decided to ignore viral tweet mentioning name in news context",
    platform: "twitter",
    source_url: "https://twitter.com/news_account/status/789",
    source_account: "@trending_news",
    status: "completed",
    priority: "low",
    confidence: 72,
    action_date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    completed_date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    response_time: "1 hour",
    compliance_status: "no_action_needed",
    threat_level: "low",
    estimated_reach: 12000,
    legal_action_required: false,
    blockchain_hash: null,
    blockchain_network: null,
    takedown_method: "manual_review",
    platform_response: "Notified for future reference",
    success_metrics: {
      removal_time: null,
      platform_cooperation: 100,
      legal_risk_reduced: 0
    }
  },
  {
    id: "4",
    type: "rebuke",
    title: "Content Repost Removal",
    description: "Automated request sent for unauthorized content repost without attribution",
    platform: "instagram",
    source_url: "https://instagram.com/p/xyz789",
    source_account: "@content_thief_2024",
    status: "failed",
    priority: "medium",
    confidence: 92,
    action_date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    completed_date: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    response_time: "2 hours",
    compliance_status: "ignored",
    threat_level: "medium",
    estimated_reach: 8500,
    legal_action_required: false,
    blockchain_hash: "0x7890abcdef123456",
    blockchain_network: "CAMP Network",
    takedown_method: "automated_dm",
    platform_response: "No response from content creator",
    success_metrics: {
      removal_time: null,
      platform_cooperation: 20,
      legal_risk_reduced: 30
    }
  },
  {
    id: "5",
    type: "escalation",
    title: "Scam Account Escalation",
    description: "Escalated to platform fraud department for cryptocurrency scam account",
    platform: "tiktok",
    source_url: "https://tiktok.com/@crypto_scam_bot",
    source_account: "@crypto_scam_bot",
    status: "escalated",
    priority: "urgent",
    confidence: 91,
    action_date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completed_date: null,
    response_time: "48 hours",
    compliance_status: "under_review",
    threat_level: "critical",
    estimated_reach: 34000,
    legal_action_required: true,
    blockchain_hash: "0xfedcba0987654321",
    blockchain_network: "CAMP Network",
    takedown_method: "platform_escalation",
    platform_response: "Under investigation by fraud team",
    success_metrics: {
      removal_time: null,
      platform_cooperation: 85,
      legal_risk_reduced: 90
    }
  }
];

const mockAnalytics = {
  totalActions: mockActions.length,
  successRate: Math.round((mockActions.filter(a => a.status === "completed" && a.compliance_status === "removed").length / mockActions.length) * 100),
  averageResponseTime: "4.2 hours",
  legalActionsRequired: mockActions.filter(a => a.legal_action_required).length,
  blockchainIntegration: mockActions.filter(a => a.blockchain_hash).length,
  platformCooperation: 87,
  threatsPrevented: 156,
  estimatedReachProtected: 287000
};

const History = () => {
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState(mockActions);
  const [filteredActions, setFilteredActions] = useState(mockActions);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("action_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [actions, searchTerm, sortBy, sortOrder, filterStatus, filterType, filterPlatform]);

  const applyFilters = () => {
    let filtered = [...actions];

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(action =>
        action.title.toLowerCase().includes(search) ||
        action.description.toLowerCase().includes(search) ||
        action.source_account.toLowerCase().includes(search) ||
        action.platform.toLowerCase().includes(search)
      );
    }

    // Apply filters
    if (filterStatus !== "all") {
      filtered = filtered.filter(action => action.status === filterStatus);
    }
    if (filterType !== "all") {
      filtered = filtered.filter(action => action.type === filterType);
    }
    if (filterPlatform !== "all") {
      filtered = filtered.filter(action => action.platform === filterPlatform);
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

    setFilteredActions(filtered);
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      case "escalated": return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      case "escalated": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "removed": return "text-green-600";
      case "pending_response": return "text-yellow-600";
      case "ignored": return "text-red-600";
      case "no_action_needed": return "text-blue-600";
      case "under_review": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case "rebuke": return <Shield className="h-4 w-4 text-blue-500" />;
      case "legal_notice": return <Gavel className="h-4 w-4 text-purple-500" />;
      case "ignore": return <Eye className="h-4 w-4 text-gray-500" />;
      case "escalation": return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTimelineProgress = (action: typeof mockActions[0]) => {
    if (action.status === "completed") return 100;
    if (action.status === "failed") return 100;
    if (action.status === "escalated") return 75;
    if (action.status === "in_progress") return 50;
    return 25;
  };

  const handleExportReport = () => {
    toast.success("Action history report exported successfully");
  };

  const handleShareAction = (actionId: string) => {
    toast.success("Action details copied to clipboard");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading action history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 bg-gradient-to-br from-orange-50 to-red-50 min-h-screen">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Action History Center</h1>
                <p className="text-orange-100">Track and analyze all enforcement actions taken</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {mockAnalytics.totalActions} Total Actions
                </Badge>
                <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-400">
                  {mockAnalytics.successRate}% Success Rate
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-orange-100 text-sm">Avg Response</p>
                <p className="text-2xl font-bold">{mockAnalytics.averageResponseTime}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-orange-100 text-sm">Legal Actions</p>
                <p className="text-2xl font-bold">{mockAnalytics.legalActionsRequired}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-orange-100 text-sm">Blockchain</p>
                <p className="text-2xl font-bold">{mockAnalytics.blockchainIntegration}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-orange-100 text-sm">Protected Reach</p>
                <p className="text-2xl font-bold">{formatNumber(mockAnalytics.estimatedReachProtected)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions by title, description, or account..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="rebuke">Rebuke</SelectItem>
                      <SelectItem value="legal_notice">Legal Notice</SelectItem>
                      <SelectItem value="ignore">Ignore</SelectItem>
                      <SelectItem value="escalation">Escalation</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold">{filteredActions.length}</span> of{' '}
                    <span className="font-semibold">{actions.length}</span> actions
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-green-600">
                        {filteredActions.filter(a => a.status === "completed").length}
                      </span> completed
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-yellow-600">
                        {filteredActions.filter(a => a.status === "in_progress").length}
                      </span> in progress
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-orange-600">
                        {filteredActions.filter(a => a.status === "escalated").length}
                      </span> escalated
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportReport}>
                    <Download className="h-4 w-4 mr-1" />
                    Export Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Timeline */}
        <div className="space-y-6">
          {filteredActions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No actions found</p>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all" || filterType !== "all" || filterPlatform !== "all"
                    ? "No actions match your current filters"
                    : "No enforcement actions have been taken yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredActions.map((action) => (
              <Card key={action.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          {getActionTypeIcon(action.type)}
                          <div className="text-2xl">{getPlatformIcon(action.platform)}</div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getPlatformColor(action.platform)}>
                              {action.platform}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(action.status)}>
                              {getStatusIcon(action.status)}
                              <span className="ml-1 capitalize">{action.status.replace("_", " ")}</span>
                            </Badge>
                            <Badge variant="outline" className={getComplianceColor(action.compliance_status)}>
                              {action.compliance_status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-purple-600 border-purple-200">
                              {action.confidence}% confidence
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold">{action.title}</h3>
                          <p className="text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareAction(action.id)}
                        >
                          <Share className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <a
                          href={action.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Source
                          </Button>
                        </a>
                      </div>
                    </div>

                    {/* Timeline Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Action Progress</span>
                        <span className="text-muted-foreground">{getTimelineProgress(action)}%</span>
                      </div>
                      <Progress value={getTimelineProgress(action)} className="h-2" />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Action Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Action Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Source Account:</span>
                            <span className="font-medium">{action.source_account}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Action Date:</span>
                            <span className="font-medium">{new Date(action.action_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Response Time:</span>
                            <span className="font-medium">{action.response_time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimated Reach:</span>
                            <span className="font-medium">{formatNumber(action.estimated_reach)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Compliance & Results */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Compliance</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline" className={getComplianceColor(action.compliance_status)}>
                              {action.compliance_status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Method:</span>
                            <span className="font-medium">{action.takedown_method.replace("_", " ")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Legal Action:</span>
                            <span className="font-medium">{action.legal_action_required ? "Required" : "Not Needed"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Success Metrics */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Success Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Platform Cooperation:</span>
                            <span className="font-medium">{action.success_metrics.platform_cooperation}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Reduced:</span>
                            <span className="font-medium">{action.success_metrics.legal_risk_reduced}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Removal Time:</span>
                            <span className="font-medium">{action.success_metrics.removal_time || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Integration */}
                    {action.blockchain_hash && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Blockchain Verification
                          </h4>
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            CAMP Network
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Transaction Hash:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="bg-white px-2 py-1 rounded text-xs font-mono flex-1">
                                {action.blockchain_hash}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(action.blockchain_hash)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Network:</span>
                            <span className="ml-2 font-medium">{action.blockchain_network}</span>
                          </div>
                        </div>
                        {/* TODO: Implement CAMP Network blockchain integration */}
                        {/* 
                          Critical Implementation Points:
                          1. Replace static hash with real CAMP Network transaction
                          2. Query CAMP Network contract for takedown record
                          3. Verify transaction status and block confirmations
                          4. Generate legal proof document from blockchain data
                          5. Implement smart contract events for real-time updates
                          6. Add blockchain explorer links for verification
                          7. Implement ZK proofs for privacy-preserving verification
                          8. Add multi-signature support for enterprise users
                          
                          Example implementation:
                          
                          const verifyTakedownOnChain = async (txHash: string) => {
                            const provider = new ethers.providers.JsonRpcProvider(process.env.CAMP_NETWORK_URL);
                            const contract = new ethers.Contract(process.env.CAMP_CONTRACT_ADDRESS, CAMP_ABI, provider);
                            
                            // Verify takedown was recorded
                            const takedownRecord = await contract.getTakedown(txHash);
                            
                            // Get block information for legal proof
                            const receipt = await provider.getTransactionReceipt(txHash);
                            const block = await provider.getBlock(receipt.blockNumber);
                            
                            return {
                              verified: takedownRecord.exists,
                              timestamp: new Date(block.timestamp * 1000),
                              blockNumber: receipt.blockNumber,
                              gasUsed: receipt.gasUsed.toString(),
                              status: receipt.status === 1 ? 'success' : 'failed'
                            };
                          };
                        */}
                        <div className="bg-blue-50 rounded p-3 mt-3">
                          <p className="text-xs text-blue-800">
                            <strong>Legal Evidence:</strong> This blockchain record provides immutable proof 
                            of your takedown request, timestamped and cryptographically secured on CAMP Network. 
                            Use this hash as evidence in legal proceedings or platform appeals.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Platform Response */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Platform Response
                      </h4>
                      <p className="text-sm text-blue-800">{action.platform_response}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default History;

