"use client";

import { useEditor } from "@/hooks/useEditor";

export function Canvas() {
    const { 
        activeScene, 
        selectedElementId, 
        selectElement 
    } = useEditor();

    if (!activeScene) {
        return (
            <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-500">
                Нет активной сцены
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-zinc-950 overflow-auto p-8">
            {/* Canvas Viewport */}
            <div
                className="relative shadow-2xl border border-zinc-800 overflow-hidden"
                style={{
                    width: 960,
                    height: 540,
                    backgroundColor: activeScene.backgroundColor || "#000",
                }}
            >
                {/* Elements Layer */}
                {activeScene.elements.map((el) => {
                    const isSelected = selectedElementId === el.id;
                    
                    return (
                        <div
                            key={el.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                selectElement(el.id);
                            }}
                            className={`absolute cursor-move transition-shadow ${
                                isSelected 
                                    ? "ring-2 ring-accent ring-offset-1 ring-offset-transparent" 
                                    : "hover:ring-1 hover:ring-white/30"
                            }`}
                            style={{
                                left: `${(el.x / 1920) * 960}px`,
                                top: `${(el.y / 1080) * 540}px`,
                                width: `${(el.width / 1920) * 960}px`,
                                height: `${(el.height / 1080) * 540}px`,
                                opacity: el.opacity,
                                transform: `rotate(${el.rotation}deg)`,
                                zIndex: el.zIndex
                            }}
                        >
                            {/* Render element by type */}
                            {el.type === "TEXT" && (
                                <div
                                    className="w-full h-full flex items-center justify-center overflow-hidden"
                                    style={{
                                        fontSize: `${(el.style?.fontSize || 48) / 2}px`,
                                        fontWeight: el.style?.fontWeight || "normal",
                                        color: el.style?.color || "#ffffff",
                                        fontFamily: el.style?.fontFamily || "sans-serif",
                                        textAlign: (el.style?.textAlign as React.CSSProperties["textAlign"]) || "center",
                                    }}
                                >
                                    {el.content || "Текст"}
                                </div>
                            )}

                            {el.type === "IMAGE" && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={el.src || ""}
                                    alt=""
                                    className="w-full h-full object-cover pointer-events-none"
                                    draggable={false}
                                />
                            )}

                            {el.type === "SHAPE" && (
                                <div
                                    className="w-full h-full"
                                    style={{
                                        backgroundColor: el.fill || "#6366f1",
                                        borderRadius: el.borderRadius != null ? `${el.borderRadius / 2}px` : "0",
                                    }}
                                />
                            )}

                            {/* Selection handles */}
                            {isSelected && (
                                <>
                                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-accent rounded-sm cursor-nw-resize" />
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-accent rounded-sm cursor-ne-resize" />
                                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-accent rounded-sm cursor-sw-resize" />
                                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-accent rounded-sm cursor-se-resize" />
                                </>
                            )}
                        </div>
                    );
                })}

                {/* Click on empty area to deselect */}
                <div
                    className="absolute inset-0 -z-0"
                    onClick={() => selectElement(null)}
                />
            </div>
        </div>
    );
}
