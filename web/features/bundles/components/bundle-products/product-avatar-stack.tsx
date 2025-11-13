import { ProductAvatarStackProps } from "@/features/bundles";

/**
 * Product avatar stack
 */
export function ProductAvatarStack({
    products,
    remainingCount,
}: ProductAvatarStackProps) {
    return (
        <>
            {products.map((product, index) => {
                const offset =
                    index === 1 ? "-left-5" : index === 2 ? "-left-10" : "";

                return (
                    <div key={`${product.id}-${index}`} className="relative">
                            <div
                                className={`${
                                    index === 2 ? "absolute -top-5" : "relative"
                                } w-10 h-10 rounded-full overflow-hidden border border-[var(--p-color-border)] ${offset}`}
                            >
                                <s-image
                                    src={product.featuredImage?.url || ""}
                                    alt={product.featuredImage?.altText || ""}
                                    aspectRatio="1/1"
                                    objectFit="cover"
                                />
                            </div>
                            {index === 2 && remainingCount > 0 && (
                                <div className="absolute w-10 h-10 -top-5 inset-0 bg-white/90 flex items-center justify-center text-[12px] font-bold rounded-full -left-10 border border-[var(--p-color-border)]">
                                    +{remainingCount}
                                </div>
                            )}
                    </div>
                );
            })}
        </>
    );
}
