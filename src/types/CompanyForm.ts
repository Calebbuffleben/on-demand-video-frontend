import { FieldErrors, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import { TInputField } from "./FormTypes";

export type TCompanyFormInputs = {
    companyName: TField;
    email: TField;
    address: TField;
    phoneNumber?: TField;
    companyCity?: TField;
    addressNumber?: TField;
    complement?: TField;
    website?: TField;
    button?: TButton;
};

export type TCompany = {
    onSubmit: (data: TCompanyFormInputs) => void;
    handleSubmit: UseFormHandleSubmit<TCompanyFormInputs>;
    register: UseFormRegister<TCompanyFormInputs>;
    errors: FieldErrors<TCompanyFormInputs>;
    inputs: TField[];
}

export type TField = TInputField | TButton;

export type TButton = {
    buttonName?: string;
}