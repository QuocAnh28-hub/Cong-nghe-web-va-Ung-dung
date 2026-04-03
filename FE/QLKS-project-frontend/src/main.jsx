import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ToastContainer
            position="top-right"
            autoClose={1500}    
            newestOnTop={true}      
            closeOnClick        
            rtl={false}             
            theme="colored"         
            transition={Slide}     
            style={{ width: '350px', fontSize: '15px', fontWeight: '500' }}
          />
  </StrictMode>,
)
