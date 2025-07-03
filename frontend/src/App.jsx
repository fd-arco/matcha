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
import { GeoProvider } from './context/GeoContext.jsx';
import { useState } from 'react';
import RootLayout from './components/RootLayout.jsx';
import MyAccount from './pages/MyAccount.jsx';
import EmailConf from './components/EmailConf.jsx'
import ResetPasswordFront from "./components/ResetPasswordFront.jsx"
const getRoutes = (userId, setUserId, refreshFlag, refreshUser, hasProfile, setHasProfile) => createBrowserRouter([
  {
    path:'/',
    element: <RootLayout setUserId={setUserId} userId={userId} refreshFlag={refreshFlag} setHasProfile={setHasProfile}/>,
    children: [
      {path: '/user', element: <TestUser/>},
      {path: '/', element: <Homepage userId={userId} hasProfile={hasProfile}/>},
      {path: '/login', element: <Login setUserId={setUserId} />},
      {path: '/register', element: <Register setUserId={setUserId} />},
      {path: '/create-profil', element: <CreateProfil refreshUser={refreshUser}/>},
      {path: '/swipe', element: <Swipe setUserId={setUserId} />},
      {path: '/profile', element: <Profile />},
      {path: '/dashboard', element: <Dashboard />},
      {path: '/settingsPage', element: <SettingsPage/>},
      {path: '/my-account', element:<MyAccount />},
      {path : '/emailconf', element:<EmailConf />},
      {path : '/PasswordConfirm', element:<ResetPasswordFront/>}
    ]
  }
]);

function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [hasProfile, setHasProfile] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const refreshUser = () => setRefreshFlag(prev => prev + 1);
  const router = getRoutes(userId, setUserId, refreshFlag, refreshUser, hasProfile, setHasProfile);
  return (
    <GeoProvider>
      <FilterProvider>
        <SocketProvider userId={userId}>
          <RouterProvider router={router}/>
        </SocketProvider>
      </FilterProvider>
    </GeoProvider>
  );
}
export default App;
