"use client";
import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MainCategory, SubCategory } from "@/lib/types/admin";
import { useAdminCategories } from "@/lib/hooks/admin/useAdminCategories";
import { AdminLoading, adminErrorMessage } from "./AdminFeedback";

// Sortable Main Category Card
function SortableMainCategoryCard({
  category,
  onEdit,
  onDelete,
  subCategoriesCount,
}: {
  category: MainCategory;
  onEdit: (c: MainCategory) => void;
  onDelete: (c: MainCategory) => void;
  subCategoriesCount: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group border border-white/10 bg-white/[0.01] rounded-xl p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-neutral-500 hover:text-white transition-colors" title="Drag to reorder">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: category.color }} />
        <div className="flex-1">
          <h3 className="text-base font-medium text-white">{category.name}</h3>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            {subCategoriesCount} sub-{subCategoriesCount === 1 ? 'category' : 'categories'} • Order: {category.sort_order}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(category)} className="px-4 py-2 text-xs border border-white/10 rounded-lg text-neutral-300 hover:bg-white/5 transition-colors">
          Edit
        </button>
        <button onClick={() => onDelete(category)} className="px-4 py-2 text-xs border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
}

// Sortable Sub Category Card
function SortableSubCategoryCard({
  category,
  mainCategoryName,
  onEdit,
  onDelete,
}: {
  category: SubCategory;
  mainCategoryName: string;
  onEdit: (c: SubCategory) => void;
  onDelete: (c: SubCategory) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `sub-${category.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group border border-white/10 bg-white/[0.01] rounded-lg p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-neutral-500 hover:text-white transition-colors" title="Drag to reorder">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
          </svg>
        </button>
        <div className="w-6 h-6 rounded" style={{ backgroundColor: category.color }} />
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{category.name}</p>
          <p className="text-[10px] text-neutral-600 font-mono mt-0.5">
            Under: {mainCategoryName} • Order: {category.sort_order}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(category)} className="px-3 py-1.5 text-xs border border-white/10 rounded-lg text-neutral-300 hover:bg-white/5 transition-colors">
          Edit
        </button>
        <button onClick={() => onDelete(category)} className="px-3 py-1.5 text-xs border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
}

export default function CategoriesTab() {
  const { isLoading, error, mainCategories: loadedMainCategories, subCategories: loadedSubCategories, refreshCategories, checkCategoryDependencies, saveMainCategory, saveSubCategory, deleteCategory, reorderCategories } = useAdminCategories();
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [expandedMainCategories, setExpandedMainCategories] = useState<Set<number>>(new Set());
  
  const [modalMode, setModalMode] = useState<"CREATE_MAIN" | "UPDATE_MAIN" | "DELETE_MAIN" | "CREATE_SUB" | "UPDATE_SUB" | "DELETE_SUB" | null>(null);
  const [activeMainCategory, setActiveMainCategory] = useState<MainCategory | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory | null>(null);
  
  const [name, setName] = useState("");
  const [color, setColor] = useState("#a855f7");
  const [sortOrder, setSortOrder] = useState(0);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(null);
  
  const [processing, setProcessing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMainCategories(loadedMainCategories);
    setSubCategories(loadedSubCategories);
  }, [loadedMainCategories, loadedSubCategories]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dismissModal = () => {
    setModalMode(null);
    setActiveMainCategory(null);
    setActiveSubCategory(null);
    clearForm();
  };

  const clearForm = () => {
    setName("");
    setColor("#a855f7");
    setSortOrder(0);
    setSelectedMainCategoryId(null);
    setDeleteError(null);
  };

  const validateName = (value: string): { valid: boolean; error?: string } => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return { valid: false, error: "Name cannot be empty" };
    if (trimmed.length > 50) return { valid: false, error: "Name must be 50 characters or less" };
    return { valid: true };
  };

  const openModal = (mode: typeof modalMode, mainCat?: MainCategory, subCat?: SubCategory) => {
    if (mode === "UPDATE_MAIN" && mainCat) {
      setActiveMainCategory(mainCat);
      setName(mainCat.name);
      setColor(mainCat.color);
      setSortOrder(mainCat.sort_order);
    } else if (mode === "DELETE_MAIN" && mainCat) {
      setActiveMainCategory(mainCat);
    } else if (mode === "UPDATE_SUB" && subCat) {
      setActiveSubCategory(subCat);
      setName(subCat.name);
      setColor(subCat.color);
      setSortOrder(subCat.sort_order);
      setSelectedMainCategoryId(subCat.main_category_id);
    } else if (mode === "DELETE_SUB" && subCat) {
      setActiveSubCategory(subCat);
    } else if (mode === "CREATE_SUB") {
      // Pre-select first main category if available
      if (mainCategories.length > 0) {
        setSelectedMainCategoryId(mainCategories[0].id);
      }
    } else {
      clearForm();
    }
    setModalMode(mode);
  };

  const handleMainCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateName(name);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    setProcessing(true);
    try {
      if (modalMode === "CREATE_MAIN") {
        await saveMainCategory(undefined, { name: name.trim(), color, sort_order: sortOrder });
      } else if (modalMode === "UPDATE_MAIN" && activeMainCategory) {
        await saveMainCategory(activeMainCategory.id, { name: name.trim(), color, sort_order: sortOrder });
      }
      refreshCategories();
      dismissModal();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save main category");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateName(name);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    if (!selectedMainCategoryId) {
      alert("Please select a main category");
      return;
    }
    
    setProcessing(true);
    try {
      if (modalMode === "CREATE_SUB") {
        await saveSubCategory(undefined, { main_category_id: selectedMainCategoryId, name: name.trim(), color, sort_order: sortOrder });
      } else if (modalMode === "UPDATE_SUB" && activeSubCategory) {
        await saveSubCategory(activeSubCategory.id, { main_category_id: selectedMainCategoryId, name: name.trim(), color, sort_order: sortOrder });
      }
      refreshCategories();
      dismissModal();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save sub-category");
    } finally {
      setProcessing(false);
    }
  };

  const handleMainCategoryDelete = async () => {
    if (!activeMainCategory) return;
    setProcessing(true);
    setDeleteError(null);
    
    try {
      const dependencyCheck = await checkCategoryDependencies("main", activeMainCategory.id);
      if (!dependencyCheck.canDelete) {
        setDeleteError(`${dependencyCheck.reason}. Please delete or reassign ${dependencyCheck.dependentCount} ${dependencyCheck.dependentType} first.`);
        setProcessing(false);
        return;
      }
      
      await deleteCategory("main", activeMainCategory.id);
      refreshCategories();
      dismissModal();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete main category");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubCategoryDelete = async () => {
    if (!activeSubCategory) return;
    setProcessing(true);
    setDeleteError(null);
    
    try {
      const dependencyCheck = await checkCategoryDependencies("sub", activeSubCategory.id);
      if (!dependencyCheck.canDelete) {
        setDeleteError(`${dependencyCheck.reason}. Please reassign ${dependencyCheck.dependentCount} ${dependencyCheck.dependentType} first.`);
        setProcessing(false);
        return;
      }
      
      await deleteCategory("sub", activeSubCategory.id);
      refreshCategories();
      dismissModal();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete sub-category");
    } finally {
      setProcessing(false);
    }
  };

  const handleMainCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = mainCategories.findIndex((c) => c.id === active.id);
    const newIndex = mainCategories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(mainCategories, oldIndex, newIndex);
    const updated = reordered.map((c, i) => ({ ...c, sort_order: i }));
    setMainCategories(updated);

    try {
      await reorderCategories("main", updated);
    } catch (err) {
      console.error("Failed to update sort_order:", err);
      setMainCategories(loadedMainCategories);
    }
  };

  const handleSubCategoryDragEnd = async (event: DragEndEvent, mainCategoryId: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = parseInt(String(active.id).replace('sub-', ''));
    const overId = parseInt(String(over.id).replace('sub-', ''));

    const filtered = subCategories.filter((c) => c.main_category_id === mainCategoryId);
    const oldIndex = filtered.findIndex((c) => c.id === activeId);
    const newIndex = filtered.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filtered, oldIndex, newIndex);
    const updated = reordered.map((c, i) => ({ ...c, sort_order: i }));
    
    const newSubCategories = subCategories.map((c) => {
      if (c.main_category_id === mainCategoryId) {
        const updatedCat = updated.find((u) => u.id === c.id);
        return updatedCat || c;
      }
      return c;
    });
    setSubCategories(newSubCategories);

    try {
      await reorderCategories("sub", updated);
    } catch (err) {
      console.error("Failed to update sort_order:", err);
      setSubCategories(loadedSubCategories);
    }
  };

  if (isLoading) return <AdminLoading label="Loading categories..." />;
  if (error) return <AdminLoading label={adminErrorMessage(error, "Unable to load categories")} />;

  const toggleMainCategory = (id: number) => {
    const newExpanded = new Set(expandedMainCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMainCategories(newExpanded);
  };

  const getSubCategoriesForMain = (mainCategoryId: number) => {
    return subCategories.filter((sub) => sub.main_category_id === mainCategoryId);
  };

  const getSubCategoriesCount = (mainCategoryId: number) => {
    return subCategories.filter((sub) => sub.main_category_id === mainCategoryId).length;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-8 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Manage Categories</h1>
          <p className="text-neutral-500 text-xs mt-1 font-light">Create and organize main categories and sub-categories. Drag to reorder.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openModal("CREATE_SUB")} className="px-5 py-3 border border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-colors">
            Add Sub-Category
          </button>
          <button onClick={() => openModal("CREATE_MAIN")} className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-colors">
            Add Main Category
          </button>
        </div>
      </div>

      {/* Main Categories Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Main Categories
          </h2>
          <span className="text-xs font-mono text-neutral-600">{mainCategories.length} {mainCategories.length === 1 ? 'category' : 'categories'}</span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMainCategoryDragEnd}>
          <SortableContext items={mainCategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {mainCategories.map((category) => (
                <SortableMainCategoryCard
                  key={category.id}
                  category={category}
                  onEdit={(c) => openModal("UPDATE_MAIN", c)}
                  onDelete={(c) => openModal("DELETE_MAIN", c)}
                  subCategoriesCount={getSubCategoriesCount(category.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {mainCategories.length === 0 && (
          <div className="flex items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">No main categories. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Sub Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Sub-Categories
          </h2>
          <span className="text-xs font-mono text-neutral-600">{subCategories.length} {subCategories.length === 1 ? 'sub-category' : 'sub-categories'}</span>
        </div>

        <div className="space-y-4">
          {mainCategories.map((mainCat) => {
            const subs = getSubCategoriesForMain(mainCat.id);
            const isExpanded = expandedMainCategories.has(mainCat.id);
            
            return (
              <div key={mainCat.id} className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.01]">
                <button
                  onClick={() => toggleMainCategory(mainCat.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: mainCat.color }} />
                    <span className="text-sm font-medium text-white">{mainCat.name}</span>
                    <span className="text-xs font-mono text-neutral-600">({subs.length})</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2">
                    {subs.length > 0 ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleSubCategoryDragEnd(e, mainCat.id)}
                      >
                        <SortableContext items={subs.map((s) => `sub-${s.id}`)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-2">
                            {subs.map((sub) => (
                              <SortableSubCategoryCard
                                key={sub.id}
                                category={sub}
                                mainCategoryName={mainCat.name}
                                onEdit={(c) => openModal("UPDATE_SUB", undefined, c)}
                                onDelete={(c) => openModal("DELETE_SUB", undefined, c)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <p className="text-xs text-neutral-600 font-mono text-center py-6">No sub-categories under this main category</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {mainCategories.length === 0 && (
          <div className="flex items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">Create main categories first to add sub-categories</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80" onClick={dismissModal}>
          <div className="w-full max-w-xl bg-[#0f0f11] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={dismissModal} className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">&times;</button>

            {(modalMode === "DELETE_MAIN" || modalMode === "DELETE_SUB") ? (
              <div>
                <h3 className="text-2xl font-light tracking-tight text-white mb-2">
                  Delete {modalMode === "DELETE_MAIN" ? "Main Category" : "Sub-Category"}
                </h3>
                <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
                  Are you sure you want to delete <span className="text-white font-medium">{modalMode === "DELETE_MAIN" ? activeMainCategory?.name : activeSubCategory?.name}</span>? This action cannot be undone.
                </p>
                {deleteError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-xs font-medium">{deleteError}</p>
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={dismissModal} className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button onClick={modalMode === "DELETE_MAIN" ? handleMainCategoryDelete : handleSubCategoryDelete} disabled={processing} className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:bg-neutral-800 transition-colors">
                    {processing ? "Checking..." : "Confirm Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-light tracking-tight text-white mb-6">
                  {modalMode === "CREATE_MAIN" && "Create Main Category"}
                  {modalMode === "UPDATE_MAIN" && "Edit Main Category"}
                  {modalMode === "CREATE_SUB" && "Create Sub-Category"}
                  {modalMode === "UPDATE_SUB" && "Edit Sub-Category"}
                </h3>
                <form onSubmit={(modalMode === "CREATE_MAIN" || modalMode === "UPDATE_MAIN") ? handleMainCategorySubmit : handleSubCategorySubmit} className="space-y-4">
                  {(modalMode === "CREATE_SUB" || modalMode === "UPDATE_SUB") && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Main Category</label>
                      <select value={selectedMainCategoryId || ""} onChange={(e) => setSelectedMainCategoryId(parseInt(e.target.value))} required className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors">
                        <option value="">Select Main Category</option>
                        {mainCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Category Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={50}
                      placeholder="Enter category name (max 50 characters)"
                      className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600"
                    />
                    <p className="mt-1 text-[10px] text-neutral-600 font-mono">{name.trim().length}/50 characters</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer p-0 rounded" />
                        <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-purple-500 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Sort Order</label>
                      <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} min={0} className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-white/5 mt-6">
                    <button type="button" onClick={dismissModal} className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={processing} className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:bg-neutral-800 transition-colors">
                      {processing ? "Saving..." : modalMode?.startsWith("CREATE") ? "Create" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
