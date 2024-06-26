import { useState } from 'react'

// Interfaz para representar una partición de memoria
interface Partition {
  id: number
  size: number
  allocated: boolean
  user: string | null
}

// Interfaz para las propiedades del componente
interface Props {
  memoryLimit: number
}

// Clase que representa el administrador de memoria
class MemoryManager {
  private memoryLimit: number
  private partitions: Partition[]
  private nextPartitionId: number

  constructor(memoryLimit: number) {
    this.memoryLimit = memoryLimit
    this.partitions = []
    this.nextPartitionId = 1

    // Inicializar con una partición libre que representa toda la memoria
    this.partitions.push({
      id: this.nextPartitionId++,
      size: this.memoryLimit,
      allocated: false,
      user: null,
    })
  }

  // Método para asignar memoria usando First-Fit
  allocateFirstFit(size: number, user: string): boolean {
    for (let i = 0; i < this.partitions.length; i++) {
      const partition = this.partitions[i]
      if (!partition.allocated && partition.size >= size) {
        this.splitPartition(i, size, user)
        return true
      }
    }
    return false // No se encontró espacio
  }

  // Método para asignar memoria usando Best-Fit
  allocateBestFit(size: number, user: string): boolean {
    let bestFitIndex = -1
    let bestFitSize = Infinity
    for (let i = 0; i < this.partitions.length; i++) {
      const partition = this.partitions[i]
      if (
        !partition.allocated &&
        partition.size >= size &&
        partition.size < bestFitSize
      ) {
        bestFitIndex = i
        bestFitSize = partition.size
      }
    }

    if (bestFitIndex !== -1) {
      this.splitPartition(bestFitIndex, size, user)
      return true
    }

    return false // No se encontró espacio
  }

  // Método para liberar una partición
  deallocate(id: number): void {
    const partitionIndex = this.partitions.findIndex(
      (partition) => partition.id === id
    )

    if (partitionIndex !== -1) {
      this.partitions[partitionIndex].allocated = false
      this.partitions[partitionIndex].user = null
      this.mergeAdjacentFreePartitions()
    }
  }

  // Método auxiliar para dividir una partición
  private splitPartition(index: number, size: number, user: string): void {
    const originalPartition = this.partitions[index]

    this.partitions.splice(index, 1, {
      id: originalPartition.id,
      size: size,
      allocated: true,
      user,
    })

    if (originalPartition.size > size) {
      this.partitions.splice(index + 1, 0, {
        id: this.nextPartitionId++,
        size: originalPartition.size - size,
        allocated: false,
        user: null,
      })
    }
  }

  // Método auxiliar para fusionar particiones libres adyacentes
  private mergeAdjacentFreePartitions(): void {
    for (let i = 0; i < this.partitions.length - 1; i++) {
      const currentPartition = this.partitions[i]
      const nextPartition = this.partitions[i + 1]

      if (!currentPartition.allocated && !nextPartition.allocated) {
        this.partitions.splice(i, 2, {
          id: currentPartition.id,
          size: currentPartition.size + nextPartition.size,
          allocated: false,
          user: null,
        })
        i-- // Volver a verificar la partición fusionada
      }
    }
  }

  // Método para obtener todas las particiones
  getPartitions(): Partition[] {
    return this.partitions
  }
}

// Componente React para el simulador de memoria dinámica
const DynamicMemory: React.FC<Props> = ({ memoryLimit }) => {
  const [memoryManager] = useState(new MemoryManager(memoryLimit))
  const [partitions, setPartitions] = useState<Partition[]>(
    memoryManager.getPartitions()
  )
  const [inputSize, setInputSize] = useState(0)
  const [inputUser, setInputUser] = useState('')
  const [allocationAlgorithm, setAllocationAlgorithm] = useState<
    'first-fit' | 'best-fit'
  >('first-fit')

  // Función para manejar la asignación de memoria
  const handleAllocateMemory = () => {
    if (inputSize <= 0 || inputUser.trim() === '') return

    let success = false
    if (allocationAlgorithm === 'first-fit') {
      success = memoryManager.allocateFirstFit(inputSize, inputUser)
    } else {
      success = memoryManager.allocateBestFit(inputSize, inputUser)
    }

    if (success) {
      setPartitions(memoryManager.getPartitions())
      setInputSize(0)
      setInputUser('')
    } else {
      alert('No hay suficiente memoria disponible.')
    }
  }

  // Función para manejar la liberación de memoria
  const handleDeallocateMemory = (id: number) => {
    memoryManager.deallocate(id)
    setPartitions(memoryManager.getPartitions())
  }

  // Función para calcular el total de memoria utilizada
  const totalUsedMemory = partitions.reduce(
    (acc, partition) => acc + (partition.allocated ? partition.size : 0),
    0
  )

  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Simulador de Memoria Dinámica</h2>

      {/* Controles de asignación */}
      <div className="mb-4">
        <input
          type="number"
          placeholder="Tamaño"
          className="border p-2 mr-2 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring focus:border-blue-500"
          value={inputSize}
          onChange={(e) => setInputSize(parseInt(e.target.value, 10) || 0)}
        />
        <input
          type="text"
          placeholder="Usuario"
          className="border p-2 mr-2 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring focus:border-blue-500"
          value={inputUser}
          onChange={(e) => setInputUser(e.target.value)}
        />
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900 mr-2"
          onClick={handleAllocateMemory}
        >
          Asignar
        </button>
        <div className="inline-block">
          <label htmlFor="algorithm" className="mr-2">
            Algoritmo:
          </label>
          <select
            id="algorithm"
            value={allocationAlgorithm}
            onChange={(e) =>
              setAllocationAlgorithm(e.target.value as 'first-fit' | 'best-fit')
            }
            className="border p-2 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="first-fit">First-Fit</option>
            <option value="best-fit">Best-Fit</option>
          </select>
        </div>
      </div>

      {/* Información de la memoria */}
      <p className="mb-4">
        Límite de Memoria: {memoryLimit} - Memoria Usada: {totalUsedMemory}
      </p>

      {/* Lista de particiones */}
      <ul className="space-y-2 mb-4">
        {partitions.map((partition) => (
          <li key={partition.id} className="border p-2 rounded bg-gray-800">
            Partición {partition.id} - Tamaño: {partition.size} - Estado:{' '}
            {partition.allocated ? `Asignado a ${partition.user}` : 'Libre'}
            {partition.allocated && (
              <button
                className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-900 ml-2"
                onClick={() => handleDeallocateMemory(partition.id)}
              >
                Liberar
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Representación visual de la memoria */}
      <div
        className="border border-gray-700 w-48 relative bg-gray-800"
        style={{ height: `${memoryLimit}px` }}
      >
        {partitions.map((partition) => (
          <div
            key={partition.id}
            className={`
              ${partition.allocated ? 'bg-yellow-500' : 'bg-gray-600'} 
              text-gray-100 text-center font-bold 
              border-t border-gray-700 
              flex-grow
            `}
            style={{
              height: `${(partition.size / memoryLimit) * 100}%`,
              lineHeight: `${partition.size}px`, // Centrar texto verticalmente
            }}
          >
            {partition.allocated
              ? `${partition.user} (${partition.size})`
              : `${partition.size}`}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DynamicMemory
