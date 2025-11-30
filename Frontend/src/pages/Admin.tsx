import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Activity, Database, Zap } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [mockForm, setMockForm] = useState({
    userId: "",
    platform: "tiktok",
    label: "impersonation",
    confidence: "0.95",
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!hasAdminRole) {
        toast.error("Access denied: Admin only");
        navigate("/dashboard");
        return;
      }

      await loadUsers();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  const generateMockAlert = async () => {
    try {
      if (!mockForm.userId) {
        toast.error("Please select a user");
        return;
      }

      const { error } = await supabase
        .from("alerts")
        .insert([{
          user_id: mockForm.userId,
          platform: mockForm.platform as "tiktok" | "twitter" | "youtube",
          label: mockForm.label as "impersonation" | "repost" | "deepfake" | "name_mention",
          confidence: parseFloat(mockForm.confidence),
          source_url: `https://${mockForm.platform}.com/mock/${Date.now()}`,
          source_account: `@mock_user_${Date.now()}`,
          caption: "This is a mock alert generated for testing purposes.",
          screenshot_url: "https://placeholder.co/800x600/1e293b/06b6d4?text=Mock+Alert",
          status: "new",
        }]);

      if (error) throw error;

      toast.success("Mock alert generated successfully");
      setMockForm({
        userId: "",
        platform: "tiktok",
        label: "impersonation",
        confidence: "0.95",
      });
    } catch (error) {
      console.error("Error generating mock alert:", error);
      toast.error("Failed to generate mock alert");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Loading admin panel...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            System monitoring and mock data generation
          </p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crawler Status</CardTitle>
              <Zap className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Active</div>
              <p className="text-xs text-muted-foreground mt-1">
                Mock: 3 platforms monitored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alert Rate</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">~12/hr</div>
              <p className="text-xs text-muted-foreground mt-1">
                Mock ingestion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mock Alert Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Generate Mock Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>User</Label>
              <Select
                value={mockForm.userId}
                onValueChange={(value) => setMockForm({ ...mockForm, userId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Platform</Label>
                <Select
                  value={mockForm.platform}
                  onValueChange={(value) => setMockForm({ ...mockForm, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="twitter">X (Twitter)</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Label</Label>
                <Select
                  value={mockForm.label}
                  onValueChange={(value) => setMockForm({ ...mockForm, label: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="impersonation">Impersonation</SelectItem>
                    <SelectItem value="repost">Repost</SelectItem>
                    <SelectItem value="deepfake">Deepfake</SelectItem>
                    <SelectItem value="name_mention">Name Mention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Confidence</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={mockForm.confidence}
                  onChange={(e) => setMockForm({ ...mockForm, confidence: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={generateMockAlert} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Generate Mock Alert
            </Button>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{user.full_name || "No name"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Joined {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No users registered yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
