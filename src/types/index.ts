// ── Types barrel export ──
// Auth
export type {
    UserRole,
    LoginCredentials,
    RegisterData,
    SafeUser,
} from "./auth";

// Project
export type {
    ProjectSettings,
    ProjectWithRelations,
    ProjectWithUser,
    CreateProjectInput,
    UpdateProjectInput,
} from "./project";
export { DEFAULT_PROJECT_SETTINGS } from "./project";

// Elements and Compositions
export type {
    Composition,
    CompositionSettings,
} from "./composition";
export { COMPOSITION_PRESETS } from "./composition";

// Layers
export type {
    LayerType,
    BlendMode,
    TrackMatte,
    Transform,
    Layer,
    TextLayerData,
    SolidLayerData,
    ImageLayerData,
    VideoLayerData,
    ShapeLayerData,
} from "./layer";

// Keyframes
export type {
    InterpolationType,
    Keyframe,
    AnimatedProperty,
} from "./keyframe";
export { createAnimatedProperty } from "./keyframe";

// Effects
export type {
    EffectCategory,
    Effect,
    EffectParameterDef,
    EffectDefinition,
} from "./effect";

// API
export type {
    ApiResponse,
    PaginatedResponse,
    GenerationRequest,
    GenerationResponse,
    UploadResponse,
    ValidationError,
} from "./api";
export { successResponse, errorResponse } from "./api";
