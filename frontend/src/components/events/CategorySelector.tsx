import React, { useState } from 'react';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  {
    name: 'Sports',
    subcategories: ['Basketball', 'Soccer', 'Football', 'Tennis', 'Baseball', 'Hockey'],
    icon: '⚽',
    color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
  },
  {
    name: 'Crypto',
    subcategories: ['Bitcoin', 'Ethereum', 'Solana', 'DeFi', 'NFTs', 'Altcoins'],
    icon: '₿',
    color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300'
  },
  {
    name: 'Politics',
    subcategories: ['Elections', 'Policy', 'International', 'Domestic'],
    icon: '🗳️',
    color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
  },
  {
    name: 'Entertainment',
    subcategories: ['Movies', 'TV Shows', 'Music', 'Gaming', 'Awards'],
    icon: '🎬',
    color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
  },
  {
    name: 'Technology',
    subcategories: ['Product Launches', 'Stock Prices', 'Startups', 'AI/ML'],
    icon: '💻',
    color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
  },
  {
    name: 'Weather',
    subcategories: ['Temperature', 'Precipitation', 'Natural Disasters'],
    icon: '🌤️',
    color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-300'
  },
  {
    name: 'Other',
    subcategories: ['Custom Events'],
    icon: '📋',
    color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
  }
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState(
    categories.find(cat => 
      cat.name === selectedCategory || 
      cat.subcategories.includes(selectedCategory)
    )?.name || 'Sports'
  );

  const handleMainCategorySelect = (categoryName: string) => {
    setSelectedMainCategory(categoryName);
    setShowSubcategories(true);
    
    // If no subcategories, select the main category
    const category = categories.find(cat => cat.name === categoryName);
    if (!category || category.subcategories.length === 0) {
      onCategoryChange(categoryName);
      setShowSubcategories(false);
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    onCategoryChange(subcategory);
    setShowSubcategories(false);
  };

  const selectedCategoryData = categories.find(cat => 
    cat.name === selectedCategory || cat.subcategories.includes(selectedCategory)
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Event Category *
        </label>
        
        {/* Selected Category Display */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
            selectedCategoryData?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }`}>
            <span className="mr-2">{selectedCategoryData?.icon}</span>
            {selectedCategory}
          </div>
        </div>

        {/* Main Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleMainCategorySelect(category.name)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${selectedMainCategory === category.name
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {category.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {category.subcategories.length} options
              </div>
            </button>
          ))}
        </div>

        {/* Subcategories */}
        {showSubcategories && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Choose {selectedMainCategory} Subcategory:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories
                .find(cat => cat.name === selectedMainCategory)
                ?.subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => handleSubcategorySelect(subcategory)}
                    className={`
                      px-3 py-2 rounded text-sm transition-colors text-left
                      ${selectedCategory === subcategory
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                      }
                    `}
                  >
                    {subcategory}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setShowSubcategories(false)}
              className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ← Back to categories
            </button>
          </div>
        )}

        {/* Popular Categories Quick Select */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular categories:</p>
          <div className="flex flex-wrap gap-2">
            {['Basketball', 'Soccer', 'Bitcoin', 'Elections', 'Movies'].map((popular) => (
              <button
                key={popular}
                onClick={() => onCategoryChange(popular)}
                className={`
                  px-3 py-1 rounded-full text-xs transition-colors
                  ${selectedCategory === popular
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }
                `}
              >
                {popular}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};