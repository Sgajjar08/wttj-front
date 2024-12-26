import { describe, expect, test } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { render } from '../../test-utils';
import CandidateColumn from '.';
import { Candidates } from '../../types';

describe('CandidateColumn', () => {
  const candidates: Candidates = {
      new: [
        { id: 1, email: 'test1@example.com', status: 'new', position: 1 },
        { id: 2, email: 'test2@example.com', status: 'new', position: 2 },
      ],
      interview: [],
      hired: [],
      rejected: [],
    };

  test('renders column with correct candidate count', () => {
    const candidates: Candidates = {
      new: [{ id: 1, email: 'test@example.com', status: 'new', position: 1 }],
      interview: [],
      hired: [],
      rejected: [],
    };

    const queryClient = new QueryClient();
    queryClient.setQueryData(['candidates', '1'], candidates);

    const { getByText, getByRole } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/job/1']}>
          <Routes>
            <Route path="/job/:jobId" element={<CandidateColumn column="new" />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(getByText('new')).toBeInTheDocument();
    // Query for the div that contains the count directly
    expect(getByRole('group-new').querySelector('.sc-dxcDKg')).toHaveTextContent('1');
  });

  test('renders candidates correctly', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['candidates', '1'], candidates);

    const { getByText, getAllByRole } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/job/1']}>
          <Routes>
            <Route path="/job/:jobId" element={<CandidateColumn column="new" />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(getByText('new')).toBeInTheDocument();
    expect(getAllByRole('listitem')).toHaveLength(2); // Check if two candidates are rendered
  });
});
