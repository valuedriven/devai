# Storefront Catalog — E2E Test Plan

## Overview

This test plan validates the new public endpoints (`/api/v1/products`, `/api/v1/products/:id`, and `/api/v1/categories`) introduced by the `storefront-catalog` capability. These endpoints serve unauthenticated storefront users.

---

### 1. Storefront Public API

#### 1.1 Public products list returns HTTP 200
**Starting state:** No authentication required.
**Steps:**
1. Send a GET request to `http://localhost:3001/api/v1/products`
**Expected:**
- Response status is 200
- Response body is a JSON array
- The `X-Total-Count` header is present

#### 1.2 Public products list returns only active products
**Starting state:** No authentication required.
**Steps:**
1. Send a GET request to `http://localhost:3001/api/v1/products`
**Expected:**
- Response status is 200
- Every product in the response has `active: true`
- No inactive products are included

#### 1.3 Public single product retrieval returns HTTP 200 for active product
**Starting state:** At least one active product exists in the database.
**Steps:**
1. Send a GET request to `http://localhost:3001/api/v1/products`
2. Extract the ID of the first product from the response
3. Send a GET request to `http://localhost:3001/api/v1/products/:id`
**Expected:**
- Response status is 200
- Response body contains the product details (name, price, etc.)

#### 1.4 Public single product retrieval returns 404 for non-existent product
**Starting state:** No authentication required.
**Steps:**
1. Send a GET request to `http://localhost:3001/api/v1/products/00000000-0000-0000-0000-000000000000`
**Expected:**
- Response status is 404

#### 1.5 Public categories list returns HTTP 200
**Starting state:** No authentication required.
**Steps:**
1. Send a GET request to `http://localhost:3001/api/v1/categories`
**Expected:**
- Response status is 200
- Response body is a JSON array
- The `X-Total-Count` header is present

#### 1.6 Public categories list returns only active categories
**Starting state:** No authentication required.
**Steps:**
1. Send a GET request to `http://localhost:3001/api/v1/categories`
**Expected:**
- Response status is 200
- Every category in the response has `active: true`

---

### 2. Storefront Frontend Integration

#### 2.1 Homepage displays products from public API
**Starting state:** Unauthenticated (no login). At least one active product exists.
**Steps:**
1. Navigate to `/` (storefront homepage)
**Expected:**
- The hero section with "Bem-vindo à DevAI Store" is visible
- The "Destaques" section is visible
- At least one product card is rendered

#### 2.2 Product detail page loads correctly
**Starting state:** Unauthenticated. At least one active product exists.
**Steps:**
1. Navigate to `/` (storefront homepage)
2. Click on the first product card
**Expected:**
- The product detail page loads
- Product name, price, and description are visible
- "Voltar para a loja" link is visible

#### 2.3 Non-existent product shows 404
**Starting state:** Unauthenticated.
**Steps:**
1. Navigate to `/products/00000000-0000-0000-0000-000000000000`
**Expected:**
- A 404 / "not found" page is displayed
