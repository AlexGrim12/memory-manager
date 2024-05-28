// components/MemoryManager.tsx
'use client'
import { useState } from 'react'
import SingleUserMemory from './SingleUserMemory'
import MultiUserMemory from './MultiUserMemory'
import DynamicMemory from './DynamicMemory'
import MemorySimulator from './AutoMemory'

const MemoryManager: React.FC = () => {
  const [simulationType, setSimulationType] = useState<string | null>(null)
  const [memoryLimit, setMemoryLimit] = useState<number>(1000)

  const renderSimulation = () => {
    switch (simulationType) {
      case 'single':
        return <SingleUserMemory memoryLimit={memoryLimit} />
      case 'multi':
        return <MultiUserMemory memoryLimit={memoryLimit} />
      case 'dynamic':
        return <DynamicMemory memoryLimit={memoryLimit} />
      case 'auto':
        return <MemorySimulator />
      default:
        return (
          <p className="text-gray-300">
            Seleccione un tipo de simulación para comenzar.
          </p>
        )
    }
  }

  return (
    <div className="p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Memory Manager</h1>
      <div className="mb-4">
        <label className="mr-2">Límite de Memoria:</label>
        <input
          type="number"
          value={memoryLimit}
          onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
          className="border px-2 py-1 rounded bg-gray-700 text-gray-100 focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>
      <div className="space-x-2 mb-6">
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900"
          onClick={() => setSimulationType('single')}
        >
          Sistema Operativo con un Solo Usuario
        </button>
        <button
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900"
          onClick={() => setSimulationType('multi')}
        >
          Sistema Operativo con Particiones para Varios Usuarios
        </button>
        <button
          className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-900"
          onClick={() => setSimulationType('dynamic')}
        >
          Sistema Operativo con Memoria Dinámica
        </button>
        <button
          className="bg-yellow-700 text-white px-4 py-2 rounded hover:bg-yellow-900"
          onClick={() => setSimulationType('auto')}
        >
          Asignación Automática de Memoria
        </button>
      </div>
      {renderSimulation()}
    </div>
  )
}

export default MemoryManager
