import { Card } from '@welcome-ui/card';

import { Candidate } from '../../types';
import { useDragAndDropContext } from '../../provider/dragAndDropProvider';

type Props = {
  candidate: Candidate;
  index?: number;
};

function CandidateCard({ candidate, index = 0 }: Props) {
  const { handleDragStart, handleDragOver, handleDragEnd, draggedCandidate } = useDragAndDropContext();
  return (
    <Card
      draggable
      mb={10}
      tabIndex={0}
      role='listitem'
      backgroundColor={draggedCandidate?.id === candidate.id ? 'beige-10' : 'neutral-10'}
      onDragStart={(e) => handleDragStart(e, candidate)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => handleDragOver(e, index.toString())}>
      <Card.Body>{candidate.position}</Card.Body>
      <Card.Body>{candidate.email}</Card.Body>
    </Card>
  );
}

export default CandidateCard;
