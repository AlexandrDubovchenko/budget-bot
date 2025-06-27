'use client'
import { categoriesService } from '@/services/categories-service';
import { isBrowser } from '@/utils/is-browser';
import { PropsWithChildren } from 'react'

export const ClientLayout = ({ children }: PropsWithChildren) => {
    if (isBrowser() && !categoriesService.getDefaultCategories()) {
        categoriesService.setDefaultCategories();
    }
    return children
}
