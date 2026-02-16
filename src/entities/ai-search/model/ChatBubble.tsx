import {cva, VariantProps} from 'class-variance-authority';

const chatBubbleVariants = cva('p-3 rounded-lg shadow-sm border', {
  variants: {
    variant: {
      bot: 'rounded-tl-none bg-white border-gray-100',
      user: 'self-end max-w-[85%] rounded-br-none bg-mediumBlue text-white text-sm md:text-base break-keep',
    },
  },
  defaultVariants: {
    variant: 'bot',
  },
});

type Props = {
  children: React.ReactNode;
} & VariantProps<typeof chatBubbleVariants>;

export function ChatBubble({children, variant}: Props) {
  return <div className={chatBubbleVariants({variant})}>{children}</div>;
}
