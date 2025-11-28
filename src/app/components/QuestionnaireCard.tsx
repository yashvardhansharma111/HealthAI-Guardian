"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function QuestionnaireCard() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Health Questionnaire
        </CardTitle>
        <CardDescription>
          Complete a 5-question assessment with real-time emotion and keystroke analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This questionnaire uses advanced AI to analyze:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Facial emotion detection via video analysis</li>
              <li>Keystroke dynamics for stress assessment</li>
              <li>Your responses to health-related questions</li>
            </ul>
          </div>
          <Link href="/questionnaire">
            <Button className="w-full glow-primary">
              Start Questionnaire
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

