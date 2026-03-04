export class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  active: boolean;
  stock: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}
