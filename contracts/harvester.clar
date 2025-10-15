;; harvester.clar
(define-constant ERR_NOT_AUTHORIZED (err u300))
(define-constant ERR_HARVEST_TOO_SOON (err u301))
(define-constant ERR_NO_REWARDS (err u302))

;; Set deployer address for testnet deployment
(define-constant OWNER 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER)
(define-constant CONTRACT_VAULT 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER.vault)
(define-constant STRATEGY_A 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER.strategy-a)
(define-constant STRATEGY_B 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER.strategy-b)
(define-constant STRATEGY_C 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER.strategy-c)

(define-data-var performance-fee uint u200) ;; 2% (bp)
(define-data-var total-harvested uint u0)
(define-data-var total-fees-collected uint u0)
(define-data-var last-harvest-time uint u0)
(define-data-var min-harvest-interval uint u144)

(define-map authorized-harvesters
  principal
  bool
)

;; Initialization function to set owner as authorized harvester
(define-public (initialize)
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_AUTHORIZED)
    (map-set authorized-harvesters OWNER true)
    (ok true)
  )
)

;; Check if principal is authorized
(define-read-only (is-authorized (p principal))
  (default-to false (map-get? authorized-harvesters p))
)

;; helper to call a strategy harvest and return an (ok yield) or bubble an error
;; Removed trait-based call-harvest. Use direct contract calls for each strategy.

(define-public (harvest)
  (let ((caller tx-sender))
    (asserts!
      (is-eq (default-to false (map-get? authorized-harvesters caller)) true)
      ERR_NOT_AUTHORIZED
    )
    ;; optional interval guard
    ;; (asserts! (>= (- stacks-block-height (var-get last-harvest-time)) (var-get min-harvest-interval)) ERR_HARVEST_TOO_SOON)

    (let (
        (rA (contract-call? STRATEGY_A harvest))
        (rB (contract-call? STRATEGY_B harvest))
        (rC (contract-call? STRATEGY_C harvest))
      )
      (let (
          (a (unwrap-panic rA))
          (b (unwrap-panic rB))
          (c (unwrap-panic rC))
          (total (+ (+ a b) c))
        )
        (asserts! (> total u0) ERR_NO_REWARDS)
        (let (
            (fee (/ (* total (var-get performance-fee)) u10000))
            (reinvest (- total fee))
          )
          (var-set total-harvested (+ (var-get total-harvested) total))
          (var-set total-fees-collected (+ (var-get total-fees-collected) fee))
          (var-set last-harvest-time stacks-block-height)
          (try! (contract-call? CONTRACT_VAULT report-yield "strategy-a" a))
          (try! (contract-call? CONTRACT_VAULT report-yield "strategy-b" b))
          (try! (contract-call? CONTRACT_VAULT report-yield "strategy-c" c))
          (ok {
            total-rewards: total,
            fee: fee,
            reinvested: reinvest,
          })
        )
      )
    )
  )
)

;; Admin: register/unregister harvester principals
;; Only owner can add/remove harvesters
(define-public (add-harvester (h principal))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_AUTHORIZED)
    (map-set authorized-harvesters h true)
    (ok true)
  )
)

(define-public (remove-harvester (h principal))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_AUTHORIZED)
    (map-delete authorized-harvesters h)
    (ok true)
  )
)

;; Claim accumulated fees to a recipient (owner-only)
;; Only owner can claim fees
(define-public (claim-fees
    (recipient principal)
    (amount uint)
  )
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (>= (var-get total-fees-collected) amount) ERR_NOT_AUTHORIZED)
    (var-set total-fees-collected (- (var-get total-fees-collected) amount))
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
    (ok true)
  )
)
