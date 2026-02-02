import RecentReviewsClient from './RecentReviewsClient';

export default function RecentReviews() {
  return (
    <div className="relative w-full overflow-hidden mb-16 md:mb-24">
      <h2 className="text-boldBlue text-center text-2xl font-bold my-10 md:my-16 lg:text-3xl">최근 등록된 후기</h2>
      <RecentReviewsClient />
    </div>
  );
}
