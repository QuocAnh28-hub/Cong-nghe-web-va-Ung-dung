import { useState } from 'react'
import QLkhachsan from './components/QLkhachsan'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <QLkhachsan></QLkhachsan>
    </>
  )
}

export default App
