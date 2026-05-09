'use client';

import { useState, useCallback } from 'react';
import { QUADRANTS } from './constants';

export interface UseDentalSelectionProps {
  initialSelected?: string[];
  onChange?: (selected: string[]) => void;
}

export function useDentalSelection({ initialSelected = [], onChange }: UseDentalSelectionProps = {}) {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>(initialSelected);

  const updateSelection = useCallback((newSelection: string[]) => {
    const sorted = [...newSelection].sort((a, b) => parseInt(a) - parseInt(b));
    setSelectedTeeth(sorted);
    onChange?.(sorted);
  }, [onChange]);

  const toggleTooth = useCallback((toothId: string) => {
    setSelectedTeeth(current => {
      const isSelected = current.includes(toothId);
      const next = isSelected 
        ? current.filter(t => t !== toothId)
        : [...current, toothId];
      
      const sorted = next.sort((a, b) => parseInt(a) - parseInt(b));
      onChange?.(sorted);
      return sorted;
    });
  }, [onChange]);

  const toggleQuadrant = useCallback((quadrantKey: keyof typeof QUADRANTS) => {
    const quadrantTeeth = QUADRANTS[quadrantKey].map(String);
    setSelectedTeeth(current => {
      const allPresent = quadrantTeeth.every(t => current.includes(t));
      let next: string[];
      
      if (allPresent) {
        next = current.filter(t => !quadrantTeeth.includes(t));
      } else {
        next = Array.from(new Set([...current, ...quadrantTeeth]));
      }
      
      const sorted = next.sort((a, b) => parseInt(a) - parseInt(b));
      onChange?.(sorted);
      return sorted;
    });
  }, [onChange]);

  const clearSelection = useCallback(() => {
    setSelectedTeeth([]);
    onChange?.([]);
  }, [onChange]);

  return {
    selectedTeeth,
    toggleTooth,
    toggleQuadrant,
    clearSelection,
    setSelectedTeeth: updateSelection
  };
}
