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
import Container from "@/components/shared/container";
// import { BlogViewModal } from "@/components/admin/blog-view-modal";
// import { DeleteAlertDialog } from "@/components/admin/delete-alert-dialog";

const mockBlogs = [
  {
    id: "1",
    title: "Study Abroad Tips for Students",
    slug: "study-abroad-tips-for-students",
    author_id: "1",
    author_name: "John Doe",
    is_published: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Scholarship Opportunities in 2024",
    slug: "scholarship-opportunities-2024",
    author_id: "2",
    author_name: "Jane Smith",
    is_published: false,
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T09:15:00Z",
  },
];

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [blogs] = useState(mockBlogs);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setShowViewModal(true);
  };

  const handleEditPost = (post: any) => {
    window.location.href = `/blogs/edit/${post.id}`;
  };

  const handleDeletePost = (post: any) => {
    setSelectedPost(post);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    setIsDeleting(true);
    try {
      console.log("Deleting blog post:", selectedPost.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowDeleteDialog(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting blog post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-gray-600">Manage blog posts and articles</p>
          </div>
          <Link href="/blogs/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
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
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell className="font-medium">
                        {blog.title}
                      </TableCell>
                      <TableCell>{blog.author_name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            blog.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {blog.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(blog.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(blog.updated_at).toLocaleDateString()}
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
                              onClick={() => handleViewPost(blog)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Post
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditPost(blog)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Post
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeletePost(blog)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Post
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
        {/* <BlogViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        post={selectedPost}
        onEdit={handleEditPost}
      />

      <DeleteAlertDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        itemName={selectedPost?.title || ""}
        isLoading={isDeleting}
      /> */}
      </div>
    </Container>
  );
}
