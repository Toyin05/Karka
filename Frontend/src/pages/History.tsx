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
import { useActionHistory, ActionHistoryItem, ActionAnalytics } from "@/hooks/useActionHistory";
import { useUserProfile } from "@/hooks/useUserProfile";

const History = () => {
  // Use the action history hook with real database integration
  const { loading, actions, analytics, error, refetch } = useActionHistory();
  const { identity } = useUserProfile();
  const [filteredActions, setFilteredActions] = useState<ActionHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("action_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");

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
      filtered = filtered.filter(action => action.action_type === filterType);
    }
    if (filterPlatform !== "all") {
      filtered = filtered.filter(action => action.platform === filterPlatform);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy as keyof ActionHistoryItem];
      let bVal = b[sortBy as keyof ActionHistoryItem];
      
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
    const iconClass = {
      tiktok: "bx bxl-tiktok text-2xl sm:text-3xl lg:text-4xl",
      youtube: "bx bxl-youtube text-2xl sm:text-3xl lg:text-4xl", 
      twitter: "bx bxl-twitter text-2xl sm:text-3xl lg:text-4xl",
      instagram: "bx bxl-instagram text-2xl sm:text-3xl lg:text-4xl"
    };
    return iconClass[platform] || "bx bx-globe text-2xl sm:text-3xl lg:text-4xl";
  };

  const getPlatformDisplayName = (platform: string) => {
    const displayNames = {
      tiktok: "TikTok",
      youtube: "YouTube", 
      twitter: "Twitter",
      instagram: "Instagram"
    };
    return displayNames[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
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

  const getTimelineProgress = (action: ActionHistoryItem) => {
    if (action.status === "completed") return 100;
    if (action.status === "failed") return 100;
    if (action.status === "escalated") return 75;
    if (action.status === "in_progress") return 50;
    return 25;
  };

  const handleExportReport = () => {
    // Generate a comprehensive TXT report
    let reportText = `
KARKA DIGITAL IDENTITY PROTECTION PLATFORM
============================================
Action History Report

Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
User: KARKA User

SUMMARY STATISTICS
==================
Total Actions Taken: ${analytics.totalActions}
Success Rate: ${analytics.successRate}%
Average Response Time: ${analytics.averageResponseTime}
Legal Actions Required: ${analytics.legalActionsRequired}
Blockchain Verified Actions: ${analytics.blockchainIntegration}
Platform Cooperation: ${analytics.platformCooperation}%
Estimated Reach Protected: ${formatNumber(analytics.estimatedReachProtected)}

DETAILED ACTION HISTORY
=======================
`;

    actions.forEach((action, index) => {
      reportText += `
Action #${index + 1}
-------------------
Title: ${action.title}
Platform: ${getPlatformDisplayName(action.platform)}
Status: ${action.status.charAt(0).toUpperCase() + action.status.slice(1)}
Compliance: ${action.compliance_status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
Confidence Level: ${action.confidence}%
Action Date: ${new Date(action.action_date).toLocaleDateString()}
Source Account: ${action.source_account}
Estimated Reach: ${formatNumber(action.estimated_reach)} people
Response Time: ${action.response_time || 'N/A'}
Blockchain Hash: ${action.blockchain_hash || 'Not Required'}
Platform Response: ${action.platform_response || 'No response recorded'}

`;
    });

    reportText += `
END OF REPORT
=============
Generated by KARKA Digital Identity Protection Platform
Visit us at: karka.app
Protecting digital identities in the AI era

For support, contact: support@karka.com
`;

    // Create and download TXT report
    const dataBlob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `karka-action-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Action history report exported successfully!");
  };

  const handleCopySummary = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      const summary = `KARKA Digital Protection Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Action: ${action.title}
Platform: ${getPlatformDisplayName(action.platform)}
Status: ${action.status.charAt(0).toUpperCase() + action.status.slice(1)}
Confidence: ${action.confidence}%
Compliance: ${action.compliance_status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
Response Time: ${action.response_time || 'N/A'}
Estimated Reach: ${formatNumber(action.estimated_reach)}
Blockchain: ${action.blockchain_hash ? 'Verified' : 'Not Required'}

Platform Response:
${action.platform_response || 'No response recorded'}

Generated by KARKA Digital Identity Protection Platform
karka.app | Protecting digital identities in the AI era`;
      
      navigator.clipboard.writeText(summary);
      toast.success("Action summary copied to clipboard!");
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Action history refreshed");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full pt-16 sm:pt-20 lg:pt-0">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading action history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full pt-16 sm:pt-20 lg:pt-0">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-muted-foreground">Failed to load action history: {error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
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
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 leading-tight">Action History Center</h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Track and analyze all enforcement actions taken</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {analytics.totalActions} Total Actions
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-400">
                    {analytics.successRate}% Success Rate
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-100 text-xs sm:text-sm">Avg Response</p>
                <p className="text-xl sm:text-2xl font-bold">{analytics.averageResponseTime}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-100 text-xs sm:text-sm">Legal Actions</p>
                <p className="text-xl sm:text-2xl font-bold">{analytics.legalActionsRequired}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-100 text-xs sm:text-sm">Blockchain</p>
                <p className="text-xl sm:text-2xl font-bold">{analytics.blockchainIntegration}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-100 text-xs sm:text-sm">Protected Reach</p>
                <p className="text-xl sm:text-2xl font-bold">{formatNumber(analytics.estimatedReachProtected)}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/5 rounded-full -translate-y-16 sm:-translate-y-24 lg:-translate-y-32 translate-x-16 sm:translate-x-24 lg:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-white/5 rounded-full translate-y-12 sm:translate-y-16 lg:translate-y-24 -translate-x-12 sm:-translate-x-16 lg:-translate-x-24"></div>
        </div>

        {/* Advanced Controls */}
        <Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-3 sm:pt-4 lg:pt-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions by title, description, or account..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 sm:h-11"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-nowrap">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40 h-10 sm:h-11">
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
                    <SelectTrigger className="w-full sm:w-40 h-10 sm:h-11">
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
                    <SelectTrigger className="w-full sm:w-32 h-10 sm:h-11">
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
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 pt-3 sm:pt-4 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold">{filteredActions.length}</span> of{' '}
                    <span className="font-semibold">{actions.length}</span> actions
                  </p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
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
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9 sm:h-10">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportReport} className="h-9 sm:h-10">
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
              <Card key={action.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Header */}
                    <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <i className={getPlatformIcon(action.platform)}></i>
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <Badge className={getPlatformColor(action.platform) + " text-xs sm:text-sm"}>
                              {getPlatformDisplayName(action.platform)}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(action.status) + " text-xs sm:text-sm"}>
                              {getStatusIcon(action.status)}
                              <span className="ml-1 capitalize">{action.status.replace("_", " ")}</span>
                            </Badge>
                            <Badge variant="outline" className={getComplianceColor(action.compliance_status) + " text-xs sm:text-sm"}>
                              {action.compliance_status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs sm:text-sm">
                              {action.confidence}% confidence
                            </Badge>
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold leading-tight">{action.title}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 w-full lg:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopySummary(action.id)}
                          className="flex-1 lg:flex-none h-8 sm:h-9"
                        >
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Summary
                        </Button>
                        <a
                          href={action.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 lg:flex-none"
                        >
                          <Button variant="outline" size="sm" className="w-full h-8 sm:h-9">
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden xs:inline">View Source</span>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* Action Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Action Details</h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Source Account:</span>
                            <span className="font-medium break-all">{action.source_account}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Action Date:</span>
                            <span className="font-medium">{new Date(action.action_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Response Time:</span>
                            <span className="font-medium">{action.response_time}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Estimated Reach:</span>
                            <span className="font-medium">{formatNumber(action.estimated_reach)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Compliance & Results */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Compliance</h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline" className={getComplianceColor(action.compliance_status) + " w-fit text-xs sm:text-sm"}>
                              {action.compliance_status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Method:</span>
                            <span className="font-medium">{action.takedown_method.replace("_", " ")}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Legal Action:</span>
                            <span className="font-medium">{action.legal_action_required ? "Required" : "Not Needed"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Success Metrics */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Success Metrics</h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Platform Cooperation:</span>
                            <span className="font-medium">{action.platform_cooperation}%</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Risk Reduced:</span>
                            <span className="font-medium">{action.legal_risk_reduced}%</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">Removal Time:</span>
                            <span className="font-medium">{action.removal_time || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Integration */}
                    {action.blockchain_hash && (
                      <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Blockchain Verification
                          </h4>
                          <Badge variant="outline" className="text-purple-600 border-purple-200 w-fit">
                            CAMP Network
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-muted-foreground block mb-1">Transaction Hash:</span>
                            <div className="flex items-center gap-2">
                              <code className="bg-white px-2 py-1 rounded text-xs font-mono flex-1 break-all">
                                {action.blockchain_hash}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(action.blockchain_hash)}
                                className="h-7 w-7 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-1">Network:</span>
                            <span className="font-medium text-slate-900">{action.blockchain_network}</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded p-2 sm:p-3 mt-3">
                          <p className="text-xs text-blue-800">
                            <strong>Legal Evidence:</strong> This blockchain record provides immutable proof 
                            of your takedown request, timestamped and cryptographically secured on CAMP Network. 
                            Use this hash as evidence in legal proceedings or platform appeals.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`https://explorer.camp.network/tx/${action.blockchain_hash}`, '_blank')}
                              className="text-xs h-7"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View on Explorer
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                const blockchainProof = `KARKA ACTION BLOCKCHAIN PROOF
=================================
Generated on: ${new Date().toLocaleString()}

ACTION DETAILS
--------------
Title: ${action.title}
Description: ${action.description}
Platform: ${action.platform}
Source Account: ${action.source_account}
Action Date: ${new Date(action.action_date).toLocaleDateString()}

BLOCKCHAIN VERIFICATION
-----------------------
Network: ${action.blockchain_network}
Transaction Hash: ${action.blockchain_hash}
Compliance Status: ${action.compliance_status}
Legal Action Required: ${action.legal_action_required ? 'Yes' : 'No'}

VERIFICATION BENEFITS
--------------------
• Immutable proof of takedown request
• Cryptographically secured timestamp
• Legal evidence for proceedings
• Platform compliance verification

For support: support@karka.com
View on Explorer: https://explorer.camp.network/tx/${action.blockchain_hash}
`;
                                navigator.clipboard.writeText(blockchainProof);
                                toast.success('Blockchain proof copied to clipboard');
                              }}
                              className="text-xs h-7"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Proof
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Platform Response */}
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                      <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Platform Response
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-800">{action.platform_response}</p>
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






