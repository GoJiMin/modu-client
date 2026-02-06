import {render, screen} from '@testing-library/react';
import Footer from '../Footer';

describe('src/widgets/footer/ui/Footer.tsx', () => {
  it('푸터가 렌더링된다.', () => {
    render(<Footer />);

    expect(screen.getByText('Copyright 2025.01 © 모두의후기 All rights reserved')).toBeInTheDocument();
  });
});
