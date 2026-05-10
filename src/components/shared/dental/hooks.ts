'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { QUADRANTS } from './constants';

export interface UseDentalSelectionProps {
  initialSelected?: string[];
  onChange?: (selected: string[]) => void;
}

export function useDentalSelection({ initialSelected = [], onChange }: UseDentalSelectionProps = {}) {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>(initialSelected);
  
  // Use a ref to track if the change is internal to avoid loops if needed
  // but standard controlled component pattern should work if handled carefully.
  
  const updateSelection = useCallback((newSelection: string[]) => {
    const sorted = [...newSelection].sort((a, b) => parseInt(a) - parseInt(b));
    setSelectedTeeth(sorted);
    // Don't call onChange here if we use useEffect for sync
  }, []);

  const toggleTooth = useCallback((toothId: string) => {
    setSelectedTeeth(current => {
      const isSelected = current.includes(toothId);
      const next = isSelected 
        ? current.filter(t => t !== toothId)
        : [...current, toothId];
      
      return [...next].sort((a, b) => parseInt(a) - parseInt(b));
    });
  }, []);

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
      
      return [...next].sort((a, b) => parseInt(a) - parseInt(b));
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTeeth([]);
  }, []);

  // Sync state to parent ONLY when it changes internally
  const isFirstRender = useRef(true);
  const prevSelectedRef = useRef(JSON.stringify(initialSelected));

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const currentStr = JSON.stringify(selectedTeeth);
    if (currentStr !== prevSelectedRef.current) {
      prevSelectedRef.current = currentStr;
      onChange?.(selectedTeeth);
    }
  }, [selectedTeeth, onChange]);

  // Sync state from parent
  useEffect(() => {
    const initialStr = JSON.stringify(initialSelected);
    if (initialStr !== JSON.stringify(selectedTeeth)) {
      setSelectedTeeth(initialSelected);
      prevSelectedRef.current = initialStr;
    }
  }, [initialSelected]);

  return {
    selectedTeeth,
    toggleTooth,
    toggleQuadrant,
    clearSelection,
    setSelectedTeeth: updateSelection
  };
}
