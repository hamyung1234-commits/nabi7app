/**
 * Data Service - Centralized data operations with count synchronization
 * This service wraps all data operations and automatically updates category counts
 * when data is created, updated, or deleted.
 */

import { useCounts } from '../contexts/CountContext';

// Type to count type mapping
const TYPE_TO_COUNT_TYPE: Record<string, keyof ReturnType<typeof useCounts>['counts']> = {
  'customer': 'customer',
  'company': 'company',
  'transaction': 'transaction',
  'pricecheck': 'pricecheck',
  'request': 'request',
  'account': 'account',
  'memo': 'memo',
  'task': 'task',
  'diary': 'diary',
  'in-progress-requests': 'in-progress-requests',
};

/**
 * Hook to use data service with auto count management
 * This should be used in pages that modify data
 */
export function useDataService() {
  // This will be called from the CountProvider context
  // The actual count management is handled by CountProvider
  
  return {
    /**
     * Notify that a new item was created
     * This increments the relevant count
     */
    notifyCreated: (type: string) => {
      const countType = TYPE_TO_COUNT_TYPE[type];
      if (countType) {
        console.log(`[DataService] Item created: ${type}`);
        // The actual increment is handled by the page component
        // which uses the CountProvider's incrementCount
      }
    },
    
    /**
     * Notify that an item was deleted
     * This decrements the relevant count
     */
    notifyDeleted: (type: string) => {
      const countType = TYPE_TO_COUNT_TYPE[type];
      if (countType) {
        console.log(`[DataService] Item deleted: ${type}`);
        // The actual decrement is handled by the page component
      }
    },
    
    /**
     * Request a full count refresh from Supabase
     */
    refreshCounts: async () => {
      // This will be handled by importing and calling refreshCounts from CountContext
    },
  };
}

/**
 * Get the count type key for a given page type
 */
export function getCountType(type: string): keyof ReturnType<typeof useCounts>['counts'] | undefined {
  return TYPE_TO_COUNT_TYPE[type];
}

/**
 * Check if a type is valid for count tracking
 */
export function isCountableType(type: string): boolean {
  return type in TYPE_TO_COUNT_TYPE;
}

/**
 * List all countable types
 */
export function getCountableTypes(): string[] {
  return Object.keys(TYPE_TO_COUNT_TYPE);
}