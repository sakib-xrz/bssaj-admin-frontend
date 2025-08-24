"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Eye,
  FileText,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { BlogViewModal } from "@/app/(private)/blogs/_components/blog-view-modal";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetAllBlogsQuery,
  useDeleteBlogMutation,
  useApproveOrRejectBlogMutation,
} from "@/redux/features/blog/blogApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

interface Blog {
  id: string;
  approved_by_id: string | null;
  approved_by: {
    name: string;
  } | null;
  author: {
    name: string;
  };
  cover_image: string | null;
  is_approved: boolean;
  is_published: boolean;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function BlogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    router.push(`/blogs${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetAllBlogsQuery(sanitizeParams(params));

  const blogs = data?.data;

  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [approveOrRejectBlog] = useApproveOrRejectBlogMutation();

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (blogId: string) => {
    setImageErrors((prev) => new Set(prev).add(blogId));
  };

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

  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsViewModalOpen(true);
  };

  const handleDeleteBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteDialogOpen(true);
  };

  const handleApproveBlog = async (blog: Blog) => {
    try {
      await approveOrRejectBlog({
        id: blog.id,
        data: {
          id: blog.id,
          is_approved: true,
          is_published: true,
        },
      }).unwrap();
      toast.success("Blog approved successfully");
    } catch (error) {
      console.error("Error approving blog:", error);
      toast.error("Failed to approve blog");
    }
  };

  const handleRejectBlog = async (blog: Blog) => {
    try {
      await approveOrRejectBlog({
        id: blog.id,
        data: {
          id: blog.id,
          is_approved: false,
        },
      }).unwrap();
      toast.success("Blog rejected successfully");
    } catch (error) {
      console.error("Error rejecting blog:", error);
      toast.error("Failed to reject blog");
    }
  };

  const getPublishStatusBadge = (blog: Blog) => {
    return blog.is_published ? (
      <Badge className="bg-blue-100 text-blue-800">Published</Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
    );
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
              <p className="text-gray-600">Manage blog posts and articles</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Blog Posts</CardTitle>
              <CardDescription>
                A list of all blog posts in the system
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

  const hasBlogs = blogs && blogs.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-gray-600">Manage blog posts and articles</p>
          </div>
          <Link href="/blogs/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Create Blog
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts</CardTitle>
            <CardDescription>
              A list of all blog posts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasBlogs ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blog Post</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs?.map((blog: Blog) => (
                      <TableRow key={blog.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {blog.cover_image && !imageErrors.has(blog.id) ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <Image
                                  src={blog.cover_image}
                                  alt={`${blog.title} cover`}
                                  fill
                                  className="object-cover"
                                  onError={() => handleImageError(blog.id)}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium line-clamp-1">
                                {blog.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {blog.content
                                  .replace(/<[^>]*>/g, "")
                                  .substring(0, 50)}
                                ...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{blog.author?.name}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {getPublishStatusBadge(blog)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(blog.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(blog.updated_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {blog.approved_by_id === null ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewBlog(blog)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleApproveBlog(blog)}
                                    className="text-green-600"
                                  >
                                    <Check className="h-4 w-4" />
                                    Approve Blog
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRejectBlog(blog)}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                    Reject Blog
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewBlog(blog)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/blogs/edit/${blog.id}`}>
                                      <Edit className="h-4 w-4" />
                                      Edit Blog
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteBlog(blog)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
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
                        No blog posts found matching &quot;{params.search}&quot;
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
                        No blog posts added yet
                      </p>
                      <Link href="/blogs/create">
                        <Button>
                          <Plus className="w-4 h-4" />
                          Create your first blog
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

        <BlogViewModal
          blogId={selectedBlog?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedBlog) return;
            try {
              await deleteBlog({ id: selectedBlog.id }).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Blog deleted successfully");
            } catch (error) {
              console.error("Failed to delete blog:", error);
              toast.error("Failed to delete blog");
            } finally {
              setSelectedBlog(null);
            }
          }}
          title="Delete Blog Post"
          description="Are you sure you want to delete this blog post? This action cannot be undone."
          itemName={selectedBlog?.title || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
