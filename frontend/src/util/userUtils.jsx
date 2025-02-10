import { useState, useEffect } from "react";

export default function UserList(){

    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/users").then((response) => response.json())
            .then((data) => setUsers(data))
    }, []);

    return users;
};