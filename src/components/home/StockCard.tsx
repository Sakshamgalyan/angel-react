import { Plus } from 'lucide-react';

interface StockCardProps {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  color?: string; // For the icon background
}

const StockCard = ({ name, symbol, price, change, isPositive, color = "bg-gray-700" }: StockCardProps) => {
  return (
    <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--card-border)] hover:border-[var(--primary)]/50 transition-all shadow-sm hover:shadow-md dark:shadow-none group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
            {symbol[0]}
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm group-hover:text-[var(--primary)] transition-colors">{name}</h3>
            <span className="text-[var(--text-secondary)] text-xs">{symbol}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[var(--text-primary)] font-medium">{price}</div>
          <div className={`text-xs ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {isPositive ? '+' : ''}{change}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-[var(--primary)] hover:brightness-110 text-white py-2 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow">
          View Analysis
        </button>
        <button className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-[#2A2E37] hover:bg-gray-200 dark:hover:bg-[#363B47] text-[var(--primary)] rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default StockCard
