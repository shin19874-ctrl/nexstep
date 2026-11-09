import type { Category } from '../data/categories'

export interface Workshop {
  id: string
  title: Category
  description: string
  icon: 'finance' | 'business' | 'marketing' | 'technology' | 'ai' | 'communication' | 'entrepreneurship'
}
