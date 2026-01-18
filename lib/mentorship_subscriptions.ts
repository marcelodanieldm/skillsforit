// Tabla de suscripciones de mentoría y sistema de créditos
export interface MentorshipSubscription {
  id: string;
  userId: string;
  email: string;
  plan: 'aceleracion' | 'transformacion';
  sessionsTotal: number;
  sessionsUsed: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  mentorId?: string;
}

const mentorshipSubscriptions: Map<string, MentorshipSubscription> = new Map();

export const mentorshipSubscriptionsDb = {
  create: (sub: MentorshipSubscription) => {
    mentorshipSubscriptions.set(sub.id, sub);
    return sub;
  },
  findByUserId: (userId: string) => {
    return Array.from(mentorshipSubscriptions.values()).filter(s => s.userId === userId && s.active);
  },
  findByEmail: (email: string) => {
    return Array.from(mentorshipSubscriptions.values()).filter(s => s.email === email && s.active);
  },
  update: (id: string, data: Partial<MentorshipSubscription>) => {
    const existing = mentorshipSubscriptions.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    mentorshipSubscriptions.set(id, updated);
    return updated;
  },
  all: () => Array.from(mentorshipSubscriptions.values()),
};
