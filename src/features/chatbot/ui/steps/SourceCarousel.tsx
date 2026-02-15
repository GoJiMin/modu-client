'use client';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import {AISearchSource, SourceCard} from '@/entities/ai-search';
import {LucideIcon} from '@/shared/ui/icons';

type Props = {
  sources: AISearchSource[];
};

const CustomArrow = ({onClick, direction}: {onClick?: () => void; direction: 'left' | 'right'}) => {
  return (
    <button
      onClick={onClick}
      className={`
        absolute z-10 top-1/2 -translate-y-1/2 
        w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md 
        flex items-center justify-center hover:bg-gray-50 transition-all
        ${direction === 'left' ? 'left-0' : 'right-0'}
      `}
      aria-label={direction === 'left' ? '이전 출처' : '다음 출처'}
    >
      <LucideIcon name={direction === 'left' ? 'ChevronLeft' : 'ChevronRight'} className="w-5 h-5 text-gray-600" />
    </button>
  );
};

export default function SourceCarousel({sources}: Props) {
  const responsive = {
    desktop: {
      breakpoint: {max: 3000, min: 0},
      items: 2,
      partialVisibilityGutter: 20,
    },
    mobile: {
      breakpoint: {max: 768, min: 0},
      items: 2,
      partialVisibilityGutter: 10,
    },
  };

  return (
    <div className="relative w-full">
      <Carousel
        responsive={responsive}
        infinite={false}
        autoPlay={false}
        partialVisible
        arrows={true}
        customLeftArrow={<CustomArrow direction="left" />}
        customRightArrow={<CustomArrow direction="right" />}
        containerClass="flex"
        itemClass="px-1"
        renderButtonGroupOutside={false}
      >
        {sources.map((source, idx) => (
          <SourceCard key={idx} source={source} />
        ))}
      </Carousel>
    </div>
  );
}
