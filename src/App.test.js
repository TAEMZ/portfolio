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
});
