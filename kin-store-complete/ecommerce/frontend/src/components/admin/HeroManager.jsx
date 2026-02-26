// frontend/src/components/admin/HeroManager.jsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Eye, EyeOff, Loader2, GripVertical } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const defaultSlide = {
  title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/shop',
  imageUrl: '', overlayColor: '#000000', overlayOpacity: 0.4,
  textColor: '#ffffff', isActive: true, interval: 5000,
};

export default function HeroManager() {
  const [slides, setSlides] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | slide object
  const [form, setForm] = useState(defaultSlide);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hero/all');
      setSlides(res.data.data.slides);
    } catch { toast.error('Failed to load slides'); }
    finally { setLoading(false); }
  };

  const openNew = () => { setForm({ ...defaultSlide }); setEditing('new'); };
  const openEdit = (slide) => { setForm({ ...slide }); setEditing(slide); };
  const closeForm = () => setEditing(null);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') {
        await api.post('/hero', form);
        toast.success('Slide created!');
      } else {
        await api.patch(`/hero/${editing._id}`, form);
        toast.success('Slide updated!');
      }
      fetchSlides();
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const deleteSlide = async (id) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await api.delete(`/hero/${id}`);
      toast.success('Deleted');
      fetchSlides();
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (slide) => {
    try {
      await api.patch(`/hero/${slide._id}`, { isActive: !slide.isActive });
      fetchSlides();
    } catch { toast.error('Update failed'); }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-kin-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold">Hero Slides</h2>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-kin-700 text-white text-sm font-semibold rounded-xl hover:bg-kin-800 transition-all">
          <Plus size={15} /> Add Slide
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-kin-500" size={32} /></div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div key={slide._id}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <GripVertical size={16} className="text-gray-300 flex-shrink-0 cursor-grab" />
              <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                {slide.imageUrl && (
                  <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{slide.title}</p>
                <p className="text-xs text-gray-400 truncate">{slide.subtitle}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-gray-400 font-mono">{slide.interval / 1000}s</span>
                <button onClick={() => toggleActive(slide)}
                  className={`p-1.5 rounded-lg transition-colors ${slide.isActive ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {slide.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => openEdit(slide)}
                  className="p-1.5 rounded-lg text-kin-600 hover:bg-kin-50 dark:hover:bg-kin-900/20 transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deleteSlide(slide._id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No slides yet. Add your first hero slide!
            </div>
          )}
        </div>
      )}

      {/* Edit / New Form Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="font-display text-lg font-bold mb-5">
                {editing === 'new' ? 'New Hero Slide' : 'Edit Slide'}
              </h3>
              <form onSubmit={save} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title *</label>
                  <input name="title" value={form.title} onChange={handle} required className={inputClass} placeholder="New Collection" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subtitle</label>
                  <input name="subtitle" value={form.subtitle} onChange={handle} className={inputClass} placeholder="Crafted for the bold." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image URL *</label>
                  <input name="imageUrl" value={form.imageUrl} onChange={handle} required className={inputClass} placeholder="https://..." />
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CTA Text</label>
                    <input name="ctaText" value={form.ctaText} onChange={handle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CTA Link</label>
                    <input name="ctaLink" value={form.ctaLink} onChange={handle} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Overlay Color</label>
                    <input type="color" name="overlayColor" value={form.overlayColor} onChange={handle}
                      className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Opacity ({form.overlayOpacity})</label>
                    <input type="range" name="overlayOpacity" value={form.overlayOpacity} onChange={handle}
                      min="0" max="1" step="0.05" className="w-full accent-kin-600 mt-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Text Color</label>
                    <input type="color" name="textColor" value={form.textColor} onChange={handle}
                      className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Interval (ms)</label>
                    <input type="number" name="interval" value={form.interval} onChange={handle}
                      min="2000" max="15000" step="500" className={inputClass} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handle} className="w-4 h-4 accent-kin-600" />
                  <span className="text-sm">Active (visible on store)</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-kin-700 text-white text-sm font-semibold rounded-xl hover:bg-kin-800 transition-all disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                    {saving ? 'Saving…' : 'Save Slide'}
                  </button>
                  <button type="button" onClick={closeForm}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
