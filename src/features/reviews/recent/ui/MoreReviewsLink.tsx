import Link from 'next/link';

export default function MoreReviewsLink() {
  return (
    <div className="flex w-full mt-16 md:mt-24">
      <Link
        href="/search"
        aria-label="더 많은 후기 보러가기"
        className="relative inline-flex items-center justify-center mx-auto px-6 py-4 group transition-transform active:scale-95"
      >
        <span className="absolute inset-0 bg-lightBlue rounded-full transition-all duration-300 ease-in-out w-14 h-14 group-hover:w-full group-hover:bg-boldBlue"></span>
        <span className="relative font-extrabold text-[16px] tracking-widest uppercase text-boldBlue group-hover:text-white">
          더 많은 후기 보기{` >`}
        </span>
      </Link>
    </div>
  );
}
