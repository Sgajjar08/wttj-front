import { Candidates, Job, UpdateCandidateStatusPayload } from '../types';

const BASE_URL_API = 'http://localhost:4000/api/jobs';

export const getJobs = async (): Promise<Job[]> => {
  const response = await fetch(BASE_URL_API);
  const { data } = await response.json();
  return data;
};

export const getJob = async (jobId?: string): Promise<Job | null> => {
  if (!jobId) return null;
  const response = await fetch(`${BASE_URL_API}/${jobId}`);
  const { data } = await response.json();
  return data;
};

export const getCandidates = async (jobId?: string): Promise<Candidates> => {
  if (!jobId) return undefined;
  const response = await fetch(`${BASE_URL_API}/${jobId}/candidates`);
  const { data } = await response.json();
  return data;
};

export const updateCandidateStatus = async (payload: UpdateCandidateStatusPayload) => {
  const { jobId, candidate } = payload;
  const { id, status, email } = candidate;

  if (!jobId || !id || !status || !email) {
    throw new Error('Missing required parameters: jobId, id, status, or email');
  }

  const response = await fetch(`${BASE_URL_API}/${jobId}/candidates/${id}`, {
    method: 'put',
    body: JSON.stringify({ candidate }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = response.json();
  return data;
};
