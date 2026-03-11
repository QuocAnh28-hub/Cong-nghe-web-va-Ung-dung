import { useState } from 'react'
import QLkhachsan from './components/QLkhachsan'
import './App.css'
import Login from './Components/Login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Login></Login>

      {/* <QLkhachsan></QLkhachsan> */}
    </>
  )
}

export default App