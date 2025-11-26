'use client';

import StockCard from './StockCard';
import { useStocks } from '@/context/stocks';

const StockSection = () => {
  const { stocks, loading, error } = useStocks();

  if (loading) {
    return <div className="text-center text-white py-20">Loading stocks...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-20">Error: {error}</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 pb-20">
      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800 mb-8">
        <button className="pb-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
          Personalized Recommendations
        </button>
        <button className="pb-4 text-sm font-medium text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-gray-300 transition-colors">
          Trending Stocks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock, index) => (
          <StockCard key={index} {...stock} />
        ))}
      </div>
    </section>
  )
}

export default StockSection
