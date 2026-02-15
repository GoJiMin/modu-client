import {cn} from '@/shared/lib/utils/cn';
import useGoLoginPage from '../lib/useGoLoginPage';
import {useGetFullPathName} from '@/shared/hooks';

type Props = {
  text?: string;
  className?: HTMLButtonElement['className'];
};

export default function LoginButton({text = '로그인', className}: Props) {
  const fullPath = useGetFullPathName();
  const {goLoginPage} = useGoLoginPage();

  const handleClickLoginButton = () => {
    goLoginPage(fullPath);
  };

  return (
    <button
      type="button"
      onClick={handleClickLoginButton}
      aria-label={text}
      className={cn(
        'w-full text-center bg-boldBlue text-white py-1.5 font-semibold rounded-md hover:bg-extraboldBlue transition-colors',
        className,
      )}
    >
      {text}
    </button>
  );
}
