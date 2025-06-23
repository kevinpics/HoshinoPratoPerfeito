
import { Button } from '@/components/ui/button';

interface CategoriesProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const staticCategories = [
  { id: 'Todos', name: 'Todos', icon: '🍽️' },
  { id: 'frangos', name: 'Frangos', icon: '🍗' },
  { id: 'acompanhamentos', name: 'Acompanhamentos', icon: '🥔' },
  { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
];

const Categories = ({ categories, selectedCategory, onCategorySelect }: CategoriesProps) => {
  const getIconForCategory = (categoryId: string) => {
    const staticCategory = staticCategories.find(cat => cat.id === categoryId);
    return staticCategory?.icon || '🍽️';
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-12">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          className={`px-6 py-3 text-lg rounded-full transition-all hover:scale-105 ${
            selectedCategory === category 
              ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' 
              : 'border-orange-300 text-orange-600 hover:border-orange-500'
          }`}
          onClick={() => onCategorySelect(category)}
        >
          <span className="mr-2">{getIconForCategory(category)}</span>
          {category === 'Todos' ? 'Todos' : category.charAt(0).toUpperCase() + category.slice(1)}
        </Button>
      ))}
    </div>
  );
};

export default Categories;
