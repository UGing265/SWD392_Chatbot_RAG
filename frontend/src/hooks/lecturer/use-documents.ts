import { useState, useEffect, useMemo, useRef } from "react";
import { ragApi } from "@/api/client";

export interface ApiSubject {
  id: string;
  code: string;
  name: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  visibility: string;
  document_type_name?: string;
  language_name?: string;
  document_source_name?: string;
  created_at: string;
  original_file_name?: string;
  file_url?: string;
  status?: string;
  subject_id?: string;
  subject_code?: string;
}

export function useLecturerDocuments() {
  const [step, setStep] = useState<"subject" | "documents" | "chapters" | "viewing">("subject");
  const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);
  
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

  // Editing state
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  
  // Adding subject state
  const [newSubjectName, setNewSubjectName] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    setIsLoading(true);
    try {
      const res = await ragApi.get("/documents/lookups");
      const data = res.data;

      // Map subjects
      const apiSubjects: ApiSubject[] = data.subjects || [];
      const mappedSubjects = apiSubjects.map((s) => ({
        id: s.id,
        name: `${s.code} - ${s.name}`,
      }));
      setSubjects(mappedSubjects);

    } catch (error) {
      console.error("Error fetching lookups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await ragApi.get("/documents/my");
      const list = res.data.documents || [];
      
      const mappedMaterials: Material[] = list.map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        visibility: m.visibility,
        document_type_name: m.document_type?.name,
        language_name: m.language?.name,
        document_source_name: m.document_source?.name,
        created_at: m.created_at,
        original_file_name: m.original_file_name,
        file_url: m.file_url,
        status: m.status,
        subject_id: m.subject_id,
      }));
      setMaterials(mappedMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSaveSubject = () => {
    if (newSubjectName.trim()) {
      setIsAddSubjectModalOpen(false);
      setNewSubjectName("");
    }
  };

  const handleDelete = () => {
    if (currentMaterial) {
      setMaterials(materials.filter((m) => m.id !== currentMaterial.id));
      if (selectedMaterialId === currentMaterial.id) {
        setSelectedMaterialId(null);
      }
    }
    setIsDeleteModalOpen(false);
    setCurrentMaterial(null);
  };

  const handleSave = () => {
    if (currentMaterial) {
      setMaterials(materials.map((m) => (m.id === currentMaterial.id ? currentMaterial : m)));
    }
    setIsEditModalOpen(false);
    setCurrentMaterial(null);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadModalOpen(true);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBack = () => {
    if (step === "viewing") {
      setStep("chapters");
    } else if (step === "chapters") {
      setStep("documents");
    } else if (step === "documents") {
      setSelectedSubject(null);
      setStep("subject");
    }
  };

  // Filter materials based on selected subject
  const filteredMaterials = materials.filter(
    (m) => m.subject_id === selectedSubject?.id
  );

  const activeMaterial = materials.find((m) => m.id === selectedMaterialId);

  return {
    step,
    setStep,
    selectedSubject,
    setSelectedSubject,
    selectedMaterialId,
    setSelectedMaterialId,
    selectedChapterIds,
    setSelectedChapterIds,
    selectedItemIds,
    setSelectedItemIds,
    materials,
    subjects,
    isLoading,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isAddSubjectModalOpen,
    setIsAddSubjectModalOpen,
    currentMaterial,
    setCurrentMaterial,
    newSubjectName,
    setNewSubjectName,
    selectedFile,
    setSelectedFile,
    fileInputRef,
    isUploading,
    filteredMaterials,
    activeMaterial,
    handleSaveSubject,
    handleDelete,
    handleSave,
    handleFileChange,
    handleBack,
  };
}
