import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'work',
    name: 'Work',
    color: '#38BDF8',
    icon: 'briefcase',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'study',
    name: 'Study',
    color: '#34D399',
    icon: 'school',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'habits',
    name: 'Habits',
    color: '#A78BFA',
    icon: 'checkbox',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'fitness',
    name: 'Fitness',
    color: '#FB923C',
    icon: 'fitness',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'general',
    name: 'General',
    color: '#67E8F9',
    icon: 'apps',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
];