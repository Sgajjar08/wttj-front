import { useMutation, useQuery } from 'react-query';

import { getCandidates, getJob, getJobs, updateCandidateStatus } from '../api';
import { UpdateCandidateStatusPayload } from '../types';

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

export const useCandidates = (jobId?: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: () => getCandidates(jobId),
    enabled: !!jobId,
  });

  return { isLoading, error, candidates: data };
};

export const useUpdateCandidateStatus = () => {
  const { mutate: updateCandidateStatusMutation, isSuccess } = useMutation({
    mutationKey: ['updateCandidate'],
    mutationFn: (updateCandidateStatusPayload: UpdateCandidateStatusPayload) =>
      updateCandidateStatus(updateCandidateStatusPayload),
  });

  return { updateCandidateStatusMutation, isSuccess };
};
