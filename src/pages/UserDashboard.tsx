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
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyUsage.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Liters this month</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{Math.abs(stats.weeklyTrend)}% less than last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Water Quality</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waterQuality}%</div>
              <p className="text-xs text-muted-foreground">Quality score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Flow</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentFlow}</div>
              <p className="text-xs text-muted-foreground">L/min active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conservation</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conservationScore}</div>
              <p className="text-xs text-muted-foreground">Eco score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.costSavings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Usage Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>Your water consumption patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Kitchen</span>
                  <span className="text-sm">850L (35%)</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bathroom</span>
                  <span className="text-sm">1,200L (49%)</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '49%' }}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Laundry</span>
                  <span className="text-sm">250L (10%)</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Garden</span>
                  <span className="text-sm">150L (6%)</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Great job! You're using 8.5% less water than last week.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Conservation Tips & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Conservation Center</CardTitle>
              <CardDescription>Tips and alerts for better water management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
      </main>
    </div>
  );
};

export default UserDashboard;