import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ArrowLeft, Search, ExternalLink, TrendingDown, Dumbbell, Bike, Watch, Shirt, Footprints, Heart } from "lucide-react";

interface DealFinderProps {
  onBack: () => void;
}

// Mock deals data - will be replaced with real API later
const mockDeals = [
  {
    id: 1,
    title: "Running Shoes - Nike Air Zoom Pegasus 40",
    category: "Footwear",
    originalPrice: 139.99,
    salePrice: 89.99,
    discount: 36,
    retailer: "Amazon",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    rating: 4.5,
    url: "#"
  },
  {
    id: 2,
    title: "Adjustable Dumbbells Set (5-52.5 lbs)",
    category: "Strength",
    originalPrice: 349.99,
    salePrice: 249.99,
    discount: 29,
    retailer: "Dick's Sporting Goods",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    rating: 4.8,
    url: "#"
  },
  {
    id: 3,
    title: "Garmin Forerunner 255 GPS Watch",
    category: "Tech",
    originalPrice: 449.99,
    salePrice: 349.99,
    discount: 22,
    retailer: "REI",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    rating: 4.7,
    url: "#"
  },
  {
    id: 4,
    title: "Yoga Mat - Extra Thick 1/2 inch",
    category: "Accessories",
    originalPrice: 39.99,
    salePrice: 24.99,
    discount: 38,
    retailer: "Target",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80",
    rating: 4.3,
    url: "#"
  },
  {
    id: 5,
    title: "Road Bike - Carbon Frame 21 Speed",
    category: "Cycling",
    originalPrice: 1299.99,
    salePrice: 899.99,
    discount: 31,
    retailer: "Performance Bicycle",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
    rating: 4.6,
    url: "#"
  },
  {
    id: 6,
    title: "Compression Sports Shirt - Moisture Wicking",
    category: "Apparel",
    originalPrice: 44.99,
    salePrice: 27.99,
    discount: 38,
    retailer: "Under Armour",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
    rating: 4.4,
    url: "#"
  },
  {
    id: 7,
    title: "Heart Rate Monitor Chest Strap",
    category: "Tech",
    originalPrice: 79.99,
    salePrice: 54.99,
    discount: 31,
    retailer: "Amazon",
    image: "https://images.unsplash.com/photo-1575489272413-cb506258027e?w=400&q=80",
    rating: 4.5,
    url: "#"
  },
  {
    id: 8,
    title: "Resistance Bands Set (5 Bands)",
    category: "Strength",
    originalPrice: 29.99,
    salePrice: 16.99,
    discount: 43,
    retailer: "Walmart",
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80",
    rating: 4.2,
    url: "#"
  }
];

const categories = [
  { name: "All", icon: Search },
  { name: "Footwear", icon: Footprints },
  { name: "Apparel", icon: Shirt },
  { name: "Strength", icon: Dumbbell },
  { name: "Cycling", icon: Bike },
  { name: "Tech", icon: Watch },
  { name: "Accessories", icon: Heart }
];

export function DealFinder({ onBack }: DealFinderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deals, setDeals] = useState(mockDeals);

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         deal.retailer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || deal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#8a9881] text-[#2d332d]">
      {/* Halftone pattern overlay - centered */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-full max-w-md" style={{ top: '-10vh', left: '-15%', transform: 'scale(2)' }}>
          <svg className="w-full h-auto" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.9" className="dot-pulsate">
              {Array.from({ length: 40 }).map((_, row) => {
                return Array.from({ length: 40 }).map((_, col) => {
                  const x = (col / 39) * 400;
                  const y = (row / 39) * 400;
                  const dx = x - 200;
                  const dy = y - 200;
                  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                  const maxRadius = 180;
                  if (distanceFromCenter > maxRadius) return null;
                  const normalizedDistance = distanceFromCenter / maxRadius;
                  let dotRadius;
                  if (normalizedDistance < 0.3) {
                    dotRadius = 2.5 - (normalizedDistance * 2);
                  } else if (normalizedDistance < 0.6) {
                    dotRadius = 1.8 - (normalizedDistance * 1.5);
                  } else {
                    dotRadius = 0.8 - ((normalizedDistance - 0.6) * 1.5);
                  }
                  dotRadius = Math.max(0.3, dotRadius);
                  return (
                    <circle
                      key={`${row}-${col}`}
                      cx={x}
                      cy={y}
                      r={dotRadius}
                      fill="#2d332d"
                    />
                  );
                });
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Decorative geometric circles */}
      <div className="absolute top-8 right-4 w-24 h-24 rounded-full bg-[#9ca895] opacity-40 blur-2xl pointer-events-none" />
      <div className="absolute bottom-16 left-4 w-20 h-20 rounded-full bg-[#7a8872] opacity-30 blur-xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 px-4 py-5 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={onBack}
                variant="ghost"
                size="icon"
                className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#8a9881]/30 h-8 w-8 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2d332d]">
                <TrendingDown className="w-5 h-5 text-[#9ca895]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] text-[#2d332d] mb-0.5">Exclusive Offers</p>
                <h1 className="text-xl text-[#2d332d]">Deal Finder</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Beta Notice */}
        <div className="bg-[#9ca895] rounded-3xl border border-[#2d332d]/10 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2d332d] flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingDown className="w-4 h-4 text-[#9ca895]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#2d332d] mb-1">Coming Soon</h3>
              <p className="text-sm text-[#2d332d]/70">
                We're building an intelligent deal finder that will search the web for the best prices on sports equipment. Below are example deals to show what's coming!
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#2d332d]/60" />
          <Input
            type="text"
            placeholder="Search for equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-[#eef0ed] border-[#2d332d]/20 text-[#2d332d] placeholder:text-[#2d332d]/50 rounded-full"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 lozenge-scrollbar">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                variant="outline"
                className={`flex-shrink-0 gap-2 rounded-full shadow-none ${
                  selectedCategory === category.name
                    ? "bg-[#2d332d] border-[#2d332d] text-[#9ca895] hover:bg-[#2d332d]/90"
                    : "bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d] hover:bg-[#a5b39d]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-[#eef0ed]">
            {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'} found
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-[#9ca895] rounded-3xl border border-[#2d332d]/10 p-4 hover:bg-[#a5b39d] transition-colors"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-[#eef0ed]">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#2d332d] mb-1 line-clamp-2 text-sm">{deal.title}</h3>
                      <p className="text-xs text-[#2d332d]/70">{deal.retailer}</p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-700 border-red-500/30 flex-shrink-0 rounded-full">
                      -{deal.discount}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-[#2d332d]/50 line-through">
                      ${deal.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-[#2d332d]">
                      ${deal.salePrice.toFixed(2)}
                    </span>
                    <Badge className="bg-[#2d332d]/80 text-[#eef0ed] text-xs rounded-full border-none">
                      ⭐ {deal.rating}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] gap-2 rounded-full shadow-none"
                    onClick={() => window.open(deal.url, '_blank')}
                  >
                    View Deal
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredDeals.length === 0 && (
          <div className="bg-[#9ca895] rounded-3xl border border-[#2d332d]/10 p-8 text-center">
            <Search className="w-12 h-12 text-[#2d332d]/40 mx-auto mb-4" />
            <h3 className="text-[#2d332d] mb-2">No deals found</h3>
            <p className="text-[#2d332d]/70">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
