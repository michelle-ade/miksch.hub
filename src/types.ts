export interface Category {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  categoryIds: string[];
  mediaUrls: string[];
  date: any; // Firestore Timestamp
  createdAt: any;
  updatedAt: any;
}

export interface ThemeConfig {
  bg: string;
  text: string;
  accent: string;
  border: string;
}

// These are defaults used if a category is missing or for "Everything"
export const DEFAULT_THEME: ThemeConfig = {
  bg: '#1e293b',
  text: '#e2e8f0',
  accent: '#e2e8f0',
  border: '#e2e8f0'
};

export function getThemeFromCategory(cat: Category | undefined, fallback?: ThemeConfig): ThemeConfig {
  const base = fallback || DEFAULT_THEME;
  if (!cat) return base;
  return {
    bg: cat.bgColor,
    text: cat.textColor,
    accent: cat.textColor,
    border: cat.textColor
  };
}
