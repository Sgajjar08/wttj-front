import { useEffect } from 'react';
import { Socket } from 'phoenix';

import { Candidate } from '../types';

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
