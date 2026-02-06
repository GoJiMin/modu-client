import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LoginRequiredPopover} from '@/features/auth';
import {useIsLoggedIn} from '@/entities/auth';
import {ROUTES} from '@/shared/lib/consts/routes';

export default function Navbar() {
  const pathName = usePathname();
  const isLoggedIn = useIsLoggedIn();

  return (
    <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-14 text-medium items-center flex-wrap">
      {ROUTES.map(({title, href, isActive, requiresAuth, scrollToTop}) =>
        !requiresAuth || isLoggedIn ? (
          <Link
            key={href}
            href={href}
            className={
              isActive(pathName)
                ? 'text-boldBlue font-semibold md:font-extrabold whitespace-nowrap underline decoration-4 decoration-boldBlue underline-offset-8'
                : 'text-muted-foreground hover:text-boldBlue transition-colors whitespace-nowrap'
            }
            aria-label={`${title}로 이동`}
            aria-selected={isActive(pathName)}
            scroll={scrollToTop}
          >
            <span className="relative group font-medium">
              <span className="invisible group-hover:visible absolute -left-2">[</span>
              <span className="px-2">{title}</span>
              <span className="invisible group-hover:visible absolute -right-2">]</span>
            </span>
          </Link>
        ) : (
          <LoginRequiredPopover key={title} title={title} />
        ),
      )}
    </nav>
  );
}
