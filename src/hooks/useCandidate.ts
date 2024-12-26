import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Socket } from 'phoenix';

import { getCandidates, updateCandidateStatus } from '../api';
import { Candidate, Candidates } from '../types';
import { COLUMNS } from '../constants';

export const useCandidates = (jobId?: string) => {
  const {data, isError, isLoading} = useQuery(['candidates', jobId], () => getCandidates(jobId as string), { enabled: !!jobId });
  return { data, isError, isLoading};
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

      if (updatedCandidate) {
        queryClient.setQueryData<Candidates>(['candidates', jobId], (oldData) => {
          if (!oldData) return oldData;
      
          const newData: Candidates = { ...oldData };
      
          // Remove candidate from the old column
          for (const column of COLUMNS) {
            newData[column] = newData[column]?.filter((c) => c.id !== updatedCandidate.id);
          }
      
          // Add to the new column
          const { status } = updatedCandidate;
          newData[status] = [...(newData[status] || []), updatedCandidate];
      
          return newData;
        });
      }
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
