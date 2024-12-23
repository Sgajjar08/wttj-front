import { Flex } from '@welcome-ui/flex';
import { Box } from '@welcome-ui/box';
import { Badge } from '@welcome-ui/badge';
import { Text } from '@welcome-ui/text';

import { Candidate, Statuses } from '../../types';
import CandidateCard from '../Candidate';

interface CandidateColumnProps {
  column: Statuses;
  candidates: Candidate[];
  handleDragStart: (e: React.DragEvent<Element>, candidate: Candidate) => void;
  handleDragEnd: (e: React.DragEvent<Element>) => void;
  handleDragOver: (e: React.DragEvent<Element>, targetIndex: string) => void;
  handleDrop: (e: React.DragEvent<Element>) => void;
}

const CandidateColumn = ({
  column,
  candidates,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
}: CandidateColumnProps) => (
  <Box
    w={300}
    border={1}
    backgroundColor="white"
    borderColor="neutral-30"
    borderRadius="md"
    overflow="hidden"
    onDragOver={(e) => e.preventDefault()}
    onDrop={handleDrop}
  >
    <Flex p={10} borderBottom={1} borderColor="neutral-30" alignItems="center" justify="space-between">
      <Text color="black" m={0} textTransform="capitalize">
        {column}
      </Text>
      <Badge>{candidates.length}</Badge>
    </Flex>
    <Flex direction="column" p={10} pb={0}>
      {candidates.map((candidate: Candidate, index: number) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          handleDragStart={(e) => handleDragStart(e, candidate)}
          handleDragEnd={handleDragEnd}
          handleDragOver={(e) => handleDragOver(e, index.toString())}
        />
      ))}
    </Flex>
  </Box>
);

export default CandidateColumn;