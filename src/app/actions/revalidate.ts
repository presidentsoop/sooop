'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateContent(path: string = '/', type: 'layout' | 'page' = 'layout') {
    try {
        revalidatePath(path, type)
        console.log(`Revalidated: ${path}`)
    } catch (error) {
        console.error(`Revalidation failed for ${path}:`, error)
    }
}
