<?php

return [
    'super_admin_role' => 'super-administrador',
    'admin_role' => 'administrador',
    'docente_role' => 'docente',
    'estudiante_role' => 'estudiante',

    'permission_groups' => [
        'roles' => [
            'label' => 'Roles y permisos',
            'description' => 'Controla la creación de roles y la asignación de permisos.',
            'permissions' => [
                ['name' => 'roles.ver', 'label' => 'Ver roles'],
                ['name' => 'roles.crear', 'label' => 'Crear roles'],
                ['name' => 'roles.editar', 'label' => 'Editar roles'],
                ['name' => 'roles.eliminar', 'label' => 'Eliminar roles'],
                ['name' => 'roles.asignar-permisos', 'label' => 'Asignar permisos'],
            ],
        ],
        'users' => [
            'label' => 'Usuarios',
            'description' => 'Controla las cuentas, sus roles y el acceso al sistema.',
            'permissions' => [
                ['name' => 'usuarios.ver', 'label' => 'Ver usuarios'],
                ['name' => 'usuarios.crear', 'label' => 'Crear usuarios'],
                ['name' => 'usuarios.editar', 'label' => 'Editar usuarios'],
                ['name' => 'usuarios.bloquear', 'label' => 'Bloquear o activar usuarios'],
                ['name' => 'usuarios.eliminar', 'label' => 'Enviar usuarios a la papelera'],
                ['name' => 'usuarios.restaurar', 'label' => 'Restaurar usuarios'],
                ['name' => 'usuarios.asignar-roles', 'label' => 'Asignar roles'],
                ['name' => 'usuarios.resetear-dispositivo', 'label' => 'Resetear dispositivo autorizado'],
            ],
        ],
        'libros' => [
            'label' => 'Libros',
            'description' => 'Controla materias, archivos privados y solicitudes de acceso.',
            'permissions' => [
                ['name' => 'libros.ver', 'label' => 'Ingresar al módulo Libros'],
                ['name' => 'libros.administracion.ver', 'label' => 'Supervisar todas las materias, archivos y estudiantes inscritos'],
                ['name' => 'libros.catalogo.ver', 'label' => 'Ver el catálogo de materias'],
                ['name' => 'libros.materias.ver', 'label' => 'Ver materias propias'],
                ['name' => 'libros.materias.crear', 'label' => 'Crear materias'],
                ['name' => 'libros.materias.crear-para-docente', 'label' => 'Crear materias para un docente'],
                ['name' => 'libros.materias.editar', 'label' => 'Editar materias propias'],
                ['name' => 'libros.materias.cambiar-estado', 'label' => 'Inhabilitar o reactivar materias propias'],
                ['name' => 'libros.archivos.ver', 'label' => 'Ver archivos propios'],
                ['name' => 'libros.archivos.subir', 'label' => 'Subir archivos a materias propias'],
                ['name' => 'libros.archivos.editar', 'label' => 'Editar archivos propios'],
                ['name' => 'libros.archivos.cambiar-estado', 'label' => 'Inhabilitar o reactivar archivos propios'],
                ['name' => 'libros.solicitudes.ver-propias', 'label' => 'Ver solicitudes propias'],
                ['name' => 'libros.solicitudes.crear', 'label' => 'Solicitar acceso a una materia'],
                ['name' => 'libros.solicitudes.ver-recibidas', 'label' => 'Ver solicitudes recibidas'],
                ['name' => 'libros.solicitudes.responder', 'label' => 'Aceptar o rechazar solicitudes recibidas'],
                ['name' => 'libros.accesos.ver-propios', 'label' => 'Ver materias y archivos concedidos'],
            ],
        ],
    ],

    'default_role_permissions' => [
        'administrador' => [
            'libros.ver',
            'libros.administracion.ver',
            'libros.materias.crear-para-docente',
        ],
        'docente' => [
            'libros.ver',
            'libros.materias.ver',
            'libros.materias.crear',
            'libros.materias.editar',
            'libros.materias.cambiar-estado',
            'libros.archivos.ver',
            'libros.archivos.subir',
            'libros.archivos.editar',
            'libros.archivos.cambiar-estado',
            'libros.solicitudes.ver-recibidas',
            'libros.solicitudes.responder',
        ],
        'estudiante' => [
            'libros.ver',
            'libros.catalogo.ver',
            'libros.solicitudes.ver-propias',
            'libros.solicitudes.crear',
            'libros.accesos.ver-propios',
        ],
    ],
];
