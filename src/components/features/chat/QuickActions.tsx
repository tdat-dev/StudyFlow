import React from "react";
import Button from "../../../components/ui/button";
import { QuickAction } from "../../../types/chat";

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
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-b">
      <p className="text-sm text-gray-600 mb-3">Thao tác nhanh:</p>
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              onClick={() => onActionClick(action)}
              className="flex-shrink-0 rounded-xl border-gray-200 dark:border-gray-600 text-xs sm:text-sm"
              disabled={disabled}
            >
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${action.bgColor} flex items-center justify-center mr-1 sm:mr-2`}
              >
                <Icon className={`h-3 w-3 ${action.color}`} />
              </div>
              <span className="truncate">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
