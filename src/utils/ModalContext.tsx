import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ModalType = 
  | 'start'
  | 'log'
  | 'leaderboard'
  | 'leagues'
  | 'profile'
  | 'settings'
  | 'metrics'
  | 'activityFeed'
  | 'activityDetail'
  | 'chat'
  | 'trainingPlans'
  | 'coffee'
  | null;

interface ModalState {
  type: ModalType;
  step: number;
  data?: any;
}

interface ModalContextType {
  activeModal: ModalType;
  modalStep: number;
  modalData: any;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  setStep: (step: number) => void;
  setModalData: (data: any) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    step: 1,
    data: undefined,
  });

  const openModal = (type: ModalType, data?: any) => {
    setModalState({
      type,
      step: 1,
      data,
    });
  };

  const closeModal = () => {
    setModalState({
      type: null,
      step: 1,
      data: undefined,
    });
  };

  const setStep = (step: number) => {
    setModalState(prev => ({
      ...prev,
      step,
    }));
  };

  const setModalData = (data: any) => {
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
    }));
  };

  return (
    <ModalContext.Provider
      value={{
        activeModal: modalState.type,
        modalStep: modalState.step,
        modalData: modalState.data,
        openModal,
        closeModal,
        setStep,
        setModalData,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
