# Security Specification: ZN JEWELLERS Firestore Security

## 1. Data Invariants
1. **User Identity Integrity**: Users can only create or update their own private document at `/users/{userId}` where `userId == request.auth.uid`. Role privilege elevation (e.g. Setting `role: "admin"`) is strictly forbidden for regular client writes.
2. **Product Catalog Protection**: The product catalog `/products/{productId}` is publicly readable by all clients. Writes (create, update, delete) are strictly restricted to authenticated administrators verified in `/admins/$(request.auth.uid)`.
3. **Order Placement Invariant**: Authenticated customers can place orders with `userId == request.auth.uid`. Guest checkouts are permitted if user is unauthenticated or user assigns their own uid, but orders cannot be modified once in terminal states (`Delivered`, `Cancelled`). Only admins can modify order statuses, tracking numbers, and payment verification.
4. **Wishlist Privacy**: Wishlist records at `/wishlists/{userId}` can only be read and written by the authenticated user `request.auth.uid == userId`.
5. **Review Integrity**: Verified product reviews can be posted by authenticated users or customers with valid rating (1-5) and comment constraints.
6. **Admin Verification**: Admin capabilities require an existing document at `/admins/{userId}` matching `request.auth.uid`.

## 2. The "Dirty Dozen" Payloads (Zero-Trust Attack Vectors)
1. **Payload 1 - Privilege Escalation in Profile**: A normal customer attempts to write `role: "admin"` to `/users/{userId}` to gain store administrator access.
2. **Payload 2 - Unauthenticated Product Deletion**: An unauthenticated attacker attempts `DELETE /products/prod_123` to wipe inventory.
3. **Payload 3 - Price Tampering**: An unauthenticated or regular client attempts `UPDATE /products/prod_123` with `{ price: 1 }` before checkout.
4. **Payload 4 - Order Status Hijacking**: A customer attempts to update their own order from `Order Placed` to `Delivered` to bypass payment.
5. **Payload 5 - Foreign Wishlist Peeking**: An authenticated user `user_B` attempts `GET /wishlists/user_A` to access private items.
6. **Payload 6 - Foreign Order Modification**: An authenticated customer `user_B` attempts `UPDATE /orders/order_123` which belongs to `user_A`.
7. **Payload 7 - Massive Payload Denial of Wallet**: An attacker attempts to create a review or order with a 2MB nested junk string in the `customerName` field.
8. **Payload 8 - Negative Price Injection**: A client attempts to post an order with negative totals (`total: -50000`).
9. **Payload 9 - Orphaned Order UID Spoofing**: An authenticated attacker `user_B` sets `userId: "user_A"` in order creation payload to frame another customer.
10. **Payload 10 - Admin Document Self-Creation**: An attacker attempts to write their own UID directly to `/admins/{attacker_uid}`.
11. **Payload 11 - Rating Out of Bounds**: An attacker attempts to post a product review with `rating: 99` or `rating: -5`.
12. **Payload 12 - Modifying Terminal Order**: Attempting to alter items or details on an order whose status is already `Delivered` or `Cancelled`.

## 3. Test Runner
All 12 attacks are enforced to return `PERMISSION_DENIED` by the Firestore ruleset.
