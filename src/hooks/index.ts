import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { Socket } from 'phoenix';

import { getCandidates, getJob, getJobs, updateCandidateStatus } from '../api';
import { Candidate, Candidates, Statuses, UpdateCandidateStatusPayload } from '../types';

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
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);
  const { jobId } = useParams();

  const handleDragStart = useCallback(
    (e: React.DragEvent<Element>, candidate: Candidate) => {
      e.dataTransfer.effectAllowed = 'move';
      setDraggedCandidate(candidate);
      (e.target as HTMLElement).setAttribute('aria-grabbed', 'true');
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent, targetIndex: string) => {
    e.preventDefault();
    if(!draggedCandidate) return;
    setHoverIndex(targetIndex);
  }, [draggedCandidate]);

  const handleDrop = useCallback(
    (e: React.DragEvent<Element>, candidates: Candidates, targetColumn: Statuses) => {
      e.preventDefault();

      if (!draggedCandidate || !candidates || !hoverIndex || !targetColumn) return;

      const { id, status } = draggedCandidate;
      const candidate = candidates[status].find(candidate => candidate.id === id);

      if (!candidate) return;

      if (candidate.id !== candidates[status][+hoverIndex].id) {
        candidate.position = candidates[status][+hoverIndex].position - 1
      }

      updateCandidateStatusMutation({
        jobId: jobId,
        candidate: { ...candidate, status: targetColumn },
      });
      setDraggedCandidate(null);
      setHoverIndex(null);
    },
    [updateCandidateStatusMutation, draggedCandidate, hoverIndex]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<Element>) => {
      (e.target as HTMLElement).setAttribute('aria-grabbed', 'false');
      setDraggedCandidate(null);
      setHoverIndex(null);
    },
    []
  );

  return {
    draggedCandidate,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};

export const useWebSocket = (onUpdate: (candidate: Candidate) => void, jobId?: string) => {
  useEffect(() => {
    const socket = new Socket('ws://localhost:4000/socket');
    socket.connect();

    const channel = socket.channel(`job:${jobId}`, {});

    channel
      .join()
      .receive('ok', () => {
        console.log(`Joined job channel for job ${jobId}`);
      })
      .receive('error', (resp) => {
        console.error('Unable to join channel', resp);
      });

    channel.on('candidate:update', (response) => {
      if (response) {
        onUpdate(response.data);
      }
    });

    socket.onError((error) => {
      console.error('WebSocket error:', error);
    });

    // Retry logic for reconnection
    const interval = setInterval(() => {
      if (!socket.isConnected()) {
        socket.connect();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      channel.leave();
      socket.disconnect();
    };
  }, [jobId, onUpdate]);

  return null;
};
