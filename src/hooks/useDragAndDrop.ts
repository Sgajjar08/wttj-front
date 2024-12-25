import { useState, useCallback } from 'react';

import { Candidate, Candidates, Statuses } from '../types';
import { useUpdateCandidateStatus } from './useCandidate';

export const useDragAndDrop = (jobId?: string) => {
  const { mutate: updateCandidateStatusMutation } = useUpdateCandidateStatus(jobId);
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent<Element>, candidate: Candidate) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCandidate(candidate);
    (e.target as HTMLElement).setAttribute('aria-grabbed', 'true');
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetIndex: string) => {
      e.preventDefault();
      if (!draggedCandidate) return;
      setHoverIndex(targetIndex);
    },
    [draggedCandidate],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<Element>, candidates: Candidates, targetColumn: Statuses) => {
      e.preventDefault();

      if (!draggedCandidate || !candidates || !targetColumn || !hoverIndex) return;

      const hoverCandidate = candidates[targetColumn][Number(hoverIndex)];
      if (hoverCandidate && hoverCandidate.position < draggedCandidate.position) {
        draggedCandidate.position = hoverCandidate.position - 1;
      }

      updateCandidateStatusMutation({
        jobId: jobId,
        candidate: { ...draggedCandidate, status: targetColumn },
      });
      setDraggedCandidate(null);
      setHoverIndex(null);
    },
    [updateCandidateStatusMutation, draggedCandidate, hoverIndex],
  );

  const handleDragEnd = useCallback((e: React.DragEvent<Element>) => {
    (e.target as HTMLElement).setAttribute('aria-grabbed', 'false');
    setDraggedCandidate(null);
    setHoverIndex(null);
  }, []);

  return {
    draggedCandidate,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
