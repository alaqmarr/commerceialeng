/**
 * modules/products/queries/index.ts
 * Barrel export for all product database queries.
 * Strictly under 200 lines.
 */

export * from "./get-products.query";
export * from "./get-product-by-id-or-slug.query";
export * from "./get-featured-products.query";
export * from "./create-product.query";
export * from "./update-product.query";
export * from "./delete-product.query";
export * from "./count-products.query";
