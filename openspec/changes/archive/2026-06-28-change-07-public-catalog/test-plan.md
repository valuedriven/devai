# Playwright E2E Test Plan - Public Storefront Catalog

## Scenarios

### Scenario 1: Guest Catalog Navigation and Category Filtering
* **WHEN** A guest user visits the homepage
* **THEN** They should see a list of categories
* **WHEN** The user clicks on a category button
* **THEN** The URL is updated with `?categoryId=<id>`
* **AND** The product grid only displays products belonging to that category

### Scenario 2: Search Products from Catalog
* **WHEN** A guest user enters a search query in the header search input and presses Enter
* **THEN** They are redirected to the homepage with the `?search=<query>` parameter
* **AND** Only matching products are displayed in the product grid

### Scenario 3: Out of Stock Badge Visiblity
* **WHEN** A guest user views a product card that has a stock count of 0
* **THEN** An "Esgotado" badge is visible on the product card
* **AND** The "Adicionar ao Carrinho" button is disabled and reads "Indisponível"
