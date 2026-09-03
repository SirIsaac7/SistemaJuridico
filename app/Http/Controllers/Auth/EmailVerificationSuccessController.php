<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationSuccessController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->get('email_verification_completed')) {
            return to_route('home');
        }

        return Inertia::render('auth/email-verified', [
            'canContinue' => $request->user()?->hasVerifiedEmail() ?? false,
        ]);
    }
}
