"use client";

import { useEffect, useState } from "react";
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "@/redux/features/user/userApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { useCurrentUser } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

const roleColors = {
  SUPER_ADMIN: "bg-red-100 text-red-800",
  ADMIN: "bg-blue-100 text-blue-800",
  AGENCY: "bg-green-100 text-green-800",
  STUDENT: "bg-purple-100 text-purple-800",
  USER: "bg-yellow-100 text-yellow-800",
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  agency: null | {
    id: string;
    name: string;
  };
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentUser = useCurrentUser();

  const initialParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || "",
  };

  const [params, setParams] = useState(initialParams);
  const [searchInput, setSearchInput] = useState(initialParams.search);

  // Debounce search query
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update search param when debounced search changes
  useEffect(() => {
    setParams((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Update URL when filters change
  useEffect(() => {
    const queryString = generateQueryString(params);
    router.push(`/users${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetUsersQuery(sanitizeParams(params));

  const users = data?.data;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Handle pagination page change
  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      (data?.meta && page > Math.ceil(data?.meta.total / data?.meta.limit)) ||
      page === params.page
    ) {
      return;
    }
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600">
                Manage system users and their roles
              </p>
            </div>
            <div className="w-[120px] h-10 bg-gray-200 animate-pulse rounded-md" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                A list of all users in the system including their roles and
                status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  const hasUsers = users && users.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          {currentUser?.role === "SUPER_ADMIN" && (
            <Link href="/users/create">
              <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </Link>
          )}
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasUsers ? (
                <Table>
                  <TableHeader>
                    <TableRow className="whitespace-nowrap">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: User) => (
                      <TableRow key={user.id} className="whitespace-nowrap">
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              roleColors[user.role as keyof typeof roleColors]
                            }
                          >
                            {user.role.split("_").join(" ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.agency ? (
                            <span className="text-sm text-gray-600">
                              {user.agency.name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No Agency
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled={
                                  user.id === currentUser?.id ||
                                  user.role === "SUPER_ADMIN"
                                }
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/users/edit/${user.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                                disabled={currentUser?.role === user.role}
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
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  {hasSearchQuery ? (
                    <>
                      <p className="text-gray-500 text-lg mb-4">
                        No users found matching &quot;{params.search}&quot;
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchInput("");
                          setParams((prev) => ({
                            ...prev,
                            search: "",
                            page: 1,
                          }));
                        }}
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 text-lg mb-4">
                        No users added yet
                      </p>
                      <Link href="/users/create">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add your first user
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {data?.meta && data?.meta.total > 1 && (
              <CustomPagination
                params={{ page: params.page }}
                totalPages={Math.ceil(data?.meta.total / params.limit)}
                handlePageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedUser) return;
            try {
              await deleteUser(selectedUser.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("User deleted successfully");
            } catch (error) {
              console.error("Failed to delete user:", error);
              toast.error("Failed to delete user");
            } finally {
              setSelectedUser(null);
            }
          }}
          title="Delete User"
          description="Are you sure you want to delete this user? This will permanently remove the user and all associated data."
          itemName={selectedUser?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
