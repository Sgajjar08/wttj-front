import { expect, test } from 'vitest';

import { Candidates, Statuses } from '../../types';
import { render } from '../../test-utils';
import CandidateColumn from '.';

test('renders column name', () => {
  const candidates: Candidates = { new: [{id: 10, email: 'test@example.com', position: 1, status: 'new' }], hired: [], interview: [], rejected: []};
  const column: Statuses = 'new';
  const { getByText } = render(<CandidateColumn column={column} candidates={candidates}/>);
  expect(getByText('new')).toBeInTheDocument();
});
