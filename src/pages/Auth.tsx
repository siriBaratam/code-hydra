import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Droplet, Eye, EyeOff, Shield, Truck, Users, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type AppRole = 'admin' | 'supplier' | 'user';
type AuthMode = 'landing' | 'signin' | 'signup';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('landing');
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  // Address fields for users
  const [doorNumber, setDoorNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setLocation('');
    setDoorNumber('');
    setStreet('');
    setArea('');
    setCity('');
    setPincode('');
  };

  const checkAddressExists = async (doorNumber: string, street: string, area: string, city: string, pincode: string) => {
    const { data, error } = await supabase.rpc('check_address_exists', {
      _door_number: doorNumber,
      _street: street,
      _area: area,
      _city: city,
      _pincode: pincode
    });
    
    if (error) {
      console.error('Error checking address:', error);
      return false;
    }
    
    return data;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    // For user role, check address validation
    if (selectedRole === 'user') {
      if (!doorNumber || !street || !area || !city || !pincode) {
        toast({
          title: 'Error',
          description: 'Please fill in all address fields',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      const addressExists = await checkAddressExists(doorNumber, street, area, city, pincode);
      
      if (addressExists) {
        setLoading(false);
        toast({
          title: 'Registration Blocked',
          description: 'An account already exists for this household. Multiple users from the same address are not allowed.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (!loading) setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      // Add user role after successful signup
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && selectedRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userData.user.id,
            role: selectedRole,
            status: selectedRole === 'admin' ? 'approved' : 'pending',
          });

        if (roleError) {
          console.error('Error adding user role:', roleError);
        }

        // Update profile with additional info
        const profileUpdateData: any = {
          phone,
          location,
        };

        // Add address fields for user role
        if (selectedRole === 'user') {
          profileUpdateData.door_number = doorNumber;
          profileUpdateData.street = street;
          profileUpdateData.area = area;
          profileUpdateData.city = city;
          profileUpdateData.pincode = pincode;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdateData)
          .eq('user_id', userData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      toast({
        title: 'Success!',
        description: 'Account created successfully. Please check your email to confirm your account.',
      });
      
      setMode('signin');
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to AquaGuard.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setMode('signin');
    resetForm();
  };

  const goToSignUp = () => {
    setMode('signup');
    resetForm();
  };

  const goBack = () => {
    if (mode === 'signin' || mode === 'signup') {
      setMode('landing');
      setSelectedRole(null);
      resetForm();
    }
  };

  const getRoleConfig = (role: AppRole) => {
    const configs = {
      admin: {
        title: 'Administrator',
        description: 'System administration and management',
        icon: Shield,
        color: 'bg-red-500 hover:bg-red-600',
      },
      supplier: {
        title: 'Water Supplier',
        description: 'Water supply management and monitoring',
        icon: Truck,
        color: 'bg-blue-500 hover:bg-blue-600',
      },
      user: {
        title: 'Household User',
        description: 'Water quality monitoring for your home',
        icon: Users,
        color: 'bg-green-500 hover:bg-green-600',
      },
    };
    return configs[role];
  };

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Droplet className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">AquaGuard</CardTitle>
            <CardDescription>
              Choose your role to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['admin', 'supplier', 'user'] as AppRole[]).map((role) => {
                const config = getRoleConfig(role);
                
                return (
                  <Button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    variant="outline"
                    className="w-full justify-start h-12"
                  >
                    {config.title}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Droplet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="w-16"></div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {selectedRole && getRoleConfig(selectedRole).title}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location"
                    required
                  />
                </div>

                {selectedRole === 'user' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Address Details</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            placeholder="Door Number"
                            value={doorNumber}
                            onChange={(e) => setDoorNumber(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Input
                        placeholder="Area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-sm text-primary hover:underline"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {mode === 'signup' && selectedRole === 'supplier' && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Supplier accounts require admin approval before access is granted.
              </p>
            </div>
          )}

          {mode === 'signup' && selectedRole === 'user' && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Only one account per household address is allowed to ensure accurate water quality monitoring.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;