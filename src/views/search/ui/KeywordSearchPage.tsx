import Link from 'next/link';
import FloatingButtonSection from './FloatingButtonSection';
import {KeywordReviews} from '@/features/reviews/keyword';
import {SearchBar} from '@/features/reviews/search-bar';

type Props = {
  params: Promise<{keyword: string}>;
};

export async function generateMetadata({params}: Props) {
  const {keyword} = await params;
  const decodedQuery = decodeURIComponent(keyword);

  return {
    title: `${decodedQuery} 검색 결과`,
    description: `${decodedQuery}에 관련된 후기글을 모아보세요.`,
    openGraph: {
      title: `${decodedQuery} 검색 결과`,
      description: `${decodedQuery}에 관련된 후기글을 모아보세요.`,
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
}

export default async function KeywordSearchPage({params}: Props) {
  const {keyword} = await params;

  const decodedQuery = decodeURIComponent(keyword);

  return (
    <section className="w-full h-full md:px-8 md:max-w-5xl mx-auto mt-2">
      <header className="flex flex-col gap-2 mt-4 md:mt-6 mb-6 md:mb-8 ml-7 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold text-2xl md:text-3xl">{decodedQuery} 검색 결과</h2>
        <Link href="/search" className="text-sm text-boldBlue hover:text-extraboldBlue transition-colors md:mr-4">
          카테고리별로 확인해보세요 →
        </Link>
      </header>
      <SearchBar />
      <KeywordReviews />
      <FloatingButtonSection />
    </section>
  );
}
