export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada';
export type TipoArchivo = 'pdf' | 'video' | 'imagen' | 'flujograma' | 'documento' | 'otro';

export interface MateriaResumen {
    id: number;
    nombre: string;
    descripcion: string | null;
    is_active: boolean;
    archivos_count: number;
    archivos_activos_count: number;
    solicitudes_pendientes_count: number;
    created_at: string | null;
    can: {
        update: boolean;
        update_status: boolean;
    };
}

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
    can: {
        view: boolean;
        update: boolean;
        update_status: boolean;
    };
}

export interface MateriaDetalle {
    id: number;
    nombre: string;
    descripcion: string | null;
    is_active: boolean;
    archivos: ArchivoLibro[];
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

export interface MateriaConcedidaResumen {
    id: number;
    nombre: string;
    docente: string;
    archivos_count: number;
    fecha_inicio: string | null;
    fecha_fin: string | null;
}

export interface ArchivoConcedido {
    id: number;
    titulo: string;
    descripcion: string | null;
    nombre_original: string;
    tipo: TipoArchivo;
    mime_type: string;
    extension: string | null;
    tamano_bytes: number;
    created_at: string | null;
}

export interface MateriaConcedidaDetalle {
    id: number;
    nombre: string;
    descripcion: string | null;
    docente: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    archivos: ArchivoConcedido[];
}
