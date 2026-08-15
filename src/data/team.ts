import type { MediaAsset } from "@/data/media";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  intro: string | null;
  email: string | null;
  linkedin: string | null;
  instagram: string | null;
  active: boolean;
  sort_order: number;
  photo: MediaAsset | null;
}

/**
 * Current team members. Add the current year's board and committee here.
 * Starts empty — do not invent names.
 * Team member photos use the centralized media registry.
 */
export const TEAM_MEMBERS: TeamMember[] = [];
