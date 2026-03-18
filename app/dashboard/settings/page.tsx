"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, User, Save, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    phone: "",
    bio: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || user.name || "",
        company_name: user.company_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const userInitials = formData.full_name
    ? formData.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display-cartoon text-3xl text-slate-900 flex items-center gap-3"> 
          Settings 
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your account and profile settings
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-neutral-50"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.avatar_url} alt={formData.full_name} />
                  <AvatarFallback className="text-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar_url: e.target.value })
                    }
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1 max-w-md"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a URL to your profile picture
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    placeholder="Design Studio Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder=" +94 123 456 789" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself and your design expertise..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief description about yourself (optional)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="cartoon-button bg-[#b0664c] text-white hover:bg-[#b0664c] rounded-full font-bold"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Profile updated!</span>
                  </motion.div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
     
      </motion.div>
    </div>
  );
}
