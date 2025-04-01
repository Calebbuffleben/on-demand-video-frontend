import { TCompanyFormInputs } from "./CompanyForm";

export type TInputField = {
    type: string; 
    placeholder: string; 
    fieldName: keyof TCompanyFormInputs; 
    isRequired: boolean;
    buttonName?: string; 
};