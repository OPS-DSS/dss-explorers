'use client'

import { useState } from 'react'

export interface TerritorySelectorProps {
  territories: string[]
  selectedTerritories: string[]
  onSelectionChange: (selected: string[]) => void
  label?: string
}

export const TerritorySelector = ({
  territories,
  selectedTerritories,
  onSelectionChange,
  label = 'Seleccionar Territorios',
}: TerritorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleTerritory = (territory: string) => {
    if (selectedTerritories.includes(territory)) {
      onSelectionChange(selectedTerritories.filter((t) => t !== territory))
    } else {
      onSelectionChange([...selectedTerritories, territory])
    }
  }

  const selectAll = () => {
    onSelectionChange(territories)
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border rounded-lg bg-white hover:bg-gray-50"
      >
        {selectedTerritories.length === 0
          ? 'Ninguno seleccionado'
          : `${selectedTerritories.length} seleccionado(s)`}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="flex gap-2 p-2 border-b">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Todos
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Ninguno
            </button>
          </div>
          {territories.map((territory) => (
            <label
              key={territory}
              className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedTerritories.includes(territory)}
                onChange={() => toggleTerritory(territory)}
                className="mr-3"
              />
              {territory}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
