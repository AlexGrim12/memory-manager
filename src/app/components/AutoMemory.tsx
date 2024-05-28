import React, { useState, useEffect, useRef } from 'react'

const MemorySimulator: React.FC = () => {
  const [memorySize, setMemorySize] = useState<number>(100)
  const [instructions, setInstructions] = useState<
    {
      name: string
      size: number
      time: number
      start: number
      end: number
      memoryAddress: string
    }[]
  >([])
  const [waitingInstructions, setWaitingInstructions] = useState<
    { name: string; size: number; time: number }[]
  >([])
  const [maxOccupancy, setMaxOccupancy] = useState<number>(0)
  const [currentOccupancy, setCurrentOccupancy] = useState<number>(0)
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0)
  const [completedTasksTotalSize, setCompletedTasksTotalSize] =
    useState<number>(0)
  const [simulationSize, setSimulationSize] = useState<number>(100)
  const [timeStepsRemaining, setTimeStepsRemaining] = useState<number>(0)
  const [instructionColors, setInstructionColors] = useState<{
    [key: string]: string
  }>({})
  const animationTimer = useRef<NodeJS.Timeout | null>(null)

  // Nuevo estado para el botón "Crear Tarea"
  const [showCreateTask, setShowCreateTask] = useState(false)

  const [memoryState, setMemoryState] = useState<
    { occupied: boolean; instructionName: string | null }[]
  >([])

  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    setMemoryState(
      Array(memorySize)
        .fill(null)
        .map(() => ({ occupied: false, instructionName: null }))
    )
  }, [memorySize])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNewInstruction({
      ...newInstruction,
      [event.target.name]: event.target.value,
    })
  }

  const addInstruction = (): void => {
    const { name, size, time } = newInstruction
    if (!name || isNaN(Number(size)) || isNaN(Number(time))) {
      alert('Por favor, ingrese valores válidos para la instrucción.')
      return
    }

    const sizeInt = parseInt(size, 10)
    const timeInt = parseInt(time, 10)

    if (sizeInt > memorySize) {
      alert(`La instrucción '${name}' excede el tamaño de la memoria.`)
      return
    }

    const start = findMemorySpace(sizeInt)

    if (start !== null) {
      const end = start + sizeInt
      const memoryAddress = `0x${start.toString(16)} - 0x${(end - 1).toString(
        16
      )}`
      setInstructions([
        ...instructions,
        {
          name,
          size: sizeInt,
          time: timeInt,
          start,
          end,
          memoryAddress,
        },
      ])
      setNewInstruction({ name: '', size: '', time: '' })

      setMemoryState((prevMemoryState) => {
        const updatedMemoryState = [...prevMemoryState]
        for (let i = start; i < end; i++) {
          updatedMemoryState[i] = { occupied: true, instructionName: name }
        }
        return updatedMemoryState
      })
    } else {
      setWaitingInstructions([
        ...waitingInstructions,
        { name, size: sizeInt, time: timeInt },
      ])
    }
  }

  const createRandomInstruction = (): {
    name: string
    size: number
    time: number
  } => {
    const randomName = `Tarea ${Math.floor(Math.random() * 1000)}`
    const randomSize = Math.floor(Math.random() * (memorySize / 3)) + 1
    const randomTime = Math.floor(Math.random() * 100) + 1

    return { name: randomName, size: randomSize, time: randomTime }
  }

  const addRandomInstruction = (): void => {
    const newInstruction = createRandomInstruction()
    const start = findMemorySpace(newInstruction.size)

    if (start !== null) {
      const end = start + newInstruction.size
      const memoryAddress = `0x${start.toString(16)} - 0x${(end - 1).toString(
        16
      )}`
      setInstructions([
        ...instructions,
        {
          ...newInstruction,
          start,
          end,
          memoryAddress,
        },
      ])

      setMemoryState((prevMemoryState) => {
        const updatedMemoryState = [...prevMemoryState]
        for (let i = start; i < end; i++) {
          updatedMemoryState[i] = {
            occupied: true,
            instructionName: newInstruction.name,
          }
        }
        return updatedMemoryState
      })
    } else {
      setWaitingInstructions([...waitingInstructions, newInstruction])
    }
  }

  const addMultipleRandomInstructions = (): void => {
    for (let i = 0; i < 5; i++) {
      addRandomInstruction()
    }
  }

  const findMemorySpace = (size: number): number | null => {
    let freeSpaceStart: number | null = null
    let freeSpaceLength = 0

    for (let i = 0; i < memorySize; i++) {
      if (!memoryState[i].occupied) {
        if (freeSpaceStart === null) {
          freeSpaceStart = i
        }
        freeSpaceLength++
        if (freeSpaceLength === size) {
          return freeSpaceStart
        }
      } else {
        freeSpaceStart = null
        freeSpaceLength = 0
      }
    }

    return null
  }

  const freeMemorySpace = (start: number, end: number): void => {
    setMemoryState((prevMemoryState) => {
      const updatedMemoryState = [...prevMemoryState]
      for (let i = start; i < end; i++) {
        updatedMemoryState[i] = { occupied: false, instructionName: null }
      }
      return updatedMemoryState
    })
  }

  const advanceTime = (): void => {
    const completedInstructions: {
      name: string
      size: number
      time: number
      start: number
      end: number
      memoryAddress: string
    }[] = []

    setInstructions((prevInstructions) => {
      const newInstructions = prevInstructions.map((instruction) => {
        if (instruction.time > 0) {
          instruction.time--
          if (instruction.time <= 0) {
            completedInstructions.push(instruction)
            return null
          }
          return { ...instruction }
        } else {
          completedInstructions.push(instruction)
          return null
        }
      })
      return newInstructions.filter((instruction) => instruction !== null)
    })

    completedInstructions.forEach((instruction) => {
      setCompletedTasksCount((prev) => prev + 1)
      setCompletedTasksTotalSize((prev) => prev + instruction.size)

      freeMemorySpace(instruction.start, instruction.end)
    })

    retryAddingInstructions()
    updateOccupancy()
  }

  const startSimulation = (): void => {
    setTimeStepsRemaining(simulationSize)

    if (animationTimer.current) {
      clearTimeout(animationTimer.current)
    }

    animationTimer.current = setTimeout(runSimulationStep, 1000)
  }

  const runSimulationStep = (): void => {
    if (timeStepsRemaining > 0) {
      advanceTime()
      setTimeStepsRemaining((prev) => prev - 1)
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
      }
      animationTimer.current = setTimeout(runSimulationStep, 1000)
    } else {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
      }
    }
  }

  const retryAddingInstructions = (): void => {
    setWaitingInstructions((prevWaiting) => {
      const stillWaiting: { name: string; size: number; time: number }[] = []
      const newInstructions = [...instructions]

      prevWaiting.forEach((instruction) => {
        const start = findMemorySpace(instruction.size)
        if (start !== null) {
          const end = start + instruction.size
          const memoryAddress = `0x${start.toString(16)} - 0x${(
            end - 1
          ).toString(16)}`
          newInstructions.push({
            ...instruction,
            start,
            end,
            memoryAddress,
          })

          setMemoryState((prevMemoryState) => {
            const updatedMemoryState = [...prevMemoryState]
            for (let i = start; i < end; i++) {
              updatedMemoryState[i] = {
                occupied: true,
                instructionName: instruction.name,
              }
            }
            return updatedMemoryState
          })
        } else {
          stillWaiting.push(instruction)
        }
      })

      setInstructions(newInstructions)
      return stillWaiting
    })
  }

  const updateOccupancy = (): void => {
    const occupied = instructions.reduce((sum, instr) => sum + instr.size, 0)
    setCurrentOccupancy(occupied)
    setMaxOccupancy(Math.max(maxOccupancy, occupied))
  }

  const removeInstruction = (index: number): void => {
    const removed = instructions[index]
    if (removed) {
      setCompletedTasksCount((prev) => prev + 1)
      setCompletedTasksTotalSize((prev) => prev + removed.size)
      setInstructions((prev) => prev.filter((_, i) => i !== index))

      freeMemorySpace(removed.start, removed.end)
    }
  }

  const clearMemory = (): void => {
    setInstructions([])
    setWaitingInstructions([])
    setMaxOccupancy(0)
    setCurrentOccupancy(0)
    setCompletedTasksCount(0)
    setCompletedTasksTotalSize(0)
    setMemoryState(
      Array(memorySize)
        .fill(null)
        .map(() => ({ occupied: false, instructionName: null }))
    )
  }

  const getInstructionColor = (instructionName: string): string => {
    if (!instructionColors[instructionName]) {
      setInstructionColors((prevColors) => ({
        ...prevColors,
        [instructionName]: `rgb(${Math.floor(
          Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255
        )})`,
      }))
    }
    return instructionColors[instructionName]
  }

  // Nuevo estado para la nueva instrucción
  const [newInstruction, setNewInstruction] = useState<{
    name: string
    size: string
    time: string
  }>({
    name: '',
    size: '',
    time: '',
  })

  // Timer para agregar tareas aleatorias
  const taskTimer = useRef<NodeJS.Timeout | null>(null)
  const startAddingTasks = (): void => {
    if (taskTimer.current) {
      clearInterval(taskTimer.current)
    }
    taskTimer.current = setInterval(addMultipleRandomInstructions, 1000)
  }

  const stopAddingTasks = (): void => {
    if (taskTimer.current) {
      clearInterval(taskTimer.current)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Simulador de Memoria</h1>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-4">
          <label
            htmlFor="memorySize"
            className="block text-sm font-medium text-white"
          >
            Tamaño de la memoria:
          </label>
          <input
            type="number"
            id="memorySize"
            value={memorySize}
            onChange={(e) => setMemorySize(parseInt(e.target.value, 10) || 0)}
            className="mt-1 p-2 border rounded-md shadow-sm bg-gray-700  focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={startSimulation}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            Iniciar Simulación
          </button>
          <button
            onClick={advanceTime}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            Avanzar Tiempo
          </button>
          <button
            onClick={clearMemory}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-200"
          >
            Limpiar Memoria
          </button>
          <button
            onClick={() => setShowCreateTask(!showCreateTask)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200"
          >
            {showCreateTask ? 'Ocultar Crear Tarea' : 'Crear Tarea'}
          </button>
          {/* Botón para agregar 5 tareas aleatorias por segundo */}
          <button
            onClick={startAddingTasks}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring focus:ring-yellow-200"
          >
            Agregar 5 Tareas/Segundo
          </button>
          {/* Botón para detener el flujo de tareas */}
          <button
            onClick={stopAddingTasks}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-200"
          >
            Detener Tareas
          </button>
        </div>
      </div>

      {showCreateTask && (
        <div className="mb-4 mt-4">
          <h2 className="text-xl font-semibold mb-2">Agregar Instrucción</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white"
              >
                Nombre:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newInstruction.name}
                onChange={handleInputChange}
                className="mt-1 p-2 border rounded-md shadow-sm bg-gray-700 focus:ring focus:ring-blue-200 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="size"
                className="block text-sm font-medium text-white"
              >
                Tamaño:
              </label>
              <input
                type="number"
                id="size"
                name="size"
                value={newInstruction.size}
                onChange={handleInputChange}
                className="mt-1 p-2 border rounded-md shadow-sm bg-gray-700 focus:ring focus:ring-blue-200 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-white"
              >
                Tiempo:
              </label>
              <input
                type="number"
                id="time"
                name="time"
                value={newInstruction.time}
                onChange={handleInputChange}
                className="mt-1 p-2 border rounded-md shadow-sm bg-gray-700 focus:ring focus:ring-blue-200 w-full"
              />
            </div>
          </div>
          <button
            onClick={addInstruction}
            className="px-4 py-2 mt-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200"
          >
            Agregar
          </button>
          <button
            onClick={addRandomInstruction}
            className="px-4 py-2 mt-2 ml-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            Agregar Tarea Aleatoria
          </button>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Memoria</h2>
        <div className="grid grid-cols-10 gap-2">
          {memoryState.map((slot, index) => (
            <div
              key={index}
              className="h-8 border relative"
              style={{
                backgroundColor: slot.occupied
                  ? getInstructionColor(slot.instructionName || '')
                  : '#081B37',
              }}
            >
              {slot.occupied && (
                <span className="absolute text-xs text-white font-bold">
                  {slot.instructionName}
                  <br />
                  {`0x${index.toString(16)}`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Instrucciones en Memoria
          </h2>
          <ul>
            {instructions.map((instruction, index) => (
              <li key={index} className="border p-2 rounded-md mb-2">
                <span className="text-white font-medium">
                  {instruction.name}
                </span>
                <span className="text-white">
                  , Tamaño: {instruction.size}, Tiempo: {instruction.time}
                </span>
                <span className="text-white">
                  , Dirección: {instruction.memoryAddress}
                </span>
                <button
                  onClick={() => removeInstruction(index)}
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-200 text-xs"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            Instrucciones en Espera
          </h2>
          <ul>
            {waitingInstructions.map((instruction, index) => (
              <li key={index} className="border p-2 rounded-md mb-2">
                <span className="text-white font-medium">
                  {instruction.name}
                </span>
                <span className="text-white">
                  , Tamaño: {instruction.size}, Tiempo: {instruction.time}
                </span>
                <button
                  onClick={() => retryAddingInstructions()}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200 text-xs"
                >
                  Reintentar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Estadísticas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              Ocupación máxima: {maxOccupancy} (
              {((maxOccupancy / memorySize) * 100).toFixed(2)}%)
            </p>
            <p>
              Ocupación actual: {currentOccupancy} (
              {((currentOccupancy / memorySize) * 100).toFixed(2)}%)
            </p>
          </div>
          <div>
            <p>Tareas completadas: {completedTasksCount}</p>
            <p>Tamaño total de tareas completadas: {completedTasksTotalSize}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemorySimulator
