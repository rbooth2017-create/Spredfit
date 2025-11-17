import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, ShoppingCart, Star, Shirt, Package, Heart, TrendingUp } from "lucide-react";

interface BrandedStoreProps {
  onBack: () => void;
}

// Mock SPREDfit branded products
const products = [
  {
    id: 1,
    name: "SPREDfit Performance Tee",
    category: "Apparel",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    colors: ["Black", "White", "Sage", "Charcoal"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    reviews: 124,
    featured: true
  },
  {
    id: 2,
    name: "SPREDfit Training Shorts",
    category: "Apparel",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80",
    colors: ["Black", "Sage", "Charcoal"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.6,
    reviews: 89,
    featured: true
  },
  {
    id: 3,
    name: "SPREDfit Water Bottle - 32oz",
    category: "Accessories",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
    colors: ["Black", "Sage", "White"],
    sizes: ["One Size"],
    rating: 4.9,
    reviews: 203,
    featured: false
  },
  {
    id: 4,
    name: "SPREDfit Gym Towel",
    category: "Accessories",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1556228841-b59d1e1c2ea2?w=400&q=80",
    colors: ["Sage", "Black", "White"],
    sizes: ["One Size"],
    rating: 4.5,
    reviews: 67,
    featured: false
  },
  {
    id: 5,
    name: "SPREDfit Hoodie",
    category: "Apparel",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
    colors: ["Black", "Sage", "Charcoal"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.7,
    reviews: 156,
    featured: true
  },
  {
    id: 6,
    name: "SPREDfit Gym Bag",
    category: "Accessories",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    colors: ["Black", "Sage"],
    sizes: ["One Size"],
    rating: 4.8,
    reviews: 94,
    featured: false
  },
  {
    id: 7,
    name: "SPREDfit Cap",
    category: "Accessories",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80",
    colors: ["Black", "White", "Sage"],
    sizes: ["Adjustable"],
    rating: 4.4,
    reviews: 78,
    featured: false
  },
  {
    id: 8,
    name: "SPREDfit Running Socks (3-Pack)",
    category: "Apparel",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&q=80",
    colors: ["Mixed"],
    sizes: ["S/M", "L/XL"],
    rating: 4.6,
    reviews: 112,
    featured: false
  }
];

const categories = ["All", "Apparel", "Accessories"];

export function BrandedStore({ onBack }: BrandedStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<number[]>([]);

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const featuredProducts = products.filter(p => p.featured);

  const addToCart = (productId: number) => {
    setCart([...cart, productId]);
  };

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
      <div className="relative z-10 px-4 py-5 max-w-md mx-auto pb-8">
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
                <ShoppingCart className="w-5 h-5 text-[#9ca895]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] text-[#2d332d] mb-0.5">Official Merchandise</p>
                <h1 className="text-xl text-[#2d332d]">SPREDfit Store</h1>
              </div>
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#2d332d] hover:text-[#2d332d] hover:bg-[#8a9881]/30 h-8 w-8"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#2d332d] text-[#eef0ed] rounded-full text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-[#9ca895] rounded-3xl border border-[#2d332d]/10 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2d332d] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package className="w-4 h-4 text-[#9ca895]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#2d332d] mb-1">Store Coming Soon</h3>
              <p className="text-sm text-[#2d332d]/70">
                Get ready to represent SPREDfit! Our branded merchandise store will launch soon with high-quality apparel and accessories. Preview our product line below.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#eef0ed]" />
              <h2 className="text-xl text-[#eef0ed]">Featured Products</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#9ca895] rounded-3xl border border-[#2d332d]/10 p-4"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-[#eef0ed]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-[#2d332d] text-sm">{product.name}</h3>
                        <Badge className="bg-[#2d332d]/90 text-[#9ca895] border-none flex-shrink-0 rounded-full">
                          Featured
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                          <span className="text-xs text-[#2d332d]">{product.rating}</span>
                        </div>
                        <span className="text-xs text-[#2d332d]/60">({product.reviews} reviews)</span>
                      </div>
                      <p className="text-lg text-[#2d332d] mb-2">${product.price}</p>
                      <Button
                        size="sm"
                        className="w-full bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] rounded-full shadow-none"
                        onClick={() => addToCart(product.id)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant="outline"
              className={`flex-1 rounded-full shadow-none ${
                selectedCategory === category
                  ? "bg-[#2d332d] border-[#2d332d] text-[#9ca895] hover:bg-[#2d332d]/90"
                  : "bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d] hover:bg-[#a5b39d]"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[#9ca895] rounded-3xl border border-[#2d332d]/10 p-3 hover:bg-[#a5b39d] transition-colors"
            >
              <div className="relative mb-3">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#eef0ed]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 w-8 h-8 bg-[#2d332d]/80 hover:bg-[#2d332d] text-[#9ca895] hover:text-[#eef0ed] rounded-full shadow-none"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="text-sm text-[#2d332d] mb-1 line-clamp-2">{product.name}</h3>
              
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                <span className="text-xs text-[#2d332d]">{product.rating}</span>
                <span className="text-xs text-[#2d332d]/60">({product.reviews})</span>
              </div>

              <p className="text-lg text-[#2d332d] mb-2">${product.price}</p>

              <Button
                size="sm"
                className="w-full bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] text-xs h-8 rounded-full shadow-none"
                onClick={() => addToCart(product.id)}
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
