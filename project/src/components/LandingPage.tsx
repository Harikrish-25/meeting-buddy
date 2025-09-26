import React, { useState } from 'react';
import { Users, MessageSquare, Calendar, Bot, ArrowRight, CheckCircle } from 'lucide-react';
import AuthModal from './AuthModal';

const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const benefits = [
    {
      icon: Users,
      title: 'Multi-Hub Management',
      description: 'Organize teams across different projects and departments with role-based permissions.',
    },
    {
      icon: MessageSquare,
      title: 'Smart Team Chat',
      description: 'Dedicated channels for teams and all-members communication with advanced permissions.',
    },
    {
      icon: Calendar,
      title: 'AI-Powered Meetings',
      description: 'Generate and manage meetings with integrated video calls and automatic scheduling.',
    },
    {
      icon: Bot,
      title: 'Intelligent Assistant',
      description: 'AI chatbot for meeting summaries, team questions, and organizational insights.',
    },
  ];

  const features = [
    'Role-based access control (Admin, Manager, HR, Member)',
    'Multi-team collaboration with dedicated channels',
    'Automated meeting generation and management',
    'AI-powered meeting summaries and insights',
    'Integrated video conferencing with Jitsi',
    'Real-time chat with message history',
    'Hub switching for multi-project management',
    'Smart notifications and reminders',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Meeting Buddy</h1>
              <p className="text-sm text-gray-500">Smart Team Collaboration</p>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent mb-6">
              Transform Your Team Collaboration
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              AI Meeting Buddy revolutionizes how teams communicate, meet, and collaborate. 
              Organize multiple hubs, manage permissions, and let AI handle the heavy lifting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all duration-300 font-semibold text-lg">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your Team Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From small startups to large enterprises, AI Meeting Buddy adapts to your team's needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Powerful Features for Modern Teams
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Built with the latest technologies and designed for scalability, 
                security, and ease of use.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="h-2 bg-blue-200 rounded w-32 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="h-2 bg-purple-200 rounded w-40 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="h-2 bg-green-200 rounded w-36 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using AI Meeting Buddy to streamline their collaboration.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-semibold">AI Meeting Buddy</span>
                <p className="text-sm text-gray-400">© 2024 All rights reserved</p>
              </div>
            </div>
            <p className="text-gray-400">Built with React, TypeScript & FastAPI</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default LandingPage;