import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useUpdateCandidateStatus } from '.';
import { Candidate, Candidates, Statuses } from '../types';

export const useDragAndDrop = () => {
  const { updateCandidateStatusMutation } = useUpdateCandidateStatus();
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);
  const { jobId } = useParams();

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

      if (!draggedCandidate || !candidates || !targetColumn) return;

      if (hoverIndex) {
        const hoverCandidate = candidates[targetColumn][+hoverIndex];
        if (hoverCandidate.position < draggedCandidate.position) {
          draggedCandidate.position = hoverCandidate.position - 1;
        }
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
