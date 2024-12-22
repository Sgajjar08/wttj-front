import { useParams } from 'react-router-dom';

import { Text } from '@welcome-ui/text';
import { Flex } from '@welcome-ui/flex';
import { Box } from '@welcome-ui/box';
import { Badge } from '@welcome-ui/badge';

import { useJob, useCandidates } from '../../hooks';
import { Candidate } from '../../types';
import CandidateCard from '../../components/Candidate';
import { COLUMNS } from '../../constants';

function JobShow() {
  const { jobId } = useParams();
  const { job } = useJob(jobId);
  const { candidates } = useCandidates(jobId);

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
            <Box
              w={300}
              border={1}
              backgroundColor="white"
              borderColor="neutral-30"
              borderRadius="md"
              overflow="hidden"
            >
              <Flex
                p={10}
                borderBottom={1}
                borderColor="neutral-30"
                alignItems="center"
                justify="space-between"
              >
                <Text color="black" m={0} textTransform="capitalize">
                  {column}
                </Text>
                <Badge>{(candidates?.[column] || []).length}</Badge>
              </Flex>
              <Flex direction="column" p={10} pb={0}>
                {candidates?.[column]?.map((candidate: Candidate) => (
                  <CandidateCard candidate={candidate} />
                ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>
    </>
  )
}

export default JobShow;
