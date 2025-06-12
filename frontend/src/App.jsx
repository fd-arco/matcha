import logo from './logo.svg';
import './App.css';
import Login from "./components/Login.jsx";
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import Homepage from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx"
import TestUser from "./pages/User.jsx";
import Register from './components/Register.jsx';
import CreateProfil from "./pages/CreateProfil.jsx"
import Swipe from "./pages/Swipe.jsx";
import Profile from "./pages/Profile.jsx"
import Dashboard from './pages/Dashboard.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { FilterProvider } from './context/FilterContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { UserProvider} from './context/UserContext.jsx'; 
import { useState } from 'react';
import { useUser } from './context/UserContext.jsx';
import RootLayout from './components/RootLayout.jsx';
import MyAccount from './pages/MyAccount.jsx';

const getRoutes = () => createBrowserRouter([
  {
    path:'/',
    element: <RootLayout />,
    children: [
      {path: '/user', element: <TestUser/>},
      {path: '/', element: <Homepage />},
      {path: '/login', element: <Login />},
      {path: '/register', element: <Register />},
      {path: '/create-profil', element: <CreateProfil />},
      {path: '/swipe', element: <Swipe />},
      {path: '/profile', element: <Profile />},
      {path: '/dashboard', element: <Dashboard />},
      {path: '/settingsPage', element: <SettingsPage/>},
      {path: '/my-account', element:<MyAccount />}
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
  // const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  // const [hasProfile, setHasProfile] = useState(false);
  // const [refreshFlag, setRefreshFlag] = useState(0);
  // const refreshUser = () => setRefreshFlag(prev => prev + 1);
  // const router = getRoutes(userId, setUserId, refreshFlag, refreshUser, hasProfile, setHasProfile);
  const {loading} = useUser();
  if (loading) return <div className='text-white p-10'>Loading...</div>
  return (
      <FilterProvider>
        <SocketProvider>
          <RouterProvider router={router}/>
        </SocketProvider>
      </FilterProvider>
  );
}
export default App;
