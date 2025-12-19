'use client'
import React, { useState, useTransition } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Users, Shield, Zap, BarChart3, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// Schema and types (borrowed from UserAuthForm)
const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function SIRHLoginPage() {
  // State kept for UI behavior
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, startTransition] = useTransition();

  // Next-auth callbackUrl support
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  // Form setup
  const defaultValues: UserFormValue = {
    email: 'admin@example.com',
    password: 'password'
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
          callbackUrl: callbackUrl ?? '/admin'
        });

        if (result?.error) {
          toast.error('Identifiants incorrects');
        } else {
          const session = await fetch('/api/auth/session').then((res) => res.json());

          if (session?.user?.role?.code === 'ADMIN') {
            toast.success('Connexion réussie !');
            setTimeout(() => {
              window.location.href = '/admin';
            }, 500);

          } else if (session?.user?.role?.code === 'consultant') {
            toast.success('Connexion réussie !');
            window.location.href = '/consultant';
          } else {
            toast.error('Rôle non autorisé');
          }
        }
      } catch (error) {
        toast.error('Une erreur est survenue');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e520_1px,transparent_1px),linear-gradient(to_bottom,#4f46e520_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main container */}
      <div className="w-full max-w-7xl relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Enhanced Branding */}
        <div className="hidden lg:block text-white space-y-10">
          <div className="space-y-6">
            {/* Logo and brand */}


            {/* Hero text */}
            <div className="space-y-4 pt-4">

              <h2 className="text-4xl font-bold leading-tight">
                Transformez votre
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                  gestion des ressources humaines
                </span>
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed max-w-xl">
                Une solution complète et intuitive pour centraliser, automatiser et optimiser tous vos processus RH en temps réel.
              </p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid gap-4">
            <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">Sécurité Maximale</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Protection des données sensibles .
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">Automatisation Intelligente</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Workflows automatisés, gestion des congés, paie simplifiée et onboarding fluide
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">Analytics en Temps Réel</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Tableaux de bord personnalisés, KPIs RH et rapports détaillés pour piloter votre stratégie
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-sm text-blue-200">Employés gérés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-sm text-blue-200">Disponibilité</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-blue-200">Support client</div>
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Login form */}
        <div className="w-full">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-1 justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl blur-lg opacity-60"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-900">
                    SIRH
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">Système RH</p>
                </div>
              </div>

              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Bon retour !</h2>
                <p className="text-slate-600">Connectez-vous pour accéder à votre espace</p>
              </div>

              {/* Form with react-hook-form */}
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-2">
                    Adresse email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      placeholder="nom@entreprise.com"
                      disabled={loading}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 outline-none font-medium ${
                        form.formState.errors.email
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      {form.formState.errors.email.message as string}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-slate-800 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Entrez votre mot de passe"
                      disabled={loading}
                      className={`w-full pl-12 pr-14 py-4 rounded-xl border-2 transition-all duration-200 outline-none font-medium ${
                        form.formState.errors.password
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg白 focus:ring-4 focus:ring-blue-500/10'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      {...form.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 p-1 rounded-lg hover:bg-slate-100"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      {form.formState.errors.password.message as string}
                    </p>
                  )}
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 rounded-md border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700 select-none group-hover:text-slate-900 transition-colors">
                      Se souvenir de moi
                    </span>
                  </label>
                  <a
                    href="/auth/forgot-password"
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline underline-offset-2"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="mt-1 pt-8 border-t-2 border-slate-100">
                <p className="text-center text-sm text-slate-600">
                  Besoin d&apos;aide ?{' '}
                  <button className="text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline underline-offset-2">
                    Contactez votre administrateur RH
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-blue-100/80">
              © {new Date().getFullYear()} SIRH. Tous droits réservés.
            </p>
            <p className="text-xs text-blue-100/60 mt-2">
              Propulsé par l&apos;innovation • Sécurisé par design
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-40px) translateX(-10px);
          }
          75% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}