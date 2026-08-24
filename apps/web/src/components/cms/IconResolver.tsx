'use client';

import React from 'react';
import {
  Scissors,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  Smartphone,
  Gift,
  CreditCard,
  Globe,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Zap,
  BarChart3,
  Award,
  Crown,
  ChevronDown,
  Phone,
  Mail,
  HelpCircle,
  Layers,
  MessageSquare,
  FileText,
  Percent,
  CheckCheck,
  Heart,
  ExternalLink,
  LucideProps
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Scissors,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  Smartphone,
  Gift,
  CreditCard,
  Globe,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Zap,
  BarChart3,
  Award,
  Crown,
  ChevronDown,
  Phone,
  Mail,
  HelpCircle,
  Layers,
  MessageSquare,
  FileText,
  Percent,
  CheckCheck,
  Heart,
  ExternalLink
};

export const availableIconNames = Object.keys(iconMap);

interface IconResolverProps extends LucideProps {
  name?: string;
  fallback?: React.ComponentType<LucideProps>;
}

export function IconResolver({ name, fallback: FallbackIcon = Sparkles, ...props }: IconResolverProps) {
  if (!name) {
    return <FallbackIcon {...props} />;
  }

  const IconComponent = iconMap[name] || FallbackIcon;
  return <IconComponent {...props} />;
}
