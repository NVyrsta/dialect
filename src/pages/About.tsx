export function About() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Dialect
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We believe everyone deserves to experience the joy of speaking
            another language fluently.
          </p>
        </div>

        {/* Story */}
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-6">
            Dialect was born from a simple frustration: traditional language
            learning apps teach you to pass tests, not to have conversations.
            We spent years studying languages the "right way" — memorizing
            vocabulary, drilling grammar — but still froze when talking to
            native speakers.
          </p>
          <p className="text-gray-600 mb-6">
            So we built something different. Dialect puts conversation first.
            From day one, you are speaking, making mistakes, and learning the
            way humans naturally acquire language — through real communication.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">
            Our Mission
          </h2>
          <p className="text-gray-600 mb-6">
            To make fluency accessible to everyone. Whether you are learning
            for travel, work, love, or curiosity — we want to help you get
            there faster and enjoy the journey.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">
            The Team
          </h2>
          <p className="text-gray-600">
            We are a small team of language enthusiasts, engineers, and
            educators who collectively speak 12 languages. We are building
            the tool we wish existed when we started our own language
            journeys.
          </p>
        </div>
      </div>
    </div>
  );
}
