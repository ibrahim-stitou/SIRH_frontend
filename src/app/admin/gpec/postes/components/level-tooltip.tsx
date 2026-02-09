"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface Props {
  level: number;
  description?: string; // ✅ AJOUTÉ
}

export function LevelTooltip({ level, description }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer font-medium">
            Niveau {level}
          </span>
        </TooltipTrigger>

        {description && (
          <TooltipContent>
            <p className="text-sm">{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
