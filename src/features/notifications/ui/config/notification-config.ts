export const NOTIFICATION_CONFIG = {
  comment: {
    icon: 'MessageCircle' as const,
    bgColor: 'bg-red-300',
    title: '누군가 댓글을 남겼어요.',
    getMessage: (title: string) => `'${title}' 게시글에 댓글을 남겼어요!`,
  },
  bookmark: {
    icon: 'Bookmark' as const,
    bgColor: 'bg-black',
    title: '누군가 게시글을 저장했어요.',
    getMessage: (title: string) => `'${title}' 게시글을 저장했어요!`,
  },
} as const;
