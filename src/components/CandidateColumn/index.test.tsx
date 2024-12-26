import { describe, expect, test, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';

import { Candidates, Statuses } from '../../types';
import { render } from '../../test-utils';
import CandidateColumn from '.';
import { DragAndDropProvider } from '../../provider/dragAndDropProvider';

describe('CandidateColumn', () => {
  test('renders column name', () => {
    const candidates: Candidates = { new: [], hired: [], interview: [], rejected: []};
    const column: Statuses = 'new';
    const { getByText } = render(<CandidateColumn column={column} candidates={candidates}/>);
    expect(getByText('new')).toBeInTheDocument();
  });

  const candidates: Candidates = {
    new: [
      { id: 1, email: 'test1@example.com', status: 'new', position: 1 },
      { id: 2, email: 'test2@example.com', status: 'new', position: 2 },
    ],
    interview: [],
    hired: [],
    rejected: [],
  };

  test('renders candidates correctly', () => {
    const { getByText, getAllByRole } = render(
      <DragAndDropProvider>
        <CandidateColumn column="new" candidates={candidates} />
      </DragAndDropProvider>,
    );

    expect(getByText('new')).toBeInTheDocument();
    expect(getAllByRole('listitem')).toHaveLength(2);
  });

  test('handles drop event', async () => {
    const { getByRole } = render(
      <DragAndDropProvider>
        <CandidateColumn column="new" candidates={candidates} />
      </DragAndDropProvider>,
    );

    const column = getByRole('group');

    // Mock dataTransfer object and preventDefault
    const mockDropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => '1'),
      },
    } as unknown as React.DragEvent;
  
    // Trigger the drop event on the column
    await fireEvent.drop(column, mockDropEvent);

    console.log(fireEvent.drop(column), column);
  
    // Ensure that preventDefault was called
    expect(mockDropEvent.preventDefault).toHaveBeenCalled();
    expect(mockDropEvent.dataTransfer.getData).toHaveBeenCalledWith('text'); // Ensure the default action was prevented
  });
});
