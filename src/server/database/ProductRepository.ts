import { IProductFormInput } from '@/interfaces/IProductFormInput';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ProductRepository = {
    async findAll(organizationId: string) {
        return await prisma.product.findMany({
            where: { organizationId }
        });
    },

    async findById(id: string, organizationId: string) {
        return await prisma.product.findFirst({
            where: { 
                id,
                organizationId
            },
        });
    },

    async create(data: IProductFormInput & { organizationId: string }) {
        return await prisma.product.create({
            data: {
                ...data,
                organizationId: data.organizationId
            }
        });
    },

    async update(id: string, data: IProductFormInput, organizationId: string) {
        return await prisma.product.update({
            where: { 
                id,
                organizationId
            },
            data
        });
    },

    async delete(id: string, organizationId: string) {
        return await prisma.product.delete({
            where: { 
                id,
                organizationId
            },
        });
    }
}