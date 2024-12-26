import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Socket } from 'phoenix';

import { getCandidates, updateCandidateStatus } from '../api';
import { Candidate, Candidates } from '../types';
import { COLUMNS } from '../constants';

export const useCandidates = (jobId?: string) => {
  const { data, isError, isLoading } = useQuery(['candidates', jobId], () => getCandidates(jobId as string), { enabled: !!jobId });
  return { data, isError, isLoading };
};

export const useUpdateCandidate = (jobId?: string) => {
  const queryClient = useQueryClient();

  return useMutation(updateCandidateStatus, {
    onError: (context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['candidates', jobId], context.previousData);
      }
    },
  });
};

export const useWebSocketForCandidates = (jobId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!jobId) return;

    const socket = new Socket('ws://localhost:4000/socket');
    socket.connect();

    const channel = socket.channel(`job:${jobId}`, {});
    channel
      .join()
      .receive('ok', () => {
        console.log(`Joined WebSocket channel for job ${jobId}`);
      })
      .receive('error', (resp) => {
        console.error('Unable to join channel', resp);
      });

    // Listen for WebSocket updates
    channel.on('candidate:update', (response) => {
      const updatedCandidate: Candidate = response?.data;

      if (!updatedCandidate) return;

      queryClient.setQueryData<Candidates>(['candidates', jobId], (oldCandidates) => {
        if (!oldCandidates) return undefined;

        const newCandidates: Candidates = { ...oldCandidates };
        const { id, status } = updatedCandidate;

        COLUMNS.forEach((column) => {
          if (newCandidates[column]) {
            newCandidates[column] = newCandidates[column].filter((c) => c.id !== id);
          }
        });

        newCandidates[status] = newCandidates[status].concat([updatedCandidate]).sort((a, b) => a.position - b.position);

        return newCandidates;
      });
    });

    socket.onError((error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, [jobId, queryClient]);
};
