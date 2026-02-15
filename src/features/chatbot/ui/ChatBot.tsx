'use client';

import {useShallow} from 'zustand/react/shallow';
import {AnimatePresence, motion} from 'framer-motion';
import {RemoveScroll} from 'react-remove-scroll';
import ChatBotTrigger from './ChatBotTrigger';
import ChatWindow from './ChatWindow';
import {useChatStore} from '@/entities/ai-search';
import {useMediaQuery} from '@/shared/hooks/useMediaQuery';
import {useChatRouteSync} from '../lib/useChatRouteSync';

export function ChatBot() {
  const {isHidden} = useChatRouteSync();

  const {isOpen, openChat, closeChat} = useChatStore(
    useShallow(state => ({
      isOpen: state.isOpen,
      openChat: state.openChat,
      closeChat: state.closeChat,
    })),
  );

  const isMobile = useMediaQuery('(max-width: 767px)');

  const toogleChatBot = () => {
    if (isOpen) closeChat();
    else openChat();
  };

  if (isHidden) return null;

  return (
    <div className="relative">
      <RemoveScroll enabled={isOpen && isMobile}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{opacity: 0, y: 20, scale: 0.95}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, y: 20, scale: 0.95}}
              transition={{duration: 0.2}}
              className={`
                z-50
                fixed inset-0 w-full h-full
                md:absolute md:inset-auto md:bottom-[4.5rem] md:right-0 md:w-auto md:h-auto
              `}
            >
              <ChatWindow />
            </motion.div>
          )}
        </AnimatePresence>
      </RemoveScroll>
      <ChatBotTrigger isOpen={isOpen} toogleChatBot={toogleChatBot} />
    </div>
  );
}
