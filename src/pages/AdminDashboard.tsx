import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Building2, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Settings,
  Shield,
  Droplet,
  LogOut,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserRole {
  id: string;
  role: string;
  status: string;
  user_id: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  profiles?: {
    user_id: string;
    full_name: string;
    phone: string;
    location: string;
  } | null;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeSuppliers: 0,
    systemAlerts: 2
  });

  // useEffect(() => {
  //   if (!user) {
  //     navigate("/auth");
  //     return;
  //   }
    
  //   checkAdminRole();
  //   fetchUserRoles();
  // }, [user, navigate]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, status')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('status', 'approved')
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchUserRoles = async () => {
    try {
      // First get user roles
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Then get profiles for these users
      const userIds = userRolesData?.map(role => role.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, location')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const combinedData = userRolesData?.map(role => ({
        ...role,
        profiles: profilesData?.find(profile => profile.user_id === role.user_id) || null
      })) || [];

      setUserRoles(combinedData);
      
      // Calculate stats
      const totalUsers = combinedData?.length || 0;
      const pendingApprovals = combinedData?.filter(role => role.status === 'pending').length || 0;
      const activeSuppliers = combinedData?.filter(role => role.role === 'supplier' && role.status === 'approved').length || 0;
      
      setStats({
        totalUsers,
        pendingApprovals,
        activeSuppliers,
        systemAlerts: 2 // Mock data
      });
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

  const handleApproveUser = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User approved successfully.",
      });
      
      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: 'rejected' })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User rejected.",
      });
      
      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
  //         <p className="text-muted-foreground">Loading Admin Dashboard...</p>
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
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Administration</p>
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
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
              <p className="text-xs text-muted-foreground">Approved suppliers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.systemAlerts}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Review and manage user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {userRole.profiles?.full_name || "Unknown User"}
                      </h4>
                      <Badge variant={userRole.role === 'admin' ? 'default' : userRole.role === 'supplier' ? 'secondary' : 'outline'}>
                        {userRole.role}
                      </Badge>
                      <Badge variant={
                        userRole.status === 'approved' ? 'default' : 
                        userRole.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }>
                        {userRole.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Location: {userRole.profiles?.location || "Not specified"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phone: {userRole.profiles?.phone || "Not provided"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registered: {new Date(userRole.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {userRole.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveUser(userRole.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectUser(userRole.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {userRoles.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No user registrations found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;