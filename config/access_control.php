<?php

return [
    'super_admin_role' => 'super-administrador',

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
            ],
        ],
    ],
];
