import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="border-border/15 bg-card/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-xl overflow-hidden">
      <CardHeader className="space-y-2 pb-6">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20 shadow-[0_0_15px_rgba(207,150,255,0.15)]">
            {/* Gallery icon */}
            <svg
              className="w-6 h-6 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <CardTitle className="text-center text-3xl font-bold tracking-tight text-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-center text-muted-foreground text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="flex justify-center pt-2 pb-6">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
