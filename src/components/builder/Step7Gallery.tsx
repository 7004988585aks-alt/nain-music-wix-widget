import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Music, 
  Video, 
  FileText, 
  Trash2, 
  UploadCloud, 
  ShieldCheck, 
  Check, 
  Plus, 
  AlertCircle 
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { AudioPlayer } from '../common/AudioPlayer';
import { GigMedia } from '../../types';

export const Step7Gallery: React.FC = () => {
  const { currentGig, updateCurrentGig, services } = useGig();

  const [activeMediaTab, setActiveMediaTab] = useState<'images' | 'audio' | 'video' | 'docs'>('images');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  if (!currentGig) return null;

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];

  // Preset curated music cover artworks so the user can easily test and select
  const PRESET_ARTWORKS = [
    {
      title: 'Analog Studio Mixing Console',
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
    },
    {
      title: 'Modern Beatmaking & Synthesis Setup',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    },
    {
      title: 'Acoustic Guitar & Songwriting Lounge',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    },
    {
      title: 'Vocal Booth & Studio Microphone',
      url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    },
    {
      title: 'Cinematic Orchestral Keyboard Suite',
      url: 'https://images.unsplash.com/photo-1520523839898-507127b72db7?w=1200&auto=format&fit=crop&q=80',
    },
  ];

  const handleAddMedia = (mediaItem: Omit<GigMedia, 'id' | 'gig_id' | 'sort_order'>) => {
    const newItem: GigMedia = {
      ...mediaItem,
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      gig_id: currentGig.id,
      sort_order: currentGig.media.length + 1,
    };

    updateCurrentGig(prev => ({
      ...prev,
      media: [...prev.media, newItem],
    }));
  };

  const handleDeleteMedia = (mediaId: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== mediaId),
    }));
  };

  const handleSetPrimary = (mediaId: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      media: prev.media.map(m => ({
        ...m,
        primary: m.id === mediaId,
      })),
    }));
  };

  const handleToggleRights = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCurrentGig({ seller_rights_confirmed: e.target.checked });
  };

  const imageMedia = currentGig.media.filter(m => m.media_type === 'image');
  const audioMedia = currentGig.media.filter(m => m.media_type === 'audio');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Showcase Gallery & Media</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Step 7 of 8
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Add audio samples with Before/After comparisons, cover artwork, and gear documents.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveMediaTab('images')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeMediaTab === 'images'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Cover Art ({imageMedia.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveMediaTab('audio')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeMediaTab === 'audio'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          Audio Samples ({audioMedia.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveMediaTab('video')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeMediaTab === 'video'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          Intro Video
        </button>

        <button
          type="button"
          onClick={() => setActiveMediaTab('docs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeMediaTab === 'docs'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Studio PDF / Documents
        </button>
      </div>

      {/* 1. Images Tab */}
      {activeMediaTab === 'images' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div>
              <h3 className="text-sm font-semibold text-white">Cover Images (16:9 Recommended)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                At least 1 cover image is required. Choose from curated studio presets or add your own image URL.
              </p>
            </div>

            {/* Existing Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {imageMedia.map((img) => (
                <div
                  key={img.id}
                  className={`relative rounded-xl overflow-hidden border group ${
                    img.primary ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-slate-800'
                  }`}
                >
                  <img
                    src={img.file_url}
                    alt={img.title}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-2.5 bg-slate-950/90 text-xs">
                    <p className="font-semibold text-white truncate">{img.title || 'Studio Cover'}</p>
                    <div className="flex items-center justify-between mt-2">
                      {img.primary ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                          Primary Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          className="text-[10px] text-slate-400 hover:text-amber-400 font-medium"
                        >
                          Set as Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(img.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Preset Selector */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Select from Studio Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PRESET_ARTWORKS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddMedia({
                      media_type: 'image',
                      file_url: preset.url,
                      title: preset.title,
                      primary: imageMedia.length === 0,
                    })}
                    className="relative rounded-lg overflow-hidden border border-slate-800 hover:border-amber-500 transition group text-left"
                  >
                    <img src={preset.url} alt={preset.title} className="w-full h-16 object-cover" />
                    <div className="p-1 bg-slate-950 text-[10px] text-slate-300 truncate">
                      {preset.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Image URL */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste direct image URL (https://...)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="Image caption"
                className="w-48 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newImageUrl.trim()) {
                    handleAddMedia({
                      media_type: 'image',
                      file_url: newImageUrl.trim(),
                      title: newImageTitle.trim() || 'Showcase Image',
                      primary: imageMedia.length === 0,
                    });
                    setNewImageUrl('');
                    setNewImageTitle('');
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                + Add Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Audio Tab */}
      {activeMediaTab === 'audio' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-amber-400" />
                  Audio Showcase with Before & After Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audio is the most important conversion driver on Nain Music. Upload samples or enable A/B comparison.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddMedia({
                  media_type: 'audio',
                  file_url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3',
                  audio_before_url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3',
                  audio_after_url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3',
                  title: `${currentService.name} Demo Track`,
                  primary: false,
                })}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition"
              >
                + Add Sample Audio Track
              </button>
            </div>

            {/* Audio Players List */}
            <div className="space-y-4">
              {audioMedia.map((audio) => (
                <div key={audio.id} className="relative group">
                  <AudioPlayer
                    title={audio.title}
                    audioUrl={audio.file_url}
                    beforeUrl={audio.audio_before_url}
                    afterUrl={audio.audio_after_url}
                    hasBeforeAfter={Boolean(audio.audio_before_url && audio.audio_after_url)}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(audio.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-red-400 border border-slate-700 transition"
                    title="Remove audio track"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {audioMedia.length === 0 && (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 space-y-2">
                  <Music className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">No audio preview added yet.</p>
                  <p className="text-[11px] text-slate-500">Adding audio significantly increases buyer inquiries.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Video Tab */}
      {activeMediaTab === 'video' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
          <div>
            <h3 className="text-sm font-semibold text-white">Introduction or Studio Session Video</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              1 video limit. Showcase your studio, gear walkthrough, or live production session.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Video Embed / URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=... or MP4 link"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (videoUrl.trim()) {
                    handleAddMedia({
                      media_type: 'video',
                      file_url: videoUrl.trim(),
                      title: 'Studio Intro Video',
                      primary: false,
                    });
                    setVideoUrl('');
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                Save Video
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Only high-quality studio videos showing actual music production or studio hardware are recommended.
            </p>
          </div>
        </div>
      )}

      {/* 4. Documents Tab */}
      {activeMediaTab === 'docs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
          <div>
            <h3 className="text-sm font-semibold text-white">Studio Gear Sheet or Music Portfolio (PDF)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Attach PDF documents such as your complete analog gear inventory, discography credits, or lyric books.
            </p>
          </div>

          <div className="p-6 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
            <FileText className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xs text-slate-300 font-semibold">Upload Studio Spec Sheet (PDF)</p>
            <p className="text-[11px] text-slate-500">Maximum file size: 10MB</p>
            <button
              type="button"
              onClick={() => handleAddMedia({
                media_type: 'document',
                file_url: 'https://nainmusic.com/docs/studio_gear_specs.pdf',
                title: 'Studio Outboard Gear & Monitoring Specs (PDF)',
                primary: false,
              })}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
            >
              + Attach Sample Gear Sheet
            </button>
          </div>
        </div>
      )}

      {/* 5. MANDATORY SELLER RIGHTS / COPYRIGHT DECLARATION */}
      <div className={`p-5 rounded-2xl border transition-all ${
        currentGig.seller_rights_confirmed
          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
          : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
      }`}>
        <div className="flex items-start gap-3">
          <input
            id="seller_rights_checkbox"
            type="checkbox"
            checked={currentGig.seller_rights_confirmed}
            onChange={handleToggleRights}
            className="w-5 h-5 rounded border-amber-500/50 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer mt-0.5"
          />
          <label htmlFor="seller_rights_checkbox" className="text-xs space-y-1 cursor-pointer select-none">
            <span className="font-bold block text-sm">
              Music Ownership & Copyright Declaration (Mandatory)
            </span>
            <span className="text-slate-300 block leading-relaxed">
              I certify that I am the author or hold proper commercial licenses/permissions for all audio samples, images, and media attached to this Gig. I understand that uploading stolen beats, unlicensed samples, or copyrighted tracks from other artists violates Nain Music policies and will result in account suspension.
            </span>
          </label>
        </div>
      </div>

    </div>
  );
};
