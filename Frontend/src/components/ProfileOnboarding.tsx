import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, Camera, Shield, Plus, MapPin, Globe, Phone, Calendar, 
  Check, ArrowRight, Award, Star, AlertCircle, Info, Zap 
} from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'profile' | 'security' | 'social' | 'features';
}

interface ProfileOnboardingProps {
  profile: UserProfile | null;
  onCompleteStep: (stepId: string) => void;
  onNavigateToProfile: () => void;
  onOpenProfileEditModal: (field: string, label: string) => void;
}

export const ProfileOnboarding = ({ 
  profile, 
  onCompleteStep, 
  onNavigateToProfile,
  onOpenProfileEditModal
}: ProfileOnboardingProps) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'profile' | 'security' | 'social' | 'features'>('all');

  if (!profile) return null;

  const calculateProfileCompletion = (): number => {
    let completion = 0;
    const fields = [
      profile.full_name && profile.full_name !== '',
      profile.display_name && profile.display_name !== '',
      profile.bio && profile.bio !== '',
      profile.avatar_url && profile.avatar_url !== '' && !profile.avatar_url.includes('images.unsplash.com'),
      profile.location && profile.location !== '',
      profile.website && profile.website !== '',
      profile.phone && profile.phone !== '',
      profile.date_of_birth && profile.date_of_birth !== ''
    ];
    
    const completedFields = fields.filter(Boolean).length;
    completion = (completedFields / 8) * 100;
    
    return Math.round(completion);
  };

  const steps: OnboardingStep[] = [
    // Profile Setup
    {
      id: 'avatar',
      title: 'Upload Profile Picture',
      description: 'Add a personal photo to make your profile more recognizable',
      completed: profile.avatar_url && !profile.avatar_url.includes('images.unsplash.com'),
      required: true,
      action: 'Upload Photo',
      icon: Camera,
      category: 'profile'
    },
    {
      id: 'display_name',
      title: 'Set Display Name',
      description: 'Choose how others will see you on the platform',
      completed: profile.display_name && profile.display_name !== profile.email?.split('@')[0],
      required: true,
      action: 'Edit Profile',
      icon: User,
      category: 'profile'
    },
    {
      id: 'bio',
      title: 'Write a Bio',
      description: 'Tell others about yourself and what you do',
      completed: profile.bio && profile.bio.trim() !== '',
      required: false,
      action: 'Add Bio',
      icon: User,
      category: 'profile'
    },
    {
      id: 'location',
      title: 'Add Location',
      description: 'Help us provide location-specific protection',
      completed: profile.location && profile.location.trim() !== '',
      required: false,
      action: 'Add Location',
      icon: MapPin,
      category: 'profile'
    },
    {
      id: 'website',
      title: 'Add Website',
      description: 'Link your personal or professional website',
      completed: profile.website && profile.website.trim() !== '',
      required: false,
      action: 'Add Website',
      icon: Globe,
      category: 'profile'
    },
    {
      id: 'phone',
      title: 'Add Phone Number',
      description: 'For account recovery and important notifications',
      completed: profile.phone && profile.phone.trim() !== '',
      required: false,
      action: 'Add Phone',
      icon: Phone,
      category: 'profile'
    },
    {
      id: 'birthday',
      title: 'Add Date of Birth',
      description: 'For age verification and personalized content',
      completed: profile.date_of_birth && profile.date_of_birth !== '',
      required: false,
      action: 'Add Birthday',
      icon: Calendar,
      category: 'profile'
    },
    // Security
    {
      id: 'blockchain_identity',
      title: 'Set Up Blockchain Identity',
      description: 'Secure your identity with blockchain verification',
      completed: true, // For demo purposes, assume completed
      required: true,
      action: 'Setup Identity',
      icon: Shield,
      category: 'security'
    },
    // Social
    {
      id: 'first_social',
      title: 'Add First Social Handle',
      description: 'Start monitoring your first social media account',
      completed: true, // For demo purposes, assume completed
      required: true,
      action: 'Add Social Handle',
      icon: Plus,
      category: 'social'
    },
    // Features
    {
      id: 'notifications',
      title: 'Configure Notifications',
      description: 'Set up how you want to receive alerts',
      completed: true, // For demo purposes, assume completed
      required: false,
      action: 'Setup Alerts',
      icon: AlertCircle,
      category: 'features'
    },
    {
      id: 'security_settings',
      title: 'Adjust Security Settings',
      description: 'Customize your protection preferences',
      completed: true, // For demo purposes, assume completed
      required: false,
      action: 'Configure Security',
      icon: Shield,
      category: 'security'
    }
  ];

  const filteredSteps = activeCategory === 'all' 
    ? steps 
    : steps.filter(step => step.category === activeCategory);

  const requiredSteps = steps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed);
  const overallCompletion = calculateProfileCompletion();
  const isOnboardingComplete = completedRequiredSteps.length === requiredSteps.length;

  const getStepIcon = (step: OnboardingStep) => {
    const IconComponent = step.icon;
    return step.completed ? (
      <Check className="h-5 w-5 text-green-600" />
    ) : (
      <IconComponent className="h-5 w-5 text-muted-foreground" />
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile': return <User className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'social': return <Plus className="h-4 w-4" />;
      case 'features': return <Zap className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const handleStepAction = (step: OnboardingStep) => {
    if (step.id === 'avatar') {
      // Trigger the file upload directly
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      } else {
        // Fallback: navigate to profile if file input not found
        onNavigateToProfile();
      }
    } else if (step.id === 'display_name') {
      onNavigateToProfile();
    } else if (['bio', 'location', 'website', 'phone', 'birthday'].includes(step.id)) {
      // Use modal for these fields with auto-scroll
      const fieldMap = {
        bio: 'Bio',
        location: 'Location', 
        website: 'Website',
        phone: 'Phone Number',
        birthday: 'Date of Birth'
      };
      onOpenProfileEditModal(step.id, fieldMap[step.id as keyof typeof fieldMap]);
      
      // Auto-scroll to bottom after modal opens
      setTimeout(() => {
        if (window.innerHeight + window.scrollY < document.body.offsetHeight - 100) {
          window.scrollTo({ top: document.body.offsetHeight, behavior: 'smooth' });
        }
      }, 100);
    } else {
      onCompleteStep(step.id);
    }
  };

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOnboardingComplete ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {isOnboardingComplete ? <Award className="h-5 w-5" /> : <Star className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-lg">
                {isOnboardingComplete ? 'Profile Setup Complete!' : 'Complete Your Profile'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isOnboardingComplete 
                  ? 'Your profile is fully set up and ready to protect your digital identity'
                  : `Complete ${requiredSteps.length - completedRequiredSteps.length} more steps to unlock full protection`
                }
              </p>
            </div>
          </div>
          <Badge variant={isOnboardingComplete ? "default" : "secondary"} className="text-sm px-3 py-1">
            {overallCompletion}% Complete
          </Badge>
        </div>
        <Progress value={overallCompletion} className="h-2 mt-4" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'profile', 'security', 'social', 'features'].map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category as 'all' | 'profile' | 'security' | 'social' | 'features')}
              className="text-xs"
            >
              {category === 'all' ? 'All Steps' : category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {filteredSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                step.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${step.completed ? 'text-green-900' : 'text-foreground'}`}>
                    {step.title}
                  </h4>
                  {step.required && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      Required
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(step.category)}
                    <span className="text-xs text-muted-foreground capitalize">{step.category}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {!step.completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStepAction(step)}
                    className="text-xs"
                  >
                    {step.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
                {step.completed && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {isOnboardingComplete && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">🎉 Congratulations!</h4>
                <p className="text-sm text-green-800">
                  Your profile is complete and you're ready to protect your digital identity. 
                  You now have access to all premium features and maximum protection.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};