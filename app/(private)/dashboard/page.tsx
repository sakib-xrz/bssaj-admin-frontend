import Container from "@/components/shared/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  UserCheck,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      description: "Active users in the system",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Agencies",
      value: "56",
      description: "Registered agencies",
      icon: Building2,
      color: "text-secondary",
    },
    {
      title: "Events",
      value: "23",
      description: "Upcoming events",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Blog Posts",
      value: "89",
      description: "Published articles",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Memberships",
      value: "456",
      description: "Active memberships",
      icon: UserCheck,
      color: "text-orange-600",
    },
    {
      title: "Payments",
      value: "789",
      description: "Total transactions",
      icon: CreditCard,
      color: "text-red-600",
    },
  ];

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to BSSAJ Admin Panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Add User", href: "/admin/users/create" },
                  { label: "Create Event", href: "/admin/events/create" },
                  { label: "New Blog Post", href: "/admin/blogs/create" },
                  { label: "Add Agency", href: "/admin/agencies/create" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="p-3 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
