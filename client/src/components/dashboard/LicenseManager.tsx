import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Eye, EyeOff, Key, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LicenseManagerProps {
  licenseKey?: string;
  plan: string;
  apiCallsLeft: number;
  expiryDate?: Date | null;
}

export const LicenseManager: React.FC<LicenseManagerProps> = ({
  licenseKey,
  plan,
  apiCallsLeft,
  expiryDate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showLicenseKey, setShowLicenseKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLicenseKey, setCurrentLicenseKey] = useState(licenseKey);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "License key has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy license key. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const generateLicenseKey = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-license', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setCurrentLicenseKey(data.data.licenseKey);
        toast({
          title: "License Key Generated",
          description: "Your new license key has been generated successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate license key",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatExpiryDate = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    const now = new Date();
    const expiry = new Date(date);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  const getStatusColor = () => {
    if (plan === 'free') return 'bg-gray-500';
    if (apiCallsLeft === 0) return 'bg-red-500';
    if (apiCallsLeft < 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="luxury-card golden-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Key className="w-5 h-5 text-black" />
            </div>
            <div>
              <CardTitle className="text-gradient">License Management</CardTitle>
              <CardDescription className="text-yellow-200/70">
                Manage your AI tool license and activation
              </CardDescription>
            </div>
          </div>
          
          <Badge className={`${getStatusColor()} text-white`}>
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-400/30">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-gold font-medium text-sm">API Calls</span>
            </div>
            <p className="text-2xl font-bold text-gradient">{apiCallsLeft}</p>
            <p className="text-yellow-200/70 text-xs">remaining</p>
          </div>

          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-400/30">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-gold" />
              <span className="text-gold font-medium text-sm">License Status</span>
            </div>
            <p className="text-sm font-semibold text-gradient">
              {formatExpiryDate(expiryDate)}
            </p>
            {expiryDate && (
              <p className="text-yellow-200/70 text-xs">
                {new Date(expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* License Key Section */}
        {plan !== 'free' ? (
          <div className="space-y-4">
            <Label className="text-gold font-medium">Your License Key</Label>
            
            {currentLicenseKey ? (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type={showLicenseKey ? 'text' : 'password'}
                      value={currentLicenseKey}
                      readOnly
                      className="bg-yellow-900/20 border-yellow-400/30 text-gold font-mono text-sm"
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowLicenseKey(!showLicenseKey)}
                    className="border-yellow-400/30 text-gold hover:bg-yellow-900/30"
                  >
                    {showLicenseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(currentLicenseKey)}
                    className="border-yellow-400/30 text-gold hover:bg-yellow-900/30"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">
                    <strong>Important:</strong> Use this license key in your AI tool to activate all features. 
                    Keep it secure and do not share it with others.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4 text-center">
                  <Key className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-gold font-medium mb-2">No License Key Generated</p>
                  <p className="text-yellow-200/70 text-sm mb-4">
                    Generate your license key to activate the AI tool
                  </p>
                  
                  <Button
                    onClick={generateLicenseKey}
                    disabled={isGenerating}
                    className="btn-luxury"
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Generate License Key
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Usage Instructions */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
              <h4 className="text-gold font-medium mb-3">How to use your license:</h4>
              <ol className="text-yellow-200/70 text-sm space-y-2 list-decimal list-inside">
                <li>Download the AI tool from the download section</li>
                <li>Launch the tool on your computer</li>
                <li>Enter your license key when prompted</li>
                <li>The tool will validate your license and activate all features</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="bg-orange-900/20 border border-orange-400/30 rounded-lg p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-orange-200 font-medium mb-2">Free Plan Limitations</p>
            <p className="text-orange-200/70 text-sm mb-4">
              The free plan allows tool download but requires a paid subscription for activation.
            </p>
            <Button
              onClick={() => window.location.href = '/pricing'}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Upgrade to Activate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};