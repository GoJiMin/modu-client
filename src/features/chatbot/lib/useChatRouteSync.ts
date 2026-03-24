import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {useShallow} from 'zustand/react/shallow';
import {useChatStore} from '@/entities/ai-search';

export function useChatRouteSync() {
  const pathname = usePathname();

  const {setKeyword, setStep, goToInput} = useChatStore(
    useShallow(state => ({
      setKeyword: state.setKeyword,
      setStep: state.setStep,
      goToInput: state.goToInput,
    })),
  );

  const isHiddenPath = () => {
    const exactMatches = ['/reviews/new', '/oauth2/redirect'];
    if (exactMatches.includes(pathname)) return true;

    const patterns = [/^\/reviews\/[^/]+\/edit$/];

    return patterns.some(regex => regex.test(pathname));
  };

  const isHidden = isHiddenPath();

  useEffect(() => {
    if (isHidden) {
      goToInput();
      return;
    }

    if (pathname.startsWith('/search/')) {
      const segments = pathname.split('/');
      const rawKeyword = segments[2];

      if (rawKeyword) {
        const decodedKeyword = decodeURIComponent(rawKeyword);
        setKeyword(decodedKeyword);
        setStep('ask');
      }
    } else {
      goToInput();
    }
  }, [pathname, setKeyword, setStep, goToInput, isHidden]);

  return {isHidden};
}
