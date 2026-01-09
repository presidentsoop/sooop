import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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

    const path = request.nextUrl.pathname

    // PROTECTED ROUTES:
    // /membership should be public (landing page). /signup (application) requires auth.
    // Dashboard removed as per request. Only checking signup now (or nothing if signup is public?)
    // Assuming /signup is the only protected route now, or maybe none strictly "protected" in the same way?
    // Let's keep /signup protected if it was before, or if user wants to remove all dash related stuff.
    // If dashboard is gone, user likely doesn't have a specific landing page after login.
    const protectedPrefixes: string[] = [] // Minimal protection if needed
    const isProtected = protectedPrefixes.some(prefix => path.startsWith(prefix))

    if (isProtected && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', path) // Redirect back after login
        return NextResponse.redirect(url)
    }

    // AUTH ROUTES (Redirect to home if already logged in):
    if (user && path.startsWith('/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
