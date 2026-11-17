# Security Specification: ZN JEWELLERS Firestore Security

## 1. Data Invariants
1. **User Identity Integrity**: Users can only create or update their own private document at `/users/{userId}` where `userId == request.auth.uid` and `request.auth.token.email_verified == true`. Setting `role: "admin"` on self-registration or escalating role on profile updates is strictly forbidden.
2. **Verified Admin Registry**: Administrative privileges require `request.auth != null && request.auth.token.email_verified == true` AND either custom claim `custom_admin == true`, an existing record at `/admins/$(request.auth.uid)`, or verified allowlisted store owner emails (`nidatariq6nov@gmail.com`, `znjewelaers786@gmail.com`). Partial substring checks (such as `email.includes('admin')`) and client-side demo admin toggles are strictly forbidden.
3. **Product & Collection Catalog Protection**: `/products/{productId}` and `/collections/{collectionId}` are publicly readable. All `create`, `update`, and `delete` operations are strictly restricted to verified administrators.
4. **Order Access & Integrity**:
   - Unauthenticated public reads (`get`/`list`) on `/orders` are strictly denied (`PERMISSION_DENIED`) to prevent customer PII leakage.
   - Authenticated customers may only `get` or `list` their own orders where `resource.data.userId == request.auth.uid`.
   - Non-admin order creation MUST lock initial states to `orderStatus == 'Order Placed'`, `paymentStatus == 'pending'`, prohibit setting `trackingNumber` or `paymentVerificationHistory`, enforce schema whitelist (`hasOnly`), and bind `userId` to `request.auth.uid` (when signed in) or `'guest'` (when unauthenticated).
   - Customers cannot update or delete orders after placement (`allow update, delete: if isAdmin()`).
5. **Wishlist Privacy**: Wishlist documents at `/wishlists/{userId}` are strictly private to the owner (`request.auth.uid == userId`).
6. **Review Authentication & Validation**: Only authenticated users with verified emails (`email_verified == true`) and matching `userId == request.auth.uid` may create reviews with bounded rating `[1..5]` and bounded text length.
7. **Decommissioned Public Test Path**: `/test/{docId}` has all client read/write access explicitly disabled (`allow read, write: if false`).
8. **Immutable Inventory Logs & Payment Audits**: `/inventory_logs/{logId}` is admin-read/create only and immutable (`update, delete: if false`); `/payments/{paymentId}` restricts reads to owner/admin and updates to admin only.

## 2. The "Dirty Dozen" Payloads (Zero-Trust Attack Vectors)
1. **Payload 1 - Privilege Escalation in Profile**: Regular customer attempts to create or update `/users/{userId}` with `role: "admin"`. -> `PERMISSION_DENIED`.
2. **Payload 2 - Unauthenticated Product Deletion**: Unauthenticated attacker attempts `DELETE /products/zn-prod-005`. -> `PERMISSION_DENIED`.
3. **Payload 3 - Price Tampering**: Customer or unauthenticated user attempts `UPDATE /products/zn-prod-005` with `{ price: 1 }`. -> `PERMISSION_DENIED`.
4. **Payload 4 - Order Status & Payment Hijacking**: Customer attempts `UPDATE /orders/{id}` changing `orderStatus` to `'Delivered'` or `paymentStatus` to `'paid'`. -> `PERMISSION_DENIED`.
5. **Payload 5 - Foreign Wishlist Peeking**: User B attempts `GET /wishlists/user_A`. -> `PERMISSION_DENIED`.
6. **Payload 6 - Foreign Order Reading & Modification**: User B or unauthenticated client attempts `GET` or `UPDATE /orders/order_of_user_A`. -> `PERMISSION_DENIED`.
7. **Payload 7 - Massive Payload Denial of Wallet**: Attacker submits >2KB `customerName` or unwhitelisted shadow fields (`isAdmin: true`) in `/orders` or `/reviews`. -> `PERMISSION_DENIED`.
8. **Payload 8 - Negative Price / Total Injection**: Client submits `total: -50000` or `price: -10` in `/orders` or `/products`. -> `PERMISSION_DENIED`.
9. **Payload 9 - Orphaned Order UID Spoofing**: Authenticated User B submits order creation with `userId: "user_A"`. -> `PERMISSION_DENIED`.
10. **Payload 10 - Admin Document Self-Creation**: Unprivileged User B attempts `CREATE /admins/user_B`. -> `PERMISSION_DENIED`.
11. **Payload 11 - Unauthenticated / Out-of-Bounds Review**: Guest submits a review or User A submits `rating: 99`. -> `PERMISSION_DENIED`.
12. **Payload 12 - Public Test Collection Write / Customer Verification Bypass**: Attacker writes to `/test/pwn` or creates an order with `paymentStatus: 'paid'` or unverified admin email spoof (`email_verified: false`). -> `PERMISSION_DENIED`.
