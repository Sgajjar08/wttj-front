type Job = {
    id: string
    name: string
}

type Candidate = {
    id: number
    email: string
    status: 'new' | 'interview' | 'hired' | 'rejected'
    position: number
}

type Statuses = 'new' | 'interview' | 'hired' | 'rejected'

export { type Job, type Candidate, type Statuses}