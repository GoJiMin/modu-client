'use client';

import {useSearchParams} from 'next/navigation';
import NotificationCard from './NotificationCard';
import {useGetNotifications} from '@/entities/notifications';
import Pagination from '@/widgets/pagination';

export default function NotificationList() {
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const {results, total_pages} = useGetNotifications(currentPage);

  if (results.length === 0) {
    return (
      <section className="h-full flex flex-col items-center justify-center mt-6 md:mt-8 mx-2 md:mx-10 mb-10 bg-white rounded-lg shadow-md shadow-gray-300">
        <h2 className="text-xl md:text-2xl font-semibold mb-1">아직 알림이 없어요.</h2>
        <p className="text-sm md:text-base text-muted-foreground">새로운 알림이 도착하면 여기에서 확인할 수 있어요.</p>
      </section>
    );
  }

  return (
    <>
      <ul aria-label='알림 목록' className="h-[53vh] sm:h-[620px] md:h-[550px] mt-4 md:mt-6 mx-2 md:mx-10 mb-8 sm:mb-10 md:mb-9 bg-white rounded-lg shadow-md shadow-gray-300 overflow-y-auto">
        {results.map(notification => (
          <li key={notification.id} className="relative">
            <NotificationCard notification={notification} page={currentPage} />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        totalPages={total_pages}
        generateUrl={(page: number) => `/notifications?page=${page}`}
        className="mb-6 bg-white py-2 px-2 md:px-6 rounded-2xl"
      />
    </>
  );
}
