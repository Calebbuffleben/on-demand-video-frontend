import { NextApiRequest, NextApiResponse } from "next";
import { ProductService } from "@/server/services/ProductService";

export default async function productApi(req: NextApiRequest, res: NextApiResponse) {
    try {
        const organizationId = req.headers['x-organization-id'] as string;
        
        if (!organizationId) {
            return res.status(400).json({ message: "Organization ID is required" });
        }

        switch (req.method) {
            case "GET": {
                const { id } = req.query;
                if (id) {
                    const product = await ProductService.getProductsById(id as string, organizationId);
                    return res.status(200).json(product);
                } else {
                    const products = await ProductService.getAllProducts(organizationId);
                    return res.status(200).json(products);
                }
            } 
            case "POST": {
                const product = await ProductService.createProduct({
                    ...req.body,
                    organizationId
                });
                return res.status(201).json(product);
            }
            case "PUT": {
                const { id } = req.query;
                const product = await ProductService.updateProduct(
                    id as string,
                    req.body,
                    organizationId
                );
                return res.status(200).json(product);
            }
            case "DELETE": {
                const { id } = req.query;
                await ProductService.deleteProduct(id as string, organizationId);
                return res.status(204).end();
            }
            default: {
                return res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]).status(405).end();
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}