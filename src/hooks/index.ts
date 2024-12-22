import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'react-query';

import { getCandidates, getJob, getJobs, updateCandidateStatus } from '../api';
import { Candidates, Statuses, UpdateCandidateStatusPayload } from '../types';

export const useJobs = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  })

  return { isLoading, error, jobs: data }
}

export const useJob = (jobId?: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
  })

  return { isLoading, error, job: data }
}

export const useCandidates = (jobId?: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: () => getCandidates(jobId),
    enabled: !!jobId,
  })

  return { isLoading, error, candidates: data }
}

export const useUpdateCandidateStatus = () => {
  const { mutate: updateCandidateStatusMutation, isSuccess} = useMutation({
    mutationKey: ['updateCandidate'],
    mutationFn: (updateCandidateStatusPayload: UpdateCandidateStatusPayload) => updateCandidateStatus(updateCandidateStatusPayload)
  });

  return { updateCandidateStatusMutation, isSuccess };
}

export const useDragAndDrop = () => {
  const { updateCandidateStatusMutation } = useUpdateCandidateStatus();
  const [draggedCandidate, setDraggedCandidate] = useState<{
    jobId: string;
    candidateId: number;
    sourceColumn: Statuses;
    targetColumn: Statuses | null;
  } | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<Element>, candidateId: number, sourceColumn: Statuses, jobId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      setDraggedCandidate({ candidateId, sourceColumn, jobId, targetColumn: null });
      (e.target as HTMLElement).setAttribute('aria-grabbed', 'true');
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<Element>, targetColumn: Statuses) => {
      e.preventDefault();
      if (!draggedCandidate) return;
      setDraggedCandidate({ ...draggedCandidate, targetColumn });
    },
    [draggedCandidate]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<Element>, candidates: Candidates) => {
      (e.target as HTMLElement).setAttribute('aria-grabbed', 'false');

      if (!draggedCandidate || !candidates) return;

      const { candidateId, sourceColumn, targetColumn } = draggedCandidate;
      const candidate = candidates[sourceColumn]?.find(candidate => candidate.id === candidateId);

      if (!candidate || sourceColumn === targetColumn || !targetColumn) return; // Prevent unnecessary updates

      updateCandidateStatusMutation({
        jobId: draggedCandidate.jobId,
        candidate: { ...candidate, status: targetColumn },
      });

      setDraggedCandidate(null);
    },
    [draggedCandidate, updateCandidateStatusMutation]
  );

  return {
    draggedCandidate,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};
