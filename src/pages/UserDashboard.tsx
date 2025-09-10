import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Droplets, 
  Activity, 
  TrendingDown, 
  TrendingUp,
  Leaf,
  Droplet,
  LogOut,
  Gauge,
  Calendar,
  Clock,
  Award,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<string>('pending');
  const [stats, setStats] = useState({
    monthlyUsage: 2450,
    waterQuality: 98.5,
    currentFlow: 12.5,
    conservationScore: 87,
    costSavings: 45.20,
    weeklyTrend: -8.5
  });

  // useEffect(() => {
  //   if (!user) {
  //     navigate("/auth");
  //     return;
  //   }
    
  //   checkUserRole();
  // }, [user, navigate]);

  const checkUserRole = async () => {
    if (!user) return;
    
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', user.id)
        .eq('role', 'user')
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have user privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setUserStatus(roleData.status);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // if (loading) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-background">
  //       <div className="text-center">
  //         <Droplet className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
  //         <p className="text-muted-foreground">Loading User Dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">My Water Dashboard</h1>
                <p className="text-sm text-muted-foreground">Personal Water Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <Droplet className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 border border-blue-100/60 p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100/80 rounded-full backdrop-blur-sm border border-blue-200/50">
                <Droplets className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-slate-800">Empower Every Drop</h2>
            <p className="text-lg text-slate-600 mb-4">Monitor. Conserve. Thrive.</p>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              Join thousands of users making a difference. Your water conservation efforts contribute to a sustainable future for our community and planet.
            </p>
          </div>
          <div className="absolute top-4 right-4 opacity-10">
            <Leaf className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10">
            <Droplet className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {/* Vertical Stats Cards */}
          <div className="lg:col-span-1 xl:col-span-1">
            <div className="space-y-4">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto p-3 bg-blue-50 rounded-full w-fit mb-2 group-hover:bg-blue-100 transition-colors">
                    <Droplets className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Usage</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="text-2xl font-bold mb-1">{stats.monthlyUsage.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mb-2">Liters this month</p>
                  <div className="flex items-center justify-center">
                    <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">{Math.abs(stats.weeklyTrend)}% less</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto p-3 bg-emerald-50 rounded-full w-fit mb-2 group-hover:bg-emerald-100 transition-colors">
                    <Activity className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Water Quality</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="text-2xl font-bold mb-1">{stats.waterQuality}%</div>
                  <p className="text-xs text-muted-foreground">Quality score</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto p-3 bg-cyan-50 rounded-full w-fit mb-2 group-hover:bg-cyan-100 transition-colors">
                    <Gauge className="h-6 w-6 text-cyan-600" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Flow</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="text-2xl font-bold mb-1">{stats.currentFlow}</div>
                  <p className="text-xs text-muted-foreground">L/min active</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto p-3 bg-green-50 rounded-full w-fit mb-2 group-hover:bg-green-100 transition-colors">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Conservation</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="text-2xl font-bold mb-1">{stats.conservationScore}</div>
                  <p className="text-xs text-muted-foreground">Eco score</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto p-3 bg-teal-50 rounded-full w-fit mb-2 group-hover:bg-teal-100 transition-colors">
                    <TrendingDown className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Savings</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="text-2xl font-bold mb-1">${stats.costSavings}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Conservation Center */}
          <div className="lg:col-span-2 xl:col-span-3">
            {/* Conservation Tips & Alerts */}
            <Card>
            <CardHeader>
              <CardTitle>Conservation Center</CardTitle>
              <CardDescription>Tips and alerts for better water management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">Conservation Achievement!</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      You've saved 150L this week compared to your average.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Water-Saving Tip</p>
                    <p className="text-sm text-muted-foreground">
                      Fix that leaky faucet! Even small drips can waste up to 3,000L per year.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">Quality Notice</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Temporary maintenance scheduled for your area tomorrow 2-4 PM.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Conservation Challenge</p>
                    <p className="text-sm text-muted-foreground">
                      Join this month's "Shower Smart" challenge and save up to 20% on usage.
                    </p>
                    <Button size="sm" className="mt-2">Join Challenge</Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Eco Rank</span>
                  <Badge variant="default">#15 in Neighborhood</Badge>
                </div>
              </div>
            </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;