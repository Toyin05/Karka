import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Shield, Bell, History, User, Settings, LogOut, Home, Users, Menu, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session && location.pathname !== "/auth") {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        // Check if user is admin
        setTimeout(() => {
          checkAdminStatus(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      setIsAdmin(hasAdminRole || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-secondary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button - Fixed Position */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'lg:translate-x-0' : ''}
      `}>
        <div className="p-6 border-b border-border lg:pt-20 lg:pt-6">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-secondary" />
            <span className="text-2xl font-bold">KARKA</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 lg:pt-6">
          <NavLink
            to="/dashboard"
            end
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            activeClassName="bg-secondary/10 text-secondary font-medium"
            onClick={closeSidebar}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/alerts"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            activeClassName="bg-secondary/10 text-secondary font-medium"
            onClick={closeSidebar}
          >
            <Bell className="h-5 w-5" />
            <span>Alerts</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/sources"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            activeClassName="bg-secondary/10 text-secondary font-medium"
            onClick={closeSidebar}
          >
            <Settings className="h-5 w-5" />
            <span>Sources</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/history"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            activeClassName="bg-secondary/10 text-secondary font-medium"
            onClick={closeSidebar}
          >
            <History className="h-5 w-5" />
            <span>History</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            activeClassName="bg-secondary/10 text-secondary font-medium"
            onClick={closeSidebar}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/dashboard/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              activeClassName="bg-secondary/10 text-secondary font-medium"
              onClick={closeSidebar}
            >
              <Users className="h-5 w-5" />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full lg:ml-0">
        <div className="lg:pl-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
