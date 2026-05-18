'use client';

import { Button } from '@/components/ui/button';
import { reorderMeaningsAction } from '@/lib/actions/word-actions';
import type { MeaningView } from '@/lib/dto/meaning';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { meaningCardClass } from './meaning-card-classes';

const COLLAPSED_COUNT = 2;

type WordDetailMeaningsProps = {
  wordbookId: number;
  wordId: number;
  meanings: MeaningView[];
};

export function WordDetailMeanings({
  wordbookId,
  wordId,
  meanings,
}: WordDetailMeaningsProps) {
  const router = useRouter();
  const [items, setItems] = useState<MeaningView[]>(meanings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, startTransition] = useTransition();

  const visibleItems =
    isExpanded || items.length <= COLLAPSED_COUNT
      ? items
      : items.slice(0, COLLAPSED_COUNT);
  const hiddenCount = items.length - visibleItems.length;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over === null || active.id === over.id) return;

    const oldIndex = items.findIndex((m) => m.id === active.id);
    const newIndex = items.findIndex((m) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = items;
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await reorderMeaningsAction(
        wordbookId,
        wordId,
        reordered.map((m) => m.id)
      );
      if (result.errors !== undefined && result.errors.length > 0) {
        setItems(previous);
        setErrorMessage(result.errors[0] ?? '並び替えに失敗しました');
        return;
      }
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">意味</h3>
        {isSaving && (
          <span className="text-xs text-muted-foreground">保存中...</span>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleItems.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-4">
            {visibleItems.map((meaning, index) => (
              <SortableMeaningItem
                key={meaning.id}
                meaning={meaning}
                index={index}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {items.length > COLLAPSED_COUNT && (
        <div className="mt-3 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((v) => !v)}
          >
            {isExpanded ? (
              <>
                <ChevronUp />
                閉じる
              </>
            ) : (
              <>
                <ChevronDown />
                もっと表示 (+{hiddenCount})
              </>
            )}
          </Button>
        </div>
      )}
      {errorMessage !== null && (
        <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

type SortableMeaningItemProps = {
  meaning: MeaningView;
  index: number;
};

function SortableMeaningItem({ meaning, index }: SortableMeaningItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: meaning.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 rounded-md border p-4 ${meaningCardClass(index)}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`意味 ${index + 1} を並び替え`}
        className="flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-black/5 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1 space-y-2">
        <p className="text-lg">{meaning.definition}</p>
        {meaning.examples.length > 0 && (
          <ul className="space-y-2 pl-4 border-l-2 border-muted">
            {meaning.examples.map((example) => (
              <li key={example.id} className="space-y-1">
                <p className="text-base">{example.sentence}</p>
                <p className="text-sm text-muted-foreground">
                  {example.translation}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
