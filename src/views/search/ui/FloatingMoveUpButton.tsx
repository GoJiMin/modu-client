'use client';

import {LucideIcon} from '@/shared/ui/icons';

export default function FloatingMoveUpButton() {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className="bg-boldBlue text-white rounded-full p-3 shadow-lg hover:bg-extraboldBlue transition-colors"
      onClick={handleScrollToTop}
      aria-label='위로 이동'
    >
      <LucideIcon name="ArrowUp" size={24} />
    </button>
  );
}
