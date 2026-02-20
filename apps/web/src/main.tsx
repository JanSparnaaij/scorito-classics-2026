import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import App from './pages/App'
import RaceStartlist from './pages/RaceStartlist'
import RiderDetail from './pages/RiderDetail'
import TeamDetail from './pages/TeamDetail'
import Teams from './pages/Teams'
import Riders from './pages/Riders'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/races',
    element: <App />,
  },
  {
    path: '/race/:slug',
    element: <RaceStartlist />,
  },
  {
    path: '/rider/:riderId',
    element: <RiderDetail />,
  },
  {
    path: '/team/:teamName',
    element: <TeamDetail />,
  },
  {
    path: '/teams',
    element: <Teams />,
  },
  {
    path: '/riders',
    element: <Riders />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
