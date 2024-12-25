import { useQuery } from 'react-query';

import { getJob, getJobs } from '../api';

export const useJobs = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });

  return { isLoading, error, jobs: data };
};

export const useJob = (jobId?: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
  });

  return { isLoading, error, job: data };
};
