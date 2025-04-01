import { TCompany } from "../../types/CompanyForm";
import FormComponent from "../ui/FormComponent/FormComponent";
import { Container, Left, Right, ContainerRight } from "./styles";

const CompanyRegistrationComponent = ({ onSubmit, handleSubmit, register, errors, inputs }: TCompany) => (
    <Container>
        <Left />
        <Right>
            <ContainerRight>
                <h2>Company Registration</h2>

                <FormComponent 
                    onSubmit={onSubmit} 
                    handleSubmit={handleSubmit} 
                    register={register} 
                    errors={errors} 
                    inputs={inputs} 
                />
            </ContainerRight>
        </Right>
    </Container>
);

export default CompanyRegistrationComponent;