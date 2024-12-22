import { Card } from '@welcome-ui/card';

import { Candidate, Statuses } from '../../types';

type Props = {
  candidate: Candidate,
  handleDragStart?: (e: React.DragEvent, id: number, status: Statuses) => void;
  handleDragOver?: (e: React.DragEvent) => void;
  handleDragEnd?: (e: React.DragEvent) => void;
}

function CandidateCard({ candidate, handleDragEnd, handleDragOver, handleDragStart }: Props) {
  return (
    <Card 
      draggable 
      mb={10}
      tabIndex={0}
      role='listitem'
      onDragStart={(e) => handleDragStart?.(e, candidate.id, candidate.status)} 
      onDragEnd={handleDragEnd} 
      onDragOver={handleDragOver}
    >
      <Card.Body>{candidate.email}</Card.Body>
    </Card>
  )
}

export default CandidateCard;