"use client";

import { useEditor } from "@/hooks/useEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export function PropertiesPanel() {
    const { selectedElement, updateSelected } = useEditor();

    if (!selectedElement) {
        return (
            <div className="w-72 bg-background border-l p-4 flex flex-col h-full text-zinc-500 items-center justify-center text-sm text-center">
                Выберите элемент на сцене или таймлайне для редактирования его свойств
            </div>
        );
    }

    return (
        <div className="w-72 bg-background border-l flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b">
                <h3 className="font-semibold">{selectedElement.type} Свойства</h3>
            </div>

            <div className="p-4 space-y-6">
                {/* Общие свойства (Позиция и размер) */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Трансформация</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs">X (px)</Label>
                            <Input 
                                type="number" 
                                value={Math.round(selectedElement.x)} 
                                onChange={(e) => updateSelected({ x: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Y (px)</Label>
                            <Input 
                                type="number" 
                                value={Math.round(selectedElement.y)} 
                                onChange={(e) => updateSelected({ y: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Ширина (px)</Label>
                            <Input 
                                type="number" 
                                value={Math.round(selectedElement.width)} 
                                onChange={(e) => updateSelected({ width: Math.max(10, Number(e.target.value)) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Высота (px)</Label>
                            <Input 
                                type="number" 
                                value={Math.round(selectedElement.height)} 
                                onChange={(e) => updateSelected({ height: Math.max(10, Number(e.target.value)) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between">
                            <Label className="text-xs">Непрозрачность</Label>
                            <span className="text-xs text-muted-foreground">{Math.round(selectedElement.opacity * 100)}%</span>
                        </div>
                        <Slider 
                            value={[selectedElement.opacity]} 
                            max={1} 
                            step={0.05}
                            onValueChange={(val) => updateSelected({ opacity: val[0] })}
                        />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between">
                            <Label className="text-xs">Поворот</Label>
                            <span className="text-xs text-muted-foreground">{Math.round(selectedElement.rotation)}°</span>
                        </div>
                        <Slider 
                            value={[selectedElement.rotation]} 
                            min={-180}
                            max={180} 
                            step={1}
                            onValueChange={(val) => updateSelected({ rotation: val[0] })}
                        />
                    </div>
                </div>

                <Separator />

                {/* Специфичные свойства (Пример для текста) */}
                {selectedElement.type === "TEXT" && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Текст</h4>
                        
                        <div className="space-y-2">
                            <Label className="text-xs">Содержимое</Label>
                            <Input 
                                value={selectedElement.content} 
                                onChange={(e) => updateSelected({ content: e.target.value })}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Размер (px)</Label>
                                <Input 
                                    type="number" 
                                    value={selectedElement.style.fontSize} 
                                    onChange={(e) => updateSelected({ 
                                        style: { ...selectedElement.style, fontSize: Number(e.target.value) } 
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Цвет</Label>
                                <Input 
                                    type="color" 
                                    value={selectedElement.style.color} 
                                    onChange={(e) => updateSelected({ 
                                        style: { ...selectedElement.style, color: e.target.value } 
                                    })}
                                    className="p-1 h-10"
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {selectedElement.type === "SHAPE" && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Стиль Фигуры</h4>
                        <div className="space-y-2">
                            <Label className="text-xs">Цвет заливки</Label>
                            <Input 
                                type="color" 
                                value={selectedElement.fill} 
                                onChange={(e) => updateSelected({ fill: e.target.value })}
                                className="p-1 h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Скругление (px)</Label>
                            <Input 
                                type="number" 
                                value={selectedElement.borderRadius} 
                                onChange={(e) => updateSelected({ borderRadius: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
