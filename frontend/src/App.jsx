import logo from './logo.svg';
import './App.css';
import Login from "./components/Login.jsx";
import DarkModeToggle from "./util/dark.jsx";
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import TestHome from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx"
import TestUser from "./pages/User.jsx";
import Register from './components/Register.jsx';
import Profil from "./pages/Profile.jsx"

const router = createBrowserRouter([
    {path: '/user', element: <TestUser/>},
    {path: '/', element: <Homepage />},
    {path: '/login', element: <Login />},
    {path: '/register', element: <Register />},
    {path: '/profil', element: <Profil />}

]);

function Homepage(){
  return(
    <div>
        <header className="sticky inset-0 z-50 backdrop-blur-lg">
            <Navbar />
        </header>
        <TestHome /> 
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <DarkModeToggle />
        </div> 
    </div>
  );
}

function App() {
  return (
      <div>
        {/* <header className="sticky inset-0 z-50 backdrop-blur-lg">
            <Navbar />
        </header>
        <TestHome /> */}
         {/* <Login /> */}
          {/* <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            <DarkModeToggle /> */}
          {/* </div> */}
          <RouterProvider router={router}/>
    </div>
  );
}
export default App;
