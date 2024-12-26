import { renderHook, act } from '@testing-library/react';
import { expect, vi, describe, test } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';

import { DragAndDropProvider, useDragAndDropContext } from './dragAndDropProvider';
import { Candidate, Candidates } from '../types';

// Mock useUpdateCandidate
vi.mock('../hooks/useCandidate', () => ({
  useUpdateCandidate: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

// Helper to wrap with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <DragAndDropProvider>{children}</DragAndDropProvider>
    </QueryClientProvider>
  );
};

describe('DragAndDropProvider', () => {
  test('provides default context values', () => {
    const { result } = renderHook(() => useDragAndDropContext(), { wrapper: createWrapper() });

    console.log(result.current.hoverIndex, 'result.current.hoverIndex')

    expect(result.current.draggedCandidate).toBe(null);
    expect(result.current.hoverIndex).toBe(null);
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
        candidate,
      );
    });

    expect(result.current.draggedCandidate).toEqual(candidate);
  });

  test('handles drag over correctly', () => {
    const { result } = renderHook(() => useDragAndDropContext(), { wrapper: createWrapper() });
    const candidate: Candidate = { id: 1, email: 'test@example.com', status: 'new', position: 1 };

    act(() => {
      result.current.handleDragStart(
        { dataTransfer: { effectAllowed: 'move' }, target: { setAttribute: vi.fn() } } as unknown as React.DragEvent<Element>,
        candidate,
      );
    });

    act(() => {
      result.current.handleDragOver({ preventDefault: vi.fn() } as unknown as React.DragEvent, '0');
    });

    expect(result.current.hoverIndex).toBe('0');
  });

  test('handles drop correctly', () => {
    const candidate: Candidate = { id: 1, email: 'test@example.com', status: 'new', position: 1 };
    const candidates: Candidates = {
      new: [candidate],
      interview: [],
      hired: [],
      rejected: [],
    };

    const { result } = renderHook(() => useDragAndDropContext(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleDragStart(
        {
          dataTransfer: { effectAllowed: 'move' },
          target: { setAttribute: vi.fn() },
        } as unknown as React.DragEvent<Element>,
        candidate,
      );
    });

    act(() => {
      result.current.handleDragOver({ preventDefault: vi.fn() } as unknown as React.DragEvent, '0');
    });


    act(() => {
      result.current.handleDrop(
        { preventDefault: vi.fn() } as unknown as React.DragEvent<Element>,
        candidates,
        'interview',
      );
    });

    expect(result.current.draggedCandidate).toBe(null);
    expect(result.current.hoverIndex).toBe(null);
  });

  test('handles drag end correctly', () => {
    const { result } = renderHook(() => useDragAndDropContext(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleDragEnd({ target: { setAttribute: vi.fn() } } as unknown as React.DragEvent<Element>);
    });

    expect(result.current.draggedCandidate).toBe(null);
    expect(result.current.hoverIndex).toBe(null);
  });
});
