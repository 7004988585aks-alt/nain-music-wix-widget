import React, { useState } from 'react';
import { 
  FileText, 
  Music, 
  Headphones, 
  Languages, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  FileAudio,
  HardDrive,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { Order, OrderRequirementsData } from '../../types';
import { AudioPlayer } from '../common/AudioPlayer';

interface OrderRequirementsTabProps {
  order: Order;
  viewMode: 'seller' | 'buyer';
  onSubmitRequirements?: (orderId: string, data: OrderRequirementsData) => void;
}

export const OrderRequirementsTab: React.FC<OrderRequirementsTabProps> = ({ 
  order, 
  viewMode,
  onSubmitRequirements 
}) => {
  const reqData = order.requirements_data;
  const isAwaitingRequirements = order.status === 'Requirements Needed';

  // Demo state for submitting requirements directly in preview
  const [brief, setBrief] = useState('We recorded a 4-piece indie rock track at 124 BPM in F# Minor. Live drums, electric bass, dual rhythm electric guitars, synth pads, and lead vocal with 2-part harmony. Looking for an aggressive, punchy modern mix with crisp vocal presence.');
  const [reference, setReference] = useState('The 1975 - Somebody Else / Arctic Monkeys - Do I Wanna Know');
  const [language, setLanguage] = useState('Hindi & English Indie Rock');
  const [notes, setNotes] = useState('Stems are consolidated from bar 1 in 24-bit 48kHz WAV format. Master bus is free of compressors or limiters.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitRequirements) return;

    setIsSubmitting(true);
    const newReqs: OrderRequirementsData = {
      creative_brief: brief,
      reference_track: reference,
      language_dialect: language,
      additional_notes: notes,
      submitted_at: new Date().toISOString(),
      audio_files: [
        {
          id: `stem_drum_${Date.now()}`,
          name: 'Indie_Track_Drum_Kit_Stems_24bit.zip',
          size: 154 * 1024 * 1024,
          type: 'application/zip',
          uploaded_at: new Date().toISOString(),
          url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
        },
        {
          id: `stem_vox_${Date.now()}`,
          name: 'Lead_Vocal_Take_Dry.wav',
          size: 42 * 1024 * 1024,
          type: 'audio/wav',
          duration: '3:45',
          uploaded_at: new Date().toISOString(),
          url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3'
        }
      ]
    };

    setTimeout(() => {
      onSubmitRequirements(order.id, newReqs);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* If requirements are not yet submitted */}
      {isAwaitingRequirements ? (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-6 text-amber-200">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1">
                Awaiting Project Requirements
              </h3>
              <p className="text-sm text-amber-300/90 leading-relaxed mb-4">
                The order delivery countdown begins as soon as the buyer provides required project stems, 
                creative brief, and music specifications.
              </p>

              {/* Interactive Buyer Demo Form */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-slate-200 mt-3">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Interactive Simulation: Submit Requirements
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded font-medium">
                    Buyer Action
                  </span>
                </div>

                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Creative Brief / Instructions <span className="text-rose-400">*</span>
                    </label>
                    <textarea 
                      rows={3}
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Commercial Reference Track
                      </label>
                      <input 
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Language / Dialect
                      </label>
                      <input 
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Technical Notes (BPM, Key, Stems format)
                    </label>
                    <input 
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Attached Stems Mock */}
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-200 font-mono">2 audio archives attached (196 MB total)</span>
                    </div>
                    <span className="text-emerald-400 font-medium">Ready to upload</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting Requirements...' : 'Submit Requirements & Start Delivery Clock'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REQUIREMENTS SUBMITTED VIEW (Section 4 & 5) */
        <div className="space-y-6">
          {/* Header Badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Project Requirements Submitted
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Received on {order.requirements_submitted_at ? new Date(order.requirements_submitted_at).toLocaleString() : 'Record initialization'}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-full text-xs font-semibold text-emerald-300">
                Verified Complete
              </span>
            </div>
          </div>

          {/* 1. Project / Creative Brief */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Project / Creative Brief
              </h4>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 leading-relaxed">
              {reqData?.creative_brief || (order.buyer_responses ? Object.values(order.buyer_responses)[0] : 'Standard studio project brief.')}
            </div>
          </div>

          {/* 2. Audio Files & Stems */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Uploaded Audio Stems & Materials
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {reqData?.audio_files?.length || 2} File(s)
              </span>
            </div>

            <div className="space-y-3">
              {(reqData?.audio_files && reqData.audio_files.length > 0 ? reqData.audio_files : [
                {
                  id: 'stem_demo_1',
                  name: 'Full_Song_Consolidated_Stems_24bit_48k.zip',
                  size: 148 * 1024 * 1024,
                  type: 'application/zip',
                  uploaded_at: order.created_at,
                  url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
                },
                {
                  id: 'stem_demo_2',
                  name: 'Lead_Vocal_Raw_Take.wav',
                  size: 38 * 1024 * 1024,
                  type: 'audio/wav',
                  duration: '3:42',
                  uploaded_at: order.created_at,
                  url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3'
                }
              ]).map((file) => {
                const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                const isAudio = file.type.includes('audio') || file.name.endsWith('.wav') || file.name.endsWith('.mp3');

                return (
                  <div key={file.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                          {isAudio ? <Music className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white font-mono break-all">
                            {file.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>{sizeMb} MB</span>
                            <span>•</span>
                            <span className="uppercase">{file.type.split('/')[1] || 'AUDIO'}</span>
                            {file.duration && (
                              <>
                                <span>•</span>
                                <span>Duration: {file.duration}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <a 
                        href={file.url || '#'}
                        download={file.name}
                        onClick={(e) => {
                          if (!file.url || file.url === '#') {
                            e.preventDefault();
                            alert(`Downloading ${file.name} (${sizeMb} MB)`);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download ({sizeMb} MB)
                      </a>
                    </div>

                    {/* Integrated Audio Preview Player for audio stems */}
                    {isAudio && file.url && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <AudioPlayer 
                          src={file.url}
                          title={file.name}
                          artist={order.buyer_name}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Reference Track */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Reference Track & Benchmarks
              </h4>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200">
              {reqData?.reference_track || 'Not provided'}
            </div>
          </div>

          {/* 4. Language & Regional Dialect */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                4. Language / Regional Dialect
              </h4>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200">
              {reqData?.language_dialect || 'Hindi / English Indie'}
            </div>
          </div>

          {/* 5. Additional Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                5. Additional Technical Notes & Stems Info
              </h4>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 leading-relaxed">
              {reqData?.additional_notes || 'All tracks exported dry without master bus processing.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
