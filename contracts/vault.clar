;; title: vault
;; version:
;; summary:
;; description:

;; Yield Aggregator Vault Contract
;; Manages user deposits, vault shares, and strategy allocations

;; Constants
(define-constant contract-owner tx-sender)
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_INSUFFICIENT_BALANCE (err u101))
(define-constant ERR_INVALID_ALLOCATION (err u102))
(define-constant ERR_ZERO_AMOUNT (err u103))
(define-constant ERR_NOT_AUTHORIZED (err u104))

;; Data Variables
(define-data-var total-shares uint u0)
(define-data-var total-assets uint u0)
(define-data-var performance-fee uint u200) ;; 2% = 200 basis points

;; Strategy allocation limits (basis points, total = 10000)
(define-data-var strategy-a-allocation uint u0)
(define-data-var strategy-b-allocation uint u0)
(define-data-var strategy-c-allocation uint u0)

;; Data Maps
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

;; Strategy balances
(define-map strategy-balances
  (string-ascii 20)
  uint
)

;; Read-only functions
(define-read-only (get-user-shares (user principal))
  (default-to u0 (map-get? user-shares user))
)

(define-read-only (get-user-allocation (user principal))
  (default-to {
    strategy-a: u0,
    strategy-b: u0,
    strategy-c: u0,
  }
    (map-get? user-allocations user)
  )
)

(define-read-only (get-total-shares)
  (var-get total-shares)
)

(define-read-only (get-total-assets)
  (var-get total-assets)
)

(define-read-only (get-share-price)
  (let (
      (shares (var-get total-shares))
      (assets (var-get total-assets))
    )
    (if (is-eq shares u0)
      u1000000 ;; 1:1 ratio initially (with 6 decimals)
      (/ (* assets u1000000) shares)
    )
  )
)

(define-read-only (get-user-balance (user principal))
  (let (
      (shares (get-user-shares user))
      (price (get-share-price))
    )
    (/ (* shares price) u1000000)
  )
)

(define-read-only (get-strategy-balance (strategy (string-ascii 20)))
  (default-to u0 (map-get? strategy-balances strategy))
)

;; Public functions

;; Deposit STX into vault
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
      (current-shares (get-user-shares user))
      (share-price (get-share-price))
      (shares-to-mint (/ (* amount u1000000) share-price))
      (total (+ (get strategy-a allocations) (get strategy-b allocations)
        (get strategy-c allocations)
      ))
    )
    ;; Validations
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (is-eq total u10000) ERR_INVALID_ALLOCATION)
    ;; Must equal 100%

    ;; Transfer STX to contract
    (try! (stx-transfer? amount user (as-contract tx-sender)))

    ;; Update shares
    (map-set user-shares user (+ current-shares shares-to-mint))
    (var-set total-shares (+ (var-get total-shares) shares-to-mint))
    (var-set total-assets (+ (var-get total-assets) amount))

    ;; Set user allocations
    (map-set user-allocations user allocations)

    ;; Distribute to strategies
    (try! (distribute-to-strategies amount allocations))

    (ok shares-to-mint)
  )
)

;; Withdraw from vault
(define-public (withdraw (shares uint))
  (let (
      (user tx-sender)
      (user-shares (get-user-shares user))
      (share-price (get-share-price))
      (amount (/ (* shares share-price) u1000000))
      (user-allocation (get-user-allocation user))
    )
    ;; Validations
    (asserts! (> shares u0) ERR_ZERO_AMOUNT)
    (asserts! (>= user-shares shares) ERR_INSUFFICIENT_BALANCE)

    ;; Withdraw from strategies proportionally
    (try! (withdraw-from-strategies amount user-allocation))

    ;; Burn shares
    (map-set user-shares user (- user-shares shares))
    (var-set total-shares (- (var-get total-shares) shares))
    (var-set total-assets (- (var-get total-assets) amount))

    ;; Transfer STX to user
    (try! (as-contract (stx-transfer? amount tx-sender user)))

    (ok amount)
  )
)

;; Reallocate user's funds between strategies
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
      (user-balance (get-user-balance user))
    )
    ;; Validations
    (asserts! (is-eq total u10000) ERR_INVALID_ALLOCATION)
    (asserts! (> user-balance u0) ERR_INSUFFICIENT_BALANCE)

    ;; Update allocations
    (map-set user-allocations user new-allocations)

    ;; In production, this would trigger actual rebalancing
    ;; For hackathon, we just update the allocation tracking

    (ok true)
  )
)

;; Private functions

(define-private (distribute-to-strategies
    (amount uint)
    (allocations {
      strategy-a: uint,
      strategy-b: uint,
      strategy-c: uint,
    })
  )

  (let (
      (amount-a (/ (* amount (get strategy-a allocations)) u10000))
      (amount-b (/ (* amount (get strategy-b allocations)) u10000))
      (amount-c (/ (* amount (get strategy-c allocations)) u10000))
    )
    ;; Update strategy balances
    (map-set strategy-balances "strategy-a"
      (+ (get-strategy-balance "strategy-a") amount-a)
    )
    (map-set strategy-balances "strategy-b"
      (+ (get-strategy-balance "strategy-b") amount-b)
    )
    (map-set strategy-balances "strategy-c"
      (+ (get-strategy-balance "strategy-c") amount-c)
    )

    (ok true)
  )
)

(define-private (withdraw-from-strategies
    (amount uint)
    (allocations {
      strategy-a: uint,
      strategy-b: uint,
      strategy-c: uint,
    })
  )
  (let (
      (amount-a (/ (* amount (get strategy-a allocations)) u10000))
      (amount-b (/ (* amount (get strategy-b allocations)) u10000))
      (amount-c (/ (* amount (get strategy-c allocations)) u10000))
    )
    ;; Update strategy balances
    (map-set strategy-balances "strategy-a"
      (- (get-strategy-balance "strategy-a") amount-a)
    )
    (map-set strategy-balances "strategy-b"
      (- (get-strategy-balance "strategy-b") amount-b)
    )
    (map-set strategy-balances "strategy-c"
      (- (get-strategy-balance "strategy-c") amount-c)
    )

    (ok true)
  )
)

;; Admin functions for harvester
(define-public (report-yield
    (strategy (string-ascii 20))
    (yield-amount uint)
  )
  (begin
    ;; In production, add authorization check for harvester contract
    (var-set total-assets (+ (var-get total-assets) yield-amount))
    (map-set strategy-balances strategy
      (+ (get-strategy-balance strategy) yield-amount)
    )
    (ok true)
  )
)
