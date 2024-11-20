import { DashboardStats, DashboardAction } from "@/types/dashboard"
import {
  UserCircle,
  FileText,
  Calendar,
  Files,
  PlusCircle
} from "lucide-react"

export const mockDashboardStats: DashboardStats = {
  profile: {
    completionRate: 75,
    lastUpdate: new Date("2024-03-15"),
    missingDocuments: ["proof_of_residence", "birth_certificate"]
  },
  requests: {
    pending: 2,
    inProgress: 1,
    completed: 5,
    latest: {
      id: "REQ123",
      type: "passport_renewal",
      status: "pending",
      updatedAt: new Date("2024-03-20")
    }
  },
  appointments: {
    upcoming: {
      id: "APT456",
      date: new Date("2024-04-01"),
      type: "document_submission"
    },
    total: 3
  },
  documents: {
    total: 8,
    expiringSoon: 2,
    expired: 1
  }
}

export const mockDashboardActions: DashboardAction[] = [
  {
    id: "complete_profile",
    label: "dashboard.actions.complete_profile",
    description: "Complétez votre profil pour accéder à tous les services",
    href: "/profile",
    icon: UserCircle,
    priority: "high"
  },
  {
    id: "submit_request",
    label: "dashboard.actions.submit_request",
    description: "Déposez une nouvelle demande consulaire",
    href: "/requests/new",
    icon: PlusCircle,
    priority: "medium"
  },
  // ... autres actions
]