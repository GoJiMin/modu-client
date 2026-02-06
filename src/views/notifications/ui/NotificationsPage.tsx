import {Metadata} from 'next';
import {Notifications} from '@/features/notifications';
import checkSession from '@/shared/lib/utils/checkSession';

export const metadata: Metadata = {
  title: '알림',
  description: '생성된 알림을 확인하세요.',
};

export default async function NotificationsPage() {
  await checkSession();

  return (
    <section className="h-full flex flex-col max-w-5xl mx-auto md:px-4 pt-4 md:pt-7 md:pb-7">
      <h2 className="text-2xl font-semibold ml-6 mb-4 md:mb-6">알림</h2>
      <Notifications />
    </section>
  );
}
