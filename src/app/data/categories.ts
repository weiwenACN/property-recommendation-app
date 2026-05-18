import {
  Building,
  Building2,
  Home,
  Warehouse,
  DoorOpen,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Apartment: Building,
  Studio: DoorOpen,
  Penthouse: Building2,
  House: Home,
  Loft: Warehouse,
};

export function categoryIconFor(propertyType: string): LucideIcon {
  return ICONS[propertyType] ?? Building;
}
