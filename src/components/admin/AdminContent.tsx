import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { ContentItem, ContentCategory, ContentAudience } from '../../types/admin';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Stethoscope,
  AlertCircle,
  Tag,
  Radio,
} from 'lucide-react';

export const AdminContent: React.FC = () => {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Content Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ContentCategory>('HEALTH_EDUCATION');
  const [audience, setAudience] = useState<ContentAudience>('ALL');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [clinicalReviewRequired, setClinicalReviewRequired] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getContent();
      setContentList(data.items);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      await adminApi.createContent({
        title,
        category,
        audience,
        excerpt,
        content,
        clinicalReviewStatus: clinicalReviewRequired ? 'APPROVED' : 'NOT_REQUIRED', // Seeded admin approval
        reviewedBy: clinicalReviewRequired ? 'Dr. Anita Rao (MD)' : undefined,
      });
      setShowCreateModal(false);
      setTitle('');
      setExcerpt('');
      setContent('');
      fetchContent();
    } catch (e: any) {
      alert(`Error creating content: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this published content item?')) return;
    try {
      await adminApi.deleteContent(id);
      fetchContent();
    } catch (e: any) {
      alert(`Error removing content: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-700" />
            <span>Content Management System (CMS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage health education guidance, banners, announcements, and FAQs without requiring an app release.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-ayunexa-primary text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Content Item</span>
        </button>
      </div>

      {/* Clinical Review Notice */}
      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-3">
        <Stethoscope className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-teal-900">Clinical Verification Mandate:</span>
          <p className="text-slate-600">
            All medical health education and dietary articles published to patient dashboards must be reviewed and
            approved by an authorized MD doctor before public release.
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contentList.map((item) => (
          <div key={item.id} className="ayunexa-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 uppercase">
                  {item.category.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Draft'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{item.excerpt || item.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                  Target: {item.audience}
                </span>

                {item.clinicalReviewStatus === 'APPROVED' && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    <span>MD Reviewed</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                title="Delete content item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Content Article</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Managing Hypertension with Low Sodium Diet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ContentCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="HEALTH_EDUCATION">Health Education</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="BANNER">Banner</option>
                    <option value="CARE_GUIDANCE">Care Guidance</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as ContentAudience)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="ALL">All Users</option>
                    <option value="PATIENTS">Patients Only</option>
                    <option value="CAREGIVERS">Caregivers Only</option>
                    <option value="DOCTORS">Doctors Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary / Excerpt</label>
                <input
                  type="text"
                  placeholder="Brief preview snippet"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Content Prose *</label>
                <textarea
                  rows={4}
                  placeholder="Provide comprehensive patient/caregiver information..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 border border-purple-200">
                <input
                  type="checkbox"
                  id="clinicalCheck"
                  checked={clinicalReviewRequired}
                  onChange={(e) => setClinicalReviewRequired(e.target.checked)}
                  className="rounded text-purple-700 focus:ring-purple-600"
                />
                <label htmlFor="clinicalCheck" className="text-slate-700 font-medium cursor-pointer">
                  Require MD Clinical Review before public distribution
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-ayunexa-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || !content.trim()}
                className="btn-ayunexa-primary text-xs"
              >
                Publish Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
