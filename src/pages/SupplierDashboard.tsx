import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Settings,
  Droplet,
  LogOut,
  Gauge,
  MapPin,
  Clock,
  Zap,
  CheckCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SupplierDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [supplierStatus, setSupplierStatus] = useState<string>('pending');
  const [stats, setStats] = useState({
    waterQuality: 98.5,
    dailySupply: 45000,
    activeConnections: 1240,
    systemEfficiency: 94.2,
    maintenanceAlerts: 3
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    checkSupplierRole();
  }, [user, navigate]);

  const checkSupplierRole = async () => {
    if (!user) return;
    
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', user.id)
        .eq('role', 'supplier')
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have supplier privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setSupplierStatus(roleData.status);
      
      if (roleData.status !== 'approved') {
        toast({
          title: "Account Pending",
          description: "Your supplier account is awaiting admin approval.",
          variant: "default",
        });
      }
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Droplet className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading Supplier Dashboard...</p>
        </div>
      </div>
    );
  }

  if (supplierStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-secondary-foreground" />
            </div>
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your supplier account is currently under review by our administrators.
              You'll receive access once approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="secondary" className="text-sm">
              Status: {supplierStatus}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                <Droplet className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <Building2 className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Supplier Dashboard</h1>
                <p className="text-sm text-muted-foreground">Water Distribution Management</p>
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
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Water Quality</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waterQuality}%</div>
              <p className="text-xs text-muted-foreground">Quality score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Supply</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dailySupply.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Liters today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConnections}</div>
              <p className="text-xs text-muted-foreground">Active households</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.systemEfficiency}%</div>
              <p className="text-xs text-muted-foreground">System efficiency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maintenanceAlerts}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribution Network Status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution Network</CardTitle>
              <CardDescription>Current status of water distribution infrastructure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Main Pipeline A</p>
                    <p className="text-sm text-muted-foreground">Sector 1-5</p>
                  </div>
                </div>
                <Badge variant="default">Operational</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Main Pipeline B</p>
                    <p className="text-sm text-muted-foreground">Sector 6-10</p>
                  </div>
                </div>
                <Badge variant="secondary">Maintenance</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Pump Station 1</p>
                    <p className="text-sm text-muted-foreground">Central District</p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Storage Tank A</p>
                    <p className="text-sm text-muted-foreground">85% Capacity</p>
                  </div>
                </div>
                <Badge variant="default">Optimal</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Alert Details */}
          <div className="space-y-6">
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                  <AlertTriangle className="w-5 h-5" />
                  Maintenance Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">Pipeline B Pressure Drop</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Detected 15% pressure reduction in Main Pipeline B affecting Sectors 6-10. 
                  Scheduled maintenance required within 48 hours.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Reported: 2 hours ago</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertTriangle className="w-5 h-5" />
                  Quality Warning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">Chlorine Level Below Optimal</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Chlorine levels in Sector 3 have dropped to 0.6 mg/L. 
                  Recommended range is 0.8-1.2 mg/L for optimal disinfection.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Reported: 1 hour ago</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">Pump Station 2 Offline</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Emergency shutdown detected at Pump Station 2. Backup systems activated. 
                  Technical team dispatched for immediate inspection.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Reported: 30 minutes ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupplierDashboard;