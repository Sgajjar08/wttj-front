import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

import { Flex } from '@welcome-ui/flex';
import { Box } from '@welcome-ui/box';
import { Badge } from '@welcome-ui/badge';
import { Text } from '@welcome-ui/text';

import { Candidate, Candidates, Statuses } from '../../types';
import CandidateCard from '../Candidate';
import { useDragAndDropContext } from '../../provider/dragAndDropProvider';

interface CandidateColumnProps {
  column: Statuses;
}

const CandidateColumn = ({ column }: CandidateColumnProps) => {
  const queryClient = useQueryClient();
  const { jobId } = useParams();
  const candidates: Candidates = queryClient.getQueryData(['candidates', jobId]);
  const { handleDrop, handleDragOver } = useDragAndDropContext();

  return (
    <Box
      w={300}
      border={1}
      backgroundColor='white'
      borderColor='neutral-30'
      borderRadius='md'
      overflow='hidden'
      role={`group-${column}`}
      onDragOver={(e) => handleDragOver(e, column)}
      onDrop={handleDrop}>
      <Flex p={10} borderBottom={1} borderColor='neutral-30' alignItems='center' justify='space-between'>
        <Text variant='h5' color='black' m={0} textTransform='capitalize'>
          {column}
        </Text>
        <Badge>{candidates ? candidates[column].length : 0}</Badge>
      </Flex>
      <Flex direction='column' p={10} pb={0}>
        {candidates &&
          candidates[column].map((candidate: Candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
      </Flex>
    </Box>
  );
};

export default CandidateColumn;
