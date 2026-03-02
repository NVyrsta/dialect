import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
              Learn languages through{' '}
              <span className="text-indigo-600">real conversation</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600">
              Master any language naturally with AI-powered conversations,
              personalized lessons, and real-time feedback. Start speaking
              from day one.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Get started free
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Dialect?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to become fluent
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Conversations',
                description: 'Practice speaking with our AI that adapts to your level and interests.',
                icon: '💬',
              },
              {
                title: 'Instant Feedback',
                description: 'Get real-time corrections on pronunciation, grammar, and vocabulary.',
                icon: '✨',
              },
              {
                title: 'Personalized Path',
                description: 'Learning adapts to your goals, whether travel, work, or culture.',
                icon: '🎯',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to start speaking?
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of learners who are already having real conversations
            in their target language.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Start learning for free
          </Link>
        </div>
      </section>
    </>
  );
}
