import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const path = request.nextUrl.pathname
    const url = request.nextUrl.clone()

    // Handle password reset / auth code flow
    // When Supabase sends users to the site URL with a code parameter,
    // redirect them to the auth callback to properly exchange the code for a session
    const code = request.nextUrl.searchParams.get('code')
    const type = request.nextUrl.searchParams.get('type')

    // If there's a code in the URL and we're NOT already on the callback route
    if (code && !path.startsWith('/auth/callback')) {
        url.pathname = '/auth/callback'
        // Preserve all query params including code and type
        // Add next parameter for password reset flows
        if (type === 'recovery') {
            url.searchParams.set('next', '/update-password')
        }
        return NextResponse.redirect(url)
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh Session
    const { data: { user } } = await supabase.auth.getUser()



    // PROTECTED ROUTES:
    // /membership should be public (landing page). /signup (application) requires auth.
    // Dashboard removed as per request. Only checking signup now (or nothing if signup is public?)
    // Assuming /signup is the only protected route now, or maybe none strictly "protected" in the same way?
    // Let's keep /signup protected if it was before, or if user wants to remove all dash related stuff.
    // If dashboard is gone, user likely doesn't have a specific landing page after login.
    const protectedPrefixes: string[] = [] // Minimal protection if needed
    const isProtected = protectedPrefixes.some(prefix => path.startsWith(prefix))

    if (isProtected && !user) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('next', path) // Redirect back after login
        return NextResponse.redirect(redirectUrl)
    }

    // AUTH ROUTES (Redirect to home if already logged in):
    if (user && path.startsWith('/login')) {
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        return NextResponse.redirect(homeUrl)
    }

    return supabaseResponse
}
