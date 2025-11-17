import { PersonStanding, Bike, Waves, Users, Dumbbell, Heart, Sparkles, MoreHorizontal, LucideIcon } from "lucide-react";

export interface SportConfig {
  icon: LucideIcon;
  gradient: string;
  shadow: string;
  bg: string;
}

export const sportConfigs: Record<string, SportConfig> = {
  Running: {
    icon: PersonStanding,
    gradient: "from-emerald-700 via-teal-700 to-emerald-700",
    shadow: "shadow-emerald-900/20",
    bg: "bg-gradient-to-br from-emerald-600 to-teal-600",
  },
  Cycling: {
    icon: Bike,
    gradient: "from-teal-700 via-emerald-700 to-teal-700",
    shadow: "shadow-emerald-900/20",
    bg: "bg-gradient-to-br from-teal-600 to-emerald-600",
  },
  Swimming: {
    icon: Waves,
    gradient: "from-emerald-700 via-teal-600 to-emerald-700",
    shadow: "shadow-emerald-900/20",
    bg: "bg-gradient-to-br from-emerald-600 to-teal-600",
  },
  "Team Sports": {
    icon: Users,
    gradient: "from-teal-600 via-emerald-600 to-teal-600",
    shadow: "shadow-emerald-900/20",
    bg: "bg-gradient-to-br from-teal-600 to-emerald-600",
  },
  Strength: {
    icon: Dumbbell,
    gradient: "from-emerald-700 via-teal-700 to-emerald-700",
    shadow: "shadow-emerald-900/20",
    bg: "bg-gradient-to-br from-emerald-600 to-teal-600",
  },
  Cardio: {
    icon: Heart,
    gradient: "from-teal-700 via-emerald-700 to-teal-700",
    shadow: "shadow-emerald-900/20",
    bg: "bg-gradient-to-br from-teal-600 to-emerald-600",
  },
  Yoga: {
    icon: Sparkles,
    gradient: "from-emerald-700 via-teal-600 to-emerald-700",
    shadow: "shadow-emerald-900/20",
    bg: "bg-gradient-to-br from-emerald-600 to-teal-600",
  },
  Other: {
    icon: MoreHorizontal,
    gradient: "from-slate-700 via-slate-600 to-slate-700",
    shadow: "shadow-slate-900/20",
    bg: "bg-gradient-to-br from-slate-600 to-slate-600",
  },
};

export const getSportIcon = (sport: string): LucideIcon => {
  return sportConfigs[sport]?.icon || MoreHorizontal;
};

export const getSportGradient = (sport: string): string => {
  return sportConfigs[sport]?.gradient || "from-emerald-500 to-teal-500";
};

export const getSportShadow = (sport: string): string => {
  return sportConfigs[sport]?.shadow || "shadow-emerald-500/30";
};

export const getSportBg = (sport: string): string => {
  return sportConfigs[sport]?.bg || "bg-emerald-400";
};

// Ordered list of sports for display
export const orderedSports = [
  "Running",
  "Cycling",
  "Swimming",
  "Team Sports",
  "Strength",
  "Cardio",
  "Yoga",
  "Other",
];