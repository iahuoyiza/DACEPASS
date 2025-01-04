import { describe, it, expect, beforeEach } from 'vitest'

// Mock the Clarity contract environment
const mockContractEnv = {
  claims: new Map(),
  claimCount: 0,
  caller: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
}

// Mock Clarity functions
function mintClaim(exoplanetId: string, claimType: string, coordinates: { x: number, y: number }, area: number) {
  const newClaimId = mockContractEnv.claimCount + 1
  mockContractEnv.claims.set(newClaimId, {
    owner: mockContractEnv.caller,
    exoplanetId,
    claimType,
    coordinates,
    area
  })
  mockContractEnv.claimCount = newClaimId
  return { ok: newClaimId }
}

function transferClaim(claimId: number, recipient: string) {
  const claim = mockContractEnv.claims.get(claimId)
  if (!claim) return { err: 404 }
  if (claim.owner !== mockContractEnv.caller) return { err: 403 }
  claim.owner = recipient
  mockContractEnv.claims.set(claimId, claim)
  return { ok: true }
}

describe('Exoplanet NFT Contract', () => {
  beforeEach(() => {
    mockContractEnv.claims.clear()
    mockContractEnv.claimCount = 0
  })
  
  it('should mint a claim successfully', () => {
    const result = mintClaim('kepler-22b', 'land', { x: 10, y: 20 }, 100)
    expect(result).toEqual({ ok: 1 })
    expect(mockContractEnv.claims.size).toBe(1)
    expect(mockContractEnv.claims.get(1)).toMatchObject({
      exoplanetId: 'kepler-22b',
      claimType: 'land',
      coordinates: { x: 10, y: 20 },
      area: 100
    })
  })
  
  it('should transfer a claim successfully', () => {
    mintClaim('kepler-22b', 'land', { x: 10, y: 20 }, 100)
    const result = transferClaim(1, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')
    expect(result).toEqual({ ok: true })
    expect(mockContractEnv.claims.get(1)?.owner).toBe('ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')
  })
  
  it('should fail to transfer a non-existent claim', () => {
    const result = transferClaim(999, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')
    expect(result).toEqual({ err: 404 })
  })
  
  it('should fail to transfer a claim not owned by the caller', () => {
    mintClaim('kepler-22b', 'land', { x: 10, y: 20 }, 100)
    mockContractEnv.caller = 'ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    const result = transferClaim(1, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')
    expect(result).toEqual({ err: 403 })
  })
})
