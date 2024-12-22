import { Candidates, Job } from "../types";

export const getJobs = async (): Promise<Job[]> => {
  const response = await fetch(`http://localhost:4000/api/jobs`);
  const { data } = await response.json();
  return data;
}

export const getJob = async (jobId?: string): Promise<Job | null> => {
  if (!jobId) return null;
  const response = await fetch(`http://localhost:4000/api/jobs/${jobId}`);
  const { data } = await response.json();
  return data;
}

export const getCandidates = async (jobId?: string): Promise<Candidates> => {
  if (!jobId) return undefined;
  const response = await fetch(`http://localhost:4000/api/jobs/${jobId}/candidates`);
  const { data } = await response.json();
  return data;
}
