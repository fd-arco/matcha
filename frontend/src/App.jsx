import './App.css';
import Login from "./components/Login.jsx";
import { createBrowserRouter, RouterProvider} from 'react-router-dom';
import Homepage from "./pages/Home.jsx";
import TestUser from "./pages/User.jsx";
import Register from './components/Register.jsx';
import CreateProfil from "./pages/CreateProfil.jsx"
import Swipe from "./pages/Swipe.jsx";
import Dashboard from './pages/Dashboard.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { FilterProvider } from './context/FilterContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { UserProvider} from './context/UserContext.jsx'; 
import { GeoProvider } from './context/GeoContext.jsx';
import { useUser } from './context/UserContext.jsx';
import RootLayout from './components/RootLayout.jsx';
import MyAccount from './pages/MyAccount.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import PrivateRouteWithProfile from './components/PrivateRouteWithProfile.jsx';
import EmailConf from './components/EmailConf.jsx'
import ResetPasswordFront from "./components/ResetPasswordFront.jsx"

const getRoutes = () => createBrowserRouter([
  {
    path:'/',
    element: <RootLayout />,
    children: [
      {path: '/user', element: <TestUser/>},
      {path: '/', element: <Homepage />},
      {path: '/login', element: <Login />},
      {path: '/register', element: <Register />},

      {
        path: '/create-profil', 
        element: (
          <PrivateRoute>
            <CreateProfil />
          </PrivateRoute>
        )
      },
      {
        path: '/emailconf', 
        element: (
          <PrivateRoute>
            <EmailConf />
          </PrivateRoute>
        )
      },
      {
        path: '/PasswordConfirm',
        element: <ResetPasswordFront />
      },
      
      {
        path: '/swipe', 
        element: (
          <PrivateRouteWithProfile>
            <Swipe />
          </PrivateRouteWithProfile>
        )
      },
      {
        path: '/dashboard', 
        element: (
          <PrivateRouteWithProfile>
            <Dashboard />
          </PrivateRouteWithProfile>
        )
      },
      {
        path: '/settings', 
        element: (
          <PrivateRouteWithProfile>
            <SettingsPage />
          </PrivateRouteWithProfile>
        )
      },
      {
        path: '/my-account', 
        element: (
          <PrivateRouteWithProfile>
            <MyAccount />
          </PrivateRouteWithProfile>
        )
      },
    ]
  }
]);

function App() {
  const router = getRoutes();

  return (
    <UserProvider>
      <AppWithUser router={router} />
    </UserProvider>
  )
}

function AppWithUser({router}) {
  const {loading} = useUser();
  if (loading) return <div className='text-white p-10'>Loading...</div>
  return (
    <GeoProvider>
      <FilterProvider>
        <SocketProvider>
          <RouterProvider router={router}/>
        </SocketProvider>
      </FilterProvider>
    </GeoProvider>
  );
}
export default App;
