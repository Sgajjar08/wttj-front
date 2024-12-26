import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from 'react-query';

import { Candidate, Candidates, Statuses } from '../types';
import { useUpdateCandidate } from '../hooks/useCandidate';

interface DragAndDropContextProps {
  draggedCandidate: Candidate | null;
  handleDragStart: (e: React.DragEvent<Element>, candidate: Candidate) => void;
  handleDragOver: (e: React.DragEvent, targetStatus: Statuses) => void;
  handleDrop: (e: React.DragEvent<Element>) => void;
  handleDragEnd: (e: React.DragEvent<Element>) => void;
}

const DragAndDropContext = createContext<DragAndDropContextProps>({
  draggedCandidate: null,
  handleDragStart: () => {},
  handleDragOver: () => {},
  handleDrop: () => {},
  handleDragEnd: () => {},
});

interface DragAndDropProviderProps {
  children: ReactNode;
  jobId?: string;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children, jobId }) => {
  const queryClient = useQueryClient();
  const candidates: Candidates = queryClient.getQueryData(['candidates', jobId]);
  const { mutate: updateCandidateMutation } = useUpdateCandidate(jobId);
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    targetStatus: Statuses;
    index: number;
    newPosition: number;
  } | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent<Element>, candidate: Candidate) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCandidate(candidate);
    (e.target as HTMLElement).setAttribute('aria-grabbed', 'true');
  }, []);

  // Precompute positions for binary search
  const getCardPositions = useCallback(
    (columnId: Statuses) => {
      if (!candidates) return;
      return candidates[columnId].map((card) => card.position);
    },
    [candidates],
  );

  // Binary Search to Find Drop Target
  const findDropPosition = (mouseY: number, status: Statuses) => {
    if (!candidates) return { targetIndex: 0, newPosition: 0 };

    const columnCards = candidates[status];
    const cardPositions = getCardPositions(status);
    const cardElements = Array.from(document.querySelectorAll(`[role="group-${status}"] [role="listitem"]`));

    if (!cardPositions) return { targetIndex: 0, newPosition: 0 };

    let low = 0;
    let high = cardPositions.length - 1;
    let targetIndex = columnCards.length;
    let newPosition = columnCards.length > 0 ? cardPositions[cardPositions.length - 1] + 1 : 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cardRect = cardElements[mid]?.getBoundingClientRect();
      const cardMiddle = cardRect.top + cardRect.height / 2;

      if (mouseY < cardMiddle) {
        targetIndex = mid;
        if (mid === 0) {
          newPosition = cardPositions[0] / 2;
        } else {
          newPosition = (cardPositions[mid - 1] + cardPositions[mid]) / 2;
        }
        high = mid - 1;
      } else {
        low = Math.floor(mid + 100);
      }
    }

    return { targetIndex, newPosition };
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent, status: Statuses) => {
      e.preventDefault();
      const { clientY } = e;
      const { targetIndex, newPosition } = findDropPosition(clientY, status);
      setDropTarget({ targetStatus: status, index: targetIndex, newPosition });
    },
    [findDropPosition],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<Element>) => {
      e.preventDefault();
      if (!draggedCandidate || !dropTarget || !candidates) return;

      const { id, status: sourceStatus } = draggedCandidate;
      const { targetStatus: targetStatus, newPosition } = dropTarget;

      const updatedCandidates = { ...candidates };
      const sourceCandidates = updatedCandidates[sourceStatus];
      const candidateIndex = sourceCandidates.findIndex((c) => c.id === id);
      const updatedCandidate = sourceCandidates[candidateIndex];
      updatedCandidate.position = newPosition;
      updatedCandidate.status = targetStatus;

      updateCandidateMutation({
        jobId: jobId,
        candidate: updatedCandidate,
      });

      setDraggedCandidate(null);
      setDropTarget(null);
    },
    [updateCandidateMutation, draggedCandidate, jobId, dropTarget],
  );

  const handleDragEnd = useCallback((e: React.DragEvent<Element>) => {
    (e.target as HTMLElement).setAttribute('aria-grabbed', 'false');
    setDraggedCandidate(null);
    setDropTarget(null);
  }, []);

  return (
    <DragAndDropContext.Provider
      value={{
        draggedCandidate,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
      }}>
      {children}
    </DragAndDropContext.Provider>
  );
};

export const useDragAndDropContext = (): DragAndDropContextProps => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error('useDragAndDropContext must be used within a DragAndDropProvider');
  }
  return context;
};
