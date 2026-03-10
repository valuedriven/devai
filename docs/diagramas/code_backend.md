# Diagrama de Código (Nível 4) - Backend

Este diagrama detalha as estruturas das entidades principais do Domínio do Backend (Produtos, Clientes, Pedidos, Itens de Pedido e Categorias) e seus relacionamentos.

```mermaid
classDiagram
    class Customer {
        + String id
        + String name
        + String email
        + String phone
        + DateTime createdAt
        + DateTime updatedAt
    }

    class Category {
        + String id
        + String name
        + String description
        + DateTime createdAt
        + DateTime updatedAt
    }

    class Product {
        + String id
        + String name
        + String description
        + Float price
        + Boolean isActive
        + String categoryId
        + DateTime createdAt
        + DateTime updatedAt
    }

    class Order {
        + String id
        + String customerId
        + Float totalAmount
        + String status
        + DateTime createdAt
        + DateTime updatedAt
    }

    class OrderItem {
        + String id
        + String orderId
        + String productId
        + Int quantity
        + Float unitPrice
        + Float subTotal
    }

    Category "1" -- "*" Product : "possui"
    Customer "1" -- "*" Order : "realiza"
    Order "1" -- "*" OrderItem : "contém"
    Product "1" -- "*" OrderItem : "referenciado em"
```
