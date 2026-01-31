import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditorFooterActions {
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  showDelete?: boolean;
  formId?: string;
}

const EditorFooterContext = createContext<EditorFooterActions | null>(null);

export const EditorFooterProvider = ({ children, ...actions }: { children: ReactNode } & EditorFooterActions) => {
  return (
    <EditorFooterContext.Provider value={actions}>
      {children}
    </EditorFooterContext.Provider>
  );
};

export const useEditorFooter = () => {
  return useContext(EditorFooterContext);
};
