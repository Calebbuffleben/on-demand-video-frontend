import React from 'react';
import Checkout from '../Checkout/Checkout';

interface PricingPlanProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId: string;
}

const PricingPlanComponent: React.FC<PricingPlanProps> = ({ name, price, description, features, priceId }) => {
  return (
    <div className="relative p-12 bg-white border border-gray-200 rounded-3xl shadow-lg flex flex-col w-[450px]">
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        <p className="mt-6 flex items-baseline text-gray-900">
          <span className="text-6xl font-extrabold tracking-tight">{price}</span>
          <span className="ml-2 text-2xl font-semibold">/month</span>
        </p>
        <p className="mt-8 text-lg text-gray-500">{description}</p>
        <ul role="list" className="mt-8 space-y-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-gray-500">
                <svg className="flex-shrink-0 h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#55624c" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="ml-4 text-lg text-gray-500">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-10">
        <Checkout priceId={priceId} />
      </div>
    </div>
  );
};

export default PricingPlanComponent; 