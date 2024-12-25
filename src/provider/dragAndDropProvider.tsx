import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Candidate, Candidates, Statuses } from '../types';
import { useUpdateCandidateStatus } from '../hooks/useCandidate';

interface DragAndDropContextProps {
    draggedCandidate: Candidate | null;
    hoverIndex: string | null;
    handleDragStart: (e: React.DragEvent<Element>, candidate: Candidate) => void;
    handleDragOver: (e: React.DragEvent, targetIndex: string) => void;
    handleDrop: (e: React.DragEvent<Element>, candidates: Candidates, targetColumn: Statuses) => void;
    handleDragEnd: (e: React.DragEvent<Element>) => void;
}

const DragAndDropContext = createContext<DragAndDropContextProps>({
    draggedCandidate: null,
    hoverIndex: null,
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
        [updateCandidateStatusMutation, draggedCandidate, hoverIndex, jobId],
    );

    const handleDragEnd = useCallback((e: React.DragEvent<Element>) => {
        (e.target as HTMLElement).setAttribute('aria-grabbed', 'false');
        setDraggedCandidate(null);
        setHoverIndex(null);
    }, []);

    return (
        <DragAndDropContext.Provider
            value={{
                draggedCandidate,
                hoverIndex,
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
