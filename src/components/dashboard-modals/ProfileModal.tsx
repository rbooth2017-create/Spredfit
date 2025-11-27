import { memo } from "react";
import { Camera, Check, ChevronLeft, User } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { APIClient } from "../../utils/api";
import type { ProfileScreen } from "../../hooks/useDashboardState";

interface ProfileModalProps {
  profile: any;
  profileScreen: ProfileScreen;
  setProfileScreen: (screen: ProfileScreen) => void;
  selectedPhotoFile: File | null;
  setSelectedPhotoFile: (file: File | null) => void;
  isUploadingPhoto: boolean;
  setIsUploadingPhoto: (uploading: boolean) => void;
  accessToken: string;
}

function ProfileModalComponent({
  profile,
  profileScreen,
  setProfileScreen,
  selectedPhotoFile,
  setSelectedPhotoFile,
  isUploadingPhoto,
  setIsUploadingPhoto,
  accessToken,
}: ProfileModalProps) {
  const handlePhotoUpload = async () => {
    if (!selectedPhotoFile) {
      toast.error('No photo selected', {
        description: 'Please select a photo first',
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      console.log('📸 Starting photo upload...');
      const api = new APIClient(accessToken);
      const avatarUrl = await api.uploadAvatar(selectedPhotoFile);
      await api.updateProfile({ avatar_url: avatarUrl });
      
      toast.success('Photo Updated!', {
        description: 'Your profile photo has been changed',
      });
      setProfileScreen('view');
      setSelectedPhotoFile(null);
      
      // Refresh page to show new photo
      window.location.reload();
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Upload Failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Create preview URL for selected photo
  const previewUrl = selectedPhotoFile ? URL.createObjectURL(selectedPhotoFile) : null;

  return (
    <>
      {/* Modal Content */}
      <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
        <div className="flex flex-col items-center text-center w-full max-w-[280px]">
          {profileScreen === 'view' ? (
            <>
              {/* Profile Photo - Clickable to upload */}
              <button
                onClick={() => setProfileScreen('upload')}
                className="w-20 h-20 mb-2 border-2 border-white/40 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 overflow-hidden hover:border-white/60 transition-all group relative"
              >
                {profile?.avatar_url ? (
                  <>
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    <User className="w-10 h-10 text-white/60" strokeWidth={2} />
                    <Camera className="w-5 h-5 text-white/40 absolute -bottom-1 -right-1" strokeWidth={2} />
                  </div>
                )}
              </button>
              <p className="text-white text-sm mb-0.5">{profile?.name || 'User'}</p>
              <p className="text-white/70 text-[10px] mb-3">{profile?.email || ''}</p>
              <div className="space-y-1.5 w-full">
                <div className="flex justify-between items-center px-3 py-1.5 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border border-white/10">
                  <span className="text-white/70 text-[10px]">Total Workouts</span>
                  <span className="text-white text-xs">{profile?.totalWorkouts || 0}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1.5 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border border-white/10">
                  <span className="text-white/70 text-[10px]">Total Hours</span>
                  <span className="text-white text-xs">{profile?.totalHours ? `${profile.totalHours}h` : '0h'}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1.5 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border border-white/10">
                  <span className="text-white/70 text-[10px]">Distance</span>
                  <span className="text-white text-xs">{profile?.totalDistance ? `${profile.totalDistance}km` : '0km'}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1.5 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border border-white/10">
                  <span className="text-white/70 text-[10px]">Streak</span>
                  <span className="text-white text-xs">{profile?.streak ? `${profile.streak} days 🔥` : '0 days'}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-white text-sm mb-4">Upload Photo</p>
              
              {/* Photo Preview or Upload Area */}
              <label 
                htmlFor="photo-upload" 
                className="w-32 h-32 mb-4 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:bg-[#2d332d]/60 transition-all overflow-hidden"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-white/60" strokeWidth={1.5} />
                )}
              </label>
              
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedPhotoFile(e.target.files[0]);
                    toast.success('Photo Selected!', {
                      description: 'Click Save Photo to update your profile',
                    });
                  }
                }}
              />
              <input 
                id="camera-upload" 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedPhotoFile(e.target.files[0]);
                    toast.success('Photo Captured!', {
                      description: 'Click Save Photo to update your profile',
                    });
                  }
                }}
              />
              <div className="flex gap-2 mb-4">
                <label htmlFor="photo-upload" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-all cursor-pointer border border-white/20">
                  Choose from Gallery
                </label>
                <label htmlFor="camera-upload" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-all cursor-pointer border border-white/20">
                  Take Photo
                </label>
              </div>
              <p className="text-white/70 text-[10px] mb-4 px-4">
                {selectedPhotoFile ? 'Photo ready to upload!' : 'Select from gallery or take a new photo'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* External Buttons - Outside modal backdrop */}
      <div className="fixed bottom-8 right-4 z-[60]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-3">
          {/* Save Photo Button - Only visible when photo is selected - ABOVE back button */}
          {profileScreen === 'upload' && selectedPhotoFile && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-white text-[10px] text-center">{isUploadingPhoto ? 'Saving...' : 'Save'}</span>
            </div>
          )}

          {/* Back/Camera Toggle Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setProfileScreen(profileScreen === 'view' ? 'upload' : 'view')}
              className="w-20 h-20 rounded-full bg-[#2d2d2d] backdrop-blur-sm flex items-center justify-center transition-all border border-white/20 hover:bg-[#2d2d2d]/90 shadow-lg"
            >
              {profileScreen === 'view' ? (
                <Camera className="w-7 h-7 text-white" strokeWidth={2} />
              ) : (
                <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
              )}
            </button>
            <span className="text-white text-[10px] text-center">{profileScreen === 'view' ? 'Add Photo' : 'Back'}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const ProfileModal = memo(ProfileModalComponent);