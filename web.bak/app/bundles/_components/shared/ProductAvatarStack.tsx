import Image from "next/image";
import { Box } from "@shopify/polaris";

import { ProductGroup } from "@/types";

interface Props {
    products: ProductGroup[];
    remainingCount: number;
}

export default function ProductAvatarStack({ products, remainingCount }: Props) {
    return (
        <>
            {products.map((product, index) => {
                const offset = index === 1 ? "-left-5" : index === 2 ? "-left-10" : "";

                return (
                    <Box key={`${product.id}-${index}`} position="relative">
                        <div
                            className={`${
                                index === 2 ? "absolute" : "relative"
                            } w-10 h-10 rounded-full overflow-hidden border border-[var(--p-color-border)] ${offset}`}
                        >
                            <Image
                                src={product.featuredImage || ""}
                                alt={product.title}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {index === 2 && remainingCount > 0 && (
                            <div className="absolute w-10 h-10 inset-0 bg-white/90 flex items-center justify-center text-[12px] font-bold rounded-full -left-10 border border-[var(--p-color-border)]">
                                +{remainingCount}
                            </div>
                        )}
                    </Box>
                );
            })}
        </>
    );
}