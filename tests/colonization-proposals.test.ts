import { describe, it, expect, beforeEach } from 'vitest'

// Mock the Clarity contract environment
const mockContractEnv = {
  proposals: new Map(),
  proposalCount: 0,
  caller: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
}

// Mock Clarity functions
function submitProposal(exoplanetId: string, description: string, resourceRequirements: Array<{ resource: string, amount: number }>) {
  const newProposalId = mockContractEnv.proposalCount + 1
  mockContractEnv.proposals.set(newProposalId, {
    proposer: mockContractEnv.caller,
    exoplanetId,
    description,
    resourceRequirements,
    votes: 0,
    status: 'active'
  })
  mockContractEnv.proposalCount = newProposalId
  return { ok: newProposalId }
}

function voteOnProposal(proposalId: number) {
  const proposal = mockContractEnv.proposals.get(proposalId)
  if (!proposal) return { err: 404 }
  if (proposal.status !== 'active') return { err: 403 }
  proposal.votes += 1
  mockContractEnv.proposals.set(proposalId, proposal)
  return { ok: true }
}

function allocateResources(proposalId: number) {
  const proposal = mockContractEnv.proposals.get(proposalId)
  if (!proposal) return { err: 404 }
  if (proposal.status !== 'active') return { err: 403 }
  if (proposal.votes < 10) return { err: 403 }
  proposal.status = 'resources-allocated'
  mockContractEnv.proposals.set(proposalId, proposal)
  return { ok: true }
}

describe('Colonization Proposals Contract', () => {
  beforeEach(() => {
    mockContractEnv.proposals.clear()
    mockContractEnv.proposalCount = 0
  })
  
  it('should submit a proposal successfully', () => {
    const result = submitProposal('kepler-22b', 'Test proposal', [{ resource: 'water', amount: 1000 }])
    expect(result).toEqual({ ok: 1 })
    expect(mockContractEnv.proposals.size).toBe(1)
    expect(mockContractEnv.proposals.get(1)).toMatchObject({
      exoplanetId: 'kepler-22b',
      description: 'Test proposal',
      votes: 0,
      status: 'active'
    })
  })
  
  it('should vote on a proposal successfully', () => {
    submitProposal('kepler-22b', 'Test proposal', [{ resource: 'water', amount: 1000 }])
    const result = voteOnProposal(1)
    expect(result).toEqual({ ok: true })
    expect(mockContractEnv.proposals.get(1)?.votes).toBe(1)
  })
  
  it('should fail to vote on a non-existent proposal', () => {
    const result = voteOnProposal(999)
    expect(result).toEqual({ err: 404 })
  })
  
  it('should allocate resources when votes threshold is met', () => {
    submitProposal('kepler-22b', 'Test proposal', [{ resource: 'water', amount: 1000 }])
    for (let i = 0; i < 10; i++) {
      voteOnProposal(1)
    }
    const result = allocateResources(1)
    expect(result).toEqual({ ok: true })
    expect(mockContractEnv.proposals.get(1)?.status).toBe('resources-allocated')
  })
  
  it('should fail to allocate resources when votes threshold is not met', () => {
    submitProposal('kepler-22b', 'Test proposal', [{ resource: 'water', amount: 1000 }])
    voteOnProposal(1)
    const result = allocateResources(1)
    expect(result).toEqual({ err: 403 })
    expect(mockContractEnv.proposals.get(1)?.status).toBe('active')
  })
})

