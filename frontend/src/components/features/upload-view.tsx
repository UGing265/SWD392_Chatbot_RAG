"use client";

import { useState, useEffect } from "react";
import { CloudUpload, FileText, CheckCircle2, Loader2, X, BookOpen, Calendar, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Subject {
  id: string;
  name: string;
}

interface AcademicTerm {
  id: string;
  name: string;
}

export function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);

  useEffect(() => {
    // Mock data for development
    const mockSubjects: Subject[] = [
      { id: "1", name: "Lập trình Web" },
      { id: "2", name: "Cơ sở dữ liệu" },
      { id: "3", name: "Toán cao cấp" },
      { id: "4", name: "Mạng máy tính" },
    ];

    const mockTerms: AcademicTerm[] = [
      { id: "1", name: "HK1 2024-2025" },
      { id: "2", name: "HK2 2024-2025" },
      { id: "3", name: "HK1 2025-2026" },
    ];

    setSubjects(mockSubjects);
    setTerms(mockTerms);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject_id", subjectId);
    formData.append("academic_term_id", termId);
    formData.append("visibility", visibility);

    try {
      const response = await fetch("http://localhost:8080/api/documents/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploaded(true);
        setTimeout(() => {
          setUploaded(false);
          resetForm();
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setSubjectId("");
    setTermId("");
    setVisibility("private");
  };

  const removeFile = () => {
    setFile(null);
    if (title === file?.name.replace(/\.[^/.]+$/, "")) {
      setTitle("");
    }
  };

  if (uploaded) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-200">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h2 className="mb-3 text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Tải lên thành công!
          </h2>
          <p className="text-muted-foreground text-lg">Tài liệu của bạn đang được xử lý</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-4xl p-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2">
            <CloudUpload className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Tài liệu giáo dục</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tải lên tài liệu mới
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Chia sẻ tài liệu giảng dạy với sinh viên của bạn. Hỗ trợ PDF, DOC, DOCX, PPT, PPTX
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {/* File Upload Area */}
          <div className="relative group">
            <input
              type="file"
              id="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="file"
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-16 transition-all duration-300 ${
                file
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-100"
                  : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:shadow-lg hover:shadow-blue-100"
              }`}
            >
              {file ? (
                <div className="flex w-full items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-lg text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile();
                    }}
                    disabled={uploading}
                    className="h-12 w-12 rounded-full hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CloudUpload className="h-10 w-10 text-white" />
                  </div>
                  <p className="mb-2 font-semibold text-xl text-gray-900">Kéo và thả file vào đây</p>
                  <p className="text-gray-500">hoặc nhấp để chọn file từ máy tính</p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-3 py-1 rounded-full bg-gray-100">PDF</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100">DOC</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100">DOCX</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100">PPT</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100">PPTX</span>
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Document Details */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base font-semibold text-gray-700">Tiêu đề tài liệu</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề tài liệu"
                required
                disabled={uploading}
                className="h-12 text-base rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-base font-semibold text-gray-700">Mô tả ngắn gọn</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về nội dung tài liệu..."
                rows={3}
                disabled={uploading}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="subject" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Môn học
                </Label>
                <Select value={subjectId} onValueChange={setSubjectId} disabled={uploading}>
                  <SelectTrigger id="subject" className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="term" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Kỳ học
                </Label>
                <Select value={termId} onValueChange={setTermId} disabled={uploading}>
                  <SelectTrigger id="term" className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Chọn kỳ học" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="visibility" className="text-base font-semibold text-gray-700">Quyền riêng tư</Label>
              <Select value={visibility} onValueChange={setVisibility} disabled={uploading}>
                <SelectTrigger id="visibility" className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn quyền riêng tư" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500" />
                      <span>Riêng tư (chỉ mình tôi)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span>Công khai (tài liệu chung)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-blue-200 transition-all duration-300 hover:shadow-xl hover:shadow-blue-300"
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <CloudUpload className="mr-3 h-5 w-5" />
                Tải lên tài liệu
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
