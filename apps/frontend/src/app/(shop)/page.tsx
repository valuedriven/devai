import { ProductCard } from "@/components/ui/ProductCard";
import { getProducts } from "@/lib/data";
export const dynamic = "force-dynamic";

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const { search } = await searchParams;
    const products = await getProducts(search);
    return (
        <div className="container home-container">

            {/* Hero Section Placeholder */}
            <section className="hero-section">
                <h1 className="hero-title">Bem-vindo à DevAI Store</h1>
                <p className="hero-subtitle">
                    Encontre os melhores produtos com a qualidade que você merece.
                </p>
            </section>

            {/* Vitrine */}
            <section>
                <div className="section-header">
                    <h2 className="section-title">Destaques</h2>
                </div>

                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    );
}
