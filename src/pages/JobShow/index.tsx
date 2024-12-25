import { useParams } from 'react-router-dom';

import { Text } from '@welcome-ui/text';
import { Flex } from '@welcome-ui/flex';
import { Box } from '@welcome-ui/box';

import { useJob } from '../../hooks';
import { COLUMNS } from '../../constants';
import CandidateColumn from '../../components/CandidateColumn';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useCandidates, useWebSocketForCandidates } from '../../hooks/useCandidate';

function JobShow() {
  const { jobId } = useParams();
  const { job } = useJob(jobId);
  const { data: candidates } = useCandidates(jobId);

  const { handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragAndDrop(jobId);

  useWebSocketForCandidates(jobId);

  return (
    <>
      <Box backgroundColor='neutral-70' p={20} alignItems='center'>
        <Text variant='h5' color='white' m={0}>
          {job?.name}
        </Text>
      </Box>

      <Box p={20}>
        <Flex gap={10}>
          {COLUMNS.map((column) => (
            <CandidateColumn
              key={column}
              column={column}
              candidates={candidates?.[column] || []}
              handleDragStart={(e, candidate) => handleDragStart(e, candidate)}
              handleDragOver={(e, index) => handleDragOver(e, index)}
              handleDrop={(e) => handleDrop(e, candidates, column)}
              handleDragEnd={handleDragEnd}
            />
          ))}
        </Flex>
      </Box>
    </>
  );
}

export default JobShow;
