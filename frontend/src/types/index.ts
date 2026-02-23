export interface User {
    _id: string;
    name: string;
    email: string;
    role: "Participant" | "Organizer" | "Admin";
}

export interface CustomField {
    label: string;
    fieldType: "text" | "number" | "email" | "dropdown" | "checkbox" | "file";
    options?: string[];
    required: boolean;
    order: number;
}

export interface MerchandiseDetails {
    sizes: string[];
    colors: string[];
    variants?: string[];
    stock: number;
    imageUrl?: string;
    purchaseLimitPerParticipant?: number;
}

export interface Event {
    _id: string;
    name: string;
    description: string;
    eventType: "Normal" | "Merchandise";
    status: "Draft" | "Published" | "Ongoing" | "Closed";
    organizerId: { _id: string; organizerName: string; contactEmail?: string; email?: string };
    tags: string[];
    eligibility: string;
    registrationLimit?: number;
    fee: number;
    deadline: string;
    startDate: string;
    endDate: string;
    customFormFields?: CustomField[];
    merchandiseDetails?: MerchandiseDetails;
    createdAt: string;
    isTeamEvent?: boolean;
    maxTeamSize?: number;
    formLocked?: boolean;
}

export interface Ticket {
    _id: string;
    participantId: string | { _id: string; firstName: string; lastName: string; email: string };
    eventId: Event;
    teamId?: string | { _id: string; teamName: string };
    status: "Registered" | "Pending" | "Cancelled" | "Rejected" | "Completed";
    registrationDate: string;
    formData?: Record<string, string>;
    merchandiseSelection?: {
        size: string;
        color: string;
        quantity: number;
    };
    paymentStatus: "Pending" | "Approved" | "Rejected" | "Paid" | "NA";
    paymentProofUrl?: string;
    attended?: boolean;
    attendedAt?: string;
    qrCodeData?: string;
}
