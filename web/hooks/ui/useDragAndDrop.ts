// web/hooks/useDragAndDrop.ts
import { useSensors, useSensor, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { useBundleStore } from '@/stores';

export function useDragAndDrop() {
    const { reorderItems } = useBundleStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 } // Prevent accidental drags
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderItems(active.id as string, over.id as string);
        }
    };

    return {
        sensors,
        handleDragEnd
    };
}