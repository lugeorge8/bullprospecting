export type ProspectMeta = {
  advisor: string;
  called: boolean;
  scrubbed: boolean;

  // enrichment
  email: string;
  website: string;
  notes: string;
  nextFollowUp: string; // YYYY-MM-DD
  leadStatus: string; // e.g. New/Researching/Contacted/Not interested/Converted

  updatedAt: number;
};
