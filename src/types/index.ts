type Job = {
  id: string;
  name: string;
};

type Candidate = {
  id: number;
  email: string;
  status: 'new' | 'interview' | 'hired' | 'rejected';
  position: number;
};

type Statuses = 'new' | 'interview' | 'hired' | 'rejected';

type Candidates =
  | {
      [key in Statuses]: Candidate[];
    }
  | undefined;

type UpdateCandidateStatusPayload = {
  jobId?: string;
  candidate: Candidate;
};

export type { Job, Candidate, Statuses, Candidates, UpdateCandidateStatusPayload };
