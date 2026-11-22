'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Trash2,
  Plus,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Tag,
  Percent,
  Sparkles,
  ExternalLink,
  Layers,
  FileText,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { FirestoreProduct, ProductPackOption, ProductImage } from '@/types/firestore/product';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductEditorProps {
  productId?: string; // If provided, mode is 'edit'; else 'create'
}

export default function ProductEditor({ productId }: ProductEditorProps) {
  const router = useRouter();
  const isEditMode = Boolean(productId);

  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Dirty State & Discard Modal
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const initialSnapshotRef = useRef<string>('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [categoryId, setCategoryId] = useState('gut-wellness');
  const [baseSku, setBaseSku] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [netWeightGrams, setNetWeightGrams] = useState(200);
  const [servingSize, setServingSize] = useState('');
  const [hsnCode, setHsnCode] = useState('2106 90 99');
  const [gstRateBasisPoints, setGstRateBasisPoints] = useState(1800);

  // Pack Options State (Rupees for intuitive editing, converted to Paise on submit)
  const [packOptions, setPackOptions] = useState<
    Array<{
      id: string;
      name: string;
      subtitle: string;
      packQuantity: number;
      servings: number;
      durationMonths: number;
      totalWeightGrams: number;
      sellingPriceRupees: number;
      mrpRupees: number;
      badge: string;
      isPopular: boolean;
      isActive: boolean;
    }>
  >([]);

  // Images State
  const [images, setImages] = useState<ProductImage[]>([]);

  // Content State
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [storageInstructions, setStorageInstructions] = useState(
    'Store in a cool, dry place away from direct sunlight.'
  );
  const [safetyInformation, setSafetyInformation] = useState<string[]>([
    'Consult your physician before use if pregnant, nursing, or have a medical condition.',
  ]);

  // Load Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/v1/admin/categories');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(
            json.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug || c.id,
            }))
          );
        } else {
          setCategories([
            { id: 'gut-wellness', name: 'Gut Wellness Nutraceuticals', slug: 'gut-wellness' },
            { id: 'daily-rituals', name: 'Daily Rituals & Accessories', slug: 'daily-rituals' },
          ]);
        }
      } catch {
        setCategories([
          { id: 'gut-wellness', name: 'Gut Wellness Nutraceuticals', slug: 'gut-wellness' },
          { id: 'daily-rituals', name: 'Daily Rituals & Accessories', slug: 'daily-rituals' },
        ]);
      }
    }
    loadCategories();
  }, []);

  // Compute a snapshot string of all editable state to accurately detect dirty changes
  const computeStateSnapshot = useCallback(() => {
    return JSON.stringify({
      name,
      slug,
      tagline,
      categoryId,
      baseSku,
      status,
      isFeatured,
      netWeightGrams,
      servingSize,
      hsnCode,
      gstRateBasisPoints,
      packOptions,
      images,
      shortDescription,
      fullDescription,
      highlights,
      storageInstructions,
      safetyInformation,
    });
  }, [
    name,
    slug,
    tagline,
    categoryId,
    baseSku,
    status,
    isFeatured,
    netWeightGrams,
    servingSize,
    hsnCode,
    gstRateBasisPoints,
    packOptions,
    images,
    shortDescription,
    fullDescription,
    highlights,
    storageInstructions,
    safetyInformation,
  ]);

  // Load Existing Product if Edit Mode
  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        // Initialize defaults for create mode (100% clean & blank)
        setName('');
        setSlug('');
        setTagline('');
        setCategoryId('gut-wellness');
        setBaseSku('');
        setStatus('active');
        setIsFeatured(false);
        setNetWeightGrams(200);
        setServingSize('');
        setHsnCode('2106 90 99');
        setGstRateBasisPoints(1800);
        setPackOptions([]);
        setImages([]);
        setShortDescription('');
        setFullDescription('');
        setHighlights(['']);
        setStorageInstructions('Store in a cool, dry place away from direct sunlight.');
        setSafetyInformation([
          'Consult your physician before use if pregnant, nursing, or have a medical condition.',
        ]);

        // Snapshot initial creation state after render tick
        setTimeout(() => {
          initialSnapshotRef.current = JSON.stringify({
            name: '',
            slug: '',
            tagline: '',
            categoryId: 'gut-wellness',
            baseSku: '',
            status: 'active',
            isFeatured: false,
            netWeightGrams: 200,
            servingSize: '',
            hsnCode: '2106 90 99',
            gstRateBasisPoints: 1800,
            packOptions: [],
            images: [],
            shortDescription: '',
            fullDescription: '',
            highlights: [''],
            storageInstructions: 'Store in a cool, dry place away from direct sunlight.',
            safetyInformation: [
              'Consult your physician before use if pregnant, nursing, or have a medical condition.',
            ],
          });
          setIsDirty(false);
          setLoading(false);
        }, 50);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/admin/products/${productId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch product');
        }

        const p: FirestoreProduct = json.data;
        setName(p.name || (p as any).title || '');
        setSlug(p.slug || p.id || '');
        setTagline(p.tagline || '');
        setCategoryId(p.category?.id || 'gut-wellness');
        setBaseSku(p.baseSku || (p as any).basePhysicalSku || '');
        setStatus(p.status || 'active');
        setIsFeatured(Boolean(p.isFeatured));
        setNetWeightGrams(p.netWeightGrams || 200);
        setServingSize(p.servingSize || '');
        setHsnCode(p.hsnCode || '2106 90 99');
        setGstRateBasisPoints(p.gstRateBasisPoints || 1800);

        const loadedPacks = Array.isArray(p.packOptions) && p.packOptions.length > 0
          ? p.packOptions.map((opt) => ({
              id: opt.id,
              name: opt.name,
              subtitle: opt.subtitle || `${opt.servings || opt.packQuantity * 30} Daily Servings`,
              packQuantity: opt.packQuantity || (opt as any).unitCount || 1,
              servings: opt.servings || opt.packQuantity * 30,
              durationMonths: opt.durationMonths || opt.packQuantity || 1,
              totalWeightGrams: opt.totalWeightGrams || opt.packQuantity * (p.netWeightGrams || 200),
              sellingPriceRupees: Math.round(opt.sellingPriceInPaise / 100),
              mrpRupees: Math.round(opt.mrpInPaise / 100),
              badge: opt.badge || '',
              isPopular: Boolean(opt.isPopular),
              isActive: opt.isActive !== false,
            }))
          : [];
        setPackOptions(loadedPacks);

        const loadedImgs = Array.isArray(p.images) && p.images.length > 0
          ? p.images.map((img: any, idx: number) => ({
              id: img.id || `img-${idx + 1}`,
              src: img.src || img.url || '',
              alt: img.alt || img.altText || p.name,
              label: img.label || `Photo ${idx + 1}`,
              isPrimary: Boolean(img.isPrimary || idx === 0),
              displayOrder: img.displayOrder || idx + 1,
            }))
          : [];
        setImages(loadedImgs);

        setShortDescription(p.shortDescription || '');
        setFullDescription(p.fullDescription || '');
        const loadedHighlights = Array.isArray(p.highlights) && p.highlights.length > 0
          ? p.highlights
          : ['Formulated with bio-fermented botanicals'];
        setHighlights(loadedHighlights);
        setStorageInstructions(
          p.storageInstructions || 'Store in a cool, dry place away from direct sunlight.'
        );
        const loadedSafety = Array.isArray(p.safetyInformation) && p.safetyInformation.length > 0
          ? p.safetyInformation
          : ['Consult your physician before use if pregnant or nursing.'];
        setSafetyInformation(loadedSafety);

        // Store pristine snapshot
        setTimeout(() => {
          initialSnapshotRef.current = JSON.stringify({
            name: p.name || (p as any).title || '',
            slug: p.slug || p.id || '',
            tagline: p.tagline || '',
            categoryId: p.category?.id || 'gut-wellness',
            baseSku: p.baseSku || (p as any).basePhysicalSku || 'GG-DWF-200G',
            status: p.status || 'active',
            isFeatured: Boolean(p.isFeatured),
            netWeightGrams: p.netWeightGrams || 200,
            servingSize: p.servingSize || '1 Scoop (~6.5g) daily with water',
            hsnCode: p.hsnCode || '2106 90 99',
            gstRateBasisPoints: p.gstRateBasisPoints || 1800,
            packOptions: loadedPacks,
            images: loadedImgs,
            shortDescription: p.shortDescription || '',
            fullDescription: p.fullDescription || '',
            highlights: loadedHighlights,
            storageInstructions:
              p.storageInstructions || 'Store in a cool, dry place away from direct sunlight.',
            safetyInformation: loadedSafety,
          });
          setIsDirty(false);
          setLoading(false);
        }, 50);
      } catch (err: any) {
        setError(err.message || 'Error loading product');
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  // Check dirty state on every state change
  useEffect(() => {
    if (loading || !initialSnapshotRef.current) return;
    const currentSnapshot = computeStateSnapshot();
    const hasChanged = currentSnapshot !== initialSnapshotRef.current;
    setIsDirty(hasChanged);
  }, [computeStateSnapshot, loading]);

  // Browser leave protection (tab close, page refresh, external link)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Back Navigation Guard (checks for unsaved changes)
  const handleBackWithGuard = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      router.push('/admin/products');
    }
  };

  // Discard all changes
  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    setIsDirty(false);
    router.push('/admin/products');
  };

  // Auto-slugify when typing name in Create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  // Pack Option handlers
  const handleAddPackOption = () => {
    const nextUnits = packOptions.length + 1;
    const newOption = {
      id: `pack-${nextUnits}-${Date.now().toString(36)}`,
      name: nextUnits === 1 ? '1-Month Supply' : `${nextUnits}-Month Supply`,
      subtitle: `${nextUnits * 30} Daily Servings`,
      packQuantity: nextUnits,
      servings: nextUnits * 30,
      durationMonths: nextUnits,
      totalWeightGrams: nextUnits * (Number(netWeightGrams) || 200),
      sellingPriceRupees: 0,
      mrpRupees: 0,
      badge: nextUnits === 2 ? 'Most Popular' : nextUnits >= 3 ? 'Best Value' : '',
      isPopular: nextUnits === 2,
      isActive: true,
    };
    setPackOptions([...packOptions, newOption]);
  };

  const handleRemovePackOption = (index: number) => {
    setPackOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePackOption = (index: number, field: string, value: any) => {
    setPackOptions((prev) =>
      prev.map((opt, i) => {
        if (i !== index) return opt;
        const updated = { ...opt, [field]: value };
        if (field === 'packQuantity') {
          const qty = Number(value) || 1;
          updated.servings = qty * 30;
          updated.durationMonths = qty;
          updated.totalWeightGrams = qty * netWeightGrams;
        }
        return updated;
      })
    );
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (droppedFiles.length > 0) {
        handleFileUpload(droppedFiles);
      }
    }
  };

  // Image Upload Handler (Supports single or multiple files)
  const handleFileUpload = async (filesOrEvent: React.ChangeEvent<HTMLInputElement> | File[]) => {
    let files: File[] = [];
    if (Array.isArray(filesOrEvent)) {
      files = filesOrEvent;
    } else if (filesOrEvent?.target?.files) {
      files = Array.from(filesOrEvent.target.files);
      filesOrEvent.target.value = '';
    }
    if (files.length === 0) return;

    setUploadingImage(true);
    setUploadingCount(files.length);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('folder', 'products');

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload image file(s)');
      }

      const uploadedList: Array<{ url: string; name: string }> =
        Array.isArray(json.data?.files) && json.data.files.length > 0
          ? json.data.files
          : json.data?.url
          ? [{ url: json.data.url, name: files[0]?.name || 'Product Photo' }]
          : [];

      setImages((prev) => {
        const newImages: ProductImage[] = uploadedList.map((item, idx) => ({
          id: `img-${Date.now().toString(36)}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          src: item.url,
          alt: item.name?.split('.')[0] || name || 'Product Photo',
          label: item.name?.split('.')[0] || `Photo ${prev.length + idx + 1}`,
          isPrimary: prev.length === 0 && idx === 0,
          displayOrder: prev.length + idx + 1,
        }));
        return [...prev, ...newImages];
      });
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setUploadingImage(false);
      setUploadingCount(0);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  // Highlights handlers
  const handleAddHighlight = () => setHighlights([...highlights, '']);
  const handleRemoveHighlight = (i: number) =>
    setHighlights(highlights.filter((_, idx) => idx !== i));
  const updateHighlight = (i: number, val: string) => {
    const copy = [...highlights];
    copy[i] = val;
    setHighlights(copy);
  };

  // Submit Handler
  const handleSave = async (andExit = false) => {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Product Title is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!slug.trim()) {
      setError('Product Slug is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (packOptions.length === 0) {
      setError('At least one commercial pack option is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (images.length === 0) {
      setError('At least one product image is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId) || {
      id: categoryId,
      name:
        categoryId === 'gut-wellness'
          ? 'Gut Wellness Nutraceuticals'
          : 'Daily Rituals & Accessories',
      slug: categoryId,
    };

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      tagline: tagline.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim() || shortDescription.trim(),
      category: {
        id: selectedCategory.id,
        name: selectedCategory.name,
        slug: selectedCategory.slug,
      },
      status,
      isFeatured,
      servingSize: servingSize.trim(),
      baseSku: baseSku.trim() || (slug ? `GG-${slug.toUpperCase().slice(0, 10)}` : 'GG-PROD'),
      netWeightGrams: Number(netWeightGrams) || 200,
      hsnCode: hsnCode.trim() || '2106 90 99',
      gstRateBasisPoints: Number(gstRateBasisPoints) || 1800,
      packOptions: packOptions.map((opt) => ({
        id: opt.id,
        name: opt.name,
        subtitle: opt.subtitle,
        packQuantity: Number(opt.packQuantity) || 1,
        servings: Number(opt.servings) || Number(opt.packQuantity) * 30,
        durationMonths: Number(opt.durationMonths) || Number(opt.packQuantity) || 1,
        totalWeightGrams:
          Number(opt.totalWeightGrams) ||
          Number(opt.packQuantity) * (Number(netWeightGrams) || 200),
        sellingPriceInPaise: Math.round(Number(opt.sellingPriceRupees) * 100),
        mrpInPaise: Math.round(Number(opt.mrpRupees) * 100),
        compareAtPriceInPaise: Math.round(Number(opt.mrpRupees) * 100),
        badge: opt.badge?.trim() || undefined,
        isPopular: Boolean(opt.isPopular),
        isActive: Boolean(opt.isActive),
      })),
      images: images.map((img, idx) => ({
        id: img.id || `img-${idx + 1}`,
        src: img.src,
        alt: img.alt || name,
        label: img.label || `Image ${idx + 1}`,
        isPrimary: Boolean(img.isPrimary),
        displayOrder: idx + 1,
      })),
      highlights: highlights.filter((h) => h.trim().length > 0),
      storageInstructions: storageInstructions.trim(),
      safetyInformation: safetyInformation.filter((s) => s.trim().length > 0),
      seo: {
        metaTitle: `${name.trim()} | GutGlow India`,
        metaDescription: shortDescription.slice(0, 155),
        keywords: ['gut health', 'wellness', 'nutraceuticals', 'ayurveda'],
      },
    };

    setIsSaving(true);
    try {
      let res: Response;
      if (isEditMode) {
        res = await fetch(`/api/v1/admin/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/v1/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save product');
      }

      // Reset dirty state to current state
      initialSnapshotRef.current = computeStateSnapshot();
      setIsDirty(false);

      if (andExit) {
        router.push('/admin/products');
      } else {
        setSuccessToast(
          isEditMode ? 'Product updated successfully.' : 'New product created successfully!'
        );
        setTimeout(() => setSuccessToast(null), 4000);
        if (!isEditMode && json.data?.id) {
          router.replace(`/admin/products/${json.data.id}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving product.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-[#70675E] space-y-3 max-w-7xl mx-auto">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-[#210D15]" />
        <p className="font-medium text-[#210D15]">Loading product details from catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* SHOPIFY-STYLE STICKY UNSAVED CHANGES BAR */}
      {isDirty && (
        <div className="sticky top-0 z-40 bg-[#210D15] text-[#FAF8F5] px-4 sm:px-6 py-3 rounded-lg shadow-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-200 border border-[#3D1A27]">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="p-1 bg-[#FDE047] text-[#854D0E] rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="font-semibold text-[#FAF8F5]">Unsaved changes</span>
              <span className="hidden sm:inline text-[#D5CCC1] ml-2 text-[11px]">
                You have unsaved edits on this formulation.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDiscardModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-[#FAF8F5] hover:bg-[#3D1A27] rounded transition"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-4 py-1.5 bg-[#FAF8F5] text-[#210D15] font-semibold text-xs rounded hover:bg-[#FFFFFF] transition shadow-xs disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ECE6DE]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackWithGuard}
            className="p-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FFFFFF] hover:text-[#210D15] transition"
            title="Back to Product Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-serif text-[#210D15] font-bold tracking-tight">
                {isEditMode ? name || 'Edit Product' : 'Add New Product'}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                  status === 'active'
                    ? 'bg-[#DCFCE7] text-[#166534]'
                    : status === 'draft'
                    ? 'bg-[#FEF3C7] text-[#92400E]'
                    : 'bg-[#F3F4F6] text-[#4B5563]'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-[#70675E] mt-0.5">
              {isEditMode
                ? `SKU: ${baseSku} • Slug: /${slug}`
                : 'Configure formulation specifications, commercial packs, and statutory taxation.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackWithGuard}
            className="px-4 py-2 border border-[#D5CCC1] text-[#554E46] text-xs font-medium rounded-md hover:bg-[#FFFFFF] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#3D1A27] transition shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Save Changes' : 'Create & Publish'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3 bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] rounded-md text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-COLUMN SHOPIFY-STYLE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: MAIN CONTENT & SPECIFICATIONS (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD 1: TITLE & BASIC DETAILS */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#210D15] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#70675E]" />
              <span>Product Title & Formulation Summary</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. GutGlow Daily Wellness Formula"
                  className="w-full px-3.5 py-2.5 border border-[#D5CCC1] rounded-md text-sm text-[#2D2A26] font-medium focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    Storefront URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 bg-[#FAF8F5] border border-r-0 border-[#D5CCC1] rounded-l-md text-xs text-[#70675E] font-mono">
                      /
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      disabled={isEditMode}
                      onChange={(e) =>
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                      }
                      placeholder="e.g. daily-bloat-relief"
                      className="w-full px-3 py-2 border border-[#D5CCC1] rounded-r-md text-xs font-mono text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15] disabled:bg-[#FAF8F5]"
                    />
                  </div>
                  {isEditMode && (
                    <p className="text-[10px] text-[#8C827A] mt-0.5">
                      Slug is immutable to prevent broken customer URLs and bookmarks.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    Tagline / Sub-Heading
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Daily botanical blend for digestive vitality"
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  Short Description (Storefront Preview & Meta Snippet) *
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g. High-fiber gut nourishment blend for bloating relief and microbiome balance..."
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  Full Description & Story *
                </label>
                <textarea
                  rows={4}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Detailed formulation story, clinical citations, and efficacy profile..."
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: MEDIA & GALLERY */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#ECE6DE]">
              <div>
                <h2 className="text-sm font-bold text-[#210D15] uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#70675E]" />
                  <span>Product Imagery & Media Gallery</span>
                </h2>
                <p className="text-[11px] text-[#70675E]">
                  Upload high-resolution product photos (PNG, WebP, JPEG). Select multiple images at once.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#210D15] text-[#FAF8F5] rounded-md text-xs font-medium hover:bg-[#3D1A27] transition cursor-pointer shadow-xs disabled:opacity-50">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadingImage
                      ? uploadingCount > 1
                        ? `Uploading ${uploadingCount} images...`
                        : 'Uploading image...'
                      : 'Upload Images'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {images.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition flex flex-col items-center justify-center space-y-3 ${
                  isDraggingOver
                    ? 'border-[#210D15] bg-[#FAF8F5]'
                    : 'border-[#D5CCC1] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#EBE4DC] flex items-center justify-center text-[#70675E]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-xs font-semibold text-[#210D15]">
                    {isDraggingOver ? 'Drop images here' : 'No media uploaded yet'}
                  </p>
                  <p className="text-[11px] text-[#70675E]">
                    Drag & drop product photos here, or click below to select multiple images (PNG, WebP, JPEG). The first uploaded image will automatically become your primary storefront thumbnail.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#210D15] text-[#FAF8F5] rounded-md text-xs font-medium hover:bg-[#3D1A27] transition cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingImage
                        ? uploadingCount > 1
                          ? `Uploading ${uploadingCount} images...`
                          : 'Uploading image...'
                        : 'Upload Images'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className={`p-3 bg-[#FAF8F5] border rounded-lg space-y-2 relative ${
                      img.isPrimary ? 'border-[#210D15] ring-1 ring-[#210D15]' : 'border-[#ECE6DE]'
                    }`}
                  >
                    <div className="w-full h-36 bg-[#FFFFFF] rounded border border-[#ECE6DE] overflow-hidden flex items-center justify-center relative">
                      {img.src ? (
                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-[#C5BDB5]" />
                      )}
                      {img.isPrimary && (
                        <span className="absolute top-2 left-2 bg-[#210D15] text-[#FAF8F5] text-[9px] font-bold px-2 py-0.5 rounded shadow">
                          PRIMARY
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] text-[#70675E] font-medium block">
                        Image Label
                      </label>
                      <input
                        type="text"
                        value={img.label}
                        onChange={(e) => {
                          const copy = [...images];
                          copy[idx].label = e.target.value;
                          setImages(copy);
                        }}
                        placeholder="e.g. Front View, Packaging, Ritual"
                        className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#ECE6DE]/80">
                      {!img.isPrimary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="text-[10px] font-semibold text-[#210D15] hover:underline"
                        >
                          Set as Primary
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#15803D] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Main Store Thumbnail
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-[#991B1B] hover:text-[#DC2626] p-1 rounded hover:bg-[#FEE2E2]/50 transition"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 3: PRICING & COMMERCIAL PACK TIERS */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE6DE]">
              <div>
                <h2 className="text-sm font-bold text-[#210D15] uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#70675E]" />
                  <span>Commercial Pack Options & Pricing</span>
                </h2>
                <p className="text-[11px] text-[#70675E]">
                  Packs draw from the single physical warehouse inventory pool using unit multipliers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddPackOption}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#D5CCC1] text-[#210D15] rounded-md text-xs font-medium hover:bg-[#EBE4DC] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pack Option</span>
              </button>
            </div>

            {packOptions.length === 0 ? (
              <div className="border-2 border-dashed border-[#D5CCC1] rounded-xl p-6 text-center bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#EBE4DC] flex items-center justify-center text-[#70675E]">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#210D15]">No commercial pack options configured</p>
                  <p className="text-[11px] text-[#70675E]">
                    Add at least one pack tier (e.g. Single Pack, 1-Month Supply, or Bulk Bundle) with selling price.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPackOption}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#210D15] text-[#FAF8F5] rounded-md text-xs font-medium hover:bg-[#3D1A27] transition shadow-xs mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Pack Option</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {packOptions.map((opt, idx) => {
                  const discountPercent =
                    opt.mrpRupees > opt.sellingPriceRupees
                      ? Math.round(((opt.mrpRupees - opt.sellingPriceRupees) / opt.mrpRupees) * 100)
                      : 0;

                  return (
                    <div
                      key={opt.id || idx}
                      className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] rounded-lg space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#210D15] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#210D15] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          Pack Option: {opt.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePackOption(idx)}
                          className="text-[#991B1B] hover:text-[#DC2626] p-1 rounded transition"
                          title="Remove Pack"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                            Pack Display Name *
                          </label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updatePackOption(idx, 'name', e.target.value)}
                            placeholder="e.g. 1-Month Supply"
                            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-xs text-[#2D2A26] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                            Physical Units *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={opt.packQuantity}
                            onChange={(e) =>
                              updatePackOption(idx, 'packQuantity', parseInt(e.target.value, 10) || 1)
                            }
                            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-xs text-[#2D2A26] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                            Selling Price (₹ GST-Inc) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={opt.sellingPriceRupees}
                            onChange={(e) =>
                              updatePackOption(
                                idx,
                                'sellingPriceRupees',
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-xs text-[#15803D] font-bold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                            Printed MRP (₹) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={opt.mrpRupees}
                            onChange={(e) =>
                              updatePackOption(idx, 'mrpRupees', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-xs text-[#2D2A26] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                            Subtitle / Daily Servings
                          </label>
                          <input
                            type="text"
                            value={opt.subtitle}
                            onChange={(e) => updatePackOption(idx, 'subtitle', e.target.value)}
                            placeholder="e.g. 30 Daily Servings"
                            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-xs text-[#2D2A26] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                            Promo Badge (Optional)
                          </label>
                          <input
                            type="text"
                            value={opt.badge}
                            onChange={(e) => updatePackOption(idx, 'badge', e.target.value)}
                            placeholder="e.g. Most Popular / Best Value"
                            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-xs text-[#2D2A26] focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={opt.isPopular}
                              onChange={(e) => updatePackOption(idx, 'isPopular', e.target.checked)}
                              className="rounded border-[#D5CCC1] text-[#210D15]"
                            />
                            <span>Highlight as Featured</span>
                          </label>
                          {discountPercent > 0 && (
                            <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#166534] font-bold text-[10px] rounded">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CARD 4: TAX & STATUTORY INVOICING */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#210D15] uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#70675E]" />
              <span>Taxation & Statutory Invoicing (GST Compliance)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  HSN Code (Dietary Preparations / Botanicals) *
                </label>
                <input
                  type="text"
                  required
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  placeholder="2106 90 99"
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs font-mono text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  GST Rate *
                </label>
                <select
                  value={gstRateBasisPoints}
                  onChange={(e) => setGstRateBasisPoints(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                >
                  <option value={1800}>18.00% GST (1800 basis points - Standard)</option>
                  <option value={1200}>12.00% GST (1200 basis points)</option>
                  <option value={500}>5.00% GST (500 basis points)</option>
                  <option value={0}>0.00% GST (Exempt)</option>
                </select>
              </div>
            </div>

            {/* Live Statutory Tax Breakdown Preview */}
            <div className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] rounded-lg space-y-2">
              <span className="text-xs font-bold text-[#210D15] uppercase tracking-wider block">
                Live GST Calculation Preview (Based on 1st Pack Tier)
              </span>
              {packOptions[0] && packOptions[0].sellingPriceRupees > 0 ? (
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2 bg-[#FFFFFF] border border-[#ECE6DE] rounded">
                    <span className="text-[10px] text-[#70675E] block">Retail Selling Price</span>
                    <span className="font-bold text-[#210D15]">
                      ₹{packOptions[0].sellingPriceRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2 bg-[#FFFFFF] border border-[#ECE6DE] rounded">
                    <span className="text-[10px] text-[#70675E] block">Taxable Base Price</span>
                    <span className="font-bold text-[#210D15]">
                      ₹{(
                        (packOptions[0].sellingPriceRupees * 10000) /
                        (10000 + gstRateBasisPoints)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2 bg-[#FFFFFF] border border-[#ECE6DE] rounded">
                    <span className="text-[10px] text-[#70675E] block">
                      GST ({gstRateBasisPoints / 100}%)
                    </span>
                    <span className="font-bold text-[#15803D]">
                      ₹{(
                        packOptions[0].sellingPriceRupees -
                        (packOptions[0].sellingPriceRupees * 10000) / (10000 + gstRateBasisPoints)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-[#8C827A] italic py-1">
                  Add a commercial pack option with retail selling price above to see live GST calculations.
                </p>
              )}
            </div>
          </div>

          {/* CARD 5: FORMULATION HIGHLIGHTS & ADVISORY */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE6DE]">
              <h2 className="text-sm font-bold text-[#210D15] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#70675E]" />
                <span>Highlights & Customer Advisory</span>
              </h2>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="text-xs font-medium text-[#210D15] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bullet Highlight
              </button>
            </div>

            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => updateHighlight(i, e.target.value)}
                    placeholder="e.g. 12 Bio-fermented botanicals"
                    className="flex-1 px-3 py-1.5 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26]"
                  />
                  {highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(i)}
                      className="p-1.5 text-[#991B1B] hover:text-[#DC2626]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  Storage Instructions
                </label>
                <input
                  type="text"
                  value={storageInstructions}
                  onChange={(e) => setStorageInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  Safety Advisory
                </label>
                <input
                  type="text"
                  value={safetyInformation[0] || ''}
                  onChange={(e) => setSafetyInformation([e.target.value])}
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ORGANIZATION & VISIBILITY (1 col) */}
        <div className="space-y-6">
          {/* SIDEBAR CARD 1: STATUS & VISIBILITY */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#210D15] uppercase tracking-wider">
              Product Status
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                  Visibility
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] font-medium focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                >
                  <option value="active">Active (Visible on Storefront)</option>
                  <option value="draft">Draft (Hidden / Testing)</option>
                  <option value="archived">Archived (Retired)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#ECE6DE]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D5CCC1] text-[#210D15] mt-0.5 focus:ring-[#210D15]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#210D15] block">
                      Featured Product
                    </span>
                    <span className="text-[11px] text-[#70675E] block leading-tight">
                      Highlight this product in homepage hero banners and curated collections.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SIDEBAR CARD 2: PRODUCT ORGANIZATION */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#210D15] uppercase tracking-wider">
              Product Organization
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                  Product Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] font-medium focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                  Base Warehouse SKU *
                </label>
                <input
                  type="text"
                  required
                  value={baseSku}
                  onChange={(e) => setBaseSku(e.target.value.toUpperCase())}
                  placeholder="e.g. GG-BLT-200G"
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs font-mono uppercase text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
                <p className="text-[10px] text-[#8C827A] mt-0.5">
                  Links directly to physical inventory batch allocations.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                  Net Weight (Grams per Unit)
                </label>
                <input
                  type="number"
                  min="1"
                  value={netWeightGrams}
                  onChange={(e) => setNetWeightGrams(parseInt(e.target.value, 10) || 200)}
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#554E46] mb-1">
                  Standard Serving Size
                </label>
                <input
                  type="text"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  placeholder="e.g. 1 Scoop (~6.5g) daily or 1 Capsule"
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SIDEBAR CARD 3: STOREFRONT PREVIEW LINK */}
          {isEditMode && (
            <div className="p-5 bg-[#FAF8F5] border border-[#ECE6DE] rounded-lg space-y-2">
              <span className="text-xs font-bold text-[#210D15] uppercase tracking-wider block">
                Live Storefront URL
              </span>
              <p className="text-[11px] text-[#70675E]">
                Preview how this product appears to customers on the production store.
              </p>
              <Link
                href="/product"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#D5CCC1] text-[#210D15] text-xs font-medium rounded hover:bg-[#F5F2EB] transition mt-1"
              >
                <span>View Product Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* SHOPIFY-STYLE UNSAVED CHANGES DISCARD CONFIRMATION MODAL */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 bg-[#FEE2E2] text-[#991B1B] rounded-lg shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#210D15]">
                  Discard all unsaved changes?
                </h3>
                <p className="text-xs text-[#70675E] mt-1 leading-relaxed">
                  You have unsaved changes on this product. If you leave now, your edits will not be
                  saved and all progress will be lost.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 border border-[#D5CCC1] text-[#554E46] text-xs font-medium rounded-md hover:bg-[#FAF8F5] transition"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 bg-[#991B1B] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#B91C1C] transition shadow-xs"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-4 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#3D1A27] transition shadow-xs disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save & Exit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
