import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlannerItem } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

interface PlannerContextType {
  items: PlannerItem[];
  isDrawerOpen: boolean;
  addToPlanner: (item: PlannerItem) => void;
  removeFromPlanner: (id: string) => void;
  toggleDrawer: () => void;
  reorderItems: (startIndex: number, endIndex: number) => void;
  clearPlanner: () => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Load from LocalStorage on mount with 1-hour expiration check
  useEffect(() => {
    const savedData = localStorage.getItem('tripPlanner');
    if (savedData) {
      try {
        const { items: savedItems, timestamp } = JSON.parse(savedData);
        const oneHour = 60 * 60 * 1000; // 1 hour in ms
        
        if (Date.now() - timestamp < oneHour) {
          setItems(savedItems);
        } else {
          // Cache expired
          console.log('Planner cache expired. Clearing...');
          localStorage.removeItem('tripPlanner');
        }
      } catch (e) {
        console.error('Failed to parse planner data', e);
        localStorage.removeItem('tripPlanner');
      }
    }
  }, []);

  // Save to LocalStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      const data = {
        items,
        timestamp: Date.now() // Always refresh timestamp on update so active users keep their session
      };
      localStorage.setItem('tripPlanner', JSON.stringify(data));
    } else {
      // Don't remove the key immediately if empty to preserve timestamp if we wanted, 
      // but simpler to just clear it if list is empty.
      localStorage.removeItem('tripPlanner');
    }
  }, [items]);

  const addToPlanner = (item: PlannerItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev; // Prevent duplicates
      return [...prev, item];
    });
    setIsDrawerOpen(true); // Open drawer to show user it was added
  };

  const removeFromPlanner = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const reorderItems = (startIndex: number, endIndex: number) => {
    setItems((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const clearPlanner = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearPlanner = () => {
    setItems([]);
    localStorage.removeItem('tripPlanner');
    setIsClearConfirmOpen(false);
  };

  return (
    <PlannerContext.Provider
      value={{
        items,
        isDrawerOpen,
        addToPlanner,
        removeFromPlanner,
        toggleDrawer,
        reorderItems,
        clearPlanner
      }}
    >
      {children}
      {isClearConfirmOpen && (
        <ConfirmationModal 
          title="Clear Itinerary?"
          message="Are you sure you want to clear your entire itinerary? This cannot be undone."
          onConfirm={confirmClearPlanner}
          onCancel={() => setIsClearConfirmOpen(false)}
        />
      )}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};