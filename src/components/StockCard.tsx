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
    <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md dark:shadow-none">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs`}>
            {symbol[0]}
          </div>
          <div>
            <h3 className="text-black dark:text-white font-semibold text-sm">{name}</h3>
            <span className="text-gray-500 text-xs">{symbol}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-black dark:text-white font-medium">{price}</div>
          <div className={`text-xs ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {isPositive ? '+' : ''}{change}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-medium transition-colors">
          View Analysis
        </button>
        <button className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-[#2A2E37] hover:bg-gray-200 dark:hover:bg-[#363B47] text-blue-500 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default StockCard
