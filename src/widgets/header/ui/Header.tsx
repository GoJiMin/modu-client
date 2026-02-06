'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {usePathname} from 'next/navigation';
import {Navbar} from '../nav-bar';
import {Sidebar} from '../side-bar';
import {LoginButtonLoading, LogoutButton} from '@/features/auth';
import {NotificationBell} from '@/features/notifications';
import {useIsLoggedIn} from '@/entities/auth';

const LoginButton = dynamic(() => import('@/features/auth/ui/LoginButton'), {
  ssr: false,
  loading: () => <LoginButtonLoading className="px-6" />,
});

export default function Header() {
  const pathName = usePathname();
  const isMainPage = pathName === '/';
  const isLoggedIn = useIsLoggedIn();

  return (
    <header
      className={`flex justify-between items-center py-5 px-5 md:px-8 lg:py-6 lg:px-10 ${isMainPage ? '' : 'border-b border-gray-200'}`}
    >
      <Link href="/">
        <h2 className="text-2xl md:text-3xl font-extrabold whitespace-nowrap text-boldBlue">모두의 : 후기</h2>
      </Link>
      {/* 모바일 */}
      <div className="lg:hidden flex gap-6">
        {isLoggedIn && <NotificationBell />}
        <Sidebar />
      </div>

      {/* 데스크탑 */}
      <div className="hidden lg:flex w-full lg:max-w-screen-2xl items-center">
        <div className="flex justify-center items-center w-full gap-4">
          {/* 메뉴 영역 */}
          <Navbar />
        </div>
        {/* 로그인/로그아웃 버튼 */}
        <div className="flex gap-8">
          {isLoggedIn && <NotificationBell />}
          <div className="flex-shrink-0">{isLoggedIn ? <LogoutButton /> : <LoginButton className="px-6" />}</div>
        </div>
      </div>
    </header>
  );
}
