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

// Editor
export type {
    ElementType,
    BaseElement,
    TextElement,
    ImageElement,
    VideoElement,
    ShapeElement,
    AudioElement,
    SceneElement,
    Scene,
    TimelineTrack,
    EditorState,
} from "./editor";
export { DEFAULT_ELEMENT_PROPS } from "./editor";

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
