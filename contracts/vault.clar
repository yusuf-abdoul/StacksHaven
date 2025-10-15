;; vault.clar
(define-constant ERR_NOT_AUTHORIZED (err u104))
(define-constant ERR_INVALID_AMOUNT (err u105))
(define-constant ERR_INVALID_ALLOCATION (err u102))
(define-constant ERR_ZERO_AMOUNT (err u103))

;; Set deployer address for testnet deployment
(define-constant OWNER 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER)
(define-constant STRATEGY_A 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER.strategy-a)
(define-constant STRATEGY_B 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER.strategy-b)
(define-constant STRATEGY_C 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER.strategy-c)
(define-constant CONTRACT_HARVESTER 'ST3SDPDCDVF45R7ZWKSBXF20AXF6AWR5AMAC72BER.harvester)

(define-data-var total-assets uint u0) ;; microSTX units
(define-data-var total-shares uint u0)
(define-map user-shares
  principal
  uint
)
(define-map user-allocations
  principal
  {
    strategy-a: uint,
    strategy-b: uint,
    strategy-c: uint,
  }
)
(define-map strategy-balances
  (string-ascii 20)
  uint
)

(define-read-only (get-total-assets)
  (ok (var-get total-assets))
)
(define-read-only (get-total-shares)
  (ok (var-get total-shares))
)

(define-read-only (get-share-price)
  (let (
      (shares (var-get total-shares))
      (assets (var-get total-assets))
    )
    (if (is-eq shares u0)
      (ok u1000000) ;; 1:1 with 6 decimals
      (ok (/ (* assets u1000000) shares))
    )
  )
)

(define-read-only (get-user-shares (user principal))
  (ok (default-to u0 (map-get? user-shares user)))
)

(define-read-only (get-user-allocation (user principal))
  (ok (default-to {
    strategy-a: u0,
    strategy-b: u0,
    strategy-c: u0
  } (map-get? user-allocations user)))
)

(define-public (deposit
    (amount uint)
    (allocations {
      strategy-a: uint,
      strategy-b: uint,
      strategy-c: uint,
    })
  )
  (let (
      (user tx-sender)
      (total (+ (get strategy-a allocations) (get strategy-b allocations)
        (get strategy-c allocations)
      ))
    )
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (is-eq total u10000) ERR_INVALID_ALLOCATION)

  ;; transfer STX from user to vault contract
  (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    ;; wrapped in try! to bubble error

    ;; mint shares (simple model: shares = amount * 1e6 / share-price)
    (let ((share-price (unwrap-panic (get-share-price))))
      (let ((shares-to-mint (/ (* amount u1000000) share-price)))
        (map-set user-shares user
          (+ (default-to u0 (map-get? user-shares user)) shares-to-mint)
        )
        (var-set total-shares (+ (var-get total-shares) shares-to-mint))
      )
    )

    ;; update totals
    (var-set total-assets (+ (var-get total-assets) amount))
    (map-set user-allocations user allocations)

    ;; distribute to strategies: call their deposit functions; if any fails, whole tx fails
    (let (
        (amount-a (/ (* amount (get strategy-a allocations)) u10000))
        (amount-b (/ (* amount (get strategy-b allocations)) u10000))
        (amount-c (/ (* amount (get strategy-c allocations)) u10000))
      )
      ;; (try! (contract-call? STRATEGY_A deposit amount-a))
      ;; (try! (contract-call? STRATEGY_B deposit amount-b))
      ;; (try! (contract-call? STRATEGY_C deposit amount-c))
      ;; update local strategy balances
      (map-set strategy-balances "strategy-a"
        (+ (default-to u0 (map-get? strategy-balances "strategy-a")) amount-a)
      )
      (map-set strategy-balances "strategy-b"
        (+ (default-to u0 (map-get? strategy-balances "strategy-b")) amount-b)
      )
      (map-set strategy-balances "strategy-c"
        (+ (default-to u0 (map-get? strategy-balances "strategy-c")) amount-c)
      )
    )

    (ok true)
  )
)

(define-public (withdraw (shares uint))
  (let (
      (user tx-sender)
      (shares-balance (default-to u0 (map-get? user-shares user)))
    )
    (asserts! (> shares u0) ERR_ZERO_AMOUNT)
    (asserts! (>= shares-balance shares) ERR_INVALID_AMOUNT)

    ;; compute amount to withdraw
    (let (
        (share-price (unwrap-panic (get-share-price)))
        (amount (/ (* shares share-price) u1000000))
      )
      ;; For MVP: simply reduce totals and call withdraw-from-strategy functions proportionally
      (var-set total-assets (- (var-get total-assets) amount))
      (map-set user-shares user (- shares-balance shares))
      (var-set total-shares (- (var-get total-shares) shares))

      ;; withdraw proportionally from strategies (calls withdraw on strategy contracts)
      (let (
          (user-allocation (default-to {
            strategy-a: u0,
            strategy-b: u0,
            strategy-c: u0,
          }
            (map-get? user-allocations user)
          ))
          (amount-a (/ (* amount (get strategy-a user-allocation)) u10000))
          (amount-b (/ (* amount (get strategy-b user-allocation)) u10000))
          (amount-c (/ (* amount (get strategy-c user-allocation)) u10000))
        )
        ;; (try! (contract-call? STRATEGY_A withdraw amount-a))
        ;; (try! (contract-call? STRATEGY_B withdraw amount-b))
        ;; (try! (contract-call? STRATEGY_C withdraw amount-c))
        (map-set strategy-balances "strategy-a"
          (- (default-to u0 (map-get? strategy-balances "strategy-a")) amount-a)
        )
        (map-set strategy-balances "strategy-b"
          (- (default-to u0 (map-get? strategy-balances "strategy-b")) amount-b)
        )
        (map-set strategy-balances "strategy-c"
          (- (default-to u0 (map-get? strategy-balances "strategy-c")) amount-c)
        )

        ;; transfer STX back to user from vault contract
        (try! (as-contract (stx-transfer? amount tx-sender user)))

        (ok amount)
      )
    )
  )
)

(define-public (reallocate (new-allocations {
  strategy-a: uint,
  strategy-b: uint,
  strategy-c: uint,
}))
  (let (
      (user tx-sender)
      (total (+ (get strategy-a new-allocations) (get strategy-b new-allocations)
        (get strategy-c new-allocations)
      ))
    )
    (asserts! (is-eq total u10000) ERR_INVALID_ALLOCATION)
    (map-set user-allocations user new-allocations)
    ;; NOTE: We do NOT perform on-chain rebalancing in MVP
    (ok true)
  )
)

;; Called by Harvester contract to report yield per strategy
;; Only harvester contract can call this
(define-public (report-yield
    (strategy (string-ascii 20))
    (yield-amount uint)
  )
  (begin
    (asserts! (is-eq tx-sender CONTRACT_HARVESTER) ERR_NOT_AUTHORIZED)
    (asserts! (> yield-amount u0) ERR_INVALID_AMOUNT)
    (asserts!
      (or
        (is-eq strategy "strategy-a")
        (is-eq strategy "strategy-b")
        (is-eq strategy "strategy-c")
      )
      ERR_INVALID_ALLOCATION
    )
    (var-set total-assets (+ (var-get total-assets) yield-amount))
    (map-set strategy-balances strategy
      (+ (default-to u0 (map-get? strategy-balances strategy)) yield-amount)
    )
    (ok true)
  )
)

(define-public (claim-fees (recipient principal) (amount uint))
     (begin
       (asserts! (is-eq tx-sender OWNER) ERR_NOT_AUTHORIZED)
       (try! (as-contract (stx-transfer? amount tx-sender recipient)))
       (ok true)
     )
   )