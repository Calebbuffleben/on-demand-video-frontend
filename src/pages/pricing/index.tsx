import PricingPlanComponent from '../../components/Pricing/PricingPlanComponent';

const PricingPage = () => {
  const basicPlan = {
    name: 'Basic Plan',
    price: '$9.99',
    description: 'Perfect for individuals and small teams.',
    features: ['10 products', '1 user'],
    priceId: 'price_1R4jNLAIzkEWAbtilQVHzE2P',
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Pricing Plans
        </h1>
        <p className="mt-5 text-xl text-gray-500 text-center">
          Choose the plan that best fits your needs.
        </p>
        <div className="mt-12 flex justify-center">
          <PricingPlanComponent {...basicPlan} />
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 