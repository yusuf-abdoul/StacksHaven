;; title: strategy-b
;; version:
;; summary:
;; description:


;; Strategy B - STX Lending via Arkadiko/ALEX
(define-constant ERR_INSUFFICIENT_FUNDS (err u100))
(define-constant ERR_UNAUTHORIZED (err u101))

(define-data-var strategy-b-tvl uint u0)
(define-data-var strategy-b-apy uint u650) ;; 6.5% APY

(define-map strategy-b-deposits principal uint)

(define-read-only (get-strategy-b-balance (user principal))
  (default-to u0 (map-get? strategy-b-deposits user))
)

(define-read-only (get-strategy-b-rewards (user principal))
  (let (
    (balance (get-strategy-b-balance user))
    (apy (var-get strategy-b-apy))
  )
    ;; Mock calculation for demo
    (/ (* balance apy) u10000)
  )
)

(define-public (lend-stx (amount uint))
  (let ((user tx-sender))
    (asserts! (> amount u0) ERR_INSUFFICIENT_FUNDS)
    
    (map-set strategy-b-deposits user 
      (+ (get-strategy-b-balance user) amount))
    (var-set strategy-b-tvl (+ (var-get strategy-b-tvl) amount))
    
    (ok true)
  )
)

(define-public (withdraw-lend (amount uint))
  (let (
    (user tx-sender)
    (balance (get-strategy-b-balance user))
  )
    (asserts! (>= balance amount) ERR_INSUFFICIENT_FUNDS)
    
    (map-set strategy-b-deposits user (- balance amount))
    (var-set strategy-b-tvl (- (var-get strategy-b-tvl) amount))
    
    (ok amount)
  )
)

(define-public (claim-lending-rewards)
  (let (
    (user tx-sender)
    (rewards (get-strategy-b-rewards user))
  )
    (ok rewards)
  )
)