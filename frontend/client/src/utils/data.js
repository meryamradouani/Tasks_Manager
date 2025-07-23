import {
  LuLayoutDashboard,
  LuUsers,
  LuClipboardCheck,
  LuSquarePlus,
  LuLogOut,
} from "react-icons/lu";

export const PRIORITY_DATA = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const STATUS_DATA = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    route: "/admin/dashboard",
  },
  {
    id: "02",
    label: "Manage Tasks",
    icon: LuClipboardCheck,
    route: "/admin/tasks",
  },
  {
    id: "03",
    label: "Create Task",
    icon: LuSquarePlus,
    route: "/admin/create-task",
  },
  {
    id: "04",
    label: "Team Members",
    icon: LuUsers,
    route: "/admin/users",
  },
  {
    id: "05",
    label: "Logout",
    icon: LuLogOut,
    route: "logout",
  },
];

export const SIDE_MENU_USER_DATA = [
  {
    id: "u1",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    route: "/user/dashboard",
  },
  {
    id: "u2",
    label: "My Tasks",
    icon: LuClipboardCheck,
    route: "/user/mytask",
  },
  {
    id: "u3",
    label: "Logout",
    icon: LuLogOut,
    route: "logout",
  },
];