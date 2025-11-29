"use client";

import { motion } from "framer-motion";
import { Sparkles, Play, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import InteractiveNeuralVortex from "@/app/components/ui/interactive-neural-vortex-background";
import healthGuardianHero from "@/app/assets/health-guardian-hero.png";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Interactive Neural Vortex Background */}
      <InteractiveNeuralVortex className="opacity-90 z-0" />
      
      {/* Transparent overlay */}
      <div className="absolute inset-0 bg-transparent z-1" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6 border-black"
            >
              <Sparkles className="w-4 h-4 text-primary text-black" />
              <span className="text-sm font-medium text-black">AI-Powered Health Monitoring</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-black"
            >
              Your AI-Powered{" "}
              <span className="text-gradient">Health Guardian</span>
              <br />
              <span className=" text-black">Level Up Your Wellness</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-black max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              HealthAI Guardian helps students proactively monitor chronic disease risks using AI. 
              Track your vitals, complete health quests, unlock wellness badges, and receive 
              personalized recommendations—all designed to build healthier habits in a fun, gamified way.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/auth">
                <Button
                  size="lg"
                  className="group relative overflow-hidden glow-primary hover:glow-primary-lg transition-all duration-300 hover:scale-105 text-black"
                >
                  <span className="relative z-10 flex items-center gap-2 ">
                    Start Your Health Journey
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              
              <Link href="/auth">
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform " />
                  Explore Dashboard Demo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            {/* <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start"
            >
              {[
                { value: "10K+", label: "Active Students" },
                { value: "50+", label: "Health Quests" },
                { value: "95%", label: "Accuracy Rate" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div> */}
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl transform scale-90" />
              
              {/* Main image container */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <img
                  src={healthGuardianHero.src}
                  alt="HealthAI Guardian - Your AI Health Companion"
                  className="w-full h-auto rounded-3xl shadow-2xl"
                />
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -top-4 -right-4 bg-card p-3 rounded-2xl card-glow border border-black"
                >
                  <div className="flex items-center gap-2 text-black border-black">
                    <div className="w-3 h-3 rounded-full bg-health-green animate-pulse" />
                    <span className="text-sm font-medium text-black">Health Score: 85</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-card p-3 rounded-2xl card-glow border border-black"
                >
                  <div className="flex items-center gap-2 text-black border-black">
                    <Sparkles className="w-4 h-4 text-quest-gold text-black" />
                    <span className="text-sm font-medium text-black">+250 XP Earned</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 rounded-full bg-primary/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
