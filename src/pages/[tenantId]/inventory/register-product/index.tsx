import ProductForm from "@/components/Inventory/ProductFormComponent/ProductFormComponent";
import { IProductFormInput } from "@/interfaces/IProductFormInput";
import api from "@/api-connection/service";

const RegisterProductPage = () => {
    const handleProductSubmit = async (data: IProductFormInput) => {
      const response = await api.post('/products', data);

      console.log(response);
    };
    return (      
          <ProductForm
            onSubmit={handleProductSubmit}
            initialValues={{
              name: '',
              sku: '',
              price: '',
              quantity: 0,
              description: '',
            }}
          />
    );
};

export default RegisterProductPage;