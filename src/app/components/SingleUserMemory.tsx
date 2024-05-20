// components/SingleUserMemory.tsx

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface Partition {
  size: number
  allocated: boolean
}

interface Props {
  memoryLimit: number
}

const SingleUserMemory: React.FC<Props> = ({ memoryLimit }) => {
  const [partition, setPartition] = useState<Partition>({
    size: memoryLimit,
    allocated: false,
  })

  const assignMemory = () => {
    setPartition({ ...partition, allocated: true })
  }

  const deassignMemory = () => {
    setPartition({ ...partition, allocated: false })
  }

  const data = [
    {
      name: 'Sistema Operativo',
      size: 100,
      fill: '#2980b9',
    },
    {
      name: 'Partición 1',
      size: partition.size - 100,
      fill: partition.allocated ? '#82ca9d' : '#8884d8',
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        Sistema Operativo con un Solo Usuario
      </h2>
      <p className="mb-2">
        Partición - Tamaño: {partition.size} - Estado:{' '}
        {partition.allocated ? 'Asignado' : 'Libre'}
      </p>
      <div className="space-x-2 mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={assignMemory}
        >
          Asignar
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={deassignMemory}
        >
          Desasignar
        </button>
      </div>
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

export default SingleUserMemory
