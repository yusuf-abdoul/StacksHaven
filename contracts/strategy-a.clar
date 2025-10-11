;; title: strategy-a
;; version:
;; summary:
;; description:


;; Strategy A - sBTC Staking Contract
(define-constant ERR_INSUFFICIENT_FUNDS (err u100))
(define-constant ERR_UNAUTHORIZED (err u101))

(define-data-var strategy-a-tvl uint u0)
(define-data-var strategy-a-apy uint u800) ;; 8% APY = 800 basis points
(define-data-var last-harvest-block uint u0)

(define-map strategy-a-deposits principal uint)

(define-read-only (get-strategy-a-balance (user principal))
  (default-to u0 (map-get? strategy-a-deposits user))
)

(define-read-only (get-pending-rewards (user principal))
  (let (
    (balance (get-strategy-a-balance user))
    (blocks-elapsed (- stacks-block-height (var-get last-harvest-block)))
    ;; Simplified: ~10 blocks per minute, ~14400 blocks per day
    ;; APY 8% = ~0.022% per day
    (daily-rate u22) ;; 0.022% = 22 basis points per day
  )
    (if (is-eq blocks-elapsed u0)
      u0
      (/ (* balance daily-rate (/ blocks-elapsed u14400)) u10000)
    )
  )
)

(define-public (stake (amount uint))
  (let ((user tx-sender))
    (asserts! (> amount u0) ERR_INSUFFICIENT_FUNDS)
    
    ;; Update deposits
    (map-set strategy-a-deposits user 
      (+ (get-strategy-a-balance user) amount))
    (var-set strategy-a-tvl (+ (var-get strategy-a-tvl) amount))
    
    (ok true)
  )
)

(define-public (unstake (amount uint))
  (let (
    (user tx-sender)
    (balance (get-strategy-a-balance user))
  )
    (asserts! (>= balance amount) ERR_INSUFFICIENT_FUNDS)
    
    (map-set strategy-a-deposits user (- balance amount))
    (var-set strategy-a-tvl (- (var-get strategy-a-tvl) amount))
    
    (ok amount)
  )
)

(define-public (harvest)
  (let (
    (user tx-sender)
    (rewards (get-pending-rewards user))
  )
    (var-set last-harvest-block stacks-block-height)
    (ok rewards)
  )
)


