import { Flex } from '@welcome-ui/flex';
import { Box } from '@welcome-ui/box';
import { Badge } from '@welcome-ui/badge';
import { Text } from '@welcome-ui/text';

import { Candidate, Candidates, Statuses } from '../../types';
import CandidateCard from '../Candidate';
import { useDragAndDropContext } from '../../provider/dragAndDropProvider';

interface CandidateColumnProps {
  column: Statuses;
  candidates: Candidates;
}

const CandidateColumn = ({ column, candidates }: CandidateColumnProps) => {
  const { handleDrop } = useDragAndDropContext();

  return (
    <Box
      w={300}
      border={1}
      backgroundColor='white'
      borderColor='neutral-30'
      borderRadius='md'
      overflow='hidden'
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, candidates, column)}>
      <Flex p={10} borderBottom={1} borderColor='neutral-30' alignItems='center' justify='space-between'>
        <Text variant='h5' color='black' m={0} textTransform='capitalize'>
          {column}
        </Text>
        <Badge>{candidates ? candidates[column].length : 0}</Badge>
      </Flex>
      <Flex direction='column' p={10} pb={0}>
        {candidates &&
          candidates[column].map((candidate: Candidate, index: number) => (
            <CandidateCard key={candidate.id} candidate={candidate} index={index} />
          ))}
      </Flex>
    </Box>
  );
};

export default CandidateColumn;
