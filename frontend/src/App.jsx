import logo from './logo.svg';
import './App.css';
import Login from "./components/Login.jsx";
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
        <TestHome /> 
  );
}

function App() {
  return (
      <div>
          <RouterProvider router={router}/>
    </div>
  );
}
export default App;
