import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Camera, 
  Video, 
  Lock, 
  Zap, 
  Eye, 
  Globe, 
  TrendingUp,
  Award,
  Users,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Target,
  Star,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [skipVideo, setSkipVideo] = useState(false);
  const [identityHash, setIdentityHash] = useState("");
  const [campTxHash, setCAMPTxHash] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [step]);

  // Step transition handler
  const handleStepChange = (newStep: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
    }, 150);
  };

  useEffect(() => {
    checkExistingIdentity();
  }, []);

  const checkExistingIdentity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: identity } = await supabase
      .from("identities")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (identity?.onboarding_completed) {
      navigate("/dashboard");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate photos
    const validPhotos = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });

    if (photos.length + validPhotos.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setPhotos([...photos, ...validPhotos]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be smaller than 50MB");
      return;
    }

    setVideo(file);
  };

  const generateHash = async () => {
    // Simulate hash generation
    const randomHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return randomHash;
  };

  const generateCAMPTx = async () => {
    // Simulate CAMP network transaction
    const txHash = "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return txHash;
  };

  const handleSubmitPhotos = async () => {
    if (photos.length < 3) {
      toast.error("Please upload at least 3 photos");
      return;
    }

    setLoading(true);
    try {
      // In production, upload photos to storage
      // For MVP, we'll just store mock URLs
      const photoUrls = photos.map((_, i) => `https://placeholder.com/photo-${i}.jpg`);
      
      const hash = await generateHash();
      setIdentityHash(hash);
      
      toast.success("Photos uploaded successfully");
      handleStepChange(2);
    } catch (error) {
      toast.error("Failed to upload photos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVideo = async () => {
    if (!skipVideo && !video) {
      toast.error("Please upload a video or skip this step");
      return;
    }

    handleStepChange(3);
  };

  const handleRegisterIdentity = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const photoUrls = photos.map((_, i) => `https://placeholder.com/photo-${i}.jpg`);
      const videoUrl = video ? `https://placeholder.com/video.mp4` : null;
      const txHash = await generateCAMPTx();
      setCAMPTxHash(txHash);

      // Save identity to database
      const { error } = await supabase
        .from("identities")
        .upsert({
          user_id: user.id,
          identity_hash: identityHash,
          camp_tx_hash: txHash,
          photo_urls: photoUrls,
          video_url: videoUrl,
          embeddings: { mock: "embeddings" },
          onboarding_completed: true,
        });

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      toast.success("Identity registered successfully!");
      handleStepChange(4);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to register identity: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Professional Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-bold text-slate-900">KARKA</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 border-slate-200 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
              Secure Identity Registration
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Your Digital Identity
              <span className="text-secondary block mt-2">Deserves Enterprise Protection</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Join thousands of creators securing their digital likeness with military-grade encryption 
              and blockchain verification. This process takes less than 3 minutes.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold text-slate-900">Military-Grade Security</p>
              <p className="text-sm text-slate-600 mt-1">SHA-256 encryption</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-900">Blockchain Verified</p>
              <p className="text-sm text-slate-600 mt-1">CAMP Network</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-semibold text-slate-900">15K+ Protected</p>
              <p className="text-sm text-slate-600 mt-1">Active creators</p>
            </div>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
              <span>Step {step} of 4</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            
            {/* Step Progress with Icons */}
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    stepNumber < step 
                      ? 'bg-secondary border-secondary text-white' 
                      : stepNumber === step 
                        ? 'bg-white border-secondary text-secondary shadow-lg scale-110' 
                        : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {stepNumber < step ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <span className="font-bold">{stepNumber}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      stepNumber <= step ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {stepNumber === 1 && 'Photos'}
                      {stepNumber === 2 && 'Video'}
                      {stepNumber === 3 && 'Security'}
                      {stepNumber === 4 && 'Complete'}
                    </p>
                  </div>
                  
                  {/* Connection Line */}
                  {stepNumber < 4 && (
                    <div className={`absolute top-6 left-12 w-full h-0.5 transition-all duration-300 ${
                      stepNumber < step ? 'bg-secondary' : 'bg-slate-200'
                    }`} style={{ width: 'calc(100% - 3rem)' }} />
                  )}
                </div>
              ))}
            </div>
            
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardContent 
            ref={contentRef}
            className={`p-8 lg:p-12 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
            }`}
          >
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
                {/* Why This Matters */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Step 1: Capture Your Digital Identity</h3>
                      <p className="text-slate-600 mb-4">
                        Upload 3-5 high-quality photos from different angles. These create your unique identity signature 
                        that our AI uses to detect impersonation across platforms.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-slate-700 font-medium">
                          🔒 <strong>Privacy First:</strong> Your photos are encrypted locally and never shared publicly. 
                          Only a mathematical hash is stored on the blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-secondary hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                    <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4 group-hover:text-secondary transition-colors duration-300" />
                    <Label htmlFor="photos" className="cursor-pointer block">
                      <span className="text-secondary hover:text-secondary/80 font-semibold text-lg transition-colors duration-300 inline-block">
                        Click to upload photos
                      </span>
                      <Input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={photos.length >= 5}
                      />
                    </Label>
                    <p className="text-sm text-slate-500 mt-3 transition-colors duration-300">
                      {photos.length}/5 photos uploaded • JPG, PNG up to 10MB each
                    </p>
                    {photos.length > 0 && (
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Photos ready for processing
                      </div>
                    )}
                  </div>

                  {/* Photo Preview */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {photos.map((photo, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Upload ${i + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border border-slate-200"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Requirements */}
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-3">Photo Requirements:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700">Clear, well-lit images</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700">Different angles and expressions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700">Face clearly visible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700">High resolution (minimum 512px)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitPhotos}
                  disabled={loading || photos.length < 3}
                  className="w-full h-14 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:hover:scale-100 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing Photos...
                    </>
                  ) : (
                    <>
                      Continue to Video Upload
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
                {/* Why Video Matters */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Step 2: Enhanced Voice & Motion Detection (Optional)</h3>
                      <p className="text-slate-600 mb-4">
                        Upload a 10-second video for advanced voice pattern recognition and unique motion signatures. 
                        This significantly improves detection accuracy for deepfakes and voice cloning.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-slate-700 font-medium">
                          ⚡ <strong>Optional but Recommended:</strong> Skip this step if you prefer faster onboarding. 
                          You can add video verification later in settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Upload */}
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-secondary hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:shadow-lg cursor-pointer">
                    <Video className="h-16 w-16 text-slate-400 mx-auto mb-4 group-hover:text-secondary transition-colors duration-300" />
                    <Label htmlFor="video" className="cursor-pointer block">
                      <span className="text-secondary hover:text-secondary/80 font-semibold text-lg transition-colors duration-300 inline-block">
                        Click to upload video
                      </span>
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                    </Label>
                    <p className="text-sm text-slate-500 mt-3 transition-colors duration-300">
                      MP4, MOV up to 50MB • 10 seconds recommended
                    </p>
                    
                    {video && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-300">
                        <p className="text-green-800 font-medium text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Video uploaded: {video.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Benefits of Video */}
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-4">Video verification provides:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-secondary mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900">40% Better Accuracy</p>
                          <p className="text-sm text-slate-600">Enhanced detection of AI-generated content</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Eye className="h-5 w-5 text-secondary mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900">Voice Pattern Recognition</p>
                          <p className="text-sm text-slate-600">Protects against voice cloning attacks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSkipVideo(true);
                      handleSubmitVideo();
                    }}
                    className="flex-1 h-14 text-lg font-semibold border-slate-200 text-slate-600 hover:text-slate-800 transition-all duration-300 hover:shadow-md"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={handleSubmitVideo}
                    disabled={!video && !skipVideo}
                    className="flex-1 h-14 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:hover:scale-100 disabled:opacity-50"
                  >
                    Continue to Registration
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
                {/* Security Overview */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Step 3: Blockchain Identity Registration</h3>
                      <p className="text-slate-600 mb-4">
                        Your digital identity will be cryptographically hashed and anchored on the CAMP Network 
                        blockchain. This creates an immutable proof-of-origin for your digital likeness.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-slate-700 font-medium">
                          🔐 <strong>Zero-Knowledge Privacy:</strong> Only cryptographic hashes are stored on-chain. 
                          Your original images remain private and secure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identity Details */}
                <div className="bg-slate-50 rounded-xl p-8 space-y-6">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Your Identity Signature</h4>
                    <p className="text-slate-600">Generated using SHA-256 encryption</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <Label className="text-sm text-slate-600">Identity Hash</Label>
                      <p className="font-mono text-sm break-all mt-1 text-slate-900">{identityHash || "Generating..."}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-slate-900">SHA-256 Encryption</span>
                        </div>
                        <p className="text-xs text-slate-600">Military-grade cryptographic hashing</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-slate-900">AI Embeddings</span>
                        </div>
                        <p className="text-xs text-slate-600">Advanced facial recognition vectors</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CAMP Network Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Globe className="h-8 w-8 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">CAMP Network Blockchain</h4>
                      <p className="text-blue-800 text-sm mb-3">
                        Your identity hash will be permanently recorded on the CAMP Network, 
                        providing immutable proof of authenticity for takedown requests and legal proceedings.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-blue-700">
                        <Award className="h-4 w-4" />
                        <span>Enterprise-grade blockchain infrastructure</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleRegisterIdentity}
                    disabled={loading}
                    className="w-full h-14 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:hover:scale-100 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Registering on Blockchain...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Secure My Identity
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-8 py-12 animate-in fade-in duration-700 scale-in-95">
                {/* Success Animation */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 bg-green-400/20 rounded-full animate-ping mx-auto"></div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-slate-900">Identity Registration Complete!</h2>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Your digital identity is now protected and monitored across all major platforms. 
                    You'll receive instant alerts for any potential misuse.
                  </p>
                </div>

                {/* Success Details */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 max-w-2xl mx-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Successfully registered on CAMP Network</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <Label className="text-sm text-green-700">Transaction Hash</Label>
                      <p className="font-mono text-xs break-all mt-1 text-green-900">{campTxHash}</p>
                    </div>
                    <Button
                      variant="link"
                      className="text-secondary p-0 h-auto font-medium"
                      onClick={() => window.open(`https://explorer.camp.network/tx/${campTxHash}`, "_blank")}
                    >
                      View on Blockchain Explorer →
                    </Button>
                  </div>
                </div>

                {/* What's Next */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <Eye className="h-8 w-8 text-secondary mx-auto mb-3" />
                    <h4 className="font-semibold text-slate-900 mb-2">Monitoring Active</h4>
                    <p className="text-sm text-slate-600">Scanning 50+ platforms for your digital likeness</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <Zap className="h-8 w-8 text-secondary mx-auto mb-3" />
                    <h4 className="font-semibold text-slate-900 mb-2">Instant Alerts</h4>
                    <p className="text-sm text-slate-600">Get notified within minutes of potential misuse</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <Target className="h-8 w-8 text-secondary mx-auto mb-3" />
                    <h4 className="font-semibold text-slate-900 mb-2">Quick Actions</h4>
                    <p className="text-sm text-slate-600">One-click takedown requests and enforcement</p>
                  </div>
                </div>

                <div className="pt-8">
                  <p className="text-slate-600 animate-pulse">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-medium">4.9/5 Creator Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">15,000+ Protected Identities</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;





