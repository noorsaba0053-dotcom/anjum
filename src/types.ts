/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Occupation = 
  | 'Farmer' 
  | 'Daily wage labour' 
  | 'Small business' 
  | 'Salaried private' 
  | 'Salaried government' 
  | 'Student' 
  | 'Unemployed' 
  | 'Homemaker' 
  | 'Artisan'
  | '';

export type LandOwned = 'None' | 'Agricultural land' | 'House' | 'Both' | '';

export interface CitizenProfile {
  age: number | string;
  gender: string;
  state: string;
  residence: string;
  caste: string;
  income: number | string;
  occupation: Occupation;
  marital: string;
  children: number | string;
  land: LandOwned;
  education: string;
  pregnant: boolean;
  student: boolean;
  disability: boolean;
  senior: boolean;
  ration: boolean;
  bpl: boolean;
  entrepreneur: boolean;
  house: boolean;
  health: boolean;
  pension: boolean;
  skill: boolean;
  sanitation: boolean;
}

export type SchemeCategory = 
  | "Health" 
  | "Housing" 
  | "Farming" 
  | "Business" 
  | "Student" 
  | "Insurance" 
  | "Employment" 
  | "Pension" 
  | "Sanitation" 
  | "Energy" 
  | "Financial" 
  | "Skill" 
  | "Disability";

export interface Scheme {
  scheme_id: string;
  scheme_name: string;
  ministry: string;
  category: SchemeCategory;
  benefit: string;
  match_strength: "high" | "medium";
  eligibility_reason: string;
  apply_steps: string[];
  required_documents: string[];
  official_link: string | null;
}

export interface EligibilityResult {
  schemes: Scheme[];
  rejection_reason?: string;
}

export type SupportedLanguage = 
  | 'EN' | 'HI' | 'KN' | 'BN' | 'GU' | 'ML' | 'PA' | 'OR' | 'ES' | 'FR' | 'DE';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
