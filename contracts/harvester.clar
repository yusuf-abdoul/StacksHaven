;; title: harvester
;; version:
;; summary:
;; description:

;; Harvester Contract
;; Auto-compounds yield from all strategies back into vault
;; Charges a small performance fee to incentivize bot operators

;; Constants
(define-constant contract-owner tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u300))
(define-constant ERR_HARVEST_TOO_SOON (err u301))
(define-constant ERR_NO_REWARDS (err u302))

;; Performance fee: 200 basis points (2%)
(define-data-var performance-fee uint u200)
(define-data-var min-harvest-interval uint u144) ;; ~1 day in blocks
(define-data-var last-harvest-time uint u0)

;; Track total harvested
(define-data-var total-harvested uint u0)
(define-data-var total-fees-collected uint u0)

;; Authorized harvesters (bot addresses)
(define-map authorized-harvesters principal bool)

;; Initialize contract owner as harvester
(map-set authorized-harvesters contract-owner true)

;; Read-only functions
(define-read-only (is-authorized-harvester (caller principal))
  (default-to false (map-get? authorized-harvesters caller))
)

(define-read-only (get-harvest-info)
  {
    last-harvest: (var-get last-harvest-time),
    total-harvested: (var-get total-harvested),
    total-fees: (var-get total-fees-collected),
    performance-fee: (var-get performance-fee)
  }
)

(define-read-only (can-harvest)
  (>= (- stacks-block-height (var-get last-harvest-time)) (var-get min-harvest-interval))
)

(define-read-only (time-until-next-harvest)
  (let ((elapsed (- stacks-block-height (var-get last-harvest-time)))
        (interval (var-get min-harvest-interval)))
    (if (>= elapsed interval)
      u0
      (- interval elapsed)
    )
  )
)

;; Public functions

;; Main harvest function - collects rewards from all strategies

  (let (
    (caller tx-sender)
    (current-block stacks-block-height)
  )
    ;; Validations
    (asserts! (is-authorized-harvester caller) ERR_NOT_AUTHORIZED)
    (asserts! (can-harvest) ERR_HARVEST_TOO_SOON)
    
    ;; Harvest from each strategy
    (let (
      (rewards-a (unwrap! (harvest-strategy-a) u0))
      (rewards-b (unwrap! (harvest-strategy-b) u0))
      (rewards-c (unwrap! (harvest-strategy-c) u0))
      (total-rewards (+ (+ rewards-a rewards-b) rewards-c))
    )
      (asserts! (> total-rewards u0) ERR_NO_REWARDS)
      
      ;; Calculate performance fee
      (let (
        (fee (/ (* total-rewards (var-get performance-fee)) u10000))
        (reinvest-amount (- total-rewards fee))
      )
        ;; Pay fee to harvester
        (try! (as-contract (stx-transfer? fee tx-sender caller)))
        
        ;; Update tracking
        (var-set last-harvest-time current-block)
        (var-set total-harvested (+ (var-get total-harvested) total-rewards))
        (var-set total-fees-collected (+ (var-get total-fees-collected) fee))
        
        ;; Report yield back to vault for auto-compounding
        ;; This would call the vault's report-yield function
        
        (ok {
          total-rewards: total-rewards,
          fee: fee,
          reinvested: reinvest-amount
        })
      )
    )
  )


;; Harvest individual strategies
(define-private (harvest-strategy-a)
  (begin
    ;; In production, this would call strategy-a's harvest function
    ;; For demo, return mock rewards based on TVL
    (ok u1000000) ;; 1 STX worth of rewards
  )
)

(define-private (harvest-strategy-b)
  (begin
    ;; Call strategy-b's claim function
    (ok u750000) ;; 0.75 STX
  )
)

(define-private (harvest-strategy-c)
  (begin
    ;; Call strategy-c's claim function
    (ok u1500000) ;; 1.5 STX (highest APY)
  )
)

;; Emergency harvest (no time restriction)
(define-public (emergency-harvest)
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR_NOT_AUTHORIZED)
    
    (let (
      (rewards-a (try! (harvest-strategy-a)))
      (rewards-b (try! (harvest-strategy-b)))
      (rewards-c (try! (harvest-strategy-c)))
      (total (+ (+ rewards-a rewards-b) rewards-c))
    )
      (var-set last-harvest-time stacks-block-height)
      (ok total)
    )
  )
)

;; Admin functions
(define-public (add-harvester (harvester principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (ok (map-set authorized-harvesters harvester true))
  )
)

(define-public (remove-harvester (harvester principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (ok (map-delete authorized-harvesters harvester))
  )
)

(define-public (set-performance-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (asserts! (<= new-fee u500) err-not-authorized) ;; Max 5% fee
    (ok (var-set performance-fee new-fee))
  )
)

(define-public (set-min-harvest-interval (blocks uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (ok (var-set min-harvest-interval blocks))
  )
)