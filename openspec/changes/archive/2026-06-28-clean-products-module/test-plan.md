# Test Plan: Storefront Catalog Capabilities

## Scenario 1: Public access to categories API
**Description**: Unauthenticated users should be able to fetch the active categories from the public API.
**Steps**:
1. Make a GET request to `/api/v1/categories` without an authentication token.
2. Verify the response status is 200 OK.
3. Verify the response contains a list of categories.

## Scenario 2: Public access to products API
**Description**: Unauthenticated users should be able to fetch the active products from the public API.
**Steps**:
1. Make a GET request to `/api/v1/products` without an authentication token.
2. Verify the response status is 200 OK.
3. Verify the response contains a list of products.

## Scenario 3: Storefront rendering
**Description**: The storefront should successfully fetch and display products and categories from the new public endpoints.
**Steps**:
1. Navigate to the storefront home page.
2. Verify the categories menu renders properly.
3. Verify the products grid renders properly.
