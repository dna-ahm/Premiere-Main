import { createFileRoute, Link, notFound, Outlet } from "@tanstack/react-router";
import { Nav } from "@/components/layout/nav";
import { getProduct } from "@/lib/mock-data";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductLayout,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-3xl px-8 py-24 text-center">
        <h1 className="font-serif text-5xl">Not found</h1>
        <p className="mt-4 text-muted-foreground">This product could not be located.</p>
        <Link
          to="/library"
          className="mt-8 inline-block rounded-sm bg-primary px-5 py-3 text-[11px] tracking-luxury text-primary-foreground"
        >
          Back to library
        </Link>
      </div>
    </div>
  ),
});

function ProductLayout() {
  return <Outlet />;
}
