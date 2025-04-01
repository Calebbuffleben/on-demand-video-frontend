// src/components/UserList.styles.ts
import styled from 'styled-components';

export const UserListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

export const UserListItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;

  &:last-child {
    border-bottom: none;
  }
`;

export const UserName = styled.span`
  font-weight: bold;
`;

export const UserEmail = styled.span`
  color: #555;
`;

export const UserRegisterDate = styled.span`
  color: #999;
`;
