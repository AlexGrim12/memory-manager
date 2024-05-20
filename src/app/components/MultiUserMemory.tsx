// components/MultiUserMemory.tsx

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface Partition {
  id: number
  size: number
  allocated: boolean
  user: string | null
}

interface Props {
  memoryLimit: number
}

const MultiUserMemory: React.FC<Props> = ({ memoryLimit }) => {
  const [partitions, setPartitions] = useState<Partition[]>([
    { id: 1, size: 100, allocated: false, user: null },
    { id: 2, size: 200, allocated: false, user: null },
    { id: 3, size: 300, allocated: false, user: null },
  ])

  const assignMemory = (id: number, user: string) => {
    setPartitions(
      partitions.map((partition) =>
        partition.id === id
          ? { ...partition, allocated: true, user }
          : partition
      )
    )
  }

  const deassignMemory = (id: number) => {
    setPartitions(
      partitions.map((partition) =>
        partition.id === id
          ? { ...partition, allocated: false, user: null }
          : partition
      )
    )
  }

  const data = [
    {
      name: 'Sistema Operativo',
      size: 100, // Tamaño de la partición del sistema operativo
      fill: '#2980b9', // Color de la partición del sistema operativo
    },
    ...partitions.map((partition) => ({
      name: `Partición ${partition.id}`,
      size: partition.size,
      fill: partition.allocated ? '#82ca9d' : '#8884d8',
    })),
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        Sistema Operativo con Particiones para Varios Usuarios
      </h2>
      <ul className="space-y-2 mb-4">
        {partitions.map((partition) => (
          <li key={partition.id} className="border p-2 rounded">
            Partición {partition.id} - Tamaño: {partition.size} - Estado:{' '}
            {partition.allocated
              ? `Asignado a Usuario ${partition.user}`
              : 'Libre'}
            <div className="space-x-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() =>
                  assignMemory(partition.id, 'User' + partition.id)
                }
              >
                Asignar
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => deassignMemory(partition.id)}
              >
                Desasignar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <BarChart
        width={400}
        height={150}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="size" fill="#8884d8" />
      </BarChart>
    </div>
  )
}

export default MultiUserMemory
