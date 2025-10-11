;; title: strategy-c
;; version:
;; summary:
;; description:

;; Strategy C - LP on Velar/Arkadiko
(define-constant ERR_INSUFFICIENT_FUNDS (err u100))
(define-constant ERR_UNAUTHORIZED (err u101))

(define-data-var strategy-c-tvl uint u0)
(define-data-var strategy-c-apy uint u1200) ;; 12% APY (higher risk/reward)

(define-map strategy-c-deposits principal uint)
(define-map strategy-c-rewards-claimed principal uint)

(define-read-only (get-strategy-c-balance (user principal))
  (default-to u0 (map-get? strategy-c-deposits user))
)

(define-read-only (get-strategy-c-rewards (user principal))
  (let (
    (balance (get-strategy-c-balance user))
    (apy (var-get strategy-c-apy))
  )
    ;; Mock calculation
    (/ (* balance apy) u10000)
  )
)

(define-public (add-liquidity (amount uint))
  (let ((user tx-sender))
    (asserts! (> amount u0) ERR_INSUFFICIENT_FUNDS)
    
    (map-set strategy-c-deposits user 
      (+ (get-strategy-c-balance user) amount))
    (var-set strategy-c-tvl (+ (var-get strategy-c-tvl) amount))
    
    (ok true)
  )
)

(define-public (remove-liquidity (amount uint))
  (let (
    (user tx-sender)
    (balance (get-strategy-c-balance user))
  )
    (asserts! (>= balance amount) ERR_INSUFFICIENT_FUNDS)
    
    (map-set strategy-c-deposits user (- balance amount))
    (var-set strategy-c-tvl (- (var-get strategy-c-tvl) amount))
    
    (ok amount)
  )
)

(define-public (claim-lp-rewards)
  (let (
    (user tx-sender)
    (rewards (get-strategy-c-rewards user))
  )
    (map-set strategy-c-rewards-claimed user 
      (+ (default-to u0 (map-get? strategy-c-rewards-claimed user)) rewards))
    (ok rewards)
  )
)