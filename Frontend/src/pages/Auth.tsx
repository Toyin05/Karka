import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, EyeOff, Lock, Globe, CheckCircle2, ArrowRight, Star, Users, Zap, ArrowLeft, AlertTriangle, CheckCircle, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { connectWallet } from "@/lib/web3";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    const hasValidDomain = email.includes("@") && email.split("@")[1]?.includes(".");
    const isCommonDomain = /\.(com|org|net|edu|gov|mil|co\.uk|co|io|ai|app)$/i.test(email);
    
    return {
      isValid: isValid && hasValidDomain,
      hasValidDomain,
      isCommonDomain,
      feedback: !email ? "" : 
                !isValid ? "Invalid email format" :
                !hasValidDomain ? "Email must include a valid domain" :
                !isCommonDomain ? "Consider using a more common domain" : "Valid email"
    };
  };

  const emailValidation = validateEmail(formData.email);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.numbers) score += 20;
    if (checks.special) score += 20;

    const strength = score >= 80 ? "Strong" : score >= 60 ? "Medium" : score >= 40 ? "Fair" : "Weak";
    const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
    
    return { score, strength, color, checks };
  };

  const passwordValidation = getPasswordStrength(formData.password);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      const address = await connectWallet();
      setWalletAddress(address);
      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Additional validation for signup mode
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          setLoading(false);
          return;
        }
        
        if (passwordValidation.score < 60) {
          toast.error("Password is too weak. Please choose a stronger password.");
          setLoading(false);
          return;
        }
      }

      const validationData = mode === "signup" 
        ? signupSchema.parse(formData)
        : loginSchema.parse(formData);

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: validationData.email,
          password: validationData.password,
          options: {
            data: {
              full_name: formData.fullName,
              wallet_address: walletAddress,
            },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try logging in instead.");
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          // Account created successfully - switch to sign-in tab with user's details
          toast.success("Account created successfully! Please sign in to continue.", {
            duration: 5000,
          });
          
          // Clear signup form and switch to login mode
          setMode("login");
          setFormData({
            email: formData.email,
            password: "",
            confirmPassword: "",
            fullName: formData.fullName,
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validationData.email,
          password: validationData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else if (error.message.includes("Invalid email")) {
            toast.error("Please enter a valid email address");
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          toast.success("Welcome back! Redirecting to onboarding...");
          navigate("/onboarding");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding & Visual Content */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden border-r border-slate-200">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-slate-900">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-12 w-12 text-secondary" />
            <span className="text-4xl font-bold tracking-tight">KARKA</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Secure Your Digital
            <span className="text-secondary block">Legacy Today</span>
          </h1>
          
          {/* Description... */}
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Your identity is your most <span className="text-secondary font-semibold">valuable asset</span>. 
            Every day, imposters steal your <span className="text-secondary font-semibold">reputation</span>, 
            your <span className="text-secondary font-semibold">income</span>, and your <span className="text-secondary font-semibold">peace of mind</span>. 
            Stop losing control of your digital life.
          </p>
          
          {/* Features List */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
              <span className="text-lg text-slate-700">Bulletproof AI protection</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
              <span className="text-lg text-slate-700">Instant threat elimination</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
              <span className="text-lg text-slate-700">Complete peace of mind</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
            <div>
              <div className="text-3xl font-bold text-secondary">15K+</div>
              <div className="text-slate-500 text-sm">Creators Protected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">$2.3M+</div>
              <div className="text-slate-500 text-sm">Revenue Protected</div>
            </div>
          </div>
          
          {/* Social Proof Quote */}
          <div className="mt-8 p-4 bg-white/70 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 italic">
              "Finally, I can sleep knowing my identity is safe. KARKA caught 47 fake accounts in my first week."
            </p>
            <p className="text-xs text-slate-500 mt-2">- Sarah Chen, YouTube Creator</p>
          </div>
        </div>
        
        {/* Floating Elements with Softer Edges */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-slate-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
      </div>
      
      {/* Right Side - Authentication Forms */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-secondary" />
            <span className="text-2xl font-bold text-slate-800">KARKA</span>
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
        
        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {mode === "login" ? "Welcome Back" : "Get Started"}
              </h2>
              <p className="text-muted-foreground text-lg">
                {mode === "login" 
                  ? "Sign in to protect your digital likeness" 
                  : "Create an account to start monitoring"}
              </p>
            </div>
            
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 rounded-lg p-1 mb-6 border border-slate-200">
              <button
                onClick={() => {
                  setMode("login");
                }}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "login"
                    ? "bg-secondary text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                }}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-secondary text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign Up
              </button>
            </div>
            
            {/* Form Card */}
            <Card className="border-0 shadow-none lg:shadow-lg lg:border">
              <CardContent className="p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                          className={`h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 ${
                            formData.fullName && formData.fullName.length >= 2 ? "border-green-300 focus:border-green-500 focus:ring-green-500" :
                            formData.fullName && formData.fullName.length < 2 ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                          }`}
                        />
                        {/* Name validation indicator */}
                        {formData.fullName && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {formData.fullName.length >= 2 ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Name validation feedback */}
                      {formData.fullName && (
                        <div className="flex items-center gap-2 text-xs mt-1">
                          {formData.fullName.length >= 2 ? 
                            <CheckCircle className="h-3 w-3 text-green-500" /> :
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          }
                          <span className={formData.fullName.length >= 2 ? "text-green-600" : "text-red-500"}>
                            {formData.fullName.length >= 2 ? "Name looks good" : "Name must be at least 2 characters"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={`h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 ${
                          formData.email ? (
                            emailValidation.isValid ? "border-green-300 focus:border-green-500 focus:ring-green-500" :
                            "border-red-300 focus:border-red-500 focus:ring-red-500"
                          ) : ""
                        }`}
                      />
                      {/* Email validation indicator */}
                      {formData.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {emailValidation.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Email validation feedback */}
                    {formData.email && (
                      <div className="flex items-center gap-2 text-xs mt-1">
                        {emailValidation.isValid ? 
                          <CheckCircle className="h-3 w-3 text-green-500" /> :
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        }
                        <span className={emailValidation.isValid ? "text-green-600" : "text-red-500"}>
                          {emailValidation.feedback}
                        </span>
                      </div>
                    )}
                    
                    {/* Email format tips */}
                    {formData.email && !emailValidation.isValid && (
                      <div className="text-xs text-slate-500 mt-1 space-y-1">
                        <p>• Email should include @ symbol</p>
                        <p>• Domain should include a dot (e.g., .com, .org)</p>
                        <p>• No spaces or special characters except . _ -</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className={`h-12 pr-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 ${
                          mode === "signup" && formData.password ? (
                            passwordValidation.score >= 80 ? "border-green-300 focus:border-green-500 focus:ring-green-500" :
                            passwordValidation.score >= 60 ? "border-blue-300 focus:border-blue-500 focus:ring-blue-500" :
                            "border-red-300 focus:border-red-500 focus:ring-red-500"
                          ) : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator - Only show in signup mode */}
                    {mode === "signup" && formData.password && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-600">Password Strength</span>
                          <Badge 
                            variant={passwordValidation.score >= 60 ? "default" : "destructive"}
                            className={`text-xs ${
                              passwordValidation.score >= 80 ? "bg-green-100 text-green-800" :
                              passwordValidation.score >= 60 ? "bg-blue-100 text-blue-800" :
                              passwordValidation.score >= 40 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}
                          >
                            {passwordValidation.strength}
                          </Badge>
                        </div>
                        <Progress 
                          value={passwordValidation.score} 
                          className={`h-2 ${passwordValidation.color.replace('bg-', 'bg-opacity-20 border-')}`}
                        />
                        
                        {/* Password Requirements */}
                        <div className="grid grid-cols-1 gap-1 mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.length ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.length ? "text-green-600" : "text-red-500"}>
                              At least 8 characters
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.uppercase ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.uppercase ? "text-green-600" : "text-red-500"}>
                              One uppercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.lowercase ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.lowercase ? "text-green-600" : "text-red-500"}>
                              One lowercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.numbers ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.numbers ? "text-green-600" : "text-red-500"}>
                              One number
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.special ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.special ? "text-green-600" : "text-red-500"}>
                              One special character
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field - Only in signup mode */}
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                          className={`h-12 pr-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 ${
                            formData.confirmPassword && formData.password !== formData.confirmPassword 
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Password Match Indicator */}
                      {formData.confirmPassword && (
                        <div className="flex items-center gap-2 text-xs mt-1">
                          {formData.password === formData.confirmPassword ? 
                            <CheckCircle className="h-3 w-3 text-green-500" /> :
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          }
                          <span className={formData.password === formData.confirmPassword ? "text-green-600" : "text-red-500"}>
                            {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords don't match"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connect Wallet */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {walletAddress ? "Wallet Connected" : "Connect Wallet (Optional)"}
                    </Label>
                    {walletAddress ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <Wallet className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700 font-mono">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleConnectWallet}
                        disabled={loading}
                        className="w-full h-12 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect MetaMask Wallet
                      </Button>
                    )}
                    <p className="text-xs text-slate-500">
                      Connect your wallet to enable blockchain-based identity verification
                    </p>
                  </div>

                  {/* Forgot Password Link (Login Mode) */}
                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-secondary hover:text-secondary/80 hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 mt-6 font-semibold bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || (mode === "signup" && (
                      !formData.email || 
                      !emailValidation.isValid ||
                      !formData.password || 
                      !formData.confirmPassword ||
                      !formData.fullName ||
                      formData.password !== formData.confirmPassword ||
                      passwordValidation.score < 60
                    )) || (mode === "login" && (
                      !formData.email ||
                      !emailValidation.isValid ||
                      !formData.password
                    ))}
                  >
                    {loading ? (
                      "Please wait..."
                    ) : mode === "login" ? (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
                
                {/* Social Proof (Mobile) */}
                <div className="lg:hidden mt-6 text-center">
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">4.9/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">10K+ Users</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Terms (Signup Mode) */}
            {mode === "signup" && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-secondary hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-secondary hover:underline">Privacy Policy</a>
              </p>
            )}
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="hidden lg:block p-6 border-t border-border">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;







