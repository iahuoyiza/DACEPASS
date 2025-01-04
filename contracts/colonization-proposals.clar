;; Colonization Proposals Contract

(define-data-var proposal-count uint u0)

(define-map proposals
  { proposal-id: uint }
  {
    proposer: principal,
    exoplanet-id: (string-ascii 20),
    description: (string-utf8 1000),
    resource-requirements: (list 10 {resource: (string-ascii 20), amount: uint}),
    votes: uint,
    status: (string-ascii 20)
  }
)

(define-public (submit-proposal (exoplanet-id (string-ascii 20)) (description (string-utf8 1000)) (resource-requirements (list 10 {resource: (string-ascii 20), amount: uint})))
  (let
    (
      (new-proposal-id (+ (var-get proposal-count) u1))
    )
    (map-set proposals
      { proposal-id: new-proposal-id }
      {
        proposer: tx-sender,
        exoplanet-id: exoplanet-id,
        description: description,
        resource-requirements: resource-requirements,
        votes: u0,
        status: "active"
      }
    )
    (var-set proposal-count new-proposal-id)
    (ok new-proposal-id)
  )
)

(define-public (vote-on-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) (err u404)))
    )
    (asserts! (is-eq (get status proposal) "active") (err u403))
    (map-set proposals
      { proposal-id: proposal-id }
      (merge proposal { votes: (+ (get votes proposal) u1) })
    )
    (ok true)
  )
)

(define-public (allocate-resources (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) (err u404)))
    )
    (asserts! (is-eq (get status proposal) "active") (err u403))
    (asserts! (>= (get votes proposal) u10) (err u403)) ;; Require at least 10 votes to allocate resources
    (map-set proposals
      { proposal-id: proposal-id }
      (merge proposal { status: "resources-allocated" })
    )
    (ok true)
  )
)

(define-read-only (get-proposal (proposal-id uint))
  (ok (unwrap! (map-get? proposals { proposal-id: proposal-id }) (err u404)))
)

(define-read-only (get-proposal-count)
  (ok (var-get proposal-count))
)

