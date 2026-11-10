import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

describe('Portfolio App', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && url.includes('table=experience')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                title: 'Full-Stack Web & SaaS Platforms',
                period: '2024 - Present',
                tech: 'React + Next.js + TypeScript + Node.js',
                details: ['Designed high-performance SaaS platforms'],
              },
              {
                id: 2,
                title: 'Cross-Platform Mobile Apps',
                period: '2024',
                tech: 'Flutter + Firebase',
                details: ['Built responsive mobile apps'],
              },
            ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  test('renders portfolio hero and about sections', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      await screen.findByRole('heading', { name: /Hi, I'm Abiy/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('active');
    expect(screen.getByText(/ABOUT ME/i)).toBeInTheDocument();
  });

  test('toggles color theme and switches experience timeline roles', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: /Switch to light theme/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: /Switch to dark theme/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('portfolio-theme')).toBe('dark');

    const secondRoleTab = await screen.findByRole('tab', {
      name: /Cross-Platform Mobile Apps/i,
    });
    fireEvent.click(secondRoleTab);
    expect(screen.getByText('Built responsive mobile apps')).toBeInTheDocument();
  });

  test('renders coverflow skills carousel across multiple skill categories', async () => {
    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && url.includes('table=skills')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, category: 'Frontend', items: ['React', 'Next.js', 'TypeScript'] },
              { id: 2, category: 'Backend & Cloud', items: ['Node.js', 'PostgreSQL'] },
              { id: 3, category: 'Mobile & Tooling', items: ['Flutter', 'Docker'] },
            ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Mobile & Tooling')).toBeInTheDocument();
    expect(screen.getByText('01 / 03')).toBeInTheDocument();
    expect(screen.getByText('03 / 03')).toBeInTheDocument();
    expect(container.querySelector('.skills-coverflow-swiper')).toBeInTheDocument();
    expect(container.querySelectorAll('.skills-carousel-slide')).toHaveLength(3);
    expect(container.querySelector('.swiper-pagination')).toBeInTheDocument();
    expect(container.querySelectorAll('.swiper-pagination-bullet')).toHaveLength(3);
    const prevBtn = screen.getByRole('button', { name: /Previous skill category/i });
    const nextBtn = screen.getByRole('button', { name: /Next skill category/i });
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    fireEvent.click(nextBtn);
    fireEvent.click(prevBtn);
    expect(container.querySelector('.swiper-slide-active')).toBeInTheDocument();
  });
});
