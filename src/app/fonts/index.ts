import localFont from 'next/font/local';

const pretandard = localFont({
  src: [
    {
      path: './Pretendard-Regular.subset.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Pretendard-Medium.subset.woff2',
      weight: '500',
      style: 'medium',
    },
    {
      path: './Pretendard-SemiBold.subset.woff2',
      weight: '600',
      style: 'semibold',
    },
    {
      path: './Pretendard-Bold.subset.woff2',
      weight: '700',
      style: 'bold',
    },
  ],
  display: 'swap',
});

export default pretandard;
