import styled from "styled-components";

export const Container = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    input {
        width: 100%;
        height: 55px;
        border: 0px;
        border-bottom: 1px solid #808080;

        &:focus {
            outline: none;
        }
    }
    
    div {
        width: 100%;
    }

    .buttonSubmit {
        float: right;
        margin-top: 50px;
        background-color: #007bff;
        border: none;
        color: white;
        padding: 20px;
        cursor: pointer;
        border-radius: 10px;
        font-size: 14px;
    }
`;

export const Input = styled.input`
    float: right;
    margin-top: 50px;
    background-color: #007bff;
    border: none;
    color: white;
    padding: 20px;
    cursor: pointer;
    border-radius: 10px;
    font-size: 14px;
`;