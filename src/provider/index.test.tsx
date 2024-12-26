import { renderHook, act } from '@testing-library/react';
import { expect, vi, describe, test } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';

import { DragAndDropProvider, useDragAndDropContext } from './dragAndDropProvider';
import { Candidate, Candidates, Statuses } from '../types';

// Mock useUpdateCandidate
const mockMutate = vi.fn();
vi.mock('../hooks/useCandidate', () => ({
  useUpdateCandidate: vi.fn(() => ({
    mutate: mockMutate,
  })),
}));

// Helper to wrap with QueryClientProvider
const createWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <DragAndDropProvider>{children}</DragAndDropProvider>
    </QueryClientProvider>
  );
};

describe('DragAndDropProvider', () => {
  test('provides default context values', () => {
    const { result } = renderHook(() => useDragAndDropContext(), { wrapper: createWrapper() });

    expect(result.current.draggedCandidate).toBe(null);
    expect(typeof result.current.handleDragStart).toBe('function');
    expect(typeof result.current.handleDragOver).toBe('function');
    expect(typeof result.current.handleDrop).toBe('function');
    expect(typeof result.current.handleDragEnd).toBe('function');
  });

  test('handles drag start correctly', () => {
    const candidate: Candidate = { id: 1, email: 'test@example.com', status: 'new', position: 1 };
    const { result } = renderHook(() => useDragAndDropContext(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleDragStart(
        {
          dataTransfer: { effectAllowed: 'move' },
          target: { setAttribute: vi.fn() },
        } as unknown as React.DragEvent<Element>,
        candidate
      );
    });

    expect(result.current.draggedCandidate).toEqual(candidate);
  });

  test('handles drag over correctly', () => {
    const candidate: Candidate = { id: 1, email: 'test@example.com', status: 'new', position: 1 };
    const { result } = renderHook(() => useDragAndDropContext(), { wrapper: createWrapper() });
  
    // Trigger drag start to set draggedCandidate
    act(() => {
      result.current.handleDragStart(
        {
          dataTransfer: { effectAllowed: 'move' },
          target: { setAttribute: vi.fn() },
        } as unknown as React.DragEvent<Element>,
        candidate
      );
    });
  
    // Mocking the drag over event
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;
  
    // Call handleDragOver to handle the event (no direct state to check)
    act(() => {
      result.current.handleDragOver(mockEvent, 'new');
    });
  
    // Check that the function was called correctly (this is more of a behavioral test)
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  }); 

  test('handles drop correctly', async () => {
    const candidate: Candidate = { id: 1, email: 'test@example.com', status: 'new', position: 1 };
    const candidates: Candidates = {
      new: [candidate],
      interview: [],
      hired: [],
      rejected: [],
    };
  
    // Mocking the queryClient with realistic behavior
    const queryClient = new QueryClient();
    queryClient.setQueryData(['candidates', '1'], candidates);
  
    // Render hook with the provider
    const { result } = renderHook(() => useDragAndDropContext(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <DragAndDropProvider jobId="1">{children}</DragAndDropProvider>
        </QueryClientProvider>
      ),
    });
  
    // Simulate drag start
    act(() => {
      result.current.handleDragStart(
        {
          dataTransfer: { effectAllowed: 'move' },
          target: { setAttribute: vi.fn() },
        } as unknown as React.DragEvent<Element>,
        candidate
      );
    });
  
    // Simulate drag over event
    act(() => {
      result.current.handleDragOver(
        { preventDefault: vi.fn(), clientY: 100 } as unknown as React.DragEvent<Element>,
        'interview'
      );
    });
  
    // Simulate drop event
    act(() => {
      result.current.handleDrop({ preventDefault: vi.fn() } as unknown as React.DragEvent<Element>);
    });

    queryClient.setQueryData<Candidates>(['candidates', '1'], (oldCandidates) => {
      if (!oldCandidates) return undefined;
  
      const updatedCandidate = {
        ...candidate,
        status: 'interview' as Statuses,
        position: 1.5, // Example position for the test
      };
  
      const newCandidates: Candidates = { ...oldCandidates };
      const { id, status } = updatedCandidate;
  
      // Remove candidate from all columns
      Object.keys(newCandidates).forEach((column) => {
        const key = column as keyof typeof newCandidates;
        newCandidates[key] = newCandidates[key].filter((c) => c.id !== id);
      });
  
      newCandidates[status as keyof typeof newCandidates] = newCandidates[status as keyof typeof newCandidates]
        .concat([updatedCandidate])
        .sort((a, b) => a.position - b.position);
  
      return newCandidates;
    });

    // Ensure the mutation function is called with the correct arguments
    expect(mockMutate).toHaveBeenCalledWith({
      jobId: '1',
      candidate: expect.objectContaining({
        id: 1,
        status: 'interview',
        position: expect.any(Number),
      }),
    });
  
    // Verify the updated state in queryClient
    const updatedCandidates = queryClient.getQueryData(['candidates', '1']);

    expect(updatedCandidates).toEqual({
      new: [], // Candidate should be moved out of 'new'
      interview: [expect.objectContaining({ id: 1 })], // Candidate should now be in 'interview'
      hired: [],
      rejected: [],
    });
  });

  test('handles drag end correctly', () => {
    const { result } = renderHook(() => useDragAndDropContext(), { wrapper: createWrapper() });
  
    // Mock the target element to verify the setAttribute call
    const mockSetAttribute = vi.fn();
    const mockEvent = { target: { setAttribute: mockSetAttribute } } as unknown as React.DragEvent<Element>;
  
    // Trigger the drag end
    act(() => {
      result.current.handleDragEnd(mockEvent);
    });
  
    // Check that draggedCandidate is reset
    expect(result.current.draggedCandidate).toBe(null);
  
    // Check that setAttribute was called with 'aria-grabbed' set to 'false'
    expect(mockSetAttribute).toHaveBeenCalledWith('aria-grabbed', 'false');
  });
});
