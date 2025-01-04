;; Exoplanet NFT Contract

(define-non-fungible-token exoplanet-claim uint)

(define-data-var claim-count uint u0)

(define-map claims
  { claim-id: uint }
  {
    owner: principal,
    exoplanet-id: (string-ascii 20),
    claim-type: (string-ascii 20),
    coordinates: {x: int, y: int},
    area: uint
  }
)

(define-public (mint-claim (exoplanet-id (string-ascii 20)) (claim-type (string-ascii 20)) (coordinates {x: int, y: int}) (area uint))
  (let
    (
      (new-claim-id (+ (var-get claim-count) u1))
    )
    (try! (nft-mint? exoplanet-claim new-claim-id tx-sender))
    (map-set claims
      { claim-id: new-claim-id }
      {
        owner: tx-sender,
        exoplanet-id: exoplanet-id,
        claim-type: claim-type,
        coordinates: coordinates,
        area: area
      }
    )
    (var-set claim-count new-claim-id)
    (ok new-claim-id)
  )
)

(define-public (transfer-claim (claim-id uint) (recipient principal))
  (let
    (
      (claim (unwrap! (map-get? claims { claim-id: claim-id }) (err u404)))
    )
    (asserts! (is-eq tx-sender (get owner claim)) (err u403))
    (try! (nft-transfer? exoplanet-claim claim-id tx-sender recipient))
    (map-set claims
      { claim-id: claim-id }
      (merge claim { owner: recipient })
    )
    (ok true)
  )
)

(define-read-only (get-claim (claim-id uint))
  (ok (unwrap! (map-get? claims { claim-id: claim-id }) (err u404)))
)

(define-read-only (get-claim-count)
  (ok (var-get claim-count))
)

