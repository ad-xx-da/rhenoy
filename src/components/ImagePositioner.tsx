"use client";

import { useCallback, useRef, useState } from "react";

export default function ImagePositioner({
  src,
  value,
  onChange,
}: {
  src: string;
  value: { x: number; y: number };
  onChange: (pos: { x: number; y: number }) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragState.current = { startX: e.clientX, startY: e.clientY, origX: value.x, origY: value.y };
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [value]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current || !frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragState.current.startX;
      const deltaY = e.clientY - dragState.current.startY;
      const newX = Math.min(100, Math.max(0, dragState.current.origX - (deltaX / rect.width) * 100));
      const newY = Math.min(100, Math.max(0, dragState.current.origY - (deltaY / rect.height) * 100));
      onChange({ x: newX, y: newY });
    },
    [onChange]
  );

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
    setDragging(false);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full max-w-xs overflow-hidden select-none"
        style={{ aspectRatio: "3/2", cursor: dragging ? "grabbing" : "grab", border: "1px solid #C8BFB0" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${value.x}% ${value.y}%` }}
        />
      </div>
      <p className="text-[10px] text-charcoal/40 italic">Drag the image to adjust the crop</p>
    </div>
  );
}
