'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Tag,
  Percent,
  ShieldCheck,
  FileText,
  Layers,
  Info,
} from 'lucide-react';
import type { FirestoreProduct, ProductPackOption, ProductImage } from '@/types/firestore/product';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: FirestoreProduct | null; // If provided, mode is 'edit'; else 'create'
}

type TabType = 'general' | 'pricing' | 'tax' | 'media' | 'content';

export default function ProductEditorModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ProductEditorModalProps) {
  const isEditMode = Boolean(product?.id);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [categoryId, setCategoryId] = useState('gut-wellness');
  const [baseSku, setBaseSku] = useState('GG-DWF-200G');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [netWeightGrams, setNetWeightGrams] = useState(200);
  const [servingSize, setServingSize] = useState('1 Scoop (~6.5g) daily with water');
  const [hsnCode, setHsnCode] = useState('2106 90 99');
  const [gstRateBasisPoints, setGstRateBasisPoints] = useState(1800);

  // Pack Options State (stored in UI as Rupees for intuitive editing, converted to Paise on submit)
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

  // Fetch available categories
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
          // Fallback categories
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
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Populate or reset form whenever modal opens or product changes
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setActiveTab('general');

    if (product) {
      setName(product.name || (product as any).title || '');
      setSlug(product.slug || product.id || '');
      setTagline(product.tagline || '');
      setCategoryId(product.category?.id || 'gut-wellness');
      setBaseSku(product.baseSku || (product as any).basePhysicalSku || 'GG-DWF-200G');
      setStatus(product.status || 'active');
      setIsFeatured(Boolean(product.isFeatured));
      setNetWeightGrams(product.netWeightGrams || 200);
      setServingSize(product.servingSize || '1 Scoop (~6.5g) daily with water');
      setHsnCode(product.hsnCode || '2106 90 99');
      setGstRateBasisPoints(product.gstRateBasisPoints || 1800);

      // Map pack options from integer paise to rupees
      if (Array.isArray(product.packOptions) && product.packOptions.length > 0) {
        setPackOptions(
          product.packOptions.map((opt) => ({
            id: opt.id,
            name: opt.name,
            subtitle: opt.subtitle || `${opt.servings || opt.packQuantity * 30} Daily Servings`,
            packQuantity: opt.packQuantity || (opt as any).unitCount || 1,
            servings: opt.servings || opt.packQuantity * 30,
            durationMonths: opt.durationMonths || opt.packQuantity || 1,
            totalWeightGrams: opt.totalWeightGrams || opt.packQuantity * (product.netWeightGrams || 200),
            sellingPriceRupees: Math.round(opt.sellingPriceInPaise / 100),
            mrpRupees: Math.round(opt.mrpInPaise / 100),
            badge: opt.badge || '',
            isPopular: Boolean(opt.isPopular),
            isActive: opt.isActive !== false,
          }))
        );
      } else {
        setPackOptions([
          {
            id: 'pack-1-month',
            name: '1-Month Supply',
            subtitle: '30 Daily Servings',
            packQuantity: 1,
            servings: 30,
            durationMonths: 1,
            totalWeightGrams: 200,
            sellingPriceRupees: 1999,
            mrpRupees: 2499,
            badge: 'Standard',
            isPopular: false,
            isActive: true,
          },
        ]);
      }

      // Images
      if (Array.isArray(product.images) && product.images.length > 0) {
        setImages(
          product.images.map((img: any, idx: number) => ({
            id: img.id || `img-${idx + 1}`,
            src: img.src || img.url || '',
            alt: img.alt || img.altText || product.name,
            label: img.label || `Photo ${idx + 1}`,
            isPrimary: Boolean(img.isPrimary || idx === 0),
            displayOrder: img.displayOrder || idx + 1,
          }))
        );
      } else {
        setImages([
          {
            id: 'img-1',
            src: '/images/gutglow-product-front.jpg',
            alt: product.name,
            label: 'Front View',
            isPrimary: true,
            displayOrder: 1,
          },
        ]);
      }

      setShortDescription(product.shortDescription || '');
      setFullDescription(product.fullDescription || '');
      setHighlights(
        Array.isArray(product.highlights) && product.highlights.length > 0
          ? product.highlights
          : ['Formulated with 12 bio-fermented botanicals', 'Supports gut microbiome balance']
      );
      setStorageInstructions(
        product.storageInstructions || 'Store in a cool, dry place away from direct sunlight.'
      );
      setSafetyInformation(
        Array.isArray(product.safetyInformation) && product.safetyInformation.length > 0
          ? product.safetyInformation
          : ['Consult your physician before use if pregnant or nursing.']
      );
    } else {
      // Clean creation defaults
      setName('');
      setSlug('');
      setTagline('Thoughtful gut wellness for everyday living.');
      setCategoryId('gut-wellness');
      setBaseSku('GG-DWF-200G');
      setStatus('active');
      setIsFeatured(false);
      setNetWeightGrams(200);
      setServingSize('1 Scoop (~6.5g) daily with water');
      setHsnCode('2106 90 99');
      setGstRateBasisPoints(1800);
      setPackOptions([
        {
          id: 'pack-1-month',
          name: '1-Month Supply',
          subtitle: '30 Daily Servings',
          packQuantity: 1,
          servings: 30,
          durationMonths: 1,
          totalWeightGrams: 200,
          sellingPriceRupees: 1999,
          mrpRupees: 2499,
          badge: 'Standard',
          isPopular: false,
          isActive: true,
        },
        {
          id: 'pack-2-month',
          name: '2-Month Sustained Ritual',
          subtitle: '60 Daily Servings',
          packQuantity: 2,
          servings: 60,
          durationMonths: 2,
          totalWeightGrams: 400,
          sellingPriceRupees: 3599,
          mrpRupees: 4998,
          badge: 'Most Popular',
          isPopular: true,
          isActive: true,
        },
        {
          id: 'pack-3-month',
          name: '3-Month Optimal Ritual',
          subtitle: '90 Daily Servings',
          packQuantity: 3,
          servings: 90,
          durationMonths: 3,
          totalWeightGrams: 600,
          sellingPriceRupees: 4899,
          mrpRupees: 7497,
          badge: 'Best Value',
          isPopular: false,
          isActive: true,
        },
      ]);
      setImages([
        {
          id: 'img-1',
          src: '/images/gutglow-product-front.jpg',
          alt: 'Product front view',
          label: 'Front View',
          isPrimary: true,
          displayOrder: 1,
        },
      ]);
      setShortDescription(
        'A comprehensive daily wellness botanical blend designed for daily digestive harmony, gut barrier integrity, and vibrant cellular vitality.'
      );
      setFullDescription(
        'Formulated with synergistic botanical extracts, clinically studied prebiotic soluble fibres, and gut-soothing adaptogens. GutGlow is crafted in micro-batches under strict cGMP protocols in Mumbai, Maharashtra.'
      );
      setHighlights([
        'Clinically studied prebiotic fibers & bio-fermented botanicals',
        'Zero artificial sweeteners, preservatives, or synthetic fillers',
        '100% Vegan, non-GMO, gluten-free, and allergen-friendly',
      ]);
      setStorageInstructions('Store in a cool, dry place away from direct sunlight.');
      setSafetyInformation(['Consult your physician before use if pregnant or nursing.']);
    }
  }, [isOpen, product]);

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

  // Pack Option helpers
  const handleAddPackOption = () => {
    const nextUnits = (packOptions.length + 1);
    const newOption = {
      id: `pack-${nextUnits}-month-${Date.now().toString(36)}`,
      name: `${nextUnits}-Month Supply`,
      subtitle: `${nextUnits * 30} Daily Servings`,
      packQuantity: nextUnits,
      servings: nextUnits * 30,
      durationMonths: nextUnits,
      totalWeightGrams: nextUnits * netWeightGrams,
      sellingPriceRupees: nextUnits * 1800,
      mrpRupees: nextUnits * 2499,
      badge: nextUnits === 2 ? 'Most Popular' : nextUnits >= 3 ? 'Best Value' : '',
      isPopular: nextUnits === 2,
      isActive: true,
    };
    setPackOptions([...packOptions, newOption]);
  };

  const handleRemovePackOption = (index: number) => {
    if (packOptions.length <= 1) {
      alert('A product must contain at least 1 commercial pack option.');
      return;
    }
    setPackOptions(packOptions.filter((_, i) => i !== index));
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

  // Image helpers
  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL or local asset path (e.g. /images/... or https://...):');
    if (!url) return;
    const newImg: ProductImage = {
      id: `img-${Date.now().toString(36)}`,
      src: url.trim(),
      alt: name || 'Product image',
      label: `Image ${images.length + 1}`,
      isPrimary: images.length === 0,
      displayOrder: images.length + 1,
    };
    setImages([...images, newImg]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload image file');
      }

      const uploadedUrl = json.data.url;
      const newImg: ProductImage = {
        id: `img-${Date.now().toString(36)}`,
        src: uploadedUrl,
        alt: file.name.split('.')[0] || name,
        label: file.name,
        isPrimary: images.length === 0,
        displayOrder: images.length + 1,
      };
      setImages([...images, newImg]);
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
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
    if (images.length <= 1) {
      alert('Product must have at least 1 image.');
      return;
    }
    const filtered = images.filter((_, i) => i !== index);
    if (!filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    setImages(filtered);
  };

  // Highlights helpers
  const handleAddHighlight = () => setHighlights([...highlights, '']);
  const handleRemoveHighlight = (i: number) =>
    setHighlights(highlights.filter((_, idx) => idx !== i));
  const updateHighlight = (i: number, val: string) => {
    const copy = [...highlights];
    copy[i] = val;
    setHighlights(copy);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Product Name is required.');
      setActiveTab('general');
      return;
    }
    if (!slug.trim()) {
      setError('Product Slug is required.');
      setActiveTab('general');
      return;
    }
    if (packOptions.length === 0) {
      setError('At least one commercial pack option is required.');
      setActiveTab('pricing');
      return;
    }
    if (images.length === 0) {
      setError('At least one product image is required.');
      setActiveTab('media');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId) || {
      id: categoryId,
      name: categoryId === 'gut-wellness' ? 'Gut Wellness Nutraceuticals' : 'Daily Rituals & Accessories',
      slug: categoryId,
    };

    // Format payload with integer paise for financial precision
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      tagline: tagline.trim() || 'Thoughtful gut wellness for everyday living.',
      shortDescription: shortDescription.trim() || 'Comprehensive daily botanical wellness formula.',
      fullDescription: fullDescription.trim() || shortDescription.trim() || 'Premium gut health nutraceutical.',
      category: {
        id: selectedCategory.id,
        name: selectedCategory.name,
        slug: selectedCategory.slug,
      },
      status,
      isFeatured,
      servingSize: servingSize.trim() || '1 Scoop (~6.5g) daily with water',
      baseSku: baseSku.trim() || 'GG-DWF-200G',
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
        totalWeightGrams: Number(opt.totalWeightGrams) || Number(opt.packQuantity) * (Number(netWeightGrams) || 200),
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

    setIsSubmitting(true);
    try {
      let res: Response;
      if (isEditMode) {
        res = await fetch(`/api/v1/admin/products/${product!.id}`, {
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

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECE6DE] bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#210D15] text-[#FAF8F5] rounded-md">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-serif font-bold text-[#210D15]">
                {isEditMode ? `Edit Product: ${product?.name || (product as any)?.title}` : 'Add New Product'}
              </h2>
            </div>
            <p className="text-xs text-[#70675E] mt-0.5">
              Configure formulation specifications, commercial pack pricing (integer paise), GST rates, and imagery.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-md text-[#70675E] hover:text-[#210D15] hover:bg-[#EBE4DC] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#ECE6DE] bg-[#FFFFFF] overflow-x-auto no-scrollbar">
          {[
            { id: 'general', label: '1. General Info', icon: Layers },
            { id: 'pricing', label: '2. Packs & Pricing', icon: Tag },
            { id: 'tax', label: '3. GST & Tax', icon: Percent },
            { id: 'media', label: '4. Images', icon: ImageIcon },
            { id: 'content', label: '5. Descriptions', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-[#210D15] text-[#210D15] font-semibold'
                    : 'border-transparent text-[#70675E] hover:text-[#210D15]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    URL Slug *
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
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="gutglow-daily-wellness"
                      className="w-full px-3 py-2 border border-[#D5CCC1] rounded-r-md text-xs font-mono text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15] disabled:bg-[#FAF8F5]"
                    />
                  </div>
                  {isEditMode && (
                    <p className="text-[10px] text-[#8C827A] mt-0.5">
                      Slug is immutable to prevent broken customer URLs and bookmarks.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  Tagline / Header Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Thoughtful gut wellness for everyday living."
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    Store Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    Base Warehouse SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={baseSku}
                    onChange={(e) => setBaseSku(e.target.value.toUpperCase())}
                    placeholder="GG-DWF-200G"
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs font-mono uppercase text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  />
                  <p className="text-[10px] text-[#8C827A] mt-0.5">
                    Connects directly to warehouse inventory batch ledger.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    Visibility Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  >
                    <option value="active">Active (Visible on Store)</option>
                    <option value="draft">Draft (Hidden / Internal)</option>
                    <option value="archived">Archived (Retired)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    Net Weight (Grams per Unit) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={netWeightGrams}
                    onChange={(e) => setNetWeightGrams(parseInt(e.target.value, 10) || 200)}
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    Standard Serving Size *
                  </label>
                  <input
                    type="text"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    placeholder="1 Scoop (~6.5g) daily with water"
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D5CCC1] text-[#210D15] focus:ring-[#210D15]"
                  />
                  <span className="text-xs font-medium text-[#210D15]">
                    Feature this product on homepage hero and curated carousels
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PACKS & PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#ECE6DE]">
                <div>
                  <h3 className="text-xs font-bold text-[#210D15] uppercase tracking-wider">
                    Commercial Pack Configurations
                  </h3>
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

              <div className="space-y-3">
                {packOptions.map((opt, idx) => {
                  const discountPercent =
                    opt.mrpRupees > opt.sellingPriceRupees
                      ? Math.round(((opt.mrpRupees - opt.sellingPriceRupees) / opt.mrpRupees) * 100)
                      : 0;

                  return (
                    <div
                      key={opt.id || idx}
                      className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] rounded-lg space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#210D15] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#210D15] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          Pack Tier: {opt.name}
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
                              updatePackOption(idx, 'sellingPriceRupees', parseInt(e.target.value, 10) || 0)
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
            </div>
          )}

          {/* TAB 3: TAX & COMPLIANCE */}
          {activeTab === 'tax' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F5F2EB] border border-[#E8E2D9] rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#210D15]">
                  <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                  <span>Indian GST & Statutory Invoicing Compliance</span>
                </div>
                <p className="text-[11px] text-[#70675E] leading-relaxed">
                  GutGlow displays all storefront prices as GST-inclusive. When orders are created, the backend
                  calculates CGST/SGST (for intra-state Maharashtra orders) or IGST (for inter-state orders) in exact integer paise.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#210D15] mb-1">
                    HSN Code (Nutraceuticals / Botanicals) *
                  </label>
                  <input
                    type="text"
                    required
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="2106 90 99"
                    className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs font-mono text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                  />
                  <p className="text-[10px] text-[#8C827A] mt-0.5">
                    Standard HSN for Dietary Supplements / Food Preparations.
                  </p>
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

              {/* Live Tax Breakdown Preview */}
              <div className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] rounded-lg space-y-2">
                <span className="text-xs font-bold text-[#210D15] uppercase tracking-wider block">
                  Live GST Calculation Preview (Based on 1st Pack Tier)
                </span>
                {packOptions[0] && (
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div className="p-2 bg-[#FFFFFF] border border-[#ECE6DE] rounded">
                      <span className="text-[10px] text-[#70675E] block">Retail Selling Price</span>
                      <span className="font-bold text-[#210D15]">₹{packOptions[0].sellingPriceRupees.toLocaleString('en-IN')}</span>
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
                      <span className="text-[10px] text-[#70675E] block">GST ({gstRateBasisPoints / 100}%)</span>
                      <span className="font-bold text-[#15803D]">
                        ₹{(
                          packOptions[0].sellingPriceRupees -
                          (packOptions[0].sellingPriceRupees * 10000) / (10000 + gstRateBasisPoints)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & IMAGES */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#ECE6DE]">
                <div>
                  <h3 className="text-xs font-bold text-[#210D15] uppercase tracking-wider">
                    Product Imagery & Gallery
                  </h3>
                  <p className="text-[11px] text-[#70675E]">
                    Upload PNG/WebP/JPEG files to Cloud Storage or specify image asset paths.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#210D15] text-[#FAF8F5] rounded-md text-xs font-medium hover:bg-[#3D1A27] transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#D5CCC1] text-[#210D15] rounded-md text-xs font-medium hover:bg-[#EBE4DC] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add URL</span>
                  </button>
                </div>
              </div>

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
                    </div>

                    <div className="space-y-1 text-xs">
                      <input
                        type="text"
                        value={img.label}
                        onChange={(e) => {
                          const copy = [...images];
                          copy[idx].label = e.target.value;
                          setImages(copy);
                        }}
                        placeholder="Image Label (e.g. Front View)"
                        className="w-full px-2 py-1 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-[11px]"
                      />
                      <input
                        type="text"
                        value={img.src}
                        onChange={(e) => {
                          const copy = [...images];
                          copy[idx].src = e.target.value;
                          setImages(copy);
                        }}
                        placeholder="/images/..."
                        className="w-full px-2 py-1 bg-[#FFFFFF] border border-[#D5CCC1] rounded text-[10px] font-mono text-[#70675E]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
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
                        className="text-[#991B1B] hover:text-[#DC2626] p-1"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DESCRIPTIONS & CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  Short Description (Storefront Card & Meta Snippet) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A comprehensive daily wellness botanical blend..."
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#210D15] mb-1">
                  Full Description & Story *
                </label>
                <textarea
                  rows={4}
                  required
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Detailed formulation story, clinical citations, and efficacy profile..."
                  className="w-full px-3 py-2 border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#210D15]">
                    Key Formulation Highlights
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="text-[11px] font-semibold text-[#210D15] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Highlight
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          )}

          {/* Modal Footer / Action Buttons */}
          <div className="pt-4 border-t border-[#ECE6DE] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-[#D5CCC1] text-[#554E46] text-xs font-medium rounded-md hover:bg-[#FAF8F5] transition"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {activeTab !== 'content' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: TabType[] = ['general', 'pricing', 'tax', 'media', 'content'];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx < tabs.length - 1) {
                      setActiveTab(tabs[currentIdx + 1]);
                    }
                  }}
                  className="px-4 py-2 bg-[#FAF8F5] border border-[#D5CCC1] text-[#210D15] text-xs font-medium rounded-md hover:bg-[#EBE4DC] transition"
                >
                  Next Section &rarr;
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#3D1A27] transition shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditMode ? 'Update Product' : 'Create & Publish Product'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
