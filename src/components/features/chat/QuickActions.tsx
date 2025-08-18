import React from 'react';
import { QuickAction } from '../../../types/chat';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
  disabled?: boolean;
}

export function QuickActions({
  actions,
  onActionClick,
  disabled = false,
}: QuickActionsProps) {
  // Nhóm actions theo chủ đề
  const groupedActions = {
    math: actions.filter(a => a.category === 'math'),
    language: actions.filter(a => a.category === 'language'),
    science: actions.filter(a => a.category === 'science'),
    general: actions.filter(a => !a.category),
  };

  const renderActionGroup = (title: string, groupActions: QuickAction[]) => {
    if (groupActions.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          {title}
        </h4>
        <div className="flex flex-wrap gap-2">
          {groupActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onActionClick(action)}
                disabled={disabled}
                className="group flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white rounded-full text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className="h-4 w-4 text-zinc-300 group-hover:text-white transition-colors" />
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-[#0E141A] border-b border-white/8">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Chủ đề phổ biến</h3>

        <div className="space-y-4">
          {renderActionGroup('Toán học', groupedActions.math)}
          {renderActionGroup('Ngữ văn', groupedActions.language)}
          {renderActionGroup('Khoa học', groupedActions.science)}
          {renderActionGroup('Tổng quát', groupedActions.general)}
        </div>
      </div>
    </div>
  );
}
