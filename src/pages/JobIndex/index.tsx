import { Link as RouterLink } from 'react-router-dom';

import { Link } from '@welcome-ui/link';
import { Flex } from '@welcome-ui/flex';
import { WelcomeLoader } from '@welcome-ui/welcome-loader';

import { useJobs } from '../../hooks';

function JobIndex() {
  const { isLoading, jobs } = useJobs();

  if (isLoading) {
    return <Flex justifyContent='center' h='100vh' alignItems='center'>
      <WelcomeLoader />
      </Flex>;
  }

  return (
    <ul>
      {jobs?.map((job) => (
        <li>
          <Link as={RouterLink} to={`/jobs/${job.id}`}>
            {job.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default JobIndex;
