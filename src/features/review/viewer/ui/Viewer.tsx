import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import {CATEGORY_MAP, ReviewContent} from '@/entities/review';
import {Avatar, Badge} from '@/shared/ui/components';

type Props = ReviewContent;

export default function Viewer({
  title,
  category,
  author_nickname,
  created_at,
  content,
  authorProfileUrl,
  profile_image,
}: Props) {
  const clean = DOMPurify.sanitize(content);

  const AuthorNickname = () => {
    if (authorProfileUrl) {
      return (
        <Link href={authorProfileUrl} className="hover:underline underline-offset-[3px]">
          {author_nickname}
        </Link>
      );
    }

    return <p>{author_nickname}</p>;
  };

  const ProfileImage = () => {
    if (profile_image) {
      return <Avatar src={profile_image} alt={`${author_nickname} 프로필 이미지`} rounded="rounded-full" />;
    }

    return (
      <div aria-label="기본 프로필 이미지" className="min-w-10 h-10 md:min-w-11 md:h-11 bg-boldBlue rounded-full" />
    );
  };

  return (
    <section className="flex flex-col w-full h-full min-h-[350px] md:min-h-[500px] overflow-auto">
      <header className="mx-4 mt-4 pb-4 border-b-2 border-gray-300">
        <Badge>{CATEGORY_MAP[category]}</Badge>
        <h1 className="text-2xl md:text-3xl font-semibold mt-3">{title}</h1>
        <div className="flex items-center gap-2 ml-0.5 mt-2">
          <div className="flex items-center gap-2">
            <ProfileImage />
            <AuthorNickname />
          </div>
          <p className="text-gray-500 text-[12px] md:text-sm">{created_at}</p>
        </div>
      </header>
      <div
        className="prose prose-p:my-3 prose-h1:font-bold prose-h1:text-[1.9em] md:prose-h1:text-[2.1em] lg:prose-lg focus:outline-none p-5"
        dangerouslySetInnerHTML={{__html: clean}}
      />
    </section>
  );
}
