import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Category } from "@/hooks/useCategories";

interface CityExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export default function CityExportDialog({ open, onOpenChange, category }: CityExportDialogProps) {
  const [copied, setCopied] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // INJEKTIONS-METHODE: Statisches HTML + Script am Ende
  const exportCode = `<!DOCTYPE html>
<html lang="de">
<head>
    <link rel="canonical" href="https://dating.rank-scout.com/singles-salzburg/" id="canonical-link" />
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Favicons / App Icons -->
    <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="16x16" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="https://dating.rank-scout.com/top3-dating-apps/images/apple-touch-icon.png">
    <link rel="manifest" href="https://dating.rank-scout.com/top3-dating-apps/images/site.webmanifest">
    <link rel="icon" type="image/png" sizes="192x192" href="https://dating.rank-scout.com/top3-dating-apps/images/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="https://dating.rank-scout.com/top3-dating-apps/images/android-chrome-512x512.png">
    
    <!-- SEO Meta Tags -->
    <title id="page-title">Singles Salzburg | Beste Dating Apps & Treffpunkte 2026</title>
    <meta id="meta-description" name="description" content="Du suchst Singles in Salzburg? Wir haben den großen Vergleich 2026 für Stadt & Land. ➤ Finde Dates in Salzburg, Hallein & Umgebung. Jetzt kostenlos testen!">
    <meta name="robots" content="index, follow">

    <!-- Fonts -->
    <style type="text/css">
        @font-face {font-family:Montserrat;font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:Montserrat;font-style:normal;font-weight:700;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:600;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
    </style>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            black: '#0a0a0a',
                            dark: '#58000c',
                            primary: '#c41e3a',
                            light: '#ff4d6d',
                            platinum: '#e5e7eb',
                            gold: '#fbbf24',
                            luxury: '#d4af37',
                            rose: '#ffe4e6',
                            bg: '#fafafa',
                        }
                    },
                    fontFamily: {
                        sans: ['Open Sans', 'sans-serif'],
                        heading: ['Montserrat', 'sans-serif'],
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                }
            }
        }
    </script>

    <style>
        body { scroll-behavior: smooth; }
        
        .hero-gradient {
            background: linear-gradient(135deg, #0a0a0a 0%, #7f1d1d 45%, #c41e3a 100%);
        }
        
        .btn-gold-hover {
            transition: all 0.4s ease;
            position: relative;
            z-index: 1;
            overflow: hidden;
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .btn-gold-hover:hover {
            background: linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
            background-size: 200% 200%;
            color: #111827;
            border-color: #aa771c;
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
            transform: translateY(-2px) scale(1.02);
            animation: goldShimmer 2s infinite linear;
        }

        @keyframes goldShimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .btn-shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 3s infinite;
            z-index: -1;
        }
        
        @keyframes shimmer {
            100% { left: 150%; }
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #c41e3a; border-radius: 4px; }

        .ad-box {
            width: 300px;
            height: 250px;
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            margin: 0 auto;
        }
        .ad-label {
            position: absolute;
            top: 0;
            right: 0;
            background: #e5e7eb;
            color: #6b7280;
            font-size: 10px;
            padding: 2px 5px;
            text-transform: uppercase;
        }
    </style>
</head>
<body class="font-sans antialiased text-gray-800 bg-brand-bg">

    <!-- HEADER -->
    <header class="w-full bg-brand-black text-white py-3 px-4 shadow-md sticky top-0 z-50">
        <div class="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <a href="https://dating.rank-scout.com" class="font-heading font-bold text-xl tracking-tight text-brand-gold hover:text-brand-light transition-colors">
                SinglesSalzburgAT
            </a>
            <nav class="hidden md:flex items-center space-x-2 text-sm">
                <a href="https://dating.rank-scout.com/singles-in-der-naehe/" class="hover:text-brand-gold transition-colors">Singles in der Nähe</a>
                <span class="text-gray-500">|</span>
                <a href="https://dating.rank-scout.com/singles-wien/" class="hover:text-brand-gold transition-colors">Singles Wien</a>
                <span class="text-gray-500">|</span>
                <a href="https://dating.rank-scout.com/top3-dating-apps/" class="hover:text-brand-gold transition-colors">Top3 Apps</a>
            </nav>
            <a href="https://dating.rank-scout.com" class="text-xs bg-brand-primary hover:bg-brand-light text-white px-3 py-1.5 rounded-full transition-all duration-300">
                Zum Hauptportal
            </a>
        </div>
    </header>

    <!-- HERO SECTION -->
    <section class="hero-gradient py-16 md:py-24 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 left-10 w-32 h-32 bg-brand-gold rounded-full filter blur-3xl animate-pulse-slow"></div>
            <div class="absolute bottom-10 right-10 w-40 h-40 bg-brand-light rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
            <p class="text-brand-gold text-sm md:text-base tracking-widest uppercase mb-4 font-heading">
                <i class="fas fa-heart mr-2"></i><span id="hero-subtitle">Die Top Online-Portale für Singles in Salzburg 2026</span>
            </p>
            <h1 class="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
                Finde Singles in <br><span id="hero-title" class="text-brand-gold">Salzburg & Umgebung</span>
            </h1>
            <p id="hero-description" class="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Ob Stadt Salzburg, Flachgau oder Hallein – du musst nicht alleine durch die Getreidegasse spazieren. Wir haben geprüft, welche Dating-Apps im Salzburger Land wirklich funktionieren und wo du echte Treffer landest.
            </p>
            <a href="#vergleich" class="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-luxury text-brand-black font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 btn-shimmer">
                <i class="fas fa-search"></i>
                <span id="hero-cta">Salzburger Singles finden</span>
            </a>
            <p class="text-gray-400 text-xs mt-6">
                <i class="fas fa-check-circle text-green-400 mr-1"></i><span id="hero-badge">Geprüft für Stadt & Land Salzburg</span>
            </p>
        </div>
    </section>

    <!-- INTRO SECTION -->
    <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <div class="text-center mb-12">
                <h2 id="intro-title" class="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-4">Dein Dating-Guide für das Salzburger Land</h2>
                <p id="intro-subtitle" class="text-gray-600 max-w-2xl mx-auto">Vom Mönchsberg bis Zell am See – wir zeigen dir, welche Plattformen für dein Bedürfnis funktionieren.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <i class="fas fa-user-secret text-brand-primary text-2xl mb-3"></i>
                        <h3 class="font-heading font-bold text-lg text-gray-900 mb-2">Diskrete Treffen in der Stadt</h3>
                        <p class="text-gray-600 text-sm">Salzburg ist klein – man kennt sich. Deshalb suchen viele Salzburger nach diskreten Plattformen für Abenteuer, wo Anonymität garantiert ist und man nicht dem Nachbarn über den Weg läuft.</p>
                    </div>
                    <div class="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <i class="fas fa-map-marker-alt text-brand-primary text-2xl mb-3"></i>
                        <h3 class="font-heading font-bold text-lg text-gray-900 mb-2">Regional im Flachgau & Tennengau</h3>
                        <p class="text-gray-600 text-sm">Nicht nur für Städter. Die besten Apps haben Filter, um gezielt Singles aus Seekirchen, Hallein oder Bischofshofen zu finden, ohne stundenlang fahren zu müssen.</p>
                    </div>
                    <div class="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <i class="fas fa-heart text-brand-primary text-2xl mb-3"></i>
                        <h3 class="font-heading font-bold text-lg text-gray-900 mb-2">Ernsthafte Partnersuche</h3>
                        <p class="text-gray-600 text-sm">Vom gemeinsamen Wandern auf den Gaisberg bis zum Kaffee im Bazar. Hier findest du Menschen, die eine echte Beziehung im Raum Salzburg suchen und keine Spielchen spielen.</p>
                    </div>
                    <div class="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <i class="fas fa-chart-line text-brand-primary text-2xl mb-3"></i>
                        <h3 class="font-heading font-bold text-lg text-gray-900 mb-2">Hohe Erfolgsquote</h3>
                        <p class="text-gray-600 text-sm">Wir haben geprüft, wo die Aktivität für Singles in Salzburg am höchsten ist. Spar dir Zeit auf leeren Profilen und nutze Apps mit aktiver lokaler Community.</p>
                    </div>
                </div>

                <!-- Banner Slot -->
                <div class="flex items-center justify-center">
                    <div id="banner-container" class="w-full">
                        <div class="ad-box rounded-xl">
                            <span class="ad-label">Anzeige</span>
                            <div class="text-center">
                                <p class="text-gray-500 text-sm">Werbefläche</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Navigation -->
            <div class="mt-12 bg-gray-50 rounded-2xl p-6 md:p-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h3 class="font-heading font-bold text-lg text-gray-900">Schnellnavigation: Dating-Themen & Regionen</h3>
                        <p class="text-gray-600 text-sm">Praktische interne Links, passend zu „Singles Salzburg" – ohne Umwege.</p>
                    </div>
                    <a href="#vergleich" class="inline-flex items-center gap-2 text-brand-primary hover:text-brand-dark font-semibold">
                        <i class="fas fa-arrow-down"></i> Zum Vergleich
                    </a>
                </div>
                <div class="flex flex-wrap gap-3">
                    <a href="https://dating.rank-scout.com/top3-dating-apps/" class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200">
                        <i class="fas fa-star text-brand-gold"></i> Top3 Dating Apps
                    </a>
                    <a href="https://dating.rank-scout.com/singles-in-der-naehe/" class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200">
                        <i class="fas fa-location-dot text-brand-primary"></i> Singles in der Nähe
                    </a>
                    <a href="https://dating.rank-scout.com/chat-mit-einer-frau/" class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200">
                        <i class="fas fa-comments text-brand-primary"></i> Chat mit einer Frau
                    </a>
                    <a href="https://dating.rank-scout.com/online-dating-cafe/" class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200">
                        <i class="fas fa-coffee text-brand-primary"></i> Online Dating Cafe
                    </a>
                    <a href="https://dating.rank-scout.com/online-dating-in-germany/" class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200">
                        <i class="fas fa-globe text-brand-primary"></i> Online Dating in Germany
                    </a>
                    <a href="https://dating.rank-scout.com/bildkontakte-login/" class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200">
                        <i class="fas fa-image text-brand-primary"></i> Bildkontakte Login
                    </a>
                    <a href="https://dating.rank-scout.com/singles-wien/" class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200">
                        <i class="fas fa-city text-brand-primary"></i> Singles Wien
                    </a>
                    <a href="https://dating.rank-scout.com/speed-dating-wien/" class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200">
                        <i class="fas fa-bolt text-brand-primary"></i> Speed Dating Wien
                    </a>
                </div>

                <!-- 18+ Hinweis -->
                <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-exclamation-triangle text-red-500 mt-1"></i>
                        <div>
                            <h4 class="font-bold text-red-800 text-sm">Hinweis: 18+ Bereich</h4>
                            <p class="text-red-700 text-sm mt-1">Wenn du explizit Inhalte für Erwachsene suchst, nutze bitte ausschließlich den 18+ Bereich:</p>
                            <a href="https://adult.rank-scout.com" class="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold mt-2 text-sm">
                                <i class="fas fa-external-link-alt"></i> adult.rank-scout.com (18+)
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- PROJECT LIST SECTION -->
    <section id="vergleich" class="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div class="max-w-4xl mx-auto px-4">
            <div class="flex items-center justify-between mb-2">
                <div class="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>
                <i class="fas fa-crown text-brand-gold mx-4 text-xl"></i>
                <div class="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>
            </div>
            <div class="text-center mb-10">
                <h2 id="list-title" class="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">Top 5 Apps für Singles in Salzburg</h2>
                <p id="list-subtitle" class="text-gray-600">Geprüft auf Mitgliederzahl im Raum Salzburg, Diskretion und Erfolgsquote.</p>
            </div>

            <!-- PROJECT LIST CONTAINER -->
            <div id="project-list-container" class="space-y-6">
                <!-- Platz 1 - TESTSIEGER -->
                <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-brand-gold ring-2 ring-brand-gold/20">
                    <div class="p-1">
                        <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-black">
                            <i class="fas fa-trophy mr-1"></i> Testsieger Salzburg
                        </span>
                    </div>
                    <div class="p-6 pt-2">
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="flex-shrink-0">
                                <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
                                    <i class="fas fa-comments text-brand-primary text-3xl"></i>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-heading font-bold text-xl text-gray-900 mb-2">Chatten2000</h3>
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="flex text-brand-gold">
                                        <i class="fas fa-star"></i>
                                    </div>
                                    <span class="font-bold text-gray-900">9.8 / 10</span>
                                    <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Top in Sbg-Stadt</span>
                                </div>
                                <div class="space-y-2 mb-4">
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Höchste Erfolgsquote für Singles in Salzburg</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Hohe Dichte an Profilen im Flachgau</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Schneller Kontakt, wenig Fake-Profile</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Ideal für spontane Dates</p>
                                </div>
                            </div>
                            <div class="flex-shrink-0 flex items-center">
                                <a href="#" class="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 btn-gold-hover btn-shimmer">
                                    Kostenlos Registrieren <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Platz 2 -->
                <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div class="p-1">
                        <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                            Platz 2
                        </span>
                    </div>
                    <div class="p-6 pt-2">
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="flex-shrink-0">
                                <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
                                    <i class="fas fa-search text-brand-primary text-3xl"></i>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-heading font-bold text-xl text-gray-900 mb-2">SingleFINDER</h3>
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="flex text-brand-gold">
                                        <i class="fas fa-star"></i>
                                    </div>
                                    <span class="font-bold text-gray-900">9.2 / 10</span>
                                </div>
                                <div class="space-y-2 mb-4">
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Lockere Atmosphäre für Salzburger Singles</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Viele Neuanmeldungen aus Tennengau/Pongau</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Offen für Flirts, Dates & Freizeitpartner</p>
                                </div>
                            </div>
                            <div class="flex-shrink-0 flex items-center">
                                <a href="#" class="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 btn-gold-hover btn-shimmer">
                                    Kostenlos Anmelden <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Platz 3 -->
                <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div class="p-1">
                        <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                            Platz 3
                        </span>
                    </div>
                    <div class="p-6 pt-2">
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="flex-shrink-0">
                                <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
                                    <i class="fas fa-heart text-brand-primary text-3xl"></i>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-heading font-bold text-xl text-gray-900 mb-2">XCRUSH</h3>
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="flex text-brand-gold">
                                        <i class="fas fa-star"></i>
                                    </div>
                                    <span class="font-bold text-gray-900">8.8 / 10</span>
                                </div>
                                <div class="space-y-2 mb-4">
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Spannende Alternative für Neugierige</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Wachsende Community in Salzburg</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Fokus auf aktive Dates</p>
                                </div>
                            </div>
                            <div class="flex-shrink-0 flex items-center">
                                <a href="#" class="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 btn-gold-hover btn-shimmer">
                                    Kostenlos Registrieren <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Platz 4 -->
                <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div class="p-1">
                        <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                            Platz 4
                        </span>
                    </div>
                    <div class="p-6 pt-2">
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="flex-shrink-0">
                                <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
                                    <i class="fas fa-infinity text-brand-primary text-3xl"></i>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-heading font-bold text-xl text-gray-900 mb-2">BeLoops</h3>
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="flex text-brand-gold">
                                        <i class="fas fa-star"></i>
                                    </div>
                                    <span class="font-bold text-gray-900">8.7 / 10</span>
                                </div>
                                <div class="space-y-2 mb-4">
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Gute Option für den Alpenraum</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Seriöse Profile</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Stark bei 30+</p>
                                </div>
                            </div>
                            <div class="flex-shrink-0 flex items-center">
                                <a href="#" class="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 btn-gold-hover btn-shimmer">
                                    Kostenlos Registrieren <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Platz 5 -->
                <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div class="p-1">
                        <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                            Platz 5
                        </span>
                    </div>
                    <div class="p-6 pt-2">
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="flex-shrink-0">
                                <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
                                    <i class="fas fa-kiss-wink-heart text-brand-primary text-3xl"></i>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-heading font-bold text-xl text-gray-900 mb-2">XKUSS</h3>
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="flex text-brand-gold">
                                        <i class="fas fa-star"></i>
                                    </div>
                                    <span class="font-bold text-gray-900">8.6 / 10</span>
                                </div>
                                <div class="space-y-2 mb-4">
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Geheimtipp für Salzburg</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Einfache Bedienung</p>
                                    <p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>Schnelle Anmeldung</p>
                                </div>
                            </div>
                            <div class="flex-shrink-0 flex items-center">
                                <a href="#" class="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 btn-gold-hover btn-shimmer">
                                    Kostenlos Registrieren <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p class="text-center text-gray-500 text-xs mt-8">*Werbung / Affiliate Links</p>
        </div>
    </section>

    <!-- LONG CONTENT TOP -->
    <section class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-4">
            <div id="long-content-top" class="prose prose-lg max-w-none">
                <h2 class="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-4">Singles Salzburg 2026: So findest du wirklich Dates (statt nur Matches)</h2>
                <p>Wer nach Singles Salzburg sucht, hat meistens ein klares Ziel: Menschen aus der Region kennenlernen, ohne stundenlange Fahrten oder endlose Chats, die im Sand verlaufen.</p>
                <p>Genau hier ist Salzburg besonders: In der Stadt ist alles nah, die Szene ist lebendig – und gleichzeitig kennt „gefühlt jeder jeden". Deshalb funktionieren Strategien, die in einer Großstadt wie Berlin üblich sind, nicht immer 1:1. Entscheidend sind drei Dinge: der richtige Umkreis, ein Profil mit Salzburger Kontext und eine Kommunikation, die schnell zum Treffen führt.</p>
            </div>
        </div>
    </section>

    <!-- LONG CONTENT BOTTOM -->
    <section class="py-16 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4">
            <div id="long-content-bottom" class="prose prose-lg max-w-none">
                <h2 class="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-4">So datet Salzburg</h2>
                <p>Salzburg ist mehr als Mozartkugeln und Festspiele. Die Dating-Szene ist zweigeteilt: Das urbane Leben in der Stadt und das bodenständige, aktive Leben in den Gauen.</p>
                <p>Wer Singles Salzburg sucht, sollte genau diese Dynamik nutzen: In der Stadt funktionieren spontane Treffen sehr gut, im Umland sind gemeinsame Aktivitäten oft der Schlüssel.</p>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-brand-black text-gray-400 py-12">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="text-sm">&copy; 2026 dating.rank-scout.com - Alle Rechte vorbehalten.</p>
            <div class="mt-4 flex justify-center gap-6 text-xs">
                <a href="https://dating.rank-scout.com/impressum/" class="hover:text-white transition-colors">Impressum</a>
                <a href="https://dating.rank-scout.com/datenschutz/" class="hover:text-white transition-colors">Datenschutz</a>
            </div>
        </div>
    </footer>

    <!-- ANALYTICS CONTAINER -->
    <div id="analytics-container"></div>

    <!-- STICKY MOBILE CTA -->
    <div id="sticky-cta" class="fixed bottom-0 left-0 right-0 md:hidden bg-brand-black/95 backdrop-blur-sm border-t border-brand-gold/20 p-4 z-40 transform translate-y-full transition-transform duration-300">
        <a id="sticky-cta-link" href="#vergleich" class="flex items-center justify-center gap-2 w-full bg-brand-gold hover:bg-brand-luxury text-brand-black font-bold py-3 px-6 rounded-full transition-all">
            <i class="fas fa-heart"></i>
            <span id="sticky-cta-text">Singles finden</span>
        </a>
    </div>

    <!-- COOKIE BANNER -->
    <div id="cookie-banner" class="fixed bottom-0 left-0 right-0 bg-brand-black text-white p-4 z-50 hidden">
        <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="text-sm text-gray-300">Diese Website verwendet Cookies. Mit der Nutzung stimmst du zu.</p>
            <div class="flex gap-2">
                <button onclick="acceptCookies()" class="bg-brand-gold text-brand-black px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-luxury transition-colors">Akzeptieren</button>
                <a href="/datenschutz" class="text-gray-400 hover:text-white text-sm underline">Mehr erfahren</a>
            </div>
        </div>
    </div>

    <!-- JSON-LD SCHEMA -->
    <script id="json-ld-schema" type="application/ld+json"></script>

    <!-- ANALYTICS CONTAINER -->
    <div id="analytics-container"></div>

    <!-- ============================================================= -->
    <!-- INJEKTIONS-SCRIPT: Clean & Smart Edition -->
    <!-- ============================================================= -->
    <script>
    // Cookie-Funktionen (global)
    function acceptCookies() {
        localStorage.setItem('cookies_accepted', 'true');
        document.getElementById('cookie-banner').classList.add('hidden');
    }

    (async function() {
        // ========== KONFIGURATION ==========
        const SUPABASE_URL = '${supabaseUrl}';
        const SUPABASE_KEY = '${supabaseKey}';
        
        // Slug aus URL erkennen
        const pathParts = window.location.pathname.split('/').filter(p => p && p !== 'index.html');
        const SLUG = pathParts[pathParts.length - 1] || 'singles-salzburg';
        
        console.log('[Rank-Scout] Loading data for slug:', SLUG);

        // ========== HILFSFUNKTIONEN ==========
        function el(id) { return document.getElementById(id); }
        
        // SubID an Affiliate-Links anhängen
        function addSubId(link) {
            if (!link) return '#';
            const separator = link.includes('?') ? '&' : '?';
            return link + separator + 'subid=' + SLUG;
        }
        
        // Auto-Datum (aktuelles Jahr)
        function getCurrentYear() {
            return new Date().getFullYear();
        }
        
        function generateProjectCard(project, index) {
            const isFirst = index === 0;
            const badgeText = isFirst ? (project.badge_text || 'Testsieger') : 'Platz ' + (index + 1);
            const badgeClass = isFirst 
                ? 'bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-black' 
                : 'bg-gray-200 text-gray-700';
            const borderClass = isFirst ? 'border-2 border-brand-gold ring-2 ring-brand-gold/20' : 'border border-gray-100';
            
            const features = Array.isArray(project.features) ? project.features : [];
            const featuresHtml = features.map(f => 
                '<p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>' + f + '</p>'
            ).join('');

            const rating = project.rating ? (project.rating / 10).toFixed(1) : '9.5';
            const logoUrl = project.logo_url || '';
            const logoHtml = logoUrl 
                ? '<img src="' + logoUrl + '" alt="' + project.name + '" class="w-full h-full object-cover">'
                : '<i class="fas fa-heart text-brand-primary text-3xl"></i>';
            const link = addSubId(project.affiliate_link || project.url);

            return '<div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ' + borderClass + '">' +
                '<div class="p-1">' +
                    '<span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold ' + badgeClass + '">' +
                        (isFirst ? '<i class="fas fa-trophy mr-1"></i>' : '') + badgeText +
                    '</span>' +
                '</div>' +
                '<div class="p-6 pt-2">' +
                    '<div class="flex flex-col md:flex-row gap-6">' +
                        '<div class="flex-shrink-0">' +
                            '<div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">' +
                                logoHtml +
                            '</div>' +
                        '</div>' +
                        '<div class="flex-1">' +
                            '<h3 class="font-heading font-bold text-xl text-gray-900 mb-2">' + project.name + '</h3>' +
                            '<div class="flex items-center gap-2 mb-4">' +
                                '<div class="flex text-brand-gold"><i class="fas fa-star"></i></div>' +
                                '<span class="font-bold text-gray-900">' + rating + ' / 10</span>' +
                                (isFirst ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Top Empfehlung</span>' : '') +
                            '</div>' +
                            '<div class="space-y-2 mb-4">' + featuresHtml + '</div>' +
                        '</div>' +
                        '<div class="flex-shrink-0 flex items-center">' +
                            '<a href="' + link + '" target="_blank" rel="nofollow noopener" class="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 btn-gold-hover btn-shimmer">' +
                                'Kostenlos Registrieren <i class="fas fa-arrow-right"></i>' +
                            '</a>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }
        
        // JSON-LD Schema generieren
        function generateJsonLd(category, projects) {
            const year = getCurrentYear();
            const schema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": category.meta_title || ("Singles " + category.name + " " + year),
                "description": category.meta_description || category.description,
                "url": "https://dating.rank-scout.com/" + SLUG + "/",
                "numberOfItems": projects.length,
                "itemListElement": projects.map((p, i) => ({
                    "@type": "ListItem",
                    "position": i + 1,
                    "name": p.name,
                    "url": addSubId(p.affiliate_link || p.url)
                }))
            };
            return JSON.stringify(schema, null, 2);
        }

        // ========== STICKY CTA & COOKIE BANNER ==========
        // Sticky CTA nach Scroll anzeigen
        window.addEventListener('scroll', function() {
            const sticky = el('sticky-cta');
            if (window.scrollY > 400) {
                sticky.style.transform = 'translateY(0)';
            } else {
                sticky.style.transform = 'translateY(100%)';
            }
        });
        
        // Cookie Banner anzeigen (wenn nicht akzeptiert)
        if (!localStorage.getItem('cookies_accepted')) {
            setTimeout(function() {
                el('cookie-banner').classList.remove('hidden');
            }, 1500);
        }

        // ========== DATEN LADEN ==========
        try {
            // 1. Kategorie laden
            const catRes = await fetch(SUPABASE_URL + '/rest/v1/categories?slug=eq.' + SLUG + '&is_active=eq.true&select=*', {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            const categories = await catRes.json();
            
            if (!categories || categories.length === 0) {
                console.log('[Rank-Scout] Category not found:', SLUG);
                return;
            }
            
            const category = categories[0];
            const year = getCurrentYear();
            
            // 2. SEO-Felder setzen
            if (category.meta_title) el('page-title').textContent = category.meta_title.replace('2026', year);
            if (category.meta_description) el('meta-description').setAttribute('content', category.meta_description.replace('2026', year));
            el('canonical-link').setAttribute('href', 'https://dating.rank-scout.com/' + SLUG + '/');
            
            // 3. Hero-Texte ersetzen
            const locationName = category.name.replace(/^Singles\\s*/i, '').trim() || category.name;
            if (category.h1_title) el('hero-subtitle').textContent = category.h1_title.replace('2026', year);
            el('hero-title').textContent = locationName + ' & Umgebung';
            if (category.description) el('hero-description').textContent = category.description;
            el('hero-cta').textContent = locationName + 'er Singles finden';
            el('hero-badge').textContent = 'Geprüft für Stadt & Land ' + locationName;
            
            // 4. Intro-Texte
            el('intro-title').textContent = 'Dein Dating-Guide für ' + locationName;
            el('list-title').textContent = 'Top 5 Apps für Singles in ' + locationName;
            
            // 5. Long Content
            if (category.long_content_top) el('long-content-top').innerHTML = category.long_content_top;
            if (category.long_content_bottom) el('long-content-bottom').innerHTML = category.long_content_bottom;
            
            // 6. Banner
            if (category.banner_override) el('banner-container').innerHTML = category.banner_override;
            
            // 7. Analytics
            if (category.analytics_code) el('analytics-container').innerHTML = category.analytics_code;
            
            // 8. Sticky CTA
            if (category.sticky_cta_text) el('sticky-cta-text').textContent = category.sticky_cta_text;
            if (category.sticky_cta_link) el('sticky-cta-link').setAttribute('href', addSubId(category.sticky_cta_link));
            
            // 9. Projekte laden (mit Fallback auf Default-Projekte)
            let projects = [];
            
            const cpRes = await fetch(SUPABASE_URL + '/rest/v1/category_projects?category_id=eq.' + category.id + '&select=project_id,sort_order&order=sort_order.asc', {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            const categoryProjects = await cpRes.json();
            
            if (categoryProjects && categoryProjects.length > 0) {
                // Seiten-spezifische Projekte laden
                const projectIds = categoryProjects.map(cp => cp.project_id);
                const projRes = await fetch(SUPABASE_URL + '/rest/v1/projects?id=in.(' + projectIds.join(',') + ')&is_active=eq.true&select=*', {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
                });
                projects = await projRes.json();
                
                // Nach sort_order sortieren
                const orderMap = {};
                categoryProjects.forEach(cp => orderMap[cp.project_id] = cp.sort_order);
                projects.sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));
            } else {
                // FALLBACK: Default-Projekte laden
                console.log('[Rank-Scout] No category projects found, loading defaults...');
                const defaultRes = await fetch(SUPABASE_URL + '/rest/v1/projects?is_default=eq.true&is_active=eq.true&select=*&order=sort_order.asc&limit=5', {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
                });
                projects = await defaultRes.json();
            }
            
            // 10. Projekte in Container injizieren
            if (projects && projects.length > 0) {
                const projectsHtml = projects.map((p, i) => generateProjectCard(p, i)).join('');
                el('project-list-container').innerHTML = projectsHtml;
                
                // 11. JSON-LD Schema
                el('json-ld-schema').textContent = generateJsonLd(category, projects);
            }
            
            console.log('[Rank-Scout] ✓ Data loaded for:', category.name, '| Projects:', projects.length);
            
        } catch (error) {
            console.error('[Rank-Scout] Error loading data:', error);
        }
    })();
    </script>

</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    toast({ title: "Code kopiert!", description: "Der Universal-Code wurde in die Zwischenablage kopiert." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download gestartet!", description: "index.html wird heruntergeladen." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Universal Master-Template (Injektions-Methode)</DialogTitle>
          <DialogDescription>
            <strong>Statisches HTML + Script am Ende.</strong> Das Script lädt Daten aus der DB und ersetzt Texte per getElementById.
            <br />Eine Datei für alle Städte! Der Slug wird automatisch aus der URL erkannt.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <Textarea
            value={exportCode}
            readOnly
            className="font-mono text-xs h-[500px] resize-none"
          />
        </div>
        <div className="flex gap-2 pt-4">
          <Button onClick={handleCopy} className="flex-1">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Kopiert!" : "Code kopieren"}
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download index.html
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
