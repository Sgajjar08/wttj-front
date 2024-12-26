import { useParams } from 'react-router-dom';

import { Text } from '@welcome-ui/text';
import { Flex } from '@welcome-ui/flex';
import { Box } from '@welcome-ui/box';
import { Alert } from '@welcome-ui/alert';
import { Loader } from '@welcome-ui/loader';

import { useJob } from '../../hooks';
import { COLUMNS } from '../../constants';
import CandidateColumn from '../../components/CandidateColumn';
import { useCandidates, useWebSocketForCandidates } from '../../hooks/useCandidate';
import { DragAndDropProvider } from '../../provider/dragAndDropProvider';

function JobShow() {
  const { jobId } = useParams();
  const { job } = useJob(jobId);
  const { data: candidates, isLoading, isError } = useCandidates(jobId);

  useWebSocketForCandidates(jobId);

  if (isLoading) {
    return <Loader color='primary-40' />;
  }

  if (isError) {
    return (
      <Alert variant='danger'>
        <Alert.Title>Fetching Error</Alert.Title>
        'Something went wrong. Please try again later.'
      </Alert>
    );
  }

  if (!candidates) {
    return (
      <Alert>
        <Alert.Title>No candidates available</Alert.Title>
        'Please try again later.'
      </Alert>
    );
  }

  return (
    <DragAndDropProvider jobId={jobId}>
      <Box backgroundColor='neutral-70' p={20} alignItems='center'>
        <Text variant='h5' color='white' m={0}>
          {job?.name}
        </Text>
      </Box>

      <Box p={20} role='status'>
        <Flex gap={10} justifyContent='center'>
          {COLUMNS.map((column) => (
            <CandidateColumn key={column} column={column} />
          ))}
        </Flex>
      </Box>
    </DragAndDropProvider>
  );
}

export default JobShow;
