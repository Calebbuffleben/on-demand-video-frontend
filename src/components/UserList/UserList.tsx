import { 
    UserListContainer, 
    UserListItem, 
    UserName, 
    UserEmail, 
    UserRegisterDate 
} from './styles';


const UserList = ({users}) => (
    <UserListContainer>
        {users.map((user, index) => (
            <UserListItem>
                <UserName>{user.name}</UserName>
                <UserEmail>{user.email}</UserEmail>
                <UserRegisterDate>{new Date(user.registerDate).toLocaleDateString()}</UserRegisterDate>
            </UserListItem>
        ))}
    </UserListContainer>
);

export default UserList;