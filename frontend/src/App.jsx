import logo from './logo.svg';
import './App.css';
import Login from "./components/Login.jsx";
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import TestHome from "./pages/Home.jsx";
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

const router = createBrowserRouter([
    {path: '/user', element: <TestUser/>},
    {path: '/', element: <Homepage />},
    {path: '/login', element: <Login />},
    {path: '/register', element: <Register />},
    {path: '/create-profil', element: <CreateProfil />},
    {path: '/swipe', element: <Swipe />},
    {path: '/profile', element: <Profile />},
    {path: '/dashboard', element: <Dashboard />},
    {path: '/settingsPage', element: <SettingsPage/>}
]);

function Homepage(){
  return(
        <TestHome /> 
  );
}

function App() {
  return (
      <FilterProvider>
        <SocketProvider>
          <RouterProvider router={router}/>
        </SocketProvider>
      </FilterProvider>
  );
}
export default App;
