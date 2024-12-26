import { describe, expect, it, test, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';

import { Candidate } from '../../types';
import { render } from '../../test-utils';
import CandidateCard from '../../components/Candidate';
import { DragAndDropProvider } from '../../provider/dragAndDropProvider';

test('renders candidate email', () => {
  const candidate: Candidate = { id: 10, email: 'test@example.com', position: 1, status: 'new' };
  const { getByText } = render(<CandidateCard candidate={candidate} />);
  expect(getByText('test@example.com')).toBeInTheDocument();
});

describe('CandidateCard', () => {
  const candidate: Candidate = { id: 1, email: 'test@example.com', status: 'new', position: 1 };

  it('handles drag start', () => {
    const { getAllByRole } = render(
      <DragAndDropProvider>
          <CandidateCard candidate={candidate} />
      </DragAndDropProvider>,
    );

    const card = getAllByRole('listitem');
    const mockDragEvent = { dataTransfer: { effectAllowed: 'move' }, target: { setAttribute: vi.fn() } };

    fireEvent.dragStart(card[0], mockDragEvent as unknown as React.DragEvent);

    expect(mockDragEvent.target.setAttribute).toHaveBeenCalledWith('aria-grabbed', 'true');
  });

  it('handles drag end', () => {
    const { getAllByRole } = render(
      <DragAndDropProvider>
          <CandidateCard candidate={candidate} />
      </DragAndDropProvider>,
    );

    const card = getAllByRole('listitem');
    const mockDragEvent = { target: { setAttribute: vi.fn() } };

    fireEvent.dragEnd(card[0], mockDragEvent as unknown as React.DragEvent);

    expect(mockDragEvent.target.setAttribute).toHaveBeenCalledWith('aria-grabbed', 'false');
  });
});