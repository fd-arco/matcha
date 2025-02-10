import Modal from "../components/Modal"
import { useState, useEffect } from "react";

export default function Profile(){

    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/users").then((response) => response.json())
            .then((data) => setUsers(data))
    }, []);

    return(
        <div>
            <h1>salut</h1>
                
        </div>
    );
}