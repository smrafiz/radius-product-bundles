"use client";

import {
    AppearanceStep,
    BundleType,
    DiscountStep,
    ProductsStep,
    ReviewStep,
    useBundleStore,
} from "@/features/bundles";
import { AnimatePresence, motion } from "framer-motion";

export function StepContent({ bundleType }: { bundleType: BundleType }) {
    const { currentStep, previousStep } = useBundleStore();

    const direction = currentStep > previousStep ? 1 : -1;

    const stepVariants = {
        enter: (direction: number) => ({
            opacity: 0,
            x: direction > 0 ? 8 : -8,
        }),
        center: {
            opacity: 1,
            x: 0,
        },
        exit: (direction: number) => ({
            opacity: 0,
            x: direction > 0 ? -8 : 8,
        }),
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <ProductsStep bundleType={bundleType} />;
            case 2:
                return <DiscountStep />;
            case 3:
                return <AppearanceStep />;
            case 4:
                return <ReviewStep />;
            default:
                return <ProductsStep bundleType={bundleType} />;
        }
    };

    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    duration: 0.22,
                    ease: "easeOut",
                }}
            >
                {renderCurrentStep()}
            </motion.div>
        </AnimatePresence>
    );
}
