"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { UserViewModal } from "./_components/user-view-modal";
import { DeleteAlertDialog } from "@/components/shared/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";

// Mock data - replace with actual API calls
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "STUDENT",
    agency_id: null,
    is_deleted: false,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@agency.com",
    role: "AGENCY",
    agency_id: "agency-1",
    is_deleted: false,
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T09:15:00Z",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "ADMIN",
    agency_id: null,
    is_deleted: false,
    created_at: "2024-01-13T14:45:00Z",
    updated_at: "2024-01-13T14:45:00Z",
  },
];

const roleColors = {
  STUDENT: "bg-blue-100 text-blue-800",
  AGENCY: "bg-green-100 text-green-800",
  ADMIN: "bg-purple-100 text-purple-800",
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState(mockUsers);

  const [selectedUser, setSelectedUser] = useState<
    (typeof mockUsers)[0] | null
  >(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      console.log("Deleting user:", selectedUser.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Remove user from list or refresh data
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          <Link href="/users/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              A list of all users in the system including their roles and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            roleColors[user.role as keyof typeof roleColors]
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.agency_id ? (
                          <span className="text-sm text-gray-600">
                            Agency Member
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No Agency
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* {new Date(user.created_at).toLocaleDateString()} */}
                        {format(new Date(user.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/users/edit/${user.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <UserViewModal
          user={selectedUser}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete User"
          description="Are you sure you want to delete this user? This will permanently remove the user and all associated data."
          itemName={selectedUser?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
