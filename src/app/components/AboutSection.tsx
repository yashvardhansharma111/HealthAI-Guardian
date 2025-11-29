"use client";
import { motion } from "framer-motion";
import { Brain, Target, ClipboardList, GraduationCap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Based Early Detection",
    description: "Analyzes symptoms, behavioral patterns, and wearable data for early warnings of potential health risks.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Target,
    title: "Health Quests & Rewards",
    description: "Complete gamified tasks to improve lifestyle habits and earn badges, XP, and wellness rewards.",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: ClipboardList,
    title: "Behavioral Pattern Questionnaire",
    description: "Identifies stress levels, sleep quality, eating habits, and mental wellness traits through smart assessments.",
    iconBg: "bg-xp-purple/10",
    iconColor: "text-xp-purple",
  },
  {
    icon: GraduationCap,
    title: "Student-Focused Care",
    description: "Built for universities like SVVV to make preventive healthcare accessible and engaging for students.",
    iconBg: "bg-health-green/10",
    iconColor: "text-health-green",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const AboutSection = () => {
  return (
    <section className="relative py-24 bg-card overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-block px-4 py-1.5 rounded-full bg-accent text-black text-sm font-medium mb-4"
          >
            How It Works
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
            How <span className="text-gradient">HealthAI Guardian</span> Works
          </h2>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Discover how our AI-powered platform transforms your health journey into an engaging, 
            gamified experience with personalized insights.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="h-full p-6 rounded-2xl bg-background border border-border card-glow transition-all duration-300 group-hover:border-primary/30">
                  {/* Icon container */}
                  <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4 text-black">
            Ready to take control of your health?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-black text-primary-foreground font-medium glow-primary hover:glow-primary-lg transition-all duration-300"
          >
            Get Started Free
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
