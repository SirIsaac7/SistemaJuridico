<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\DeviceResetRequestController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController as FortifyAuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\ConfirmablePasswordController as FortifyConfirmablePasswordController;
use Laravel\Fortify\Http\Controllers\NewPasswordController as FortifyNewPasswordController;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController as FortifyPasswordResetLinkController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController as FortifyRegisteredUserController;

Route::middleware('guest')->group(function () {
    Route::get('register', [FortifyRegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [FortifyRegisteredUserController::class, 'store'])
        ->name('register.store');

    Route::get('login', [FortifyAuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [FortifyAuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')
        ->name('login.store');

    Route::post('device-reset-requests', [DeviceResetRequestController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('device-reset-requests.store');

    Route::get('forgot-password', [FortifyPasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [FortifyPasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [FortifyNewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [FortifyNewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [FortifyConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [FortifyConfirmablePasswordController::class, 'store'])
        ->name('password.confirm.store');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
