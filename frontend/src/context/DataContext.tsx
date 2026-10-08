import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  QueryTicket, 
  ChatMessage, 
  ActivityLog, 
  PaymentTransaction, 
  TicketStatus, 
  TicketPriority, 
  WorkLog,
  User
} from '../types';
import { 
  INITIAL_TICKETS, 
  INITIAL_MESSAGES, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_PAYMENTS 
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface DataContextType {
  tickets: QueryTicket[];
  messages: ChatMessage[];
  activityLogs: ActivityLog[];
  payments: PaymentTransaction[];
  
  createTicket: (data: {
    title: string;
    category: QueryTicket['category'];
    subcategory: string;
    impact: QueryTicket['impact'];
    urgency: QueryTicket['urgency'];
    shortDescription: string;
    detailedDescription: string;
    environment: QueryTicket['environment'];
    assignmentGroup: QueryTicket['assignmentGroup'];
    attachments?: QueryTicket['attachments'];
  }) => Promise<{ success: boolean; ticket?: QueryTicket; error?: string }>;

  acceptJobAsExpert: (ticketId: string, expertId: string) => Promise<{ success: boolean; error?: string }>;
  
  assignEngineerToTicket: (ticketId: string, engineerId: string) => Promise<{ success: boolean; error?: string }>;
  
  updateTicketStatus: (ticketId: string, newStatus: TicketStatus, notes?: string) => Promise<{ success: boolean; error?: string }>;
  
  addWorkLog: (ticketId: string, hours: number, notes: string, isDiagnostic?: boolean) => Promise<{ success: boolean; error?: string }>;
  
  sendChatMessage: (ticketId: string, text: string, attachmentName?: string) => Promise<{ success: boolean; error?: string }>;
  
  resolveTicket: (ticketId: string, resolutionSummary: string, preventiveMeasures: string) => Promise<{ success: boolean; error?: string }>;
  
  confirmAndReleasePayment: (ticketId: string, rating: number, feedback: string) => Promise<{ success: boolean; error?: string }>;
  
  adminOverrideTicket: (ticketId: string, updates: Partial<QueryTicket>) => Promise<{ success: boolean; error?: string }>;
  
  getTicketById: (ticketId: string) => QueryTicket | undefined;
  
  getMessagesForTicket: (ticketId: string) => ChatMessage[];

  resetToDefaultData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, users, updateCurrentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [tickets, setTickets] = useState<QueryTicket[]>(() => {
    const saved = localStorage.getItem('techrescue_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('techrescue_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('techrescue_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('techrescue_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  useEffect(() => {
    localStorage.setItem('techrescue_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('techrescue_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('techrescue_activities', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('techrescue_payments', JSON.stringify(payments));
  }, [payments]);

  const computePriority = (impact: QueryTicket['impact'], urgency: QueryTicket['urgency']): TicketPriority => {
    if (impact === 'ENTERPRISE' || urgency === 'EMERGENCY') return 'CRITICAL';
    if (impact === 'HIGH' && urgency === 'HIGH') return 'HIGH';
    if (impact === 'HIGH' || urgency === 'HIGH') return 'HIGH';
    if (impact === 'MEDIUM' && urgency === 'MEDIUM') return 'MEDIUM';
    if (impact === 'MEDIUM' || urgency === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  };

  const computeSlaHours = (priority: TicketPriority): number => {
    switch (priority) {
      case 'CRITICAL': return 2;
      case 'HIGH': return 4;
      case 'MEDIUM': return 12;
      case 'LOW': return 24;
    }
  };

  const createTicket: DataContextType['createTicket'] = async (data) => {
    const priority = computePriority(data.impact, data.urgency);
    const slaHours = computeSlaHours(priority);
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString();
    
    // Estimate cost base:
    let estimatedCost = 3500;
    if (priority === 'CRITICAL') estimatedCost = 6500;
    else if (priority === 'HIGH') estimatedCost = 4500;
    else if (priority === 'LOW') estimatedCost = 2000;

    const sequentialNum = String(tickets.length + 1).padStart(4, '0');
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const ticketNumber = `INC-${datePrefix}-${sequentialNum}`;

    const newTicket: QueryTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      title: data.title,
      category: data.category,
      subcategory: data.subcategory,
      impact: data.impact,
      urgency: data.urgency,
      priority,
      status: 'OPEN',
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientCompany: currentUser.company || 'Enterprise Client',
      clientEmail: currentUser.email,
      clientPhone: currentUser.phone,
      shortDescription: data.shortDescription,
      detailedDescription: data.detailedDescription,
      environment: data.environment,
      assignmentGroup: data.assignmentGroup,
      estimatedCost,
      isEscrowFunded: true,
      isPaymentReleased: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline,
      slaBreached: false,
      attachments: data.attachments || [],
      workLogs: []
    };

    setTickets(prev => [newTicket, ...prev]);

    // Record Activity
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      queryId: newTicket.id,
      ticketNumber: newTicket.ticketNumber,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Query Created',
      details: `New ticket ${newTicket.ticketNumber} created with priority ${newTicket.priority}. Escrow ₹${estimatedCost.toLocaleString()} held.`,
      timestamp: now.toISOString(),
      type: 'status_change'
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Escrow payment record
    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      ticketId: newTicket.id,
      ticketNumber: newTicket.ticketNumber,
      clientId: currentUser.id,
      clientName: currentUser.name,
      payeeId: '',
      payeeName: 'Pending Assignment',
      payeeRole: 'EXPERT',
      amount: estimatedCost,
      platformFee: Math.round(estimatedCost * 0.1),
      netPayout: Math.round(estimatedCost * 0.9),
      status: 'ESCROW_HELD',
      date: now.toISOString(),
      invoiceNumber: `INV-TR-${datePrefix}-${sequentialNum}`
    };
    setPayments(prev => [newPayment, ...prev]);

    // Notify experts and admins
    addNotification({
      userId: 'usr-expert-1',
      title: 'New High Priority Ticket Raised',
      message: `${newTicket.ticketNumber}: ${newTicket.title} is now open for claim.`,
      type: 'ticket',
      linkTo: `/expert/jobs`
    });

    return { success: true, ticket: newTicket };
  };

  // Ticket Lock System for Race Condition Prevention
  const acceptJobAsExpert: DataContextType['acceptJobAsExpert'] = async (ticketId, expertId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, error: 'Ticket not found.' };
    }

    // CONCURRENCY LOCK CHECK:
    // If ticket is already assigned or not open
    if (ticket.status !== 'OPEN') {
      return { 
        success: false, 
        error: `Lock Collision: Ticket ${ticket.ticketNumber} has already been claimed by another specialist (Status: ${ticket.status}).` 
      };
    }

    const expert = users.find(u => u.id === expertId);
    if (!expert) {
      return { success: false, error: 'Expert profile not found.' };
    }

    const now = new Date().toISOString();

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'IN_PROGRESS',
              assignedExpertId: expert.id,
              assignedExpertName: expert.name,
              assignedExpertRate: expert.hourlyRate || 1500,
              updatedAt: now
            }
          : t
      )
    );

    // Update payee in escrow transaction
    setPayments(prev =>
      prev.map(p =>
        p.ticketId === ticketId
          ? { ...p, payeeId: expert.id, payeeName: expert.name, payeeRole: 'EXPERT' }
          : p
      )
    );

    // Record Activity
    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        queryId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: expert.id,
        userName: expert.name,
        userRole: 'EXPERT',
        action: 'Job Accepted & Locked',
        details: `${expert.name} secured lock and accepted ${ticket.ticketNumber}. Status changed to IN_PROGRESS.`,
        timestamp: now,
        type: 'assignment'
      },
      ...prev
    ]);

    // Notify Client
    addNotification({
      userId: ticket.clientId,
      title: 'Expert Assigned & Working',
      message: `${expert.name} accepted your ticket ${ticket.ticketNumber} and started diagnostics.`,
      type: 'assignment',
      linkTo: `/client/query/${ticket.id}`
    });

    return { success: true };
  };

  const assignEngineerToTicket: DataContextType['assignEngineerToTicket'] = async (ticketId, engineerId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const engineer = users.find(u => u.id === engineerId);
    if (!engineer) return { success: false, error: 'Engineer not found' };

    const now = new Date().toISOString();

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              assignedEngineerId: engineer.id,
              assignedEngineerName: engineer.name,
              engineerLocation: engineer.location,
              status: t.status === 'OPEN' ? 'ASSIGNED' : t.status,
              updatedAt: now
            }
          : t
      )
    );

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        queryId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Field Engineer Dispatched',
        details: `${engineer.name} was dispatched to on-site location for ${ticket.ticketNumber}.`,
        timestamp: now,
        type: 'assignment'
      },
      ...prev
    ]);

    addNotification({
      userId: engineer.id,
      title: 'New Field Dispatch Assigned',
      message: `You have been assigned to on-site ticket ${ticket.ticketNumber} in ${ticket.environment}.`,
      type: 'assignment',
      linkTo: `/engineer/jobs`
    });

    return { success: true };
  };

  const updateTicketStatus: DataContextType['updateTicketStatus'] = async (ticketId, newStatus, notes) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const now = new Date().toISOString();

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              updatedAt: now,
              ...(newStatus === 'RESOLVED' ? { resolvedAt: now } : {}),
              ...(newStatus === 'CLOSED' ? { closedAt: now } : {})
            }
          : t
      )
    );

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        queryId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: `Status Changed to ${newStatus}`,
        details: notes || `Ticket status progressed to ${newStatus} by ${currentUser.name}.`,
        timestamp: now,
        type: 'status_change'
      },
      ...prev
    ]);

    // Send notifications to stakeholders
    if (ticket.clientId !== currentUser.id) {
      addNotification({
        userId: ticket.clientId,
        title: `Ticket Status: ${newStatus}`,
        message: `${ticket.ticketNumber} is now marked as ${newStatus}.`,
        type: 'ticket',
        linkTo: `/client/query/${ticket.id}`
      });
    }

    return { success: true };
  };

  const addWorkLog: DataContextType['addWorkLog'] = async (ticketId, hours, notes, isDiagnostic = false) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const now = new Date().toISOString();
    const newLog: WorkLog = {
      id: `wl-${Date.now()}`,
      queryId: ticketId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      hoursSpent: hours,
      notes,
      timestamp: now,
      isDiagnostic
    };

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              workLogs: [newLog, ...(t.workLogs || [])],
              updatedAt: now
            }
          : t
      )
    );

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        queryId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Work Log Logged',
        details: `${currentUser.name} logged ${hours}h: "${notes.slice(0, 80)}${notes.length > 80 ? '...' : ''}"`,
        timestamp: now,
        type: 'comment'
      },
      ...prev
    ]);

    return { success: true };
  };

  const sendChatMessage: DataContextType['sendChatMessage'] = async (ticketId, text, attachmentName) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      queryId: ticketId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: text,
      timestamp: now,
      attachmentName
    };

    setMessages(prev => [...prev, newMsg]);

    // Add activity log
    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        queryId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Message Sent',
        details: `${currentUser.name}: "${text.slice(0, 60)}..."`,
        timestamp: now,
        type: 'comment'
      },
      ...prev
    ]);

    return { success: true };
  };

  const resolveTicket: DataContextType['resolveTicket'] = async (ticketId, resolutionSummary, preventiveMeasures) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const now = new Date().toISOString();

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'RESOLVED',
              resolvedAt: now,
              updatedAt: now,
              resolutionSummary,
              preventiveMeasures
            }
          : t
      )
    );

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        queryId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Ticket Resolved',
        details: `Issue marked as resolved by ${currentUser.name}. Awaiting client confirmation.`,
        timestamp: now,
        type: 'resolution'
      },
      ...prev
    ]);

    addNotification({
      userId: ticket.clientId,
      title: 'Resolution Submitted for Approval',
      message: `${ticket.ticketNumber} has been resolved by specialist. Please review and confirm resolution.`,
      type: 'ticket',
      linkTo: `/client/query/${ticket.id}`
    });

    return { success: true };
  };

  const confirmAndReleasePayment: DataContextType['confirmAndReleasePayment'] = async (ticketId, rating, feedback) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    const now = new Date().toISOString();

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'CLIENT_CONFIRMED',
              closedAt: now,
              updatedAt: now,
              clientRating: rating,
              clientFeedback: feedback,
              isPaymentReleased: true
            }
          : t
      )
    );

    // Update payment transaction to RELEASED
    setPayments(prev =>
      prev.map(p =>
        p.ticketId === ticketId
          ? { ...p, status: 'RELEASED', date: now }
          : p
      )
    );

    // Credit earnings to expert or engineer
    const payeeId = ticket.assignedExpertId || ticket.assignedEngineerId;
    if (payeeId) {
      const payee = users.find(u => u.id === payeeId);
      if (payee) {
        const netEarning = Math.round((ticket.actualCost || ticket.estimatedCost) * 0.9);
        updateCurrentUser({
          totalEarnings: (currentUser.id === payee.id ? (currentUser.totalEarnings || 0) : (payee.totalEarnings || 0)) + netEarning
        });

        addNotification({
          userId: payee.id,
          title: 'Escrow Payment Released!',
          message: `₹${netEarning.toLocaleString()} released for ${ticket.ticketNumber} with ${rating}★ rating!`,
          type: 'payment',
          linkTo: payee.role === 'EXPERT' ? '/expert/earnings' : '/engineer/earnings'
        });
      }
    }

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        queryId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Resolution Confirmed & Escrow Released',
        details: `Client approved resolution (${rating}★). Escrow payout disbursed successfully.`,
        timestamp: now,
        type: 'payment'
      },
      ...prev
    ]);

    return { success: true };
  };

  const adminOverrideTicket: DataContextType['adminOverrideTicket'] = async (ticketId, updates) => {
    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, ...updates, updatedAt: now } : t))
    );

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        queryId: ticketId,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'ADMIN',
        action: 'Admin Supervisory Override',
        details: `Ticket modified by Admin: ${JSON.stringify(updates)}`,
        timestamp: now,
        type: 'escalation'
      },
      ...prev
    ]);

    return { success: true };
  };

  const getTicketById = (ticketId: string) => {
    return tickets.find(t => t.id === ticketId);
  };

  const getMessagesForTicket = (ticketId: string) => {
    return messages.filter(m => m.queryId === ticketId);
  };

  const resetToDefaultData = () => {
    setTickets(INITIAL_TICKETS);
    setMessages(INITIAL_MESSAGES);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setPayments(INITIAL_PAYMENTS);
    localStorage.removeItem('techrescue_tickets');
    localStorage.removeItem('techrescue_messages');
    localStorage.removeItem('techrescue_activities');
    localStorage.removeItem('techrescue_payments');
  };

  return (
    <DataContext.Provider
      value={{
        tickets,
        messages,
        activityLogs,
        payments,
        createTicket,
        acceptJobAsExpert,
        assignEngineerToTicket,
        updateTicketStatus,
        addWorkLog,
        sendChatMessage,
        resolveTicket,
        confirmAndReleasePayment,
        adminOverrideTicket,
        getTicketById,
        getMessagesForTicket,
        resetToDefaultData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
