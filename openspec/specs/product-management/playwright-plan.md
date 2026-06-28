# Playwright E2E Test Plan: Product Management

This document defines the E2E test scenarios for the Product Management module.

## Setup & Seed Prerequisites
- **Seed Utility:** `apps/frontend/tests/utils/api.ts`
- **Session:** Admin role required for management tasks, Customer/anonymous role for permission checking.

## Test Scenarios

### 1. Product Management CRUD (Admin)

#### 1.1 Admin can create a product successfully
- **Prerequisites:** Seeded category exists.
- **Steps:**
  1. Navigate to `/admin/products`.
  2. Click the "Novo Produto" button.
  3. Fill in product details (Name, Price, Stock, Description, and select Category).
  4. Submit the form.
- **Expected Outcome:**
  - Redirected to `/admin/products`.
  - The newly created product is displayed in the products table.

#### 1.2 Admin can edit a product
- **Prerequisites:** Seeded product exists.
- **Steps:**
  1. Navigate to `/admin/products`.
  2. Locate the seeded product in the table.
  3. Click "Editar" on the product.
  4. Modify the product name/details and submit the form.
- **Expected Outcome:**
  - Redirected to `/admin/products`.
  - Updated product details are displayed in the table.

#### 1.3 Admin can delete (deactivate) a product
- **Prerequisites:** Seeded product exists.
- **Steps:**
  1. Navigate to `/admin/products`.
  2. Click "Excluir" on the product.
  3. Confirm the deletion in the modal dialog.
- **Expected Outcome:**
  - The product is soft-deleted (status in the table changes to "Inativo").

### 2. Authorization Security

#### 2.1 Non-admin user cannot access /admin/products
- **Prerequisites:** User logged in as CUSTOMER.
- **Steps:**
  1. Navigate directly to `/admin/products`.
- **Expected Outcome:**
  - Page shows a 403 Forbidden error message.
