import { computed, inject, Injectable, signal } from "@angular/core";
import { DrawingAndWritingStore } from "./canvas-store";
import { Store } from "../../../store/store";
import { Subscription } from "rxjs";
import Konva from 'konva';
import { DrawingStoreEvent } from "./event.service";
import { scrollContainers } from "../../../utils/helper";
import { GradingService } from "../../../services/grading.service";

@Injectable({ providedIn: 'root' })
export class CanvasService {
    private _drawingStore = inject(DrawingAndWritingStore)
    private _drawingStoreEvent = inject(DrawingStoreEvent)
    private _store = inject(Store)
    private _gradingService = inject(GradingService)

    questionChangeSub$: Subscription
    pageSelectEvent$: Subscription
    clearCurrentPageEvent$: Subscription
    backgroundChange$: Subscription
    selectMeasurementTool$: Subscription
    removeMeasurementTool$: Subscription
    layoutSub$: Subscription

    store = computed(() => this._store.store())
    backgroundType = signal<'LINE' | 'GRID' | 'GRAPH' | 'NONE'>('LINE')
    currentTool = signal<'brush' | 'eraser' | 'rectangle' | 'square' | 'circle'>('brush')
    drawing = signal<boolean>(false)
    currentLine = signal<Konva.Line | null>(null)
    ruler = signal<Konva.Group | null>(null)
    protractor = signal<Konva.Group | null>(null)
    rulerTransformer = signal<Konva.Transformer | null>(null)
    protractorTransformer = signal<Konva.Transformer | null>(null)
    loaded = signal(false)
    eraserSize = signal<number>(10)
    brushSize = signal(2)
    brushColor = signal('#000000')
    eraserColor = signal('#f5f5f7')
    canvasWidth = signal(3000)
    canvasHeight = signal(3000)

    constructor() {
        this.loaded.set(true)
    }

    initializeCanvas() {
        const stageContainer = document.getElementById('stage')
        if (!stageContainer) {
            return
        }

        let stage = new Konva.Stage({ container: 'stage', width: this.canvasWidth(), height: this.canvasHeight(), draggable: false });
        let gridLayer = new Konva.Layer();
        let drawingLayer = new Konva.Layer();
        let toolLayer = new Konva.Layer();

        stage.add(gridLayer, drawingLayer, toolLayer);

        const destroyCanvas = () => {
            if (stage) {
                stage.destroy();
                stage = null as any
            }
        }

        function drawGrid(gridSize = 50) {
            gridLayer.destroyChildren();

            const w = stage?.width();
            const h = stage?.height();

            const grid = new Konva.Shape({
                listening: false,
                perfectDrawEnabled: false,
                sceneFunc: function (ctx, shape) {
                    ctx.strokeStyle = '#bac2cf';
                    ctx.lineWidth = 1;

                    for (let x = 0; x <= w; x += gridSize) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, h);
                        ctx.stroke();
                    }

                    for (let y = 0; y <= h; y += gridSize) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(w, y);
                        ctx.stroke();
                    }
                }
            });

            gridLayer?.add(grid);
            gridLayer?.cache()
            gridLayer?.batchDraw();
        }

        function drawLineBackground(lineSpacing = 50) {
            gridLayer.destroyChildren();

            const w = stage?.width();
            const h = stage?.height();

            const lines = new Konva.Shape({
                listening: false,
                perfectDrawEnabled: false,
                sceneFunc: function (ctx, shape) {
                    ctx.strokeStyle = '#bac2cf';
                    ctx.lineWidth = 1;

                    for (let y = 0; y <= h; y += lineSpacing) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(w, y);
                        ctx.stroke();
                    }
                }
            });

            gridLayer?.add(lines);
            gridLayer?.cache()
            gridLayer?.batchDraw();
        }

        function drawGraphBackground(majorSize = 50, minorSize = 10) {
            gridLayer.destroyChildren();

            const w = stage?.width();
            const h = stage?.height();

            const graph = new Konva.Shape({
                listening: false,
                perfectDrawEnabled: false,
                sceneFunc: function (ctx) {
                    ctx.strokeStyle = '#e5e7eb';
                    ctx.lineWidth = 1;

                    for (let x = 0; x <= w; x += minorSize) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, h);
                        ctx.stroke();
                    }

                    for (let y = 0; y <= h; y += minorSize) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(w, y);
                        ctx.stroke();
                    }

                    ctx.strokeStyle = '#bac2cf';
                    ctx.lineWidth = 1.5;

                    for (let x = 0; x <= w; x += majorSize) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, h);
                        ctx.stroke();
                    }

                    for (let y = 0; y <= h; y += majorSize) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(w, y);
                        ctx.stroke();
                    }
                }
            });

            gridLayer?.add(graph);
            gridLayer?.cache();
            gridLayer?.batchDraw();
        }

        const setBackgroundType = () => {
            clearBackground()

            switch (this.backgroundType()) {
                case 'LINE':
                    drawLineBackground();
                    break;

                case 'GRID':
                    drawGrid();
                    break;

                case 'GRAPH':
                    drawGraphBackground();
                    break;

                case 'NONE':
                default:
                    break;
            }

        }

        const resizeStage = () => {
            stage?.width(this.canvasWidth());
            stage?.height(this.canvasHeight());

            setBackgroundType();
            loadCurrentPageStrokes()
            scrollContainers()
        }

        function clearBackground() {
            gridLayer.destroyChildren();
            gridLayer.batchDraw();
        }

        function deltaDecode(deltas: number[]): number[] {
            if (!deltas || deltas.length < 2) return [];

            const points = [deltas[0], deltas[1]];

            for (let i = 2; i < deltas.length; i += 2) {
                const x = points[points.length - 2] + deltas[i];
                const y = points[points.length - 1] + deltas[i + 1];
                points.push(x, y);
            }

            return points;
        }

        const redrawStrokes = () => {
            drawingLayer.destroyChildren();

            const currentPageData = this._drawingStore.getCurrentPageData();
            if (!currentPageData || !currentPageData.strokes) return;

            const strokeGroup = new Konva.Group({
                listening: false,
                perfectDrawEnabled: false,
            });

            const decodedStrokes = currentPageData.strokes.map(stroke => ({
                ...stroke,
                points: deltaDecode(stroke.points)
            }));

            decodedStrokes.forEach((stroke: any) => {
                let shape: Konva.Shape | null = null;

                if (stroke.type && stroke.type === 'shape') {
                    const shapeItem = stroke;
                    const shapeType = shapeItem.shapeType;
                    const commonProps = {
                        stroke: shapeItem.color || '#111827',
                        fill: 'transparent',
                        strokeWidth: shapeItem.size,
                        listening: false,
                        perfectDrawEnabled: false,
                    };

                    if (shapeType === 'rectangle' || shapeType === 'square') {
                        shape = new Konva.Rect({
                            x: shapeItem.x,
                            y: shapeItem.y,
                            width: shapeItem.width || 0,
                            height: shapeItem.height || 0,
                            ...commonProps
                        })

                    }
                    else if (shapeType === 'circle') {
                        shape = new Konva.Circle({
                            x: shapeItem.x,
                            y: shapeItem.y,
                            radius: shapeItem.radius || 0,
                            ...commonProps
                        })
                    }

                } else {
                    shape = new Konva.Line({
                        points: stroke.points,
                        stroke: stroke.mode === 'eraser' ? '#000' : (stroke.color || '#111827'),
                        strokeWidth: stroke.size,
                        globalCompositeOperation: stroke.mode === 'eraser'
                            ? 'destination-out'
                            : 'source-over',
                        lineCap: 'round',
                        lineJoin: 'round',
                        listening: false,
                        perfectDrawEnabled: false,
                    });
                }

                if (!shape) return;

                strokeGroup.add(shape);
            });


            drawingLayer.add(strokeGroup);
            drawingLayer.batchDraw();
        };

        const loadCurrentPageStrokes = () => {
            redrawStrokes();
        }

        const clearCurrentPageStrokes = () => {
            this._drawingStore.clearCurrentPage();
            drawingLayer.destroyChildren();
            drawingLayer.batchDraw();
        }

        window.addEventListener('resize', resizeStage);

        function getDPI(): number {
            const div = document.createElement("div");
            div.style.width = "1in";
            div.style.height = "1in";
            div.style.position = "absolute";
            div.style.top = "-100%";
            document.body.appendChild(div);
            const dpi = div.offsetWidth;
            document.body.removeChild(div);
            return dpi;
        }

        const createProtractor = (x: number, y: number) => {
            const DPI = getDPI();
            const PIXELS_PER_CM = DPI / 2.54;
            const radius = 8 * PIXELS_PER_CM; // 8cm radius for larger size
            const group = new Konva.Group({ x, y, draggable: true });
            // Base semicircle with gradient
            const arc = new Konva.Arc({
                x: 0,
                y: 0,
                innerRadius: 0,
                outerRadius: radius,
                angle: 180,
                fillLinearGradientStartPoint: { x: -radius, y: 0 },
                fillLinearGradientEndPoint: { x: radius, y: 0 },
                fillLinearGradientColorStops: [
                    0,
                    "#fdfdfd",
                    0.5,
                    "#f0f0f0",
                    1,
                    "#e6e6e6",
                ],
                stroke: "#888",
                strokeWidth: 2,
                shadowColor: "black",
                shadowBlur: 3,
                shadowOpacity: 0.2,
            });
            group.add(arc);
            // Add degree marks every 1 degree
            for (let angle = 0; angle <= 180; angle += 1) {
                const radians = (angle * Math.PI) / 180;
                let startRadius,
                    tickWidth = 0.5,
                    color = "#999";
                if (angle % 30 === 0) {
                    // Major marks every 30 degrees
                    startRadius = radius - 40;
                    tickWidth = 2;
                    color = "#333";
                } else if (angle % 10 === 0) {
                    // Medium marks every 10 degrees
                    startRadius = radius - 30;
                    tickWidth = 1.5;
                    color = "#444";
                } else if (angle % 5 === 0) {
                    // Small marks every 5 degrees
                    startRadius = radius - 20;
                    tickWidth = 1;
                    color = "#666";
                } else {
                    // Tiny marks for every degree
                    startRadius = radius - 12;
                    tickWidth = 0.5;
                    color = "#999";
                }
                const endRadius = radius - 3;
                const x1 = startRadius * Math.cos(radians);
                const y1 = -startRadius * Math.sin(radians);
                const x2 = endRadius * Math.cos(radians);
                const y2 = -endRadius * Math.sin(radians);
                const tick = new Konva.Line({
                    points: [x1, y1, x2, y2],
                    stroke: color,
                    strokeWidth: tickWidth,
                });
                group.add(tick);
                // Add numbers for major angles (every 30 degrees)
                if (angle % 30 === 0) {
                    const textRadius = radius - 55;
                    const textX = textRadius * Math.cos(radians);
                    const textY = -textRadius * Math.sin(radians);
                    const text = new Konva.Text({
                        x: textX - 8,
                        y: textY - 8,
                        text: angle.toString(),
                        fontSize: 16,
                        fontFamily: "monospace",
                        fill: "#111",
                        fontStyle: "bold",
                    });
                    group.add(text);
                }
                // Add smaller numbers for 10-degree marks (excluding 30-degree marks)
                else if (angle % 10 === 0 && angle % 30 !== 0) {
                    const textRadius = radius - 45;
                    const textX = textRadius * Math.cos(radians);
                    const textY = -textRadius * Math.sin(radians);
                    const text = new Konva.Text({
                        x: textX - 6,
                        y: textY - 6,
                        text: angle.toString(),
                        fontSize: 12,
                        fontFamily: "monospace",
                        fill: "#333",
                    });
                    group.add(text);
                }
            }
            // Add center point
            const centerDot = new Konva.Circle({
                x: 0,
                y: 0,
                radius: 6,
                fill: "#333",
                stroke: "#fff",
                strokeWidth: 2,
            });
            group.add(centerDot);
            // Add baseline
            const baseline = new Konva.Line({
                points: [-radius, 0, radius, 0],
                stroke: "#333",
                strokeWidth: 3,
            });
            group.add(baseline);
            // Add small notch at 0 and 180 degrees
            const leftNotch = new Konva.Rect({
                x: -radius - 3,
                y: -4,
                width: 6,
                height: 8,
                fill: "#333",
            });
            const rightNotch = new Konva.Rect({
                x: radius - 3,
                y: -4,
                width: 6,
                height: 8,
                fill: "#333",
            });
            group.add(leftNotch, rightNotch);
            group.cache();

            const protractorTransformer = new Konva.Transformer({
                nodes: [group],
                rotateEnabled: true,
                rotationHandleOffset: 60,
                rotationHandleSize: 30,
                rotationHandleStroke: "#1976d2",
                rotationHandleFill: "#1976d2",
                enabledAnchors: ["middle-left", "middle-right"],
                borderStroke: "#1976d2",
                borderStrokeWidth: 2,
                anchorCornerRadius: 6,
            });
            this.protractorTransformer.set(protractorTransformer)
            toolLayer.add(protractorTransformer);
            toolLayer.add(group);

            stage.on("click tap", (e) => {
                if (e.target === stage) protractorTransformer.nodes([]);
                else if (e.target.getParent() === group) protractorTransformer.nodes([group]);
                toolLayer.batchDraw();
            });

            group.on("dragmove transform", () => {
                protractorTransformer.moveToTop();
                toolLayer.batchDraw();
            });

            return group;
        }

        const createRuler = (x: number, y: number) => {
            const DPI = getDPI();
            const PIXELS_PER_CM = DPI / 2.54;
            const RULER_CM = 20;
            const RULER_HEIGHT = 50;
            const RULER_LENGTH_PX = RULER_CM * PIXELS_PER_CM;

            const group = new Konva.Group({ x, y, draggable: true });

            const body = new Konva.Rect({
                width: RULER_LENGTH_PX,
                height: RULER_HEIGHT,
                fillLinearGradientStartPoint: { x: 0, y: 0 },
                fillLinearGradientEndPoint: { x: 0, y: RULER_HEIGHT },
                fillLinearGradientColorStops: [0, "#fdfdfd", 1, "#e6e6e6"],
                stroke: "#888",
                cornerRadius: 3,
                shadowColor: "black",
                shadowBlur: 2,
                shadowOpacity: 0.2,
            });
            group.add(body);

            const mmTotal = RULER_CM * 10;
            for (let mm = 0; mm <= mmTotal; mm++) {
                const xPos = (mm / 10) * PIXELS_PER_CM;
                let tickHeight, color = "#333", width = 1;

                if (mm % 10 === 0) {
                    tickHeight = 20;
                    width = 1.2;
                } else if (mm % 5 === 0) {
                    tickHeight = 14;
                } else {
                    tickHeight = 8;
                    color = "#666";
                }

                const tick = new Konva.Line({
                    points: [xPos, RULER_HEIGHT, xPos, RULER_HEIGHT - tickHeight],
                    stroke: color,
                    strokeWidth: width,
                });
                group.add(tick);

                if (mm % 10 === 0) {
                    const label = new Konva.Text({
                        x: xPos - 4,
                        y: RULER_HEIGHT - 28,
                        text: mm === 0 ? "" : (mm / 10).toString(),
                        fontSize: 12,
                        fill: "#111",
                        fontFamily: "monospace",
                    });
                    group.add(label);
                }
            }

            const rulerTransformer = new Konva.Transformer({
                nodes: [group],
                rotateEnabled: true,
                rotationHandleOffset: 60,
                rotationHandleSize: 30,
                rotationHandleStroke: "#1976d2",
                rotationHandleFill: "#1976d2",
                enabledAnchors: ["middle-left", "middle-right"],
                borderStroke: "#1976d2",
                borderStrokeWidth: 2,
                anchorCornerRadius: 6,
            });

            this.rulerTransformer.set(rulerTransformer)
            toolLayer.add(rulerTransformer);
            toolLayer.add(group);

            stage.on("click tap", (e) => {
                if (e.target === stage) {
                    rulerTransformer.nodes([])
                }
                else if (e.target.getParent() === group) {
                    rulerTransformer.nodes([group])
                };
                toolLayer.batchDraw();
            });

            group.on("dragmove transform", () => {
                rulerTransformer.moveToTop();
                toolLayer.batchDraw();
            });

            toolLayer.batchDraw();
            return group;
        }

        this.layoutSub$?.unsubscribe()
        this.layoutSub$ = this._drawingStoreEvent._layoutSub$.subscribe({
            next: () => {
                setTimeout(() => {
                    resizeStage();
                }, 1000)
            }
        })

        this.pageSelectEvent$?.unsubscribe()
        this.pageSelectEvent$ = this._drawingStoreEvent._pageSelectEvent$.subscribe({
            next: () => {
                loadCurrentPageStrokes()
                scrollContainers()
                this.backgroundType.set(this._gradingService.currentQuestion().item.backgroundType as any)
                this._drawingStoreEvent._backgroundChange$.next(this.backgroundType())
            }
        })

        this.questionChangeSub$?.unsubscribe()
        this.questionChangeSub$ = this._drawingStoreEvent._questionChanged$.subscribe({
            next: () => {
                this._drawingStore.clearStoreData()
                destroyCanvas()
                scrollContainers()
                this._drawingStore.createStore()
            }
        })

        this.clearCurrentPageEvent$?.unsubscribe()
        this.clearCurrentPageEvent$ = this._drawingStoreEvent._clearCurrentPageEvent$.subscribe({
            next: () => {
                clearCurrentPageStrokes()
            }
        })

        this.backgroundChange$?.unsubscribe()
        this.backgroundChange$ = this._drawingStoreEvent._backgroundChange$.subscribe({
            next: (type) => {
                if (!this.loaded()) {
                    return
                }

                if (!type) {
                    return
                }

                this.backgroundType.set(type as any)
                setBackgroundType()
            }
        })

        this.selectMeasurementTool$?.unsubscribe()
        this.selectMeasurementTool$ = this._drawingStoreEvent._selectMeasurementTool$.subscribe({
            next: (tool) => {
                if (tool === 'ruler' && !this.ruler()) {
                    this.ruler.set(createRuler(100, 100));
                    toolLayer.add(this.ruler() as any);
                }

                if (tool === 'protractor' && !this.protractor()) {
                    this.protractor.set(createProtractor(400, 350));
                    toolLayer.add(this.protractor() as any);
                }

                toolLayer.batchDraw();
            },
        });

        this.removeMeasurementTool$?.unsubscribe()
        this.removeMeasurementTool$ = this._drawingStoreEvent._removeMeasurementTool$.subscribe({
            next: (tool) => {

                if (tool == 'all') {
                    this.ruler()?.destroy()
                    this.ruler.set(null)
                    this.protractor()?.destroy()
                    this.protractor.set(null)
                    toolLayer.destroyChildren()
                }

                if (tool === 'ruler') {
                    this.ruler()?.destroy()
                    this.ruler.set(null)
                    toolLayer.getChildren((item) => item == this.ruler())?.[0]?.destroy()
                    toolLayer.getChildren((item) => item == this.rulerTransformer())?.[0]?.destroy()
                }

                if (tool === 'protractor') {
                    this.protractor()?.destroy()
                    this.protractor.set(null)
                    toolLayer.getChildren((item) => item == this.protractor())?.[0]?.destroy()
                    toolLayer.getChildren((item) => item == this.protractorTransformer())?.[0]?.destroy()
                }

                toolLayer.batchDraw();
            },
        });

        setBackgroundType()
        loadCurrentPageStrokes()
    }
}