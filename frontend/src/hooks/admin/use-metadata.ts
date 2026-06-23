import { useState, useEffect, useCallback, useMemo } from "react";
import { metadataApi, DocumentType, Language, DocumentSource } from "@/api/metadata";
import { notify } from "@/lib/notifications";

export type MetadataSavingAction =
  | "create-type"
  | `update-type-${string}`
  | `delete-type-${string}`
  | "create-language"
  | `update-language-${string}`
  | `delete-language-${string}`
  | "create-source"
  | `update-source-${string}`
  | `delete-source-${string}`;

export function useMetadata() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [documentSources, setDocumentSources] = useState<DocumentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingAction, setSavingAction] = useState<MetadataSavingAction | null>(null);

  // Form states for Document Types
  const [addingType, setAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingTypeName, setEditingTypeName] = useState("");
  const [editingTypeDesc, setEditingTypeDesc] = useState("");

  // Form states for Languages
  const [addingLang, setAddingLang] = useState(false);
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangName, setNewLangName] = useState("");
  const [editingLangId, setEditingLangId] = useState<string | null>(null);
  const [editingLangCode, setEditingLangCode] = useState("");
  const [editingLangName, setEditingLangName] = useState("");

  // Form states for Document Sources
  const [addingSource, setAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [editingSourceName, setEditingSourceName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await metadataApi.getLookups();
      setDocumentTypes(data.documentTypes || []);
      setLanguages(data.languages || []);
      setDocumentSources(data.documentSources || []);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Không thể tải dữ liệu danh mục.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Document Types Actions
  const startAddingType = () => {
    setAddingType(true);
    setNewTypeName("");
    setNewTypeDesc("");
  };

  const startEditingType = (item: DocumentType) => {
    setAddingType(false);
    setEditingTypeId(item.id);
    setEditingTypeName(item.name);
    setEditingTypeDesc(item.description || "");
  };

  const cancelTypeForm = () => {
    setAddingType(false);
    setEditingTypeId(null);
  };

  const handleCreateType = async () => {
    const name = newTypeName.trim();
    if (!name || savingAction) return;

    setSavingAction("create-type");
    try {
      await metadataApi.createDocumentType(name, newTypeDesc.trim() || null);
      notify.success("Thêm loại học liệu thành công");
      cancelTypeForm();
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Thêm thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleUpdateType = async (id: string) => {
    const name = editingTypeName.trim();
    if (!name || savingAction) return;

    setSavingAction(`update-type-${id}`);
    try {
      await metadataApi.updateDocumentType(id, name, editingTypeDesc.trim() || null);
      notify.success("Cập nhật thành công");
      setEditingTypeId(null);
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Cập nhật thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleDeleteType = async (item: DocumentType) => {
    if (!confirm(`Xóa loại học liệu "${item.name}"?`) || savingAction) return;
    setSavingAction(`delete-type-${item.id}`);
    try {
      await metadataApi.deleteDocumentType(item.id);
      notify.success("Xóa thành công");
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Xóa thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  // Languages Actions
  const startAddingLang = () => {
    setAddingLang(true);
    setNewLangCode("");
    setNewLangName("");
  };

  const startEditingLang = (item: Language) => {
    setAddingLang(false);
    setEditingLangId(item.id);
    setEditingLangCode(item.code);
    setEditingLangName(item.name);
  };

  const cancelLangForm = () => {
    setAddingLang(false);
    setEditingLangId(null);
  };

  const handleCreateLang = async () => {
    const code = newLangCode.trim();
    const name = newLangName.trim();
    if (!code || !name || savingAction) return;

    setSavingAction("create-language");
    try {
      await metadataApi.createLanguage(code, name);
      notify.success("Thêm ngôn ngữ thành công");
      cancelLangForm();
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Thêm thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleUpdateLang = async (id: string) => {
    const code = editingLangCode.trim();
    const name = editingLangName.trim();
    if (!code || !name || savingAction) return;

    setSavingAction(`update-language-${id}`);
    try {
      await metadataApi.updateLanguage(id, code, name);
      notify.success("Cập nhật thành công");
      setEditingLangId(null);
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Cập nhật thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleDeleteLang = async (item: Language) => {
    if (!confirm(`Xóa ngôn ngữ "${item.name}"?`) || savingAction) return;
    setSavingAction(`delete-language-${item.id}`);
    try {
      await metadataApi.deleteLanguage(item.id);
      notify.success("Xóa thành công");
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Xóa thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  // Document Sources Actions
  const startAddingSource = () => {
    setAddingSource(true);
    setNewSourceName("");
  };

  const startEditingSource = (item: DocumentSource) => {
    setAddingSource(false);
    setEditingSourceId(item.id);
    setEditingSourceName(item.name);
  };

  const cancelSourceForm = () => {
    setAddingSource(false);
    setEditingSourceId(null);
  };

  const handleCreateSource = async () => {
    const name = newSourceName.trim();
    if (!name || savingAction) return;

    setSavingAction("create-source");
    try {
      await metadataApi.createDocumentSource(name);
      notify.success("Thêm nguồn tài liệu thành công");
      cancelSourceForm();
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Thêm thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleUpdateSource = async (id: string) => {
    const name = editingSourceName.trim();
    if (!name || savingAction) return;

    setSavingAction(`update-source-${id}`);
    try {
      await metadataApi.updateDocumentSource(id, name);
      notify.success("Cập nhật thành công");
      setEditingSourceId(null);
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Cập nhật thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleDeleteSource = async (item: DocumentSource) => {
    if (!confirm(`Xóa nguồn tài liệu "${item.name}"?`) || savingAction) return;
    setSavingAction(`delete-source-${item.id}`);
    try {
      await metadataApi.deleteDocumentSource(item.id);
      notify.success("Xóa thành công");
      await fetchData();
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || "Xóa thất bại.");
    } finally {
      setSavingAction(null);
    }
  };

  return {
    documentTypes,
    languages,
    documentSources,
    loading,
    error,
    savingAction,
    
    // Types
    addingType,
    newTypeName,
    newTypeDesc,
    editingTypeId,
    editingTypeName,
    editingTypeDesc,
    setNewTypeName,
    setNewTypeDesc,
    setEditingTypeName,
    setEditingTypeDesc,
    startAddingType,
    startEditingType,
    cancelTypeForm,
    handleCreateType,
    handleUpdateType,
    handleDeleteType,

    // Langs
    addingLang,
    newLangCode,
    newLangName,
    editingLangId,
    editingLangCode,
    editingLangName,
    setNewLangCode,
    setNewLangName,
    setEditingLangCode,
    setEditingLangName,
    startAddingLang,
    startEditingLang,
    cancelLangForm,
    handleCreateLang,
    handleUpdateLang,
    handleDeleteLang,

    // Sources
    addingSource,
    newSourceName,
    editingSourceId,
    editingSourceName,
    setNewSourceName,
    setEditingSourceName,
    startAddingSource,
    startEditingSource,
    cancelSourceForm,
    handleCreateSource,
    handleUpdateSource,
    handleDeleteSource,

    refresh: fetchData,
  };
}
