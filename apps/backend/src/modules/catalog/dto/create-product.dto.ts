export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  stock: number;
  active?: boolean;
}
