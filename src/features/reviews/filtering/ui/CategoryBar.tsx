import {Category, CATEGORY_LIST} from '@/entities/review';
import {Button} from '@/shared/shadcnComponent/ui/button';
import {LucideIcon} from '@/shared/ui/icons';

type Props = {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
};

export default function CategoryBar({selectedCategory, onSelectCategory}: Props) {
  return (
    <nav className="w-full px-2 mb-8 md:mb-10 relative">
      <ul className="flex overflow-x-auto xs:grid xs:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] text-center gap-2 bg-white rounded-3xl p-3 border shadow-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden;">
        {CATEGORY_LIST.map(({id, value, label}) => (
          <li key={id}>
            <Button
              className="w-[90px] md:w-full"
              variant={selectedCategory === value ? 'activeCategory' : 'inActiveCategory'}
              size="category"
              aria-label={`카테고리: ${label}`}
              aria-selected={selectedCategory === value}
              onClick={() => onSelectCategory(value)}
            >
              {label}
            </Button>
          </li>
        ))}
      </ul>
      <LucideIcon
        name="ChevronRight"
        className="block xs:hidden absolute right-2 top-[19px] text-muted-foreground font-bold text-xl"
      />
    </nav>
  );
}
