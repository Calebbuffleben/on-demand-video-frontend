import React from 'react'
import { useForm } from 'react-hook-form'
import { IProductFormInput } from '@/interfaces/IProductFormInput';


interface IProductFormProps {
    onSubmit: (data: IProductFormInput) => void;
    initialValues?: IProductFormInput;
}

const ProductForm: React.FC<IProductFormProps> = ({ onSubmit, initialValues }) => {
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<IProductFormInput>({
        defaultValues: initialValues
    });

    return (
        <form 
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 space-y-4"
        >
            <div>
                <label 
                    htmlFor='name'
                    className="block text-sm font-medium text-gray-700"
                >
                    Nome do Produto:
                </label>
                <input 
                    id='name' {...register("name")} 
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.name ? 'border-red-500' : ''
                    }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
                <label 
                    htmlFor='sku'
                    className="block text-sm font-medium text-gray-700"
                >
                    SKU:
                </label>
                <input 
                    id='sku'
                    {...register("sku")}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.sku ? 'border-red-500' : ''
                    }`} 
                />
                {errors.sku && <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>}
            </div>
            <div>
                <label 
                    htmlFor='price'
                    className="block text-sm font-medium text-gray-700"
                >
                    Price:
                </label>
                <input
                    id='price'
                    {...register("price")}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.price ? 'border-red-500' : ''
                    }`} 
                />
                {errors.price && <p className='mt-1 text-sm text-red-500' >{errors.price.message}</p>}
            </div>
            <div>
                <label 
                    htmlFor='number'
                    className="block text-sm font-medium text-gray-700"
                >
                    Quantity:
                </label>
                <input 
                    id="quantity"
                    type="number"
                    {...register('quantity', {
                      required: 'Quantity is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Quantity must be at least 0' },
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        errors.quantity ? 'border-red-500' : ''
                    }`}
                />
                {errors.quantity && <p className='mt-1 text-sm text-red-500' >{errors.quantity.message}</p>}
            </div>
            <div>
                <label 
                    htmlFor='description'
                    className="block text-sm font-medium text-gray-700"
                >
                    Description:
                </label>
                <textarea
                    id='description'
                    {...register("description")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                />
                {errors.description && <p>{errors.description.message}</p>}
            </div>
            <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Submit
            </button>
        </form>
    );
};

export default ProductForm;

