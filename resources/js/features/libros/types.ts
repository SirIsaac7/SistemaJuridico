export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada';
export type TipoArchivo = 'pdf' | 'video' | 'imagen' | 'flujograma' | 'documento' | 'otro';

export interface ArchivoLibro {
    id: number;
    titulo: string;
    descripcion: string | null;
    nombre_original: string;
    tipo: TipoArchivo;
    mime_type: string;
    extension: string | null;
    tamano_bytes: number;
    is_active: boolean;
    created_at: string | null;
    view_url?: string;
    can: {
        view: boolean;
        update: boolean;
        update_status: boolean;
    };
}

export interface MateriaUnificadaResumen {
    id: number;
    nombre: string;
    descripcion: string | null;
    is_active: boolean;
    docente: {
        id: number;
        nombre: string;
        email: string;
    };
    archivos_count: number;
    archivos_activos_count: number;
    solicitudes_pendientes_count: number;
    estudiantes_activos_count: number;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    created_at: string | null;
    context: {
        can_supervise: boolean;
        can_manage: boolean;
        has_granted_access: boolean;
    };
}

export interface MateriaUnificadaDetalle {
    id: number;
    nombre: string;
    descripcion: string | null;
    is_active: boolean;
    created_at: string | null;
    docente: {
        id: number;
        nombre: string;
        email: string;
    };
    access: {
        fecha_inicio: string | null;
        fecha_fin: string | null;
    } | null;
    archivos: ArchivoLibro[];
    students: AccesoMateriaResumen[] | null;
}

export interface MateriaCatalogo {
    id: number;
    nombre: string;
    docente: {
        id: number;
        nombre_completo: string;
    };
    has_current_request: boolean;
    can_request: boolean;
}

export interface SolicitudPropia {
    id: number;
    materia: {
        id: number;
        nombre: string;
        docente: string;
    };
    universidad: string;
    observacion: string | null;
    estado: EstadoSolicitud;
    motivo_respuesta: string | null;
    fecha_solicitud: string | null;
    fecha_respuesta: string | null;
    respondido_por: string | null;
}

export interface SolicitudRecibida {
    id: number;
    estudiante: {
        id: number;
        nombre_completo: string;
        email: string;
    };
    materia: {
        id: number;
        nombre: string;
    };
    universidad: string;
    observacion: string | null;
    estado: EstadoSolicitud;
    motivo_respuesta: string | null;
    fecha_solicitud: string | null;
    fecha_respuesta: string | null;
}

export interface AccesoMateriaResumen {
    id: number;
    estudiante: {
        id: number;
        nombre: string;
        email: string;
    };
    universidad: string;
    is_current: boolean;
    fecha_inicio: string | null;
    fecha_fin: string | null;
}
