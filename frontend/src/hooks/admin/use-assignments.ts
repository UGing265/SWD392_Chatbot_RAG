import { useState, useEffect, useCallback, useMemo } from "react";
import { assignmentApi, Assignment } from "@/api/assignment";
import { adminUserApi } from "@/api/admin-user";
import { curriculumApi } from "@/api/curriculum";
import { notify } from "@/lib/notifications";

export interface Lecturer {
  id: string;
  name: string;
  email: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
}

export function useAssignments() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const assignedBySubject = useMemo(() => {
    const map = new Map<string, Assignment>();
    assignments.forEach((assignment) => map.set(assignment.subjectId, assignment));
    return map;
  }, [assignments]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, lookupsData, assignmentsData] = await Promise.all([
        adminUserApi.getUsers(),
        curriculumApi.getLookups(),
        assignmentApi.getAssignments(),
      ]);

      const lecturerUsers = (usersData || [])
        .filter((user: any) => Number(user.role_id) === 2)
        .map((user: any) => ({
          id: String(user.id),
          name: user.name || user.email || "Lecturer",
          email: user.email || "",
        }));

      const subjectList = (lookupsData.subjects || []).map((subject: any) => ({
        id: String(subject.id),
        code: subject.code || "",
        name: subject.name || "",
      }));

      const firstLecturerId = lecturerUsers[0]?.id || "";

      setLecturers(lecturerUsers);
      setSubjects(subjectList);
      setAssignments(assignmentsData);
      setSelectedLecturer(firstLecturerId);
      
      if (firstLecturerId) {
        setAssignedSubjects(
          assignmentsData
            .filter((a) => a.userId === firstLecturerId)
            .map((a) => a.subjectId)
        );
      }
    } catch (err: any) {
      console.error("Error loading assignments data:", err);
      const msg = err.response?.data?.error || err.message || "Không thể tải dữ liệu phân công.";
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectLecturer = (lecturerId: string) => {
    setSelectedLecturer(lecturerId);
    setAssignedSubjects(
      assignments
        .filter((a) => a.userId === lecturerId)
        .map((a) => a.subjectId)
    );
  };

  const toggleSubject = (subjectId: string) => {
    const existing = assignedBySubject.get(subjectId);
    if (existing && existing.userId !== selectedLecturer) {
      notify.error(
        "Môn học đã được phân công",
        `${existing.subjectCode || "Môn này"} đang thuộc ${existing.lecturerEmail || "giảng viên khác"}.`
      );
      return;
    }

    setAssignedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSave = async () => {
    if (!selectedLecturer) {
      notify.error("Vui lòng chọn giảng viên.");
      return;
    }

    setSaving(true);
    try {
      const savedAssignments = await assignmentApi.saveAssignments(selectedLecturer, assignedSubjects);
      setAssignments((prev) => [
        ...prev.filter((a) => a.userId !== selectedLecturer),
        ...savedAssignments,
      ]);
      notify.success("Đã lưu phân công môn học thành công.");
    } catch (err: any) {
      console.error("Error saving assignments:", err);
      const msg = err.response?.data?.error || err.message || "Lưu phân công thất bại.";
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return {
    lecturers,
    subjects,
    assignments,
    selectedLecturer,
    assignedSubjects,
    loading,
    saving,
    assignedBySubject,
    handleSelectLecturer,
    toggleSubject,
    handleSave,
    refresh: fetchData,
  };
}
