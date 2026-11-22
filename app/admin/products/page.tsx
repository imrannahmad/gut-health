'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Edit3,
  Trash2,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import type { FirestoreProduct } from '@/types/firestore/product';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Floating Viewport-Fixed Dropdown Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // Permanent Delete Modal State
  const [productToDelete, setProductToDelete] = useState<FirestoreProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/products?limit=50');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load products');
      }
      setProducts(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Close floating dropdown on scroll or window resize
  useEffect(() => {
    const handleCloseMenu = () => {
      if (openMenuId) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };
    window.addEventListener('scroll', handleCloseMenu, true);
    window.addEventListener('resize', handleCloseMenu);
    return () => {
      window.removeEventListener('scroll', handleCloseMenu, true);
      window.removeEventListener('resize', handleCloseMenu);
    };
  }, [openMenuId]);

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 176;
    const menuHeight = 88;
    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }
    const left = Math.max(10, rect.right - menuWidth);
    setMenuPosition({ top, left });
    setOpenMenuId(id);
  };

  const handleToggleStatus = async (product: FirestoreProduct) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/v1/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update product status');
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      setSuccessToast(`Product "${product.name}" status updated to ${newStatus}.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/products/${productToDelete.id}?permanent=true`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete product');
      }
      setProducts((prev) => prev.filter((item) => item.id !== productToDelete.id));
      setSuccessToast(`Product "${productToDelete.name}" permanently deleted.`);
      setTimeout(() => setSuccessToast(null), 4000);
      setProductToDelete(null);
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const displayName = p.name || (p as any).title || '';
    const displaySku = p.baseSku || (p as any).basePhysicalSku || '';
    const matchesSearch =
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      displaySku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
              Product Catalog
            </h1>
            <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-full text-xs font-mono text-[#70675E]">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <p className="text-xs text-[#70675E] mt-1">
            Manage formulations, physical pack multipliers, GST rates, and live storefront visibility.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 border border-[#D5CCC1] rounded-md text-[#554E46] hover:bg-[#FFFFFF] transition"
            title="Refresh Products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Primary CTA: Dedicated Full-Page Add Product Route */}
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#3D1A27] transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-3 bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] rounded-md text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or slug..."
            className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#D5CCC1] rounded-md text-xs text-[#2D2A26] placeholder-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#210D15]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#EBE4DC] p-1 rounded-md text-xs overflow-x-auto no-scrollbar shrink-0">
          {(['all', 'active', 'draft', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded capitalize font-medium transition whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-[#FFFFFF] text-[#210D15] shadow-xs'
                  : 'text-[#696159] hover:text-[#210D15]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table Card - Natural compact height, no artificial empty white gap */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#70675E] space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#210D15]" />
            <p>Loading catalog products from Firestore...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#70675E] space-y-3">
            <Package className="w-8 h-8 mx-auto text-[#C5BDB5]" />
            <p className="font-medium text-[#210D15]">No products found</p>
            <p className="text-[11px] text-[#8C827A]">
              {search
                ? 'Try clearing your search filters.'
                : 'Click "Add Product" above to list your first formulation.'}
            </p>
            {!search && (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#210D15] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#3D1A27] transition shadow-xs mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Product</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2A26] min-w-[780px]">
              <thead className="bg-[#FAF8F5] border-b border-[#ECE6DE] text-[#696159] font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Formulation</th>
                  <th className="py-3 px-4">Base SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pack Options & Pricing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DE]">
                {filteredProducts.map((p) => {
                  const displayName = p.name || (p as any).title || 'GutGlow Formulation';
                  const displaySku = p.baseSku || (p as any).basePhysicalSku || 'GG-DWF-200G';
                  const primaryImg =
                    p.images?.find((img) => img.isPrimary) || p.images?.[0];
                  const imgSrc =
                    primaryImg?.src || (primaryImg as any)?.url || '/images/gutglow-product-front.jpg';

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition">
                      {/* Product Thumbnail & Title (Links to Full-Page Editor) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="w-12 h-12 rounded-md bg-[#F5F2EB] border border-[#E8E2D9] overflow-hidden shrink-0 flex items-center justify-center group"
                          >
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={primaryImg?.alt || displayName}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-[#8C827A]" />
                            )}
                          </Link>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-semibold text-[#210D15] hover:underline text-left leading-tight block"
                            >
                              {displayName}
                            </Link>
                            <p className="text-[11px] text-[#70675E] font-mono mt-0.5">/{p.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Base SKU */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#554E46]">
                        <span className="bg-[#F5F2EB] px-2 py-0.5 rounded border border-[#E8E2D9]">
                          {displaySku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#554E46]">
                        {p.category?.name || 'Gut Health'}
                      </td>

                      {/* Pack Options & Pricing */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {p.packOptions?.map((opt) => {
                            const units = opt.packQuantity || (opt as any).unitCount || 1;
                            return (
                              <div key={opt.id} className="flex items-center gap-2 text-[11px]">
                                <span className="font-medium text-[#210D15]">{opt.name}:</span>
                                <span className="text-[#15803D] font-semibold">
                                  ₹{(opt.sellingPriceInPaise / 100).toLocaleString('en-IN')}
                                </span>
                                {opt.mrpInPaise > opt.sellingPriceInPaise && (
                                  <span className="line-through text-[#8C827A] text-[10px]">
                                    ₹{(opt.mrpInPaise / 100).toLocaleString('en-IN')}
                                  </span>
                                )}
                                <span className="text-[#70675E] text-[10px]">
                                  ({units} {units === 1 ? 'Unit' : 'Units'})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Interactive Clickable Status Badge */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          disabled={updatingId === p.id}
                          title={`Click to switch to ${p.status === 'active' ? 'Draft' : 'Active'}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize transition cursor-pointer hover:shadow-xs disabled:opacity-50 ${
                            p.status === 'active'
                              ? 'bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0] border border-[#86EFAC]'
                              : p.status === 'draft'
                              ? 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] border border-[#FCD34D]'
                              : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] border border-[#D1D5DB]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'active'
                                ? 'bg-[#166534]'
                                : p.status === 'draft'
                                ? 'bg-[#92400E]'
                                : 'bg-[#4B5563]'
                            }`}
                          />
                          <span>{updatingId === p.id ? 'Updating...' : p.status}</span>
                        </button>
                      </td>

                      {/* Actions: Clean Three-Dot Menu Only */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => handleOpenMenu(e, p.id)}
                            className="p-1.5 border border-[#D5CCC1] rounded text-[#554E46] hover:bg-[#FAF8F5] hover:text-[#210D15] transition"
                            title="Product Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Viewport-Fixed Dropdown Menu (Escapes all table containers & overflow completely) */}
      {openMenuId && menuPosition && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => {
              setOpenMenuId(null);
              setMenuPosition(null);
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: menuPosition.top,
              left: menuPosition.left,
            }}
            className="w-44 bg-[#FFFFFF] border border-[#D5CCC1] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
          >
            <Link
              href={`/admin/products/${openMenuId}`}
              onClick={() => {
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#2D2A26] hover:bg-[#FAF8F5] transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#554E46]" />
              <span>Edit Product</span>
            </Link>

            {/* Toggle Status inside dropdown */}
            {(() => {
              const prod = products.find((x) => x.id === openMenuId);
              if (!prod) return null;
              const isProdActive = prod.status === 'active';
              return (
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuId(null);
                    setMenuPosition(null);
                    handleToggleStatus(prod);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#2D2A26] hover:bg-[#FAF8F5] transition text-left"
                >
                  {isProdActive ? (
                    <>
                      <ToggleLeft className="w-3.5 h-3.5 text-[#92400E]" />
                      <span>Set as Draft (Hide)</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-3.5 h-3.5 text-[#166534]" />
                      <span>Publish (Set Active)</span>
                    </>
                  )}
                </button>
              );
            })()}

            <div className="my-1 border-t border-[#ECE6DE]" />

            <button
              onClick={() => {
                const prod = products.find((x) => x.id === openMenuId);
                setOpenMenuId(null);
                setMenuPosition(null);
                if (prod) setProductToDelete(prod);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#991B1B] hover:bg-[#FEE2E2] transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#991B1B]" />
              <span>Delete Product</span>
            </button>
          </div>
        </>
      )}

      {/* Sleek Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="p-2.5 bg-[#FEE2E2] text-[#991B1B] rounded-lg shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#210D15]">
                  Permanently Delete Product?
                </h3>
                <p className="text-xs text-[#70675E] mt-1.5 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-[#210D15]">{productToDelete.name}</strong> from the catalog?
                  This will completely remove the formulation, all pack tiers, and its SKU from the database.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#ECE6DE]">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#D5CCC1] text-[#554E46] text-xs font-medium rounded-md hover:bg-[#FAF8F5] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#991B1B] text-[#FAF8F5] text-xs font-medium rounded-md hover:bg-[#B91C1C] transition shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
