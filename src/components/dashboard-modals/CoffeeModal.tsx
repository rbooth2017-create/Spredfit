import { memo } from "react";

interface CoffeeModalProps {
  onCoffeePayment: (amount: number, label: string) => void;
}

function CoffeeModalComponent({ onCoffeePayment }: CoffeeModalProps) {
  return (
    <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center text-center w-full max-w-[280px]">
        <p className="text-white text-sm mb-3">Buy me a coffee ☕</p>
        <div className="space-y-1.5 w-full">
          <div 
            onClick={() => onCoffeePayment(3, 'Americano ☕')}
            className="flex justify-between items-center px-3 py-1.5 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border border-white/10 cursor-pointer hover:bg-[#2d332d]/60 transition-all"
          >
            <span className="text-white/70 text-[10px]">Americano</span>
            <span className="text-white text-xs">$3</span>
          </div>
          <div 
            onClick={() => onCoffeePayment(5, 'Cappuccino ☕')}
            className="flex justify-between items-center px-3 py-1.5 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border border-white/10 cursor-pointer hover:bg-[#2d332d]/60 transition-all"
          >
            <span className="text-white/70 text-[10px]">Cappuccino</span>
            <span className="text-white text-xs">$5</span>
          </div>
          <div 
            onClick={() => onCoffeePayment(10, 'Coffee & Cake ☕🍰')}
            className="flex justify-between items-center px-3 py-1.5 rounded-full bg-[#2d332d]/40 backdrop-blur-sm border border-white/10 cursor-pointer hover:bg-[#2d332d]/60 transition-all"
          >
            <span className="text-white/70 text-[10px]">Coffee & Cake</span>
            <span className="text-white text-xs">$10</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Memoize to prevent unnecessary re-renders
export const CoffeeModal = memo(CoffeeModalComponent);