;; ------------------------------------------------------------
;; Strategy C - LP Yield Farm (High-risk)
;; ------------------------------------------------------------
;; strategy-c: APY 12%
;; strategy-c.clar
;; Simple strategy contract: deposit/withdraw/harvest
(define-constant STRATEGY-NAME "strategy-c")
(define-constant ERR_INSUFFICIENT_FUNDS (err u100))
(define-constant ERR_HARVEST_TOO_SOON (err u101))

(define-data-var total-tvl uint u0)
(define-data-var apy uint u1200)
(define-data-var min-harvest-interval uint u288)
(define-data-var last-harvest-block uint u0)

(define-map deposits principal uint)

(define-read-only (get-strategy-name)
  (ok STRATEGY-NAME)
)

(define-read-only (get-tvl)
  (ok (var-get total-tvl))
)

(define-read-only (get-last-harvest)
  (ok (var-get last-harvest-block))
)

(define-public (deposit (amount uint))
  (let ((user tx-sender))
    (asserts! (> amount u0) ERR_INSUFFICIENT_FUNDS)
    (map-set deposits user (+ (default-to u0 (map-get? deposits user)) amount))
    (var-set total-tvl (+ (var-get total-tvl) amount))
    (ok true)
  )
)

(define-public (withdraw (amount uint))
  (let ((user tx-sender)
        (balance (default-to u0 (map-get? deposits user))))
    (asserts! (>= balance amount) ERR_INSUFFICIENT_FUNDS)
    (map-set deposits user (- balance amount))
    (var-set total-tvl (- (var-get total-tvl) amount))
    (ok amount)
  )
)

;; harvest returns (ok yield:uint). Harvester will call it.
(define-public (harvest)
  (let ((blocks-elapsed (- stacks-block-height (var-get last-harvest-block))))
    ;; optional timing guard: only allow harvest after min interval
    (if (>= blocks-elapsed (var-get min-harvest-interval))
      (let ((yield (/ (* (var-get total-tvl) (var-get apy)) u10000)))
        (var-set total-tvl (+ (var-get total-tvl) yield))
        (var-set last-harvest-block stacks-block-height)
        (ok yield))
      ;; nothing to harvest yet
      (ok u0)
    )
  )
)