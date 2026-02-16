import FloatingMoveUpButton from './FloatingMoveUpButton';
import FloatingWriteButton from './FloatingWriteButton';

export default function FloatingButtonSection() {
  return (
    <div className="fixed bottom-[4.5rem] md:bottom-[7.25rem] right-4 md:right-8 flex flex-col gap-3 z-40">
      <FloatingMoveUpButton />
      <FloatingWriteButton />
    </div>
  );
}
