import { Card } from '@welcome-ui/card';

import { Candidate } from '../../types';

type Props = {
  candidate: Candidate;
  handleDragStart?: (e: React.DragEvent) => void;
  handleDragOver?: (e: React.DragEvent) => void;
  handleDragEnd?: (e: React.DragEvent) => void;
};

function CandidateCard({ candidate, handleDragEnd, handleDragOver, handleDragStart }: Props) {
  return (
    <Card
      draggable
      mb={10}
      tabIndex={0}
      role='listitem'
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}>
      <Card.Body>{candidate.position}</Card.Body>
      <Card.Body>{candidate.email}</Card.Body>
    </Card>
  );
}

export default CandidateCard;
