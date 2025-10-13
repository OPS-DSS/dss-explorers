'use client'

import { useState, useMemo } from 'react'
import { TerritorySelector } from './territory-selector'

export interface IndicatorData {
  Departamento: string
  Año: number
  Tasa: number
}

export interface IndicatorExplorerProps {
  data: IndicatorData[]
  onFilteredDataChange: (filtered: IndicatorData[]) => void
}

export const IndicatorExplorer = ({
  data,
  onFilteredDataChange,
}: IndicatorExplorerProps) => {
  const territories = useMemo(
    () => Array.from(new Set(data.map((d) => d.Departamento))).sort(),
    [data]
  )

  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([])
  const [yearRange, setYearRange] = useState<[number, number]>([
    Math.min(...data.map((d) => d.Año)),
    Math.max(...data.map((d) => d.Año)),
  ])

  const filteredData = useMemo(() => {
    let filtered = data

    if (selectedTerritories.length > 0) {
      filtered = filtered.filter((d) =>
        selectedTerritories.includes(d.Departamento)
      )
    }

    filtered = filtered.filter(
      (d) => d.Año >= yearRange[0] && d.Año <= yearRange[1]
    )

    onFilteredDataChange(filtered)
    return filtered
  }, [data, selectedTerritories, yearRange, onFilteredDataChange])

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <TerritorySelector
        territories={territories}
        selectedTerritories={selectedTerritories}
        onSelectionChange={setSelectedTerritories}
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          Rango de Años: {yearRange[0]} - {yearRange[1]}
        </label>
        <div className="flex gap-4">
          <input
            type="range"
            min={Math.min(...data.map((d) => d.Año))}
            max={Math.max(...data.map((d) => d.Año))}
            value={yearRange[0]}
            onChange={(e) =>
              setYearRange([parseInt(e.target.value), yearRange[1]])
            }
            className="flex-1"
          />
          <input
            type="range"
            min={Math.min(...data.map((d) => d.Año))}
            max={Math.max(...data.map((d) => d.Año))}
            value={yearRange[1]}
            onChange={(e) =>
              setYearRange([yearRange[0], parseInt(e.target.value)])
            }
            className="flex-1"
          />
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Mostrando {filteredData.length} de {data.length} registros
      </div>
    </div>
  )
}
