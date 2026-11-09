// The allowed categories. A webinar's `category` must be one of these exact names.
export const CATEGORIES = [
  'Finance', 'Business', 'Marketing', 'Technology', 'AI', 'Communication', 'Entrepreneurship',
] as const
export type Category = (typeof CATEGORIES)[number]
