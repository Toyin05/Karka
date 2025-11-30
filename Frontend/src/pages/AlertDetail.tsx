import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Shield, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<any>(null);
  const [showRebukeModal, setShowRebukeModal] = useState(false);
  const [rebukeMessage, setRebukeMessage] = useState("");
  const [rebukeTemplate, setRebukeTemplate] = useState<"legal" | "friendly">("legal");
  const [rebukeing, setRebukeing] = useState(false);

  useEffect(() => {
    loadAlert();
  }, [id]);

  useEffect(() => {
    if (showRebukeModal) {
      setRebukeMessage(getRebukeTemplate(rebukeTemplate));
    }
  }, [rebukeTemplate, showRebukeModal]);

  const loadAlert = async () => {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setAlert(data);
    } catch (error) {
      console.error("Error loading alert:", error);
      toast.error("Failed to load alert");
      navigate("/dashboard/alerts");
    } finally {
      setLoading(false);
    }
  };

  const getRebukeTemplate = (template: "legal" | "friendly") => {
    if (template === "legal") {
      return `Dear Platform Administrator,

I am writing to request the immediate removal of content that unlawfully uses my digital likeness without authorization.

Content URL: ${alert?.source_url}
Account: ${alert?.source_account}
Detected: ${alert?.label}

This content violates my intellectual property rights and terms of service. I have a good faith belief that the use of my likeness in the manner complained of is not authorized by me, my agent, or the law.

I request that you remove or disable access to this content immediately.

Sincerely,
[Your Name]`;
    } else {
      return `Hi there,

I noticed that content featuring my likeness has been posted without my permission:

${alert?.source_url}

I'd appreciate if you could remove this content as I haven't authorized its use. Happy to chat if you have any questions!

Thanks for understanding!`;
    }
  };

  const handleRebuke = async () => {
    setRebukeing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Simulate enforcement attempt
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create action record
      const { error } = await supabase
        .from("actions")
        .insert({
          alert_id: id,
          user_id: user.id,
          action_type: "rebuke",
          message_template: rebukeMessage,
          status: Math.random() > 0.3 ? "submitted" : "failed",
          attempts: [
            {
              timestamp: new Date().toISOString(),
              status: Math.random() > 0.3 ? "submitted" : "failed",
            }
          ],
        });

      if (error) throw error;

      // Update alert status
      await supabase
        .from("alerts")
        .update({ status: "actioned", reviewed_at: new Date().toISOString() })
        .eq("id", id);

      toast.success("Rebuke submitted successfully");
      setShowRebukeModal(false);
      loadAlert();
    } catch (error) {
      console.error("Rebuke error:", error);
      toast.error("Failed to submit rebuke");
    } finally {
      setRebukeing(false);
    }
  };

  const handleIgnore = async () => {
    try {
      await supabase
        .from("alerts")
        .update({ status: "ignored", reviewed_at: new Date().toISOString() })
        .eq("id", id);

      toast.success("Alert ignored");
      navigate("/dashboard/alerts");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to ignore alert");
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-success";
    if (confidence >= 60) return "text-warning";
    return "text-destructive";
  };

  if (loading || !alert) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Loading alert...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard/alerts")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Alert Details</h1>
            <p className="text-muted-foreground">
              Detected on {new Date(alert.detected_at).toLocaleDateString()}
            </p>
          </div>
          <Badge
            variant={alert.status === "new" ? "default" : alert.status === "actioned" ? "secondary" : "outline"}
          >
            {alert.status}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Evidence */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                {alert.screenshot_url ? (
                  <img
                    src={alert.screenshot_url}
                    alt="Alert evidence"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="bg-muted rounded-lg p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No screenshot available</p>
                  </div>
                )}
                {alert.caption && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Caption/Text:</p>
                    <p className="text-sm text-muted-foreground">{alert.caption}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {alert.status === "new" && (
              <Card>
                <CardHeader>
                  <CardTitle>Take Action</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    onClick={() => setShowRebukeModal(true)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Rebuke
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleIgnore}
                  >
                    Ignore Alert
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                  <div className="flex items-center gap-3">
                    <Progress value={alert.confidence} className="flex-1" />
                    <span className={`text-lg font-bold ${getConfidenceColor(alert.confidence)}`}>
                      {alert.confidence}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Platform</p>
                  <Badge>{alert.platform}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Detection Type</p>
                  <Badge variant="outline">{alert.label.replace("_", " ")}</Badge>
                </div>
                {alert.similarity_score && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Similarity Score</p>
                    <p className="font-semibold">{alert.similarity_score}%</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alert.source_account && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Account</p>
                    <p className="font-semibold">{alert.source_account}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">URL</p>
                  <a
                    href={alert.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline flex items-center gap-1"
                  >
                    View Source <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Rebuke Modal */}
      <Dialog open={showRebukeModal} onOpenChange={setShowRebukeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Rebuke</DialogTitle>
            <DialogDescription>
              Choose a template and customize the enforcement message
            </DialogDescription>
          </DialogHeader>
          <Tabs value={rebukeTemplate} onValueChange={(v) => setRebukeTemplate(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="legal">Legal Tone</TabsTrigger>
              <TabsTrigger value="friendly">Friendly Tone</TabsTrigger>
            </TabsList>
            <TabsContent value="legal" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Professional legal language for formal takedown requests
              </p>
            </TabsContent>
            <TabsContent value="friendly" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Casual, friendly approach for direct communication
              </p>
            </TabsContent>
          </Tabs>
          <Textarea
            value={rebukeMessage}
            onChange={(e) => setRebukeMessage(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setShowRebukeModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRebuke}
              disabled={rebukeing}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {rebukeing ? "Submitting..." : "Submit Rebuke"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AlertDetail;
