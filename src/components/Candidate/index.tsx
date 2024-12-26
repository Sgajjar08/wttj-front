import { Card } from '@welcome-ui/card';

import { Candidate } from '../../types';
import { useDragAndDropContext } from '../../provider/dragAndDropProvider';

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const { handleDragStart, handleDragEnd, draggedCandidate } = useDragAndDropContext();

  return (
    <Card
      draggable
      mb={10}
      tabIndex={0}
      role='listitem'
      backgroundColor={draggedCandidate?.id === candidate.id ? 'beige-10' : 'neutral-10'}
      onDragStart={(e) => handleDragStart(e, candidate)}
      onDragEnd={handleDragEnd}
    >
      <Card.Body>{candidate.email}</Card.Body>
    </Card>
  );
}

export default CandidateCard;
