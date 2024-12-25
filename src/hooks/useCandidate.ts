import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Socket } from 'phoenix';

import { getCandidates, updateCandidateStatus } from '../api';
import { Candidate, Candidates, UpdateCandidateStatusPayload } from '../types';
import { COLUMNS } from '../constants';

export const useCandidates = (jobId?: string) => {
  return useQuery(['candidates', jobId], () => getCandidates(jobId));
};

export const useUpdateCandidateStatus = (jobId?: string) => {
  const queryClient = useQueryClient();

  return useMutation(updateCandidateStatus, {
    onMutate: async (updatedCandidatePayload: UpdateCandidateStatusPayload) => {
      await queryClient.cancelQueries(['candidates', jobId]);

      const previousData = queryClient.getQueryData<Candidates>([
        'candidates',
        jobId,
      ]);

      if (previousData) {
        const newData: Candidates = { ...previousData };
        const updatedCandidate = updatedCandidatePayload.candidate;

        // Remove candidate from its old column
        for (const column of COLUMNS) {
          newData[column] = newData[column]?.filter(
            (c) => c.id !== updatedCandidate.id
          );
          newData[column] = newData[column]
        }

        // Add to the new column
        const { status } = updatedCandidate;
        newData[status] = [
          ...(newData[status] || []),
          { ...updatedCandidate },
        ];

        queryClient.setQueryData(['candidates', jobId], newData);
      }

      return { previousData };
    },

    onError: (context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['candidates', jobId], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(['candidates', jobId]);
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
            newData[column] = newData[column]?.filter(
              (c) => c.id !== updatedCandidate.id
            );
          }

          // Add to the new column
          const { status } = updatedCandidate;
          newData[status] = [
            ...(newData[status] || []),
            updatedCandidate,
          ];

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
