import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, Upload, Camera, Check } from "lucide-react";
import { FloatingContent } from "./FloatingContent";

interface UploadPhotoProps {
  onBack: () => void;
  currentPhoto: string;
}

export function UploadPhoto({ onBack, currentPhoto }: UploadPhotoProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setUploaded(true);
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div>
            <p className="text-[10px] text-[#2d332d] mb-0.5">Profile Settings</p>
            <h1 className="text-xl text-[#2d332d]">Upload Photo</h1>
          </div>
        </div>

        {uploaded && (
          <div className="mb-4 p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-center gap-2 text-white">
              <Check className="w-4 h-4" />
              <p className="text-sm">Photo uploaded successfully!</p>
            </div>
          </div>
        )}

        {/* Photo Preview Card */}
        <div className="mb-6">
          <div className="p-8 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/20">
            <div className="flex flex-col items-center gap-6">
              <Avatar className="w-40 h-40 ring-4 ring-white/20">
                <AvatarImage
                  src={selectedPhoto || currentPhoto}
                  alt="Profile"
                />
                <AvatarFallback className="bg-[#2d332d]/80 text-white text-4xl">
                  AR
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-lg text-white">Profile Picture</h2>
                <p className="text-sm text-white/70 mt-1">
                  Choose a photo that represents you
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Options */}
        <div className="space-y-3 mb-32">
          <label htmlFor="file-upload">
            <div className="p-6 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/20 cursor-pointer hover:bg-white/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2d332d]/80 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white">Upload from device</p>
                  <p className="text-sm text-white/70">Choose from your gallery</p>
                </div>
              </div>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="p-6 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/20 cursor-pointer hover:bg-white/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2d332d]/80 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white">Take a photo</p>
                <p className="text-sm text-white/70">Use your camera</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pb-8 space-y-3">
          {selectedPhoto && (
            <Button
              onClick={handleSave}
              className="w-full h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full shadow-none border border-white/20"
            >
              Save Photo
            </Button>
          )}
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-12 border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-full shadow-none"
          >
            Cancel
          </Button>
        </div>
      </div>
    </FloatingContent>
  );
}