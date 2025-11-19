import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile, uploadProfilePicture } from "@/services/auth";
import { Edit, Upload, X } from "lucide-react";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface EditProfileDialogProps {
  profile: any;
  onSuccess?: () => void;
}

export const EditProfileDialog = ({ profile, onSuccess }: EditProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDescription(profile.description || "");
      setPhotoPreview(profile.photoURL || null);
    }
  }, [profile]);

  const handlePhotoChange = async () => {
    try {
      // On native platforms, use the Camera plugin for photo library access only
      if (Capacitor.isNativePlatform()) {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos, // Only photo library, no camera
        });

        if (image.dataUrl) {
          // Convert data URL to File for upload
          const response = await fetch(image.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });

          if (file.size > 5 * 1024 * 1024) {
            toast({
              title: "Error",
              description: "Image must be less than 5MB",
              variant: "destructive",
            });
            return;
          }

          setPhotoFile(file);
          setPhotoPreview(image.dataUrl);
        }
      } else {
        // On web, use the standard file input
        fileInputRef.current?.click();
      }
    } catch (error: any) {
      console.error('[EditProfileDialog] Error selecting photo:', error);
      // User cancelled or error occurred
      if (error.message && !error.message.includes('cancelled')) {
        toast({
          title: "Error",
          description: "Failed to select photo. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleWebPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(profile?.photoURL || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('[EditProfileDialog] Starting profile update...', {
        hasPhotoFile: !!photoFile,
        name: name.trim(),
        description: description.trim()
      });

      let photoURL = profile?.photoURL;

      // Upload photo if changed - make this optional, don't block the update
      if (photoFile) {
        try {
          console.log('[EditProfileDialog] Uploading photo...');
          photoURL = await uploadProfilePicture(user.uid, photoFile);
          console.log('[EditProfileDialog] Photo uploaded successfully:', photoURL);
        } catch (uploadError: any) {
          console.error('[EditProfileDialog] Photo upload failed, continuing anyway:', uploadError);
          toast({
            title: "Photo upload failed",
            description: "Saving other changes...",
            variant: "destructive",
          });
        }
      }

      const updates = {
        name: name.trim(),
        description: description.trim(),
      };

      if (photoURL) {
        Object.assign(updates, { photoURL });
      }

      console.log('[EditProfileDialog] Updating profile with:', updates);
      await updateUserProfile(user.uid, updates);

      console.log('[EditProfileDialog] Profile updated successfully!');

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      setOpen(false);

      // Always call onSuccess to refresh the profile data
      if (onSuccess) {
        console.log('[EditProfileDialog] Calling onSuccess to refresh profile');
        onSuccess();
      }
    } catch (error: any) {
      console.error('[EditProfileDialog] Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-racing-red/10 border-racing-red/40 hover:bg-racing-red/20 text-white">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] sm:w-full bg-black/95 border-2 border-racing-red/40">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-white font-semibold">Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-black/60 border-2 border-racing-red/40 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-2xl font-bold text-racing-red">
                    {(name || profile?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWebPhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePhotoChange}
                  className="gap-2 bg-racing-red/10 border-racing-red/40 hover:bg-racing-red/20 text-white"
                >
                  <Upload className="w-4 h-4" />
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {photoFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removePhoto}
                    className="gap-2 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Recommended: Square image, max 5MB
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-semibold">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              required
              className="bg-black/60 border-racing-red/40 text-white placeholder:text-gray-500 focus:border-racing-red"
            />
            <p className="text-xs text-gray-400">
              {name.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white font-semibold">Bio</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about yourself and your love for F1..."
              className="min-h-[100px] resize-none bg-black/60 border-racing-red/40 text-white placeholder:text-gray-500 focus:border-racing-red"
              maxLength={500}
            />
            <p className="text-xs text-gray-400">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-racing-red hover:bg-racing-red/80 text-white font-semibold"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
