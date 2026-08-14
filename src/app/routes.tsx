import { createBrowserRouter, Navigate } from "react-router";

// Layouts
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardLayout_student } from "./components/DashboardLayout_student";
import { DashboardLayout_teacher } from "./components/DashboardLayout_teacher";

// Auth guard
import { ProtectedRoute } from "./components/ProtectedRoute";

// Admin pages
import { Dashboard } from "./pages_admin/Dashboard";
import { Projects } from "./pages_admin/Projects";
import { Milestones } from "./pages_admin/Milestones";
import { Feedback } from "./pages_admin/Feedback";
import { Reports } from "./pages_admin/Reports";
import { UserManagement } from "./pages_admin/UserManagement";
import Login from "./Login";

// Student (นิสิต) pages
import { Dashboard_student } from "./pages_user/Dashboard_student";
import { Projects_student } from "./pages_user/Projects_student";
import { Milestones_student } from "./pages_user/Milestones_student";
import { Feedback_student } from "./pages_user/Feedback_student";

// Teacher (อาจารย์) pages
import { Dashboard_teacher } from "./pages_teacher/Dashboard_teacher";
import { Projects_teacher } from "./pages_teacher/Projects_teacher";
import { Feedback_teacher } from "./pages_teacher/Feedback_teacher";
import { Reports_teacher } from "./pages_teacher/Reports_teacher";
import React from "react";

export const router = createBrowserRouter([
  // ─── Public ───────────────────────────────────────────────
  {
    path: "/login",
    Component: Login,
  },

  // ─── Admin (ผู้ดูแลระบบ) ──────────────────────────────────
  {
    path: "/",
    element: <ProtectedRoute allowedRole="ผู้ดูแลระบบ" />,
    children: [
      {
        Component: DashboardLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "projects", Component: Projects },
          { path: "milestones", Component: Milestones },
          { path: "feedback", Component: Feedback },
          { path: "reports", Component: Reports },
          { path: "users", Component: UserManagement },
        ],
      },
    ],
  },

  // ─── Student (นิสิต) ──────────────────────────────────────
  {
    path: "/student",
    element: <ProtectedRoute allowedRole="นักศึกษา" />,
    children: [
      {
        Component: DashboardLayout_student,
        children: [
          { index: true, Component: Dashboard_student },
          { path: "projects", Component: Projects_student },
          { path: "milestones", Component: Milestones_student },
          { path: "feedback", Component: Feedback_student },
        ],
      },
    ],
  },

  // ─── Teacher (อาจารย์) ────────────────────────────────────
  {
    path: "/teacher",
    element: <ProtectedRoute allowedRole="อาจารย์" />,
    children: [
      {
        Component: DashboardLayout_teacher,
        children: [
          { index: true, Component: Dashboard_teacher },
          { path: "projects", Component: Projects_teacher },
          { path: "feedback", Component: Feedback_teacher },
          { path: "reports", Component: Reports_teacher },
          { path: "milestones", element: <Navigate to="/teacher/projects" replace /> },
        ],
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);