import { useState } from "react";
import UserList from "../../components/UserList/UserList";

const Users = () => {
    const [users, setUsers] = useState({});


    const getUsers = async () => {
        const response = await getUsers();

        setUsers(response);
    }

    return (
        <UserList users={users} />
    )
}

export default Users;