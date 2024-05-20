import Image from 'next/image'
import MemoryManager from './components/MemoryManager'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <MemoryManager />
    </div>
  )
}
