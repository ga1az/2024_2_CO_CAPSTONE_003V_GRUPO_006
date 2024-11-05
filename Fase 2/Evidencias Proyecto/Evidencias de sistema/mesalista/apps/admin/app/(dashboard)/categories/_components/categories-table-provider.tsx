'use client'

import * as React from 'react'

import { dataTableConfig, type DataTableConfig } from '@/config/data-table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

type FeatureFlagValue = DataTableConfig['featureFlags'][number]['value']

interface CategoriesTableContextProps {
  featureFlags: FeatureFlagValue[]
  setFeatureFlags: React.Dispatch<React.SetStateAction<FeatureFlagValue[]>>
}

const CategoriesTableContext = React.createContext<CategoriesTableContextProps>(
  {
    featureFlags: [],
    setFeatureFlags: () => {}
  }
)

export function useCategoriesTable() {
  const context = React.useContext(CategoriesTableContext)
  if (!context) {
    throw new Error(
      'useCategoriesTable must be used within a CategoriesTableProvider'
    )
  }
  return context
}

export function CategoriesTableProvider({ children }: React.PropsWithChildren) {
  const [featureFlags, setFeatureFlags] = React.useState<FeatureFlagValue[]>([])

  return (
    <CategoriesTableContext.Provider
      value={{
        featureFlags,
        setFeatureFlags
      }}
    >
      <div className="w-full overflow-x-auto">
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="md"
          value={featureFlags}
          onValueChange={(value: FeatureFlagValue[]) => setFeatureFlags(value)}
          className="w-fit gap-2"
        >
          {dataTableConfig.featureFlags.map((flag) => (
            <Tooltip key={flag.value} delayDuration={250}>
              <ToggleGroupItem
                value={flag.value}
                className="whitespace-nowrap px-3 text-sm"
                asChild
                disabled={flag.disabled}
              >
                <TooltipTrigger>
                  <flag.icon
                    className="mr-2 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {flag.label}
                </TooltipTrigger>
              </ToggleGroupItem>
              <TooltipContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="flex max-w-60 flex-col space-y-1.5 border bg-background py-2 font-semibold text-foreground"
              >
                <div>{flag.tooltipTitle}</div>
                <div className="text-xs text-muted-foreground">
                  {flag.tooltipDescription}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
      {children}
    </CategoriesTableContext.Provider>
  )
}
