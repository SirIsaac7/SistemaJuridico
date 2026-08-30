<?php

use App\Http\Controllers\Admin\DeletedUserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserStatusController;
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

    Route::put('users/{user}/status', UserStatusController::class)->name('users.status.update');
    Route::put('deleted-users/{user}', [DeletedUserController::class, 'update'])->name('deleted-users.update');
    Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
