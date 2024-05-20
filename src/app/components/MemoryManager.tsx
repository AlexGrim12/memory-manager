// components/MemoryManager.tsx
'use client'
import { useState } from 'react'
import SingleUserMemory from './SingleUserMemory'
import MultiUserMemory from './MultiUserMemory'
import DynamicMemory from './DynamicMemory'

const MemoryManager: React.FC = () => {
  const [simulationType, setSimulationType] = useState<string | null>(null)
  const [memoryLimit, setMemoryLimit] = useState<number>(1000) // Establece el límite de memoria inicial

  const renderSimulation = () => {
    switch (simulationType) {
      case 'single':
        return <SingleUserMemory memoryLimit={memoryLimit} />
      case 'multi':
        return <MultiUserMemory memoryLimit={memoryLimit} />
      case 'dynamic':
        return <DynamicMemory memoryLimit={memoryLimit} />
      default:
        return <p>Seleccione un tipo de simulación para comenzar.</p>
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Memory Manager</h1>
      <div className="mb-4">
        <label className="mr-2">Límite de Memoria:</label>
        <input
          type="number"
          value={memoryLimit}
          onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
          className="border px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="space-x-2 mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setSimulationType('single')}
        >
          Sistema Operativo con un Solo Usuario
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setSimulationType('multi')}
        >
          Sistema Operativo con Particiones para Varios Usuarios
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => setSimulationType('dynamic')}
        >
          Sistema Operativo con Memoria Dinámica
        </button>
      </div>
      {renderSimulation()}
    </div>
  )
}

export default MemoryManager
