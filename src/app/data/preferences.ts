import {
  Train,
  GraduationCap,
  Dog,
  ShoppingCart,
  Building2,
  Music,
  type LucideIcon,
} from 'lucide-react';

export interface PreferenceOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const preferenceOptions: PreferenceOption[] = [
  { id: 'tube', label: 'Near tube', icon: Train },
  { id: 'schools', label: 'Good schools', icon: GraduationCap },
  { id: 'parks', label: 'Dog-friendly parks', icon: Dog },
  { id: 'supermarkets', label: 'Supermarkets nearby', icon: ShoppingCart },
  { id: 'cbd', label: 'Close to CBD', icon: Building2 },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
];

export function preferenceOptionById(id: string): PreferenceOption | undefined {
  return preferenceOptions.find((p) => p.id === id);
}
