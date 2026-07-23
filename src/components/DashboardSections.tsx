"use client";

import { type ReactNode, useState, useSyncExternalStore, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateDashboardSectionOrder } from "@/lib/actions";
import type { DashboardSectionId } from "@/lib/dashboardSections";

const noopSubscribe = () => () => {};

// Returns false during SSR and the initial hydration pass, then true once
// mounted on the client — avoids the dnd-kit hydration mismatch without
// calling setState from an effect.
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function SortableSection({ id, children }: { id: DashboardSectionId; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-label="Przeciągnij, aby zmienić kolejność sekcji"
        className="group flex justify-center py-1.5 cursor-grab active:cursor-grabbing touch-none"
      >
        <span className="w-10 h-1 rounded-full bg-border group-hover:bg-muted transition-colors" />
      </div>
      {children}
    </div>
  );
}

export function DashboardSections({
  initialOrder,
  sections,
}: {
  initialOrder: DashboardSectionId[];
  sections: Partial<Record<DashboardSectionId, ReactNode>>;
}) {
  const [order, setOrder] = useState(initialOrder);
  const mounted = useMounted();
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as DashboardSectionId);
      const newIndex = prev.indexOf(over.id as DashboardSectionId);
      const next = arrayMove(prev, oldIndex, newIndex);
      startTransition(() => {
        updateDashboardSectionOrder(next);
      });
      return next;
    });
  }

  const visibleOrder = order.filter((id) => sections[id]);

  // Drag-and-drop is client-only: dnd-kit generates internal ids that don't
  // stay stable between server render and hydration, so the interactive
  // version is only rendered after mount to avoid a hydration mismatch.
  if (!mounted) {
    return (
      <div className="flex flex-col gap-8">
        {visibleOrder.map((id) => (
          <div key={id}>{sections[id]}</div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleOrder} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-8">
          {visibleOrder.map((id) => (
            <SortableSection key={id} id={id}>
              {sections[id]}
            </SortableSection>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
