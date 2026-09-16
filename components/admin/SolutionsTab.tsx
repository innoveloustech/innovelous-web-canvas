"use client";
import React, { useState, useMemo } from "react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Solution, SolutionFormData } from "@/lib/types/solutions";
import { useAdminSolutions } from "@/lib/hooks/admin/useAdminSolutions";
import { AdminLoading, AdminError, adminErrorMessage } from "./AdminFeedback";

function SortableSolutionCard({
  solution,
  onEdit,
  onDelete,
}: {
  solution: Solution;
  onEdit: (s: Solution) => void;
  onDelete: (s: Solution) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: solution.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.03] transition-colors">
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-white mb-1">{solution.title.replace(/\n/g, ' ')}</h3>
            <span className="text-xs font-mono text-white/50">{solution.slug} • {solution.category}</span>
          </div>
          <button {...attributes} {...listeners} className="text-white/30 hover:text-white/70 cursor-grab active:cursor-grabbing p-1" aria-label="Drag handle">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
          </button>
        </div>
        <p className="text-sm text-white/60 mb-6 line-clamp-2">{solution.description}</p>
      </div>

      <div className="flex justify-end gap-3 mt-4 border-t border-white/10 pt-4">
        <button onClick={() => onEdit(solution)} className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">Edit</button>
        <button onClick={() => { if(confirm('Are you sure you want to delete this solution?')) onDelete(solution); }} className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 hover:text-red-300 rounded-lg transition-colors border border-red-400/10">Delete</button>
      </div>
    </div>
  );
}

export default function SolutionsTab() {
  const { solutions, isLoading, error, refetch, createSolution, updateSolution, deleteSolution, reorderSolutions } = useAdminSolutions();
  const [isEditing, setIsEditing] = useState(false);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const [formData, setFormData] = useState<SolutionFormData>({
    slug: "",
    label: "",
    category: "",
    title: "",
    description: "",
    stats: [],
    features: [],
    cta_text: "",
    order: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const displaySolutions = useMemo(() => {
    if (!solutions) return [];
    const sorted = [...solutions].sort((a, b) => a.order - b.order);
    if (!localOrder) return sorted;
    const map = new Map(sorted.map((s) => [s.id, s]));
    const ordered: Solution[] = [];
    for (const id of localOrder) {
      const s = map.get(id);
      if (s) ordered.push(s);
    }
    for (const s of sorted) {
      if (!localOrder.includes(s.id)) ordered.push(s);
    }
    return ordered;
  }, [solutions, localOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const currentIds = displaySolutions.map((s) => s.id);
      const oldIndex = currentIds.indexOf(String(active.id));
      const newIndex = currentIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const newIds = arrayMove(currentIds, oldIndex, newIndex);
        setLocalOrder(newIds);
        void reorderSolutions(newIds);
      }
    }
  };

  if (isLoading && !solutions) return <AdminLoading label="Loading solutions..." />;
  if (error && !solutions) {
    return (
      <AdminError
        message={adminErrorMessage(error, "Failed to load solutions.")}
        onRetry={() => void refetch()}
      />
    );
  }

  const handleEdit = (solution: Solution) => {
    setEditingSolution(solution);
    setFormData({
      slug: solution.slug,
      label: solution.label,
      category: solution.category,
      title: solution.title,
      description: solution.description,
      stats: [...solution.stats],
      features: [...solution.features],
      cta_text: solution.cta_text,
      order: solution.order,
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setEditingSolution(null);
    setFormData({
      slug: "",
      label: "",
      category: "",
      title: "",
      description: "",
      stats: [],
      features: [],
      cta_text: "",
      order: displaySolutions.length,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSolution) {
        await updateSolution(editingSolution.id, formData);
      } else {
        await createSolution(formData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save solution:", error);
      alert("Failed to save solution. See console for details.");
    }
  };

  const addStat = () => setFormData({ ...formData, stats: [...formData.stats, { value: "", label: "" }] });
  const updateStat = (index: number, field: "value" | "label", val: string) => {
    const newStats = [...formData.stats];
    newStats[index][field] = val;
    setFormData({ ...formData, stats: newStats });
  };
  const removeStat = (index: number) => setFormData({ ...formData, stats: formData.stats.filter((_, i) => i !== index) });

  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ""] });
  const updateFeature = (index: number, val: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = val;
    setFormData({ ...formData, features: newFeatures });
  };
  const removeFeature = (index: number) => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-light text-white mb-1">Solutions</h2>
          <p className="text-sm text-white/50">Manage dynamic solutions pages and content.</p>
        </div>
        {!isEditing && (
          <button onClick={handleAddNew} className="px-5 py-2.5 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors">
            Add Solution
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Slug (URL Path)</label>
              <input required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="e.g., hardware" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Category (e.g., Hardware & IoT Solutions)</label>
              <input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Label (e.g., 01 // HARDWARE)</label>
              <input required value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">CTA Button Text</label>
              <input required value={formData.cta_text} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="e.g., Deploy Hardware" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-2">Title (Supports \n for line breaks)</label>
              <textarea required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors min-h-[100px]" placeholder="Physical\nInfrastructure." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
              <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors min-h-[120px]" />
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Stats</h3>
              <button type="button" onClick={addStat} className="text-sm px-3 py-1.5 border border-white/20 rounded hover:bg-white/10 transition-colors text-white">+ Add Stat</button>
            </div>
            <div className="space-y-4">
              {formData.stats.map((stat, i) => (
                <div key={i} className="flex gap-4 items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <input required value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="Value (e.g. <5ms)" className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                  <input required value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Label (e.g. Latency)" className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                  <button type="button" onClick={() => removeStat(i)} className="text-red-400 hover:text-red-300 p-2">✕</button>
                </div>
              ))}
              {formData.stats.length === 0 && <p className="text-white/40 text-sm italic">No stats added yet.</p>}
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Features / Capabilities</h3>
              <button type="button" onClick={addFeature} className="text-sm px-3 py-1.5 border border-white/20 rounded hover:bg-white/10 transition-colors text-white">+ Add Feature</button>
            </div>
            <div className="space-y-4">
              {formData.features.map((feature, i) => (
                <div key={i} className="flex gap-4 items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <input required value={feature} onChange={(e) => updateFeature(i, e.target.value)} placeholder="Feature description..." className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                  <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300 p-2">✕</button>
                </div>
              ))}
              {formData.features.length === 0 && <p className="text-white/40 text-sm italic">No features added yet.</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-white/10 pt-8 mt-8">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 font-medium text-white/70 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors">{editingSolution ? "Save Changes" : "Create Solution"}</button>
          </div>
        </form>
      ) : displaySolutions.length === 0 ? (
        <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/[0.01]">
          <h3 className="text-xl font-medium text-white mb-2">No solutions yet</h3>
          <p className="text-white/50 mb-6 max-w-sm mx-auto">Create your first solution to display it on the website.</p>
          <button onClick={handleAddNew} className="px-5 py-2.5 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors">Create Solution</button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displaySolutions.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displaySolutions.map((solution) => (
                <SortableSolutionCard key={solution.id} solution={solution} onEdit={handleEdit} onDelete={(s) => deleteSolution(s.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
