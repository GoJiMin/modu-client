import {Metadata} from 'next';
import SearchDrawer from './SearchDrawer';
import FloatingButtonSection from './FloatingButtonSection';
import {CategoryReviews} from '@/features/reviews/category';

export const metadata: Metadata = {
  title: '후기글 모음',
  description: '카테고리별로 후기글을 모아보세요.',
  openGraph: {
    title: '후기글 모음',
    description: '카테고리별로 후기글을 모아보세요.',
    images: [
      {
        url: '/resources/og-image.png',
        width: 1200,
        height: 630,
        alt: '모두의 후기',
      },
    ],
  },
};

export default function CategorySearchPage() {
  return (
    <section className="flex flex-col md:px-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mt-4 md:mt-6 mb-4 md:mb-6 pl-7 pr-10">
        <h4 className="font-bold text-2xl md:text-3xl"> 후기글 모음 </h4>
        <div className="md:hidden flex items-center justify-center">
          <SearchDrawer />
        </div>
      </header>
      <CategoryReviews />
      <FloatingButtonSection />
    </section>
  );
}
