import { IProductFormInput } from "@/interfaces/IProductFormInput";
import { ProductRepository } from "../database/ProductRepository";

export const ProductService = {
    async getAllProducts(organizationId: string) {
        return await ProductRepository.findAll(organizationId);
    },
    async getProductsById(id: string, organizationId: string) {
        const product = await ProductRepository.findById(id, organizationId);
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    },
    async createProduct(data: IProductFormInput & { organizationId: string }) {
        return await ProductRepository.create(data);
    },
    async updateProduct(id: string, data: IProductFormInput, organizationId: string) {
        return await ProductRepository.update(id, data, organizationId);
    },
    async deleteProduct(id: string, organizationId: string) {
        return await ProductRepository.delete(id, organizationId);
    }
};
export default { ProductService };