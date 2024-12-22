import { useParams } from 'react-router-dom';

import { Text } from '@welcome-ui/text';
import { Flex } from '@welcome-ui/flex';
import { Box } from '@welcome-ui/box';

import { useJob, useCandidates, useDragAndDrop } from '../../hooks';

import { COLUMNS } from '../../constants';
import CandidateColumn from '../../components/CandidateColumn';

function JobShow() {
  const { jobId } = useParams();
  const { job } = useJob(jobId);
  const { candidates } = useCandidates(jobId);
  const { handleDragStart, handleDragOver, handleDrop, handleDragEnd} = useDragAndDrop();

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
              handleDragStart={(e, candidateId, sourceColumn) => handleDragStart(e, candidateId, sourceColumn, jobId as string)}
              handleDragOver={handleDragOver}
              handleDrop={(e) => handleDrop(e, column)}
              handleDragEnd={(e) => handleDragEnd(e, candidates)}
            />
          ))}
        </Flex>
      </Box>
    </>
  )
}

export default JobShow;
