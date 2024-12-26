import { describe, expect, test } from 'vitest';

import { Candidate } from '../../types';
import { render } from '../../test-utils';
import CandidateCard from '../../components/Candidate';

describe('CandidateCard', () => {
  const candidate: Candidate = { id: 1, email: 'test@example.com', status: 'new', position: 1 };

  test('renders candidate email', () => {
    const { getByText } = render(<CandidateCard candidate={candidate} />);
    expect(getByText('test@example.com')).toBeInTheDocument();
  });
});