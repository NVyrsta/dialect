export function Features() {
  const features = [
    {
      title: 'AI-Powered Conversations',
      description:
        'Have natural conversations with our AI tutor that understands context, remembers your progress, and adapts to your skill level.',
      icon: '🤖',
    },
    {
      title: 'Speech Recognition',
      description:
        'Practice your pronunciation with real-time feedback. Our AI listens and helps you sound more natural.',
      icon: '🎤',
    },
    {
      title: 'Personalized Learning',
      description:
        'Your learning path adapts based on your goals, interests, and progress. No two journeys are the same.',
      icon: '📊',
    },
    {
      title: 'Real-World Scenarios',
      description:
        'Practice conversations for travel, work, dating, or daily life. Learn language that you will actually use.',
      icon: '🌍',
    },
    {
      title: 'Grammar Explanations',
      description:
        'Get clear, contextual grammar explanations when you need them. No more confusing rules.',
      icon: '📚',
    },
    {
      title: 'Progress Tracking',
      description:
        'See your improvement over time with detailed statistics and milestones.',
      icon: '📈',
    },
  ];

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Features
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to go from beginner to fluent speaker
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
