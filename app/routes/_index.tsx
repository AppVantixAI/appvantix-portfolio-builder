import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "AppVantix Web Builder - LinkedIn to Portfolio" },
    { name: "description", content: "Transform your LinkedIn profile into a stunning professional website with AI-powered design and customization." },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your LinkedIn Into a 
            <span className="text-indigo-600"> Stunning Portfolio</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            AppVantix Web Builder uses AI to convert your LinkedIn profile into a 
            professional portfolio website in minutes, not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Start Building Now
            </button>
            <button className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-8 rounded-lg transition-colors">
              View Examples
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Generate your professional portfolio in under 5 minutes with our AI-powered platform.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Design</h3>
              <p className="text-gray-600">
                Our AI understands your industry and creates designs that make you stand out.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Quality</h3>
              <p className="text-gray-600">
                Enterprise-grade portfolios that impress recruiters and clients.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold mb-2">Import LinkedIn</h3>
                <p className="text-gray-600">Connect your LinkedIn profile or paste your profile data</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold mb-2">AI Generates</h3>
                <p className="text-gray-600">Our AI creates a beautiful, responsive portfolio website</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold mb-2">Customize & Deploy</h3>
                <p className="text-gray-600">Fine-tune and publish your portfolio with a custom domain</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500">
              Trusted by professionals at top companies worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
