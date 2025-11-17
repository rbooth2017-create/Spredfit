import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, Upload, Camera, Check, X } from "lucide-react";
import { FloatingContent } from "./FloatingContent";

interface UploadWorkoutPhotoProps {
  onBack: () => void;
  onSkip: () => void;
  workoutSport: string;
}

export function UploadWorkoutPhoto({ onBack, onSkip, workoutSport }: UploadWorkoutPhotoProps) {
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
      onSkip();
    }, 1500);
  };

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#2d332d] mb-0.5">Workout Photo</p>
              <h1 className="text-xl text-[#2d332d]">Add Photo</h1>
            </div>
            <Button
              onClick={onSkip}
              variant="ghost"
              size="icon"
              className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-white/30 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
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
              <div className="w-40 h-40 rounded-2xl bg-[#2d332d]/80 flex items-center justify-center overflow-hidden ring-4 ring-white/20">
                {selectedPhoto ? (
                  <img src={selectedPhoto} alt="Workout" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-16 h-16 text-white/40" />
                )}
              </div>

              <div className="text-center">
                <h2 className="text-lg text-white">{workoutSport} Photo</h2>
                <p className="text-sm text-white/70 mt-1">
                  Capture your workout moment
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
            onClick={onSkip}
            variant="outline"
            className="w-full h-12 border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-full shadow-none"
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </FloatingContent>
  );
}