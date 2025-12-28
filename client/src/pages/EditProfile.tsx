import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";
import { getSessionToken, emitSessionChange } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Upload, X, Camera } from "lucide-react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequestV2 } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AnimatedBackground from "@/components/AnimatedBackground";
import { discordAuthUrl } from "@/lib/constants";
import { xAuthUrl } from "@/lib/generateXAuthUrl";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || user?.username || "User",
    socialProfiles: {
      x: { connected: false, username: "" },
      discord: { connected: false, username: "" }
    }
  });

  // Load existing profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || user.username || "User",
        socialProfiles: user.socialProfiles ?? {
          x: { connected: false, username: "" },
          discord: { connected: false, username: "" }
        }
      });
      // Set initial avatar preview
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const handleSave = async () => {
  try {
    let avatarUrl = user?.avatar || '';

    // Upload new avatar if selected
    if ((profileData as any).avatarFile) {
      const file: File = (profileData as any).avatarFile;
      avatarUrl = await uploadFile(file, `avatars/${user?.id ?? 'guest'}`);
    }

    const updatePayload = {
      username: profileData.displayName,
      avatar: avatarUrl,
      socialProfiles: profileData.socialProfiles,
    };

    // Send update to backend
    await apiRequestV2('PATCH', '/api/user/update', updatePayload);

    // Optimistically update local user context immediately
    // updateUserContext({
    //   ...user,
    //   displayName: profileData.displayName,
    //   avatar: avatarUrl,
    //   socialProfiles: profileData.socialProfiles,
    // });

    // Emit session change to backend if needed
    // await emitSessionChange();

    // Show toast and navigate
    toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
    setLocation("/profile");
    window.location.reload();
  } catch (e) {
    console.error('Profile update error:', e);
    toast({ title: "Update failed", description: String(e), variant: "destructive" });
  }
};

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 2MB", variant: "destructive" });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setProfileData(prev => ({ ...prev, avatarFile: file }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setProfileData(prev => ({ ...prev, avatarFile: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConnect = (service: "x" | "discord") => {
    // Redirect to actual social media connection sites
    const urls = {
      x: xAuthUrl,
      discord: discordAuthUrl
    };

    toast({
      title: `Connecting to ${service}`,
      description: `Opening ${service} authentication...`,
    });

    // Open in new tab for OAuth flow
    window.open(urls[service]);
  };

  const handleDisconnect = (service: "x" | "discord") => {
    setProfileData(prev => ({
      ...prev,
      socialProfiles: {
        ...prev.socialProfiles,
        [service]: { connected: false, username: "" }
      }
    }));
    toast({
      title: `Disconnected from ${service}`,
      description: `Your ${service} account has been disconnected.`,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative" data-testid="edit-profile-page">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm" data-testid="button-back-to-profile">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
          </div>
          <Button onClick={handleSave} data-testid="button-save-profile">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  data-testid="input-display-name"
                />
            </div>

            <Separator className="my-6" />

            {/* Avatar Upload Section */}
            <div className="space-y-3">
              <Label>Profile Picture</Label>
              
              <div className="flex items-start gap-6">
                {/* Current Avatar Preview */}
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-border">
                    <AvatarImage src={avatarPreview || user?.avatar || ""} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {(profileData.displayName || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {avatarPreview && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                      title="Remove avatar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Upload Area */}
                <div className="flex-1">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
                      ${isDragging 
                        ? 'border-primary bg-primary/5 scale-[1.02]' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Profiles */}
        <Card>
          <CardHeader>
            <CardTitle>Social Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Twitter/X */}
            <div className="flex items-center justify-between" data-testid="x-connection">
              <div className="flex items-center space-x-3">
                <FaTwitter className="w-6 h-6 text-[#1DA1F2]" />
                <div>
                  <p className="font-medium">X (Formerly Twitter)</p>
                  {profileData.socialProfiles.x.connected ? (
                    <p className="text-sm text-muted-foreground">@{profileData.socialProfiles.x.username}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>
              {profileData.socialProfiles.x.connected ? (
                <Button 
                  variant="outline" 
                  onClick={() => handleDisconnect("x")}
                  data-testid="button-disconnect-x"
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  onClick={() => handleConnect("x")}
                  data-testid="button-connect-x"
                >
                  Connect
                </Button>
              )}
            </div>

            <Separator />

            {/* Discord */}
            <div className="flex items-center justify-between" data-testid="discord-connection">
              <div className="flex items-center space-x-3">
                <FaDiscord className="w-6 h-6 text-[#5865F2]" />
                <div>
                  <p className="font-medium">Discord</p>
                  {profileData.socialProfiles.discord.connected ? (
                    <p className="text-sm text-muted-foreground">@{profileData.socialProfiles.discord.username}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>
              {profileData.socialProfiles.discord.connected ? (
                <Button 
                  variant="outline" 
                  onClick={() => handleDisconnect("discord")}
                  data-testid="button-disconnect-discord"
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  onClick={() => handleConnect("discord")}
                  data-testid="button-connect-discord"
                >
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}