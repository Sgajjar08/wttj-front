import { QueryClient, QueryClientProvider } from 'react-query';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';

import JobShow from '.';
import { useJob } from '../../hooks';
import { useCandidates, useWebSocketForCandidates } from '../../hooks/useCandidate';
import { render } from '../../test-utils';

// Mocking external hooks
vi.mock('../../hooks', () => ({
  useJob: vi.fn(),
}));

vi.mock('../../hooks/useCandidate', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCandidates: vi.fn(),
    useWebSocketForCandidates: vi.fn(),
    useUpdateCandidate: vi.fn(() => ({
      mutate: vi.fn(), // Mock the mutate function
    })),
  };
});

// Mock React Router's useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

describe('JobShow Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test to ensure no state leakage
    queryClient = new QueryClient();

    // Mock useParams
    vi.mocked(useParams).mockReturnValue({ jobId: '123' });

    // Mock useJob
    vi.mocked(useJob).mockReturnValue({
      job: { id: '123', name: 'Software Engineer' },
      isLoading: false,
      error: false
    });

    // Mock useCandidates
    vi.mocked(useCandidates).mockReturnValue({
      data: {
        new: [
          { id: 1, email: 'candidate1@example.com', status: 'new', position: 1 },
        ],
        interview: [],
        hired: [],
        rejected: [],
      },
      isLoading: false,
      isError: false,
    });

    // Mock WebSocket hook
    vi.mocked(useWebSocketForCandidates).mockReturnValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders columns', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/jobs/123']}>
          <Routes>
            <Route path="/jobs/:jobId" element={<JobShow />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(getByText('Software Engineer')).toBeInTheDocument();
    expect(getByText('new')).toBeInTheDocument();
    expect(getByText('interview')).toBeInTheDocument();
  });
});
