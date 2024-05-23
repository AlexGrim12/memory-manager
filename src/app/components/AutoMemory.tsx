import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

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

// Interfaz para representar una tarea en la cola
interface QueueTask {
  size: number
  user: string
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
  const [taskQueue, setTaskQueue] = useState<QueueTask[]>([])
  const [simulationRunning, setSimulationRunning] = useState(false)

  // Referencias a los intervalos
  let generateTaskInterval: NodeJS.Timeout
  let allocateFromQueueInterval: NodeJS.Timeout
  let deallocateInterval: NodeJS.Timeout

  // Función para generar una nueva tarea
  const generateNewTask = () => {
    const newTaskSize = Math.floor(Math.random() * 200) + 50
    const newUser = `Usuario ${Math.floor(Math.random() * 10) + 1}`
    return { size: newTaskSize, user: newUser }
  }

  // Función para intentar asignar tareas de la cola
  const allocateFromQueue = () => {
    let queueCopy = [...taskQueue]
    let newPartitions = [...partitions]

    queueCopy.forEach((task, index) => {
      let success = false
      if (allocationAlgorithm === 'first-fit') {
        success = memoryManager.allocateFirstFit(task.size, task.user)
      } else {
        success = memoryManager.allocateBestFit(task.size, task.user)
      }

      if (success) {
        newPartitions = memoryManager.getPartitions()
        queueCopy.splice(index, 1)
      }
    })

    setTaskQueue(queueCopy)
    setPartitions(newPartitions)
  }

  // Función para iniciar/detener la simulación
  const toggleSimulation = () => {
    setSimulationRunning((prevRunning) => {
      if (prevRunning) {
        // Detener la simulación
        clearInterval(generateTaskInterval)
        clearInterval(allocateFromQueueInterval)
        clearInterval(deallocateInterval)
      } else {
        // Iniciar la simulación
        generateTaskInterval = setInterval(() => {
          const newTask = generateNewTask()
          setTaskQueue((prevQueue) => [...prevQueue, newTask])
        }, 5000)

        allocateFromQueueInterval = setInterval(() => {
          allocateFromQueue()
        }, 2000)

        deallocateInterval = setInterval(() => {
          const allocatedPartitions = partitions.filter(
            (partition) => partition.allocated
          )
          if (allocatedPartitions.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * allocatedPartitions.length
            )
            memoryManager.deallocate(allocatedPartitions[randomIndex].id)
            setPartitions(memoryManager.getPartitions())
          }
        }, 7000)
      }
      return !prevRunning
    })
  }

  // Función para manejar la asignación de memoria manual
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
      alert(
        'No hay suficiente memoria disponible. La tarea se agregó a la cola.'
      )
      setTaskQueue((prevQueue) => [
        ...prevQueue,
        { size: inputSize, user: inputUser },
      ])
    }
  }

  // Función para manejar la liberación de memoria
  const handleDeallocateMemory = (id: number) => {
    memoryManager.deallocate(id)
    setPartitions(memoryManager.getPartitions())
  }

  // Calcular el total de memoria utilizada
  const totalUsedMemory = partitions.reduce(
    (acc, partition) => acc + (partition.allocated ? partition.size : 0),
    0
  )

  // Datos para el gráfico de área
  const chartData = partitions.map((partition, index) => ({
    name: `Locación ${index + 1}`,
    size: partition.size,
    allocated: partition.allocated ? 1 : 0,
    user: partition.user,
  }))

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        Simulador de Memoria Dinámica
      </h2>

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
      <p className="mb-2">
        Límite de Memoria: {memoryLimit} - Memoria Usada: {totalUsedMemory}
      </p>

      {/* Lista de particiones */}
      <ul className="space-y-2 mb-4">
        {partitions.map((partition) => (
          <li key={partition.id} className="border p-2 rounded">
            Partición {partition.id} - Tamaño: {partition.size} - Estado:{' '}
            {partition.allocated ? `Asignado a ${partition.user}` : 'Libre'}
            {partition.allocated && (
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
                onClick={() => handleDeallocateMemory(partition.id)}
              >
                Liberar
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Representación visual de la memoria */}
      <div className="flex space-x-4">
        <div
          className="border border-gray-400 w-48 relative"
          style={{ height: `${memoryLimit}px` }}
        >
          {/* Sistema Operativo */}
          <div
            className="bg-green-500 text-white text-center font-bold"
            style={{ height: `${partitions[0].size}px` }}
          >
            SO
          </div>

          {/* Particiones */}
          <div className="flex flex-col flex-grow">
            {partitions.slice(1).map((partition, index) => (
              <div
                key={partition.id}
                className={`
                  ${partition.allocated ? 'bg-orange-400' : 'bg-gray-300'} 
                  text-white text-center font-bold 
                  border-t border-gray-400 
                  flex-grow
                `}
                style={{
                  height: `${partition.size}px`,
                  lineHeight: `${partition.size}px`,
                }}
              >
                {partition.allocated ? partition.user : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mostrar la cola de tareas */}
      <div className="mt-4">
        <h3>Cola de Tareas:</h3>
        <ul>
          {taskQueue.map((task, index) => (
            <li key={index}>
              Tamaño: {task.size}, Usuario: {task.user}
            </li>
          ))}
        </ul>
      </div>

      {/* Botón para iniciar/detener la simulación */}
      <button
        className={`bg-${
          simulationRunning ? 'red' : 'green'
        }-500 text-white px-4 py-2 rounded hover:bg-${
          simulationRunning ? 'red' : 'green'
        }-700 mt-4`}
        onClick={toggleSimulation}
      >
        {simulationRunning ? 'Detener Simulación' : 'Iniciar Simulación'}
      </button>
    </div>
  )
}

export default DynamicMemory
