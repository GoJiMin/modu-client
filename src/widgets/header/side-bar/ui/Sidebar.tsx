'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {usePathname} from 'next/navigation';
import UserInfo from './UserInfo';
import {LoginButtonLoading, LoginRequiredPopover, LogoutButton} from '@/features/auth';
import {useIsLoggedIn} from '@/entities/auth';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/shadcnComponent/ui/sheet';
import {LucideIcon} from '@/shared/ui/icons';
import {ROUTES} from '@/shared/lib/consts/routes';

const LoginButton = dynamic(() => import('@/features/auth/ui/LoginButton'), {
  ssr: false,
  loading: () => <LoginButtonLoading />,
});

export default function Sidebar() {
  const pathName = usePathname();
  const isLoggedIn = useIsLoggedIn();

  return (
    <Sheet>
      <SheetTrigger aria-label="사이드바 네비게이션 열기">
        <LucideIcon
          name="Menu"
          className="w-6 h-6 md:w-7 md:h-7 hover:text-boldBlue md:hover:scale-105 transition-all"
        />
      </SheetTrigger>
      <SheetContent className="w-[300px] flex flex-col">
        <SheetHeader className="border-b-[3px] border-boldBlue pb-3">
          <SheetTitle className="text-xl md:text-2xl mb-1">모두의 후기</SheetTitle>
          <SheetDescription>당신이 찾던 그 후기를 확인해보세요.</SheetDescription>
        </SheetHeader>
        <nav className="flex-1 flex flex-col space-y-10 md:space-y-11 text-lg mt-5 md:font-semibold">
          {ROUTES.map(({title, href, isActive, requiresAuth, scrollToTop}) =>
            !requiresAuth || isLoggedIn ? (
              <SheetClose key={title} asChild>
                <Link
                  href={href}
                  className={
                    isActive(pathName)
                      ? 'text-boldBlue font-semibold md:font-bold'
                      : 'text-muted-foreground hover:text-boldBlue transition-colors'
                  }
                  aria-label={`${title}로 이동`}
                  aria-selected={isActive(pathName)}
                  scroll={scrollToTop}
                >
                  <span>{title}</span>
                </Link>
              </SheetClose>
            ) : (
              <LoginRequiredPopover key={title} title={title} />
            ),
          )}
        </nav>
        <SheetFooter>
          {isLoggedIn ? (
            <section className="w-full flex items-center justify-between">
              <UserInfo />
              <LogoutButton />
            </section>
          ) : (
            <LoginButton />
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
