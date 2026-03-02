import { Link } from 'react-router-dom';

export function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out Dialect',
      features: [
        '5 conversations per day',
        '1 language',
        'Basic grammar tips',
        'Progress tracking',
      ],
      cta: 'Get started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month',
      description: 'For serious language learners',
      features: [
        'Unlimited conversations',
        'All languages',
        'Advanced grammar explanations',
        'Speech analysis',
        'Personalized curriculum',
        'Priority support',
      ],
      cta: 'Start free trial',
      highlighted: true,
    },
    {
      name: 'Team',
      price: '$29',
      period: '/user/month',
      description: 'For companies and schools',
      features: [
        'Everything in Pro',
        'Admin dashboard',
        'Team progress reports',
        'Custom scenarios',
        'API access',
        'Dedicated support',
      ],
      cta: 'Contact sales',
      highlighted: false,
    },
  ];

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade when you are ready. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl ${
                plan.highlighted
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-600 ring-offset-2'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-semibold ${
                  plan.highlighted ? 'text-indigo-100' : 'text-gray-600'
                }`}
              >
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span
                  className={`ml-1 ${
                    plan.highlighted ? 'text-indigo-200' : 'text-gray-500'
                  }`}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={`mt-4 ${
                  plan.highlighted ? 'text-indigo-100' : 'text-gray-600'
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg
                      className={`w-5 h-5 ${
                        plan.highlighted ? 'text-indigo-200' : 'text-indigo-600'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`mt-8 block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
