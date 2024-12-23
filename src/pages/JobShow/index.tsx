import { useParams } from 'react-router-dom';
import { useEffect, useReducer } from 'react';

import { Text } from '@welcome-ui/text';
import { Flex } from '@welcome-ui/flex';
import { Box } from '@welcome-ui/box';

import { useJob, useCandidates, useDragAndDrop, useWebSocket } from '../../hooks';

import { COLUMNS } from '../../constants';
import CandidateColumn from '../../components/CandidateColumn';
import { Candidates, Candidate } from '../../types';

// Reducer to manage candidates state
type Action =
  | { type: 'INITIALIZE'; payload: Candidates }
  | { type: 'UPDATE_CANDIDATE'; payload: Candidate };

const candidatesReducer = (state: Candidates | undefined, action: Action): Candidates => {
  switch (action.type) {
    case 'INITIALIZE':
      return action.payload;
    case 'UPDATE_CANDIDATE': {
      const { id, status } = action.payload;
      const updatedCandidates = { ...state };

      // Remove from the previous column
      for (const column of COLUMNS) {
        updatedCandidates[column] = updatedCandidates[column]?.filter(candidate => candidate.id !== id);
      }

      // Add to the new column
      updatedCandidates[status] = [
        ...(updatedCandidates[status] || []),
        action.payload,
      ];

      return updatedCandidates as Candidates;
    }
    default:
      return state;
  }
};

function JobShow() {
  const { jobId } = useParams();
  const { job } = useJob(jobId);
  const { candidates: initialCandidates } = useCandidates(jobId);

  const [candidates, dispatch] = useReducer(candidatesReducer, undefined);

  const { handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragAndDrop();

  useEffect(() => {
    if (initialCandidates) {
      dispatch({ type: 'INITIALIZE', payload: initialCandidates });
    }
  }, [initialCandidates]);

  useWebSocket(
    (updatedCandidate: Candidate) => {
      dispatch({ type: 'UPDATE_CANDIDATE', payload: updatedCandidate });
    },
    jobId
  );
  return (
    <>
      <Box backgroundColor="neutral-70" p={20} alignItems="center">
        <Text variant="h5" color="white" m={0}>
          {job?.name}
        </Text>
      </Box>

      <Box p={20}>
        <Flex gap={10}>
          {COLUMNS.map(column => (
            <CandidateColumn
              key={column}
              column={column}
              candidates={candidates?.[column] ||	[]}
              handleDragStart={(e, candidate) => handleDragStart(e, candidate)}
              handleDragOver={(e, index) => handleDragOver(e, index)}
              handleDrop={(e) => handleDrop(e, candidates, column)}
              handleDragEnd={handleDragEnd}
            />
          ))}
        </Flex>
      </Box>
    </>
  )
}

export default JobShow;
