<?php

use App\Http\Controllers\Admin\ApprovedDeviceResetRequestController;
use App\Http\Controllers\Admin\DeletedUserController;
use App\Http\Controllers\Admin\DeviceResetRequestController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserDeviceResetController;
use App\Http\Controllers\Admin\UserStatusController;
use App\Http\Controllers\Libros\ArchivoConcedidoContenidoController;
use App\Http\Controllers\Libros\ArchivoConcedidoVisorController;
use App\Http\Controllers\Libros\ArchivoContenidoController;
use App\Http\Controllers\Libros\ArchivoController;
use App\Http\Controllers\Libros\ArchivoStatusController;
use App\Http\Controllers\Libros\CatalogoMateriaController;
use App\Http\Controllers\Libros\LibroController;
use App\Http\Controllers\Libros\MateriaConcedidaController;
use App\Http\Controllers\Libros\MateriaController;
use App\Http\Controllers\Libros\MateriaStatusController;
use App\Http\Controllers\Libros\SolicitudAccesoController;
use App\Http\Controllers\Libros\SolicitudRecibidaController;
use App\Http\Controllers\Libros\SolicitudRespuestaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('roles/{role}/permissions', [RolePermissionController::class, 'edit'])
        ->name('roles.permissions.edit');
    Route::put('roles/{role}/permissions', [RolePermissionController::class, 'update'])
        ->name('roles.permissions.update');
    Route::resource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('users/device-reset-requests', [DeviceResetRequestController::class, 'index'])
        ->name('users.device-reset-requests.index');
    Route::post(
        'users/device-reset-requests/{solicitudReseteoDispositivo}/approval',
        [ApprovedDeviceResetRequestController::class, 'store'],
    )->name('users.device-reset-requests.approval.store');

    Route::put('users/{user}/status', UserStatusController::class)->name('users.status.update');
    Route::put('users/{user}/device/reset', UserDeviceResetController::class)->name('users.device.reset');
    Route::put('deleted-users/{user}', [DeletedUserController::class, 'update'])->name('deleted-users.update');
    Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::prefix('libros')->name('libros.')->group(function () {
        Route::get('/', [LibroController::class, 'index'])->name('index');
        Route::get('catalogo', CatalogoMateriaController::class)->name('catalogo.index');

        Route::get('solicitudes', [SolicitudAccesoController::class, 'index'])
            ->name('solicitudes.index');
        Route::post('materias/{materia}/solicitudes', [SolicitudAccesoController::class, 'store'])
            ->middleware('throttle:10,1')
            ->name('solicitudes.store');

        Route::get('solicitudes-recibidas', SolicitudRecibidaController::class)
            ->name('solicitudes-recibidas.index');
        Route::put('solicitudes-recibidas/{solicitud}', SolicitudRespuestaController::class)
            ->name('solicitudes-recibidas.update');

        Route::get('mis-materias/{materia}', [MateriaConcedidaController::class, 'show'])
            ->name('mis-materias.show');

        Route::scopeBindings()->group(function () {
            Route::get(
                'mis-materias/{materia}/archivos/{archivo}/visor',
                ArchivoConcedidoVisorController::class,
            )->name('mis-materias.archivos.visor');
            Route::get(
                'mis-materias/{materia}/archivos/{archivo}/contenido',
                ArchivoConcedidoContenidoController::class,
            )->name('mis-materias.archivos.contenido');
        });

        Route::resource('materias', MateriaController::class)
            ->only(['index', 'store', 'show', 'update']);
        Route::put('materias/{materia}/estado', MateriaStatusController::class)
            ->name('materias.estado.update');

        Route::scopeBindings()->group(function () {
            Route::post('materias/{materia}/archivos', [ArchivoController::class, 'store'])
                ->name('materias.archivos.store');
            Route::put('materias/{materia}/archivos/{archivo}', [ArchivoController::class, 'update'])
                ->name('materias.archivos.update');
            Route::put('materias/{materia}/archivos/{archivo}/estado', ArchivoStatusController::class)
                ->name('materias.archivos.estado.update');
            Route::get('materias/{materia}/archivos/{archivo}/contenido', ArchivoContenidoController::class)
                ->name('materias.archivos.contenido');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
