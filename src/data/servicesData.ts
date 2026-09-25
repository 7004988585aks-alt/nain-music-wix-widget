import { ServiceDefinition } from '../types';

export const INITIAL_SERVICES: ServiceDefinition[] = [
  {
    id: 'mixing-mastering',
    name: 'Mixing & Mastering',
    iconName: 'Sliders',
    description: 'Professional multi-track mixing, vocal tuning, analog summing, stereo imaging, and commercial loudness mastering for release.',
    category: 'Music & Audio',
    serviceTypes: [
      'Full Mixing & Mastering (Single / Track)',
      'Multi-track Mixing & Stem Mastering',
      'Stereo Mastering Only',
      'Multi-track Mixing Only',
      'Vocal Tuning, Mixing & Final Master',
      'EP / Album Mixing & Mastering',
      'Dolby Atmos / Spatial Audio Mix & Master',
      'Analog Summing Mix & Hybrid Master',
    ],
    metadataFields: {
      genres: ['Hip Hop', 'Pop', 'R&B', 'Rock', 'Electronic / EDM', 'Bollywood / Desi Pop', 'Jazz', 'Acoustic / Folk', 'Metal', 'Classical', 'World / Regional'],
      targetPlatforms: ['Spotify & Apple Music (-14 LUFS)', 'Club / DJ Loudness (-7 to -9 LUFS)', 'Audiophile (-16 LUFS)', 'YouTube / Video Sync', 'Radio Broadcast', 'CD / DDP Image', 'Vinyl Cut'],
      targetDaws: ['Pro Tools', 'Logic Pro', 'Ableton Live', 'FL Studio', 'Studio One', 'Cubase', 'Reaper', 'Wavelab'],
      languages: ['English', 'Hindi', 'Punjabi', 'Spanish', 'Instrumental (No Vocals)', 'Multi-lingual'],
      vocalTypes: ['Male Lead', 'Female Lead', 'Vocal Duet', 'Choir / Group', 'No Vocals (Instrumental)'],
    },
    features: [
      // --- Mixing Portion Features ---
      { id: 'stems_count', name: 'Number of Stems / Audio Tracks', description: 'Maximum stem count processed for multi-track mixing', type: 'number', unit: 'tracks', portion: 'mixing', defaultValues: { basic: 16, standard: 36, premium: 99 } },
      { id: 'mix_balancing', name: 'Multi-Track Balancing & EQ Sculpting', description: 'Individual instrument leveling, tonal cleaning, and clinical surgical EQ', type: 'boolean', portion: 'mixing', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'vocal_editing', name: 'Vocal Tuning & Timing Alignment', description: 'Pitch correction via Melodyne/AutoTune and rhythmic pocket alignment', type: 'boolean', portion: 'mixing', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'analog_gear', name: 'Analog Console Summing & Saturation', description: 'SSL, Neve, Manley, or Tube-Tech analog hybrid bus warmth', type: 'boolean', portion: 'mixing', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'creative_effects', name: 'Spatial Automation, Reverbs & Delays', description: 'Sidechain compression, vocal throws, widening, and stereo movement', type: 'boolean', portion: 'mixing', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'mastered_stems', name: 'Separated Mix Stems Export (Drums/Bass/Inst/Vox)', description: 'Sub-group mix stems bounced for live performance or sync licensing', type: 'boolean', portion: 'mixing', defaultValues: { basic: false, standard: true, premium: true } },

      // --- Mastering Portion Features ---
      { id: 'commercial_mastering', name: 'Commercial Loudness & Limiting (Target LUFS)', description: 'Final stereo limiter, true-peak optimization, and release-ready volume', type: 'boolean', portion: 'mastering', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'stereo_imaging', name: 'Stereo Field Enhancement & Mid/Side EQ', description: 'Phase coherence, wide stereo image, and tight mono sub-bass translation', type: 'boolean', portion: 'mastering', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'streaming_optimization', name: 'Streaming Compliance & True-Peak Check', description: 'Verification report ensuring no inter-sample distortion on Spotify/Apple Music', type: 'boolean', portion: 'mastering', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'high_res_delivery', name: 'High-Res 24-bit 96kHz + 16-bit Master Files', description: 'Dual resolution uncompressed masters for streaming, sync, and CD', type: 'boolean', portion: 'mastering', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'alternate_mix', name: 'Alternate Masters (Radio Edit / TV / Acapella)', description: 'Instrumental, clean edits, and performance backing masters', type: 'boolean', portion: 'mastering', defaultValues: { basic: false, standard: false, premium: true } },
      { id: 'project_file', name: 'DAW Session Project File & Settings Archive', description: 'Raw project session file and plugins settings archive', type: 'boolean', portion: 'mastering', defaultValues: { basic: false, standard: false, premium: true } },
    ],
    suggestedExtras: [
      { name: 'Extra Fast 24-Hour Delivery', description: 'Get your mix & master delivered within 24 hours with priority studio slot', defaultPriceInr: 1800, additionalDays: -1 },
      { name: 'Additional Revision Round', description: 'One extra round of feedback adjustments after included revisions', defaultPriceInr: 800, additionalDays: 1 },
      { name: 'Acapella & Instrumental TV Mixes', description: 'Clean instrumental, lead-up acapella, and performance backing masters', defaultPriceInr: 1200, additionalDays: 0 },
      { name: 'Mastered Sub-group Stems (8 Stems)', description: 'Separated processed stems for live performance or sync licensing', defaultPriceInr: 1800, additionalDays: 1 },
      { name: 'Dedicated Vinyl Pre-master', description: 'De-essed high frequencies and centered low-end to prevent stylus skipping', defaultPriceInr: 1200, additionalDays: 1 },
      { name: 'Complete DAW Project Archive', description: 'Packaged session with all plugin presets and bounced offline audio', defaultPriceInr: 2500, additionalDays: 1 },
    ],
    suggestedRequirements: [
      { question: 'Please provide a link to download your raw, consolidated audio stems or stereo mix (WAV 24-bit/44.1kHz or 48kHz preferred, starting from 0:00).', type: 'file_upload', required: true },
      { question: 'What is the exact BPM (tempo) and musical key of the song?', type: 'text', required: true },
      { question: 'Which streaming platforms or media are you targeting primarily?', type: 'multiple_choice', options: ['Spotify & Apple Music (-14 LUFS)', 'Club / DJ Loudness (-7 to -9 LUFS)', 'YouTube / Video Sync', 'CD / Vinyl Release'], required: true },
      { question: 'Provide 1-2 commercial reference tracks (Spotify or YouTube links) with the sound, punch, and tonal balance you desire.', type: 'text', required: true },
      { question: 'Do you have specific mixing or mastering notes in mind (e.g. vocal style, punchy low end, telephone vocal, filtered intros)?', type: 'text', required: false },
    ],
  },
  {
    id: 'music-production',
    name: 'Music Production',
    iconName: 'Disc',
    description: 'Custom instrumental production, beat making, sound design, and full track arrangements.',
    category: 'Music & Audio',
    serviceTypes: [
      'Custom Beat Making',
      'Full Instrumental Production',
      'Film / Game Soundtrack Production',
      'Remix / Re-production',
      'Acoustic Arrangement to EDM / Pop',
      'Jingle / Commercial Audio Branding',
    ],
    metadataFields: {
      genres: ['Pop', 'Hip Hop / Trap', 'R&B / Soul', 'Electronic / Synthwave', 'Afrobeats', 'Bollywood / Desi Pop', 'Rock / Indie', 'Cinematic'],
      styles: ['Uplifting', 'Dark / Moody', 'Chill / Lo-Fi', 'Energetic / Hype', 'Melodic / Emotional', 'Aggressive'],
      instruments: ['Synthesizers', 'Acoustic Guitar', 'Electric Guitar', 'Piano / Keys', 'Live Drums / 808s', 'Orchestral Strings', 'Ethnic / Traditional'],
      targetDaws: ['Ableton Live', 'FL Studio', 'Logic Pro', 'Cubase', 'Studio One'],
    },
    features: [
      { id: 'track_length', name: 'Track Duration', description: 'Estimated length of finished piece', type: 'text', defaultValues: { basic: 'Up to 2 minutes', standard: 'Up to 3.5 minutes', premium: 'Up to 5 minutes' } },
      { id: 'instruments_count', name: 'Instrumentation Layers', description: 'Depth of sound design and instrument tracks', type: 'number', unit: 'layers', defaultValues: { basic: 8, standard: 20, premium: 45 } },
      { id: 'stems_separated', name: 'Individual Track Stems (WAV)', description: 'Separated audio tracks for mixing', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'midi_files', name: 'MIDI Files Included', description: 'All chords, melodies, and bassline MIDI files', type: 'boolean', defaultValues: { basic: false, standard: false, premium: true } },
      { id: 'mixing_included', name: 'Basic Mix & Pre-Master', description: 'Balanced demo mix ready for vocal recording', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'commercial_license', name: 'Exclusive Commercial Rights', description: 'Full commercial release license for all platforms', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
    ],
    suggestedExtras: [
      { name: 'Exclusive Full Ownership Buyout', description: 'Complete transfer of exclusive publishing and master rights', defaultPriceInr: 5000, additionalDays: 0 },
      { name: 'Additional Musical Bridge / Breakdown', description: 'Add a distinct bridge or extended outro arrangement', defaultPriceInr: 1500, additionalDays: 1 },
      { name: 'All MIDI Chord & Melody Packs', description: 'Full MIDI exports for each virtual instrument layer', defaultPriceInr: 1000, additionalDays: 0 },
      { name: 'Vocal Guide Track / Melody Pitching', description: 'Guide synth melody track showing vocal pocket and structure', defaultPriceInr: 1200, additionalDays: 1 },
    ],
    suggestedRequirements: [
      { question: 'Describe your vision, mood, and intended audience for this production.', type: 'text', required: true },
      { question: 'Attach or link 2-3 reference songs (YouTube/Spotify) that capture the tempo, groove, and instrumentation you want.', type: 'text', required: true },
      { question: 'What is your preferred tempo (BPM) range or song key, if already decided?', type: 'text', required: false },
      { question: 'Will you be recording vocals over this track later?', type: 'multiple_choice', options: ['Yes - Leave plenty of vocal frequency space', 'No - Pure instrumental track', 'Maybe / Not yet decided'], required: true },
    ],
  },
  {
    id: 'lyrics-writing',
    name: 'Lyrics Writing',
    iconName: 'PenTool',
    description: 'Original lyrical composition, emotional storytelling, rhymes, and song structure.',
    category: 'Music & Audio',
    serviceTypes: [
      'Full Song Lyrics (Verse, Chorus, Bridge)',
      'Hook / Chorus Writing',
      'Rap / Hip-Hop Verses',
      'Translation & Localization of Lyrics',
      'Jingle / Commercial Lyrics',
      'Lyric Polishing & Rhyme Doctoring',
    ],
    metadataFields: {
      languages: ['English', 'Hindi', 'Punjabi', 'Urdu', 'Spanish', 'Bilingual'],
      genres: ['Pop', 'R&B / Soul', 'Hip Hop / Rap', 'Rock / Indie', 'Bollywood / Filmi', 'Folk / Singer-Songwriter', 'Country / Blues'],
      styles: ['Romantic / Heartbreak', 'Inspirational / Hype', 'Narrative / Storytelling', 'Conscious / Deep', 'Catchy / Viral Pop'],
    },
    features: [
      { id: 'lyrics_sections', name: 'Song Sections Included', description: 'Scope of lyrics delivered', type: 'text', defaultValues: { basic: 'Chorus / Hook Only', standard: '2 Verses + Chorus', premium: 'Full Song (Verses, Chorus, Bridge, Outro)' } },
      { id: 'rhyme_guide', name: 'Rhyme Scheme & Meter Notes', description: 'Annotation of syllables and cadence accents', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'audio_guide', name: 'Rough Vocal Audio Guide Demo', description: 'Acoustic or spoken voice memo showing the vocal melody cadence', type: 'boolean', defaultValues: { basic: false, standard: false, premium: true } },
      { id: 'commercial_rights', name: '100% Commercial Release Rights', description: 'Seller grants full lyrical copyright for streaming release', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
    ],
    suggestedExtras: [
      { name: 'Vocal Audio Melody Demo (Audio Note)', description: 'I will sing the lyrics over your instrumental to demonstrate flow and cadence', defaultPriceInr: 1500, additionalDays: 1 },
      { name: 'Additional Verse or Bridge Section', description: 'Write an extra custom verse or breakdown', defaultPriceInr: 1000, additionalDays: 1 },
      { name: 'Bilingual Adaptation (Hindi/English)', description: 'Adapt your lyrics into a smooth multi-lingual crossover', defaultPriceInr: 1800, additionalDays: 2 },
    ],
    suggestedRequirements: [
      { question: 'What is the theme, emotion, or story you want these lyrics to convey?', type: 'text', required: true },
      { question: 'Upload your backing instrumental beat or scratch chord demo (MP3/WAV) so I can match the syllable meter.', type: 'file_upload', required: true },
      { question: 'Which language(s) or regional flavor should be used?', type: 'multiple_choice', options: ['English', 'Hindi', 'Punjabi', 'Hinglish (Mix)', 'Other'], required: true },
      { question: 'Are there any specific words, names, or phrases that must or must NOT be included?', type: 'text', required: false },
    ],
  },
  {
    id: 'songwriting',
    name: 'Songwriting',
    iconName: 'Music',
    description: 'Complete songwriting: catchy vocal melodies, chord progressions, and harmonized lyrics.',
    category: 'Music & Audio',
    serviceTypes: [
      'Top-line Melody & Lyrics',
      'Acoustic Songwriting (Guitar/Piano + Vocals)',
      'Hook & Chorus Creation',
      'Complete Pop / R&B Song Composition',
      'EDM / Electronic Vocal Top-line',
    ],
    metadataFields: {
      genres: ['Pop', 'R&B / Neo-Soul', 'Indie / Singer-Songwriter', 'Bollywood / Regional Pop', 'EDM / Dance', 'Country / Folk'],
      languages: ['English', 'Hindi', 'Punjabi', 'Spanish', 'Bilingual'],
      styles: ['Emotional / Ballad', 'Radio Catchy / Pop', 'Introspective', 'Danceable / Upbeat', 'Anthemic'],
    },
    features: [
      { id: 'song_length', name: 'Song Scope', description: 'Coverage of songwriting', type: 'text', defaultValues: { basic: 'Hook / Chorus', standard: '1 Verse + Chorus', premium: 'Full Radio Song' } },
      { id: 'chord_chart', name: 'Chord Chart & Sheet / Tabs (PDF)', description: 'Chord progression sheet with lyrics alignment', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'vocal_melody_demo', name: 'Acoustic Vocal Melody Demo (MP3/WAV)', description: 'Scratch vocal recording showcasing top-line melody', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'harmony_guide', name: 'Backing Harmony Guide Stems', description: 'Harmonic backing melody references', type: 'boolean', defaultValues: { basic: false, standard: false, premium: true } },
      { id: 'commercial_split', name: 'Commercial Rights Clearance', description: 'Clear split-sheet ready agreement', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
    ],
    suggestedExtras: [
      { name: 'Studio Quality Guide Vocal (Dry Stems)', description: 'Professional studio microphone recording of the vocal top-line dry stems', defaultPriceInr: 2500, additionalDays: 2 },
      { name: 'Full MIDI Chord & Melody Sequence', description: 'MIDI data for all melodies and chord progressions', defaultPriceInr: 1200, additionalDays: 1 },
      { name: 'Harmonized 3-Part Vocal Arrangement', description: 'Three distinct vocal harmony parts written and sung', defaultPriceInr: 2000, additionalDays: 1 },
    ],
    suggestedRequirements: [
      { question: 'Upload your instrumental track or chord progression, or let me know if I should compose from scratch.', type: 'file_upload', required: true },
      { question: 'What is the vocal range or gender of the singer who will eventually perform this song?', type: 'text', required: true },
      { question: 'Share 2 songs that represent the style and energy level you are targeting.', type: 'text', required: true },
    ],
  },
  {
    id: 'vocal-arrangement',
    name: 'Vocal Arrangement',
    iconName: 'Mic',
    description: 'Harmonies, vocal stacks, backing vocal arrangements, ad-libs, and vocal tuning.',
    category: 'Music & Audio',
    serviceTypes: [
      'Backing Vocal & Harmony Arrangement',
      'Acapella Group Arrangement',
      'Vocal Tuning & Melodyne Pocketing',
      'Choir / Multi-layer Stacks',
      'Vocal Production & FX Design',
    ],
    metadataFields: {
      genres: ['R&B / Soul', 'Pop', 'Gospel / Choir', 'Acapella', 'Bollywood', 'Rock'],
      vocalTypes: ['Lead Vocal Harmonies', 'Multi-layer 4-part choir', 'Call & Response Ad-libs', 'Falsetto / High Stacks'],
      languages: ['English', 'Hindi', 'Punjabi', 'Spanish', 'Any'],
    },
    features: [
      { id: 'harmony_tracks', name: 'Number of Harmony / Stack Tracks', description: 'Total arranged vocal layers', type: 'number', unit: 'layers', defaultValues: { basic: 4, standard: 10, premium: 24 } },
      { id: 'sheet_music', name: 'Vocal Sheet Music / Solfège Chart', description: 'Arranged notation for singers', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'guide_vocals', name: 'Sung Audio Guide Reference Stems', description: 'Isolated vocal guides for each singer', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'vocal_tuning', name: 'Pitch Tuning & Alignment Included', description: 'Clean Melodyne tuning and phase alignment of vocal stacks', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
    ],
    suggestedExtras: [
      { name: 'Live Studio Sung Stems (Commercial Grade)', description: 'I will sing and deliver studio-grade vocal stems ready to drop into your mix', defaultPriceInr: 3000, additionalDays: 2 },
      { name: 'Complex Counter-Melody Line', description: 'Add an intricate counter-melody during choruses and bridge', defaultPriceInr: 1400, additionalDays: 1 },
      { name: 'Full MIDI Pitch Map', description: 'Exact pitch and note length MIDI track for synthesis or sampler', defaultPriceInr: 900, additionalDays: 0 },
    ],
    suggestedRequirements: [
      { question: 'Upload your raw Lead Vocal track and the instrumental backing track (aligned from 0:00).', type: 'file_upload', required: true },
      { question: 'Do you want traditional harmonies (3rds/5ths) or modern dissonant/R&B clusters?', type: 'multiple_choice', options: ['Clean Classic Harmonies (3rds & 5ths)', 'Modern R&B / Neo-Soul Rich Clusters', 'Big Pop / Rock Gang Vocals', 'Ambient / Reverberant Textures'], required: true },
      { question: 'Key of the song and BPM:', type: 'text', required: true },
    ],
  },
  {
    id: 'composition',
    name: 'Composition',
    iconName: 'FileText',
    description: 'Original musical compositions for films, games, ads, orchestral works, and ensembles.',
    category: 'Music & Audio',
    serviceTypes: [
      'Film / Cinematic Score',
      'Video Game Soundtrack',
      'Orchestral / Classical Composition',
      'Commercial Advertisement Theme',
      'String Quartet / Ensemble Arrangement',
    ],
    metadataFields: {
      styles: ['Cinematic Orchestral', 'Modern Hybrid (Synths + Orchestra)', 'Minimalist Piano', 'Epic Trailer / Action', 'Emotional Drama', 'Dark Ambient / Thriller'],
      instruments: ['Full Orchestra', 'String Section', 'Brass & Woodwinds', 'Hybrid Cinematic Synths', 'Grand Piano', 'Percussion'],
    },
    features: [
      { id: 'duration_minutes', name: 'Composition Length', description: 'Total running time composed', type: 'text', defaultValues: { basic: 'Up to 1 minute', standard: 'Up to 3 minutes', premium: 'Up to 6 minutes' } },
      { id: 'full_score_pdf', name: 'Full Orchestral Score & Parts (PDF)', description: 'Engraved conductor score and individual player parts', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'high_res_mockup', name: 'Realistic High-End Sample Mockup (WAV)', description: 'Rendered with premium orchestral libraries (Spitfire, VSL, Orchestral Tools)', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'separated_cues', name: 'Cue Stems (Strings, Brass, Winds, Percussion)', description: 'Individual orchestral family stems for film dubbing', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'sync_license', name: 'Broadcast / Sync Clearance', description: 'Full sync license for film festivals, broadcast, or commercial release', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
    ],
    suggestedExtras: [
      { name: 'Video Timecode Sync Lock', description: 'Exact hit-point synchronization to your scene cut MP4 video file', defaultPriceInr: 2000, additionalDays: 1 },
      { name: 'Loopable Game Cues (Seamless Looping)', description: 'Prepared seamless loop points and stingers for game engines (Unity / Unreal)', defaultPriceInr: 1500, additionalDays: 1 },
      { name: 'Individual Musician Sheet Music Parts', description: 'Formatted and bound player parts ready for studio recording session', defaultPriceInr: 1800, additionalDays: 2 },
    ],
    suggestedRequirements: [
      { question: 'Provide a brief summary of the scene, game mood, or commercial intent.', type: 'text', required: true },
      { question: 'Upload your video cut (if scoring to picture) or concept art / design documents.', type: 'file_upload', required: false },
      { question: 'List 2 musical references that inspire the orchestral tone you are envisioning.', type: 'text', required: true },
    ],
  },
  {
    id: 'full-production',
    name: 'Full Production',
    iconName: 'Headphones',
    description: 'End-to-end song production: songwriting, arrangement, tracking, vocal production, and final master.',
    category: 'Music & Audio',
    serviceTypes: [
      'Single Track End-to-End Production',
      'Album / EP Executive Production',
      'Singer-Songwriter Demo to Radio Ready Song',
      'Band / Ensemble Full Production',
    ],
    metadataFields: {
      genres: ['Pop', 'Bollywood Pop', 'Rock / Indie', 'Hip Hop / Urban', 'R&B', 'Electronic', 'Acoustic'],
      targetPlatforms: ['Commercial Streaming Release', 'Film Placement', 'Label Pitch', 'Radio Single'],
      languages: ['English', 'Hindi', 'Punjabi', 'Multi-lingual'],
    },
    features: [
      { id: 'production_tier', name: 'Production Scope', description: 'Depth of services covered', type: 'text', defaultValues: { basic: 'Beat & Rough Mix', standard: 'Custom Production + Full Mix', premium: 'Full Radio Master + Stems + Vocal Tuning' } },
      { id: 'session_musicians', name: 'Live Session Instruments (Guitar/Bass/Keys)', description: 'Real instruments recorded in studio', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'vocal_comping', name: 'Vocal Comping, Tuning & Production', description: 'Full vocal chain and pocket tuning', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'final_master', name: 'Commercial Grade Mastering Included', description: 'Radio and club master delivery', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'full_stems_archive', name: 'Complete Uncompressed Stems Archive', description: 'All dry & wet stems packaged in 24-bit WAV', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
    ],
    suggestedExtras: [
      { name: 'Executive Producer 1-on-1 Strategy Call (60 min)', description: 'Deep dive video session discussing release strategy, playlist pitch, and arrangement', defaultPriceInr: 3500, additionalDays: 0 },
      { name: 'Additional Live Session Soloist (e.g. Saxophone / Sitar)', description: 'Hire a verified specialist studio musician for an iconic solo section', defaultPriceInr: 4500, additionalDays: 3 },
      { name: 'Dolby Atmos Spatial Audio Mix', description: 'Complete 7.1.4 immersive spatial mix delivered as an ADM BWF file', defaultPriceInr: 6000, additionalDays: 3 },
    ],
    suggestedRequirements: [
      { question: 'Upload your voice memo, rough phone acoustic demo, or lyric concept.', type: 'file_upload', required: true },
      { question: 'What is the artist brand, target audience, and release timeline for this single?', type: 'text', required: true },
      { question: 'Provide 3 reference tracks that define the target aesthetic and sonic benchmark.', type: 'text', required: true },
    ],
  },
  {
    id: 'music-classes',
    name: 'Music Classes',
    iconName: 'GraduationCap',
    description: '1-on-1 music coaching, production masterclasses, DAW tutoring, vocal lessons, and instrument training.',
    category: 'Music & Audio',
    isClassService: true,
    serviceTypes: [
      'DAW Production & Beatmaking (Ableton/FL/Logic)',
      'Mixing & Mastering Deep Dive',
      'Vocal Technique & Range Expansion',
      'Guitar / Piano / Keys 1-on-1 Lesson',
      'Music Theory for Songwriters & Producers',
      'Sound Design & Synthesizer Mastery',
    ],
    metadataFields: {
      skillLevels: ['Beginner', 'Intermediate', 'Advanced', 'All Levels Welcome'],
      targetDaws: ['Ableton Live', 'FL Studio', 'Logic Pro', 'Pro Tools', 'Cubase', 'Any / General'],
      languages: ['English', 'Hindi', 'Punjabi', 'Regional / Hinglish'],
      instruments: ['Music Production / DAW', 'Vocal Coaching', 'Electric / Acoustic Guitar', 'Piano / Keyboard', 'Bass Guitar', 'Drums / Beat Programming'],
    },
    features: [
      { id: 'session_duration', name: 'Live Video Session Duration', description: 'Length of 1-on-1 session in Nain Class Workspace', type: 'text', defaultValues: { basic: '45 Minutes', standard: '60 Minutes', premium: '90 Minutes (Deep Dive)' } },
      { id: 'session_count', name: 'Number of Live Classes', description: 'Total classes included in package', type: 'number', unit: 'sessions', defaultValues: { basic: 1, standard: 4, premium: 8 } },
      { id: 'recorded_video', name: 'HD Class Recording Access', description: 'Downloadable video of the entire screen and audio session', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'practice_stems', name: 'Practice Project Stems & Exercises', description: 'Handcrafted sample projects and homework files', type: 'boolean', defaultValues: { basic: true, standard: true, premium: true } },
      { id: 'homework_feedback', name: 'Personalized Homework Review & Voice Notes', description: 'Direct critique on your track between classes', type: 'boolean', defaultValues: { basic: false, standard: true, premium: true } },
      { id: 'certificate', name: 'Nain Music Course Completion Certificate', description: 'Verified certificate of completed syllabus', type: 'boolean', defaultValues: { basic: false, standard: false, premium: true } },
    ],
    suggestedExtras: [
      { name: 'Additional 30-Minute Live Follow-up Session', description: 'Dedicated Q&A and project troubleshooting call', defaultPriceInr: 1200, additionalDays: 0 },
      { name: 'Full Project Review & Detailed Written Report', description: 'Comprehensive written breakdown of your mix or arrangement with timestamped notes', defaultPriceInr: 1500, additionalDays: 2 },
      { name: 'Exclusive Sound Library / Sample Pack (2GB)', description: 'Custom curated kicks, snares, 808s, and synth presets crafted by the instructor', defaultPriceInr: 1000, additionalDays: 0 },
    ],
    suggestedRequirements: [
      { question: 'What is your current experience level and what specific goals do you want to accomplish?', type: 'text', required: true },
      { question: 'Which DAW, instruments, or equipment do you currently use at home?', type: 'text', required: true },
      { question: 'What time zone and preferred days/hours work best for your live schedule?', type: 'text', required: true },
      { question: 'Attach a track or work-in-progress you want to focus on during our sessions (optional).', type: 'file_upload', required: false },
    ],
  },
];

export const CURRENCY_CONFIGS = [
  { code: 'INR' as const, symbol: '₹', rateFromInr: 1, name: 'Indian Rupee (Base)' },
  { code: 'USD' as const, symbol: '$', rateFromInr: 0.01, name: 'US Dollar ($10 = ₹1,000)' },
  { code: 'EUR' as const, symbol: '€', rateFromInr: 0.0098, name: 'Euro (Live Rate)' },
  { code: 'GBP' as const, symbol: '£', rateFromInr: 0.0084, name: 'British Pound (Live Rate)' },
];

export const USD_TO_INR_RATE = 100; // Floor benchmark: $10 USD = ₹1,000 INR

export function convertUsdToInr(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_INR_RATE);
}

export function convertInrToUsdAmount(inrAmount: number): number {
  return inrAmount / USD_TO_INR_RATE;
}

export function formatCurrency(
  amountInr: number, 
  currencyCode: 'INR' | 'USD' | 'EUR' | 'GBP' = 'INR',
  overrideRates?: Partial<Record<'USD' | 'EUR' | 'GBP', number>>
): string {
  if (currencyCode === 'INR') {
    return `₹${amountInr.toLocaleString('en-IN')}`;
  }

  const customRate = overrideRates?.[currencyCode];
  const config = CURRENCY_CONFIGS.find(c => c.code === currencyCode) || CURRENCY_CONFIGS[0];
  const rate = customRate !== undefined && customRate > 0 ? customRate : config.rateFromInr;
  const converted = amountInr * rate;
  
  return `${config.symbol}${converted.toFixed(2)}`;
}

export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

export function formatGigPrice(
  amountInr: number,
  _itemCurrency?: 'INR' | 'USD' | SupportedCurrency,
  _displayCurrencyOverride?: SupportedCurrency,
  _overrideRates?: Partial<Record<'USD' | 'EUR' | 'GBP', number>>,
  _exactUsdAmount?: number
): string {
  // Gigs are strictly priced in Indian Rupees (₹)
  return `₹${amountInr.toLocaleString('en-IN')}`;
}

/**
 * Formats a Custom Offer price according to its stored buyer-facing currency.
 * USD offers are strictly formatted as "$XX.XX USD"
 * INR offers are strictly formatted as "₹XX,XXX INR"
 * NEVER converts a USD offer into INR for display.
 */
export function formatCustomOfferPrice(offer: {
  currency?: 'INR' | 'USD';
  pricing_currency?: 'INR' | 'USD';
  offer_amount?: number;
  price_usd?: number;
  price_inr: number;
}): string {
  const currency = offer.currency || offer.pricing_currency || (offer.price_usd && offer.price_usd > 0 ? 'USD' : 'INR');
  if (currency === 'USD') {
    const amt = offer.offer_amount !== undefined && offer.offer_amount > 0
      ? offer.offer_amount
      : (offer.price_usd !== undefined && offer.price_usd > 0
          ? offer.price_usd
          : Number((offer.price_inr / USD_TO_INR_RATE).toFixed(2)));
    return `$${amt.toFixed(2)} USD`;
  } else {
    const amt = offer.offer_amount !== undefined && offer.offer_amount > 0
      ? offer.offer_amount
      : offer.price_inr;
    return `₹${amt.toLocaleString('en-IN')} INR`;
  }
}

/**
 * Formats an amount with an explicit currency label for custom offers.
 */
export function formatCustomOfferAmount(amount: number, currency: 'USD' | 'INR'): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)} USD`;
  }
  return `₹${amount.toLocaleString('en-IN')} INR`;
}

