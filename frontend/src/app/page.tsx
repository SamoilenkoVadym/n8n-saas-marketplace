'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Zap, CreditCard, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gradient-aimpress">
                Aimpress
              </div>
              <span className="text-xs font-medium text-muted-foreground">by ai-impress.com</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="btn-gradient px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Powered by n8n Technology</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            Build AI Workflows
            <br />
            <span className="text-gradient-aimpress">Without Code</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Powered by <span className="font-semibold text-foreground">Aimpress LTD</span> - Premium n8n automation templates for modern businesses.
            Transform your operations with intelligent workflows built by automation specialists.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/marketplace">
              <Button size="lg" className="btn-gradient px-8 py-6 text-lg group">
                Browse Templates
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 hover:border-primary">
                Start Building
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No subscriptions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Enterprise ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Expert support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Aimpress?
            </h2>
            <p className="text-xl text-muted-foreground">
              Enterprise-grade automation solutions built for the AI era
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="card-premium p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-aimpress flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Templates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pre-built workflows with cutting-edge AI integration. From GPT-4 to Azure OpenAI, automate intelligently.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-premium p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-aimpress-reverse flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Ready</h3>
              <p className="text-muted-foreground leading-relaxed">
                Secure, scalable automation solutions designed for mission-critical operations and compliance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-premium p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-aimpress flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built by automation specialists at Aimpress. Every template comes with documentation and support.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-premium p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-aimpress-reverse flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pay As You Go</h3>
              <p className="text-muted-foreground leading-relaxed">
                Simple credits system, no subscriptions. Buy what you need, when you need it. Full transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="card-premium p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              About Aimpress LTD
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We specialize in AI-powered automation solutions, helping businesses streamline operations
              with intelligent workflows built on n8n. Our team of automation experts crafts premium templates
              that combine the power of artificial intelligence with battle-tested automation patterns.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Every workflow is designed with enterprise standards in mind: security, scalability, and reliability.
              Whether you're automating customer support, data processing, or complex business logic,
              Aimpress delivers production-ready solutions.
            </p>
            <a
              href="https://ai-impress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Visit ai-impress.com
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center bg-gradient-aimpress animate-gradient">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Automate with AI?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join businesses transforming their operations with Aimpress automation templates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/marketplace">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold"
                  >
                    Explore Templates
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-gradient-aimpress mb-4">
                Aimpress
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Premium AI-powered automation solutions built on n8n.
                Empowering businesses with intelligent workflows.
              </p>
              <a
                href="https://ai-impress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                ai-impress.com
              </a>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/marketplace" className="hover:text-primary transition-colors">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/credits" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <a href="https://docs.n8n.io" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#about" className="hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-primary transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:text-primary transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="mailto:support@ai-impress.com" className="hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Aimpress LTD. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                n8n
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
