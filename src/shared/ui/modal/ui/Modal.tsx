'use client';

import {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {RemoveScroll} from 'react-remove-scroll';
import FocusLock from 'react-focus-lock';
import {LucideIcon} from '../../icons';

type Props = {
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({children, onClose}: Props) {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  const modal = document.getElementById('modal-root') as HTMLDivElement;

  return (
    <RemoveScroll>
      {createPortal(
        <FocusLock>
          <section
            role="alertdialog"
            aria-modal="true"
            className="fixed top-0 left-0 w-full h-full z-20 flex flex-col justify-center items-center"
          >
            <button className="fixed z-50 top-4 right-3" onClick={onClose} aria-label="창닫기">
              <LucideIcon name="X" className="w-6 h-6 md:w-8 md:h-8 md:text-gray-300" />
            </button>
            <div className="fixed top-0 left-0 w-full h-full bg-black/60" onClick={onClose} />
            {children}
          </section>
        </FocusLock>,
        modal,
      )}
    </RemoveScroll>
  );
}
