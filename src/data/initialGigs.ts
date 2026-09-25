import { Gig, User, BuyerProfile } from '../types';

export const CURRENT_USER: User = {
  id: 'usr_nain_9281',
  name: 'Devon SoundLab',
  username: 'devon_audio',
  avatar_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&auto=format&fit=crop&q=80',
  headline: 'Commercial Audio Mixing & Mastering Engineer • Dolby Atmos Specialist',
  level: 'Top Rated Seller',
  rating: 4.98,
  reviews_count: 142,
  response_time: '1 Hour',
  last_delivery: 'About 2 hours ago',
  orders_completed: 184,
  location: 'Mumbai, India',
  joined_date: 'March 2022',
  bio: 'Certified audio mixing engineer and multi-platinum mastering specialist with 9+ years in professional studio production. Equipped with analog tube outboard gear and precision hybrid monitoring to make tracks radio and streaming ready.',
  badges: ['Studio Verified Pro', 'Top Rated Studio', 'Super Fast 1h Response'],
  skills: [
    'Vocal Tuning (Melodyne)',
    'Analog Stem Mixing',
    'Commercial Stereo Mastering',
    'Dolby Atmos Spatial Mix',
    'Drum Tightening & Alignment',
    'Film Audio Post-Production'
  ],
  studio_gear: [
    'Universal Audio Apollo x8p Heritage',
    'Neumann U87 Ai Studio Microphone',
    'Genelec 8351B SAM Studio Monitors',
    'SSL Fusion Analog Master Processor',
    'Tube-Tech CL 1B Optical Compressor',
    'Warm Audio WA76 Limiting Amplifier'
  ],
  daws: [
    'Pro Tools HD Ultimate',
    'Apple Logic Pro',
    'Ableton Live 12 Suite',
    'Steinberg Cubase Pro'
  ],
  languages: [
    { id: 'lang_1', language: 'Hindi', proficiency: 'Native / Bilingual' },
    { id: 'lang_2', language: 'English', proficiency: 'Fluent' },
    { id: 'lang_3', language: 'Punjabi', proficiency: 'Conversational' }
  ],
  linked_accounts: [
    { id: 'sacc_1', provider: 'Spotify', identifier: 'https://open.spotify.com/artist/devon_soundlab', is_connected: true, connected_at: '2022-04-10' },
    { id: 'sacc_2', provider: 'YouTube', identifier: 'https://www.youtube.com/@DevonSoundLab', is_connected: true, connected_at: '2022-05-01' },
    { id: 'sacc_3', provider: 'SoundCloud', identifier: 'https://soundcloud.com/devon-soundlab-official', is_connected: true, connected_at: '2022-06-20' },
    { id: 'sacc_4', provider: 'Instagram', identifier: 'https://www.instagram.com/devonsoundlab', is_connected: true, connected_at: '2022-07-15' }
  ],
  certifications: [
    'Avid Certified Pro Tools HD Expert (Music & Post)',
    'Waves Audio Certified Specialist',
    'Apple Certified Logic Pro Professional'
  ]
};

export const DEFAULT_BUYER_PROFILE: BuyerProfile = {
  id: 'usr_anilkumar_saurav',
  name: 'Anil Kumar Saurav',
  username: 'anilkumarsaurav',
  email: 'anilkumarsaurav@gmail.com',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  headline: 'Music Creator & Audio Project Director',
  bio: 'Independent music producer, creator and audio project director. Actively commissioning mixing, mastering, vocal pitch tuning and background score production for commercial music releases.',
  member_since: 'March 2024',
  location: 'Mumbai, India',
  country: 'India',
  country_code: 'IN',
  city: 'Mumbai',
  languages: [
    { id: 'lang_in_1', language: 'Hindi', proficiency: 'Native / Bilingual' },
    { id: 'lang_in_2', language: 'English', proficiency: 'Fluent' },
    { id: 'lang_in_3', language: 'Bhojpuri', proficiency: 'Native / Bilingual' }
  ],
  linked_accounts: [
    { id: 'acc_sp', provider: 'Spotify', identifier: 'https://open.spotify.com/artist/anilkumarsaurav', is_connected: true, connected_at: '2024-03-12' },
    { id: 'acc_yt', provider: 'YouTube', identifier: 'https://www.youtube.com/@AnilKumarSaurav', is_connected: true, connected_at: '2024-04-05' },
    { id: 'acc_ig', provider: 'Instagram', identifier: 'https://www.instagram.com/anilkumarsaurav', is_connected: true, connected_at: '2024-05-10' },
    { id: 'acc_sc', provider: 'SoundCloud', identifier: 'https://soundcloud.com/anilkumarsaurav', is_connected: false }
  ],
  interests: [
    'Vocal Tuning & Melodyne',
    'Stereo & Atmos Mastering',
    'Film Score & Background Music',
    'Acoustic Guitar & Vocals',
    'Commercial Audio Production'
  ],
  buyer_type: 'individual',
  is_verified: true
};

export const INITIAL_GIGS: Gig[] = [
  {
    id: 'gig_mix_01',
    seller_id: 'usr_nain_9281',
    service_id: 'mixing-mastering',
    title_prefix: 'I will ',
    service_title: 'mix and master your song to competitive commercial streaming standards',
    category: 'Music & Audio',
    service_type: 'Full Mixing & Mastering (Single / Track)',
    metadata: {
      genres: ['Pop', 'Hip Hop', 'R&B'],
      target_daw: 'Pro Tools',
      target_platforms: ['Spotify & Apple Music (-14 LUFS)', 'Club / DJ Loudness (-7 to -9 LUFS)'],
      languages: ['English', 'Hindi'],
      vocal_instrumental: 'Vocal Lead',
    },
    search_tags: ['audio mixing', 'music mastering', 'mixing & mastering', 'vocal tuning', 'song mix', 'pro tools'],
    description: `### Professional Studio Mixing & Mastering for Serious Artists

Bring your tracks to life with punch, clarity, wide stereo imaging, and commercial volume that competes directly with chart-topping releases on Spotify, Apple Music, and YouTube.

#### What is Included:
- Surgical EQ cleanup removing muddy frequencies and harsh resonances
- Analog-modeled compression for punchy drums and up-front vocals
- Premium vocal pitch correction via Melodyne & AutoTune (natural or modern style)
- Expansive spatial depth using custom algorithmic reverbs and stereo delays
- Final commercial loudness mastering targeting streaming specs without digital clipping
- Pristine 24-bit 48kHz lossless WAV master deliverables

#### What is NOT Included:
- Recording original vocal or instrument parts
- Fixing severely clipped or distorted audio files recorded on substandard microphones

#### The Studio Process:
1. You provide the consolidated raw stems starting from 0:00.
2. I perform gain staging, vocal tuning, and balancing.
3. You receive Mix Revision 1 for feedback.
4. Revisions applied and final master delivered!`,
    summary: 'High-end multi-track mixing & mastering utilizing hybrid analog chains and surgical Melodyne tuning for competitive streaming releases.',
    status: 'published',
    has_three_packages: true,
    packages: [
      {
        id: 'pkg_mix_basic',
        gig_id: 'gig_mix_01',
        package_type: 'basic',
        name: 'Silver Mix & Master',
        description: 'Single vocal over stereo beat or acoustic track up to 16 stems. Full EQ, compression, vocal tuning, and loudness polish.',
        price_inr: 2499,
        delivery_days: 3,
        revisions: 2,
        quantity_scope: 'Up to 16 stems',
        included_features: {
          stems_count: 16,
          mix_balancing: true,
          vocal_editing: true,
          analog_gear: false,
          creative_effects: true,
          mastered_stems: false,
          commercial_mastering: true,
          stereo_imaging: true,
          streaming_optimization: true,
          high_res_delivery: true,
          alternate_mix: false,
          project_file: false,
        },
        deliverables: ['High-Res 24-bit WAV', 'Commercial Streaming Master WAV'],
        published: true,
      },
      {
        id: 'pkg_mix_standard',
        gig_id: 'gig_mix_01',
        package_type: 'standard',
        name: 'Gold Pro Mix & Master',
        description: 'Full multi-track production up to 36 stems. Deep vocal comping, analog bus summing, and sub-mastered stems.',
        price_inr: 5499,
        delivery_days: 4,
        revisions: 4,
        quantity_scope: 'Up to 36 stems',
        included_features: {
          stems_count: 36,
          mix_balancing: true,
          vocal_editing: true,
          analog_gear: true,
          creative_effects: true,
          mastered_stems: true,
          commercial_mastering: true,
          stereo_imaging: true,
          streaming_optimization: true,
          high_res_delivery: true,
          alternate_mix: false,
          project_file: false,
        },
        deliverables: ['High-Res 24-bit WAV', 'Instrumental Master WAV', 'Mastered Sub-Stems WAV Archive'],
        published: true,
      },
      {
        id: 'pkg_mix_premium',
        gig_id: 'gig_mix_01',
        package_type: 'premium',
        name: 'Diamond Platinum Mix & Master',
        description: 'Unlimited stems, full analog hardware processing, Dolby Atmos stereo downmix, radio + TV edits, and full project archive.',
        price_inr: 9999,
        delivery_days: 5,
        revisions: -1, // Unlimited
        quantity_scope: 'Unlimited stems',
        included_features: {
          stems_count: 99,
          mix_balancing: true,
          vocal_editing: true,
          analog_gear: true,
          creative_effects: true,
          mastered_stems: true,
          commercial_mastering: true,
          stereo_imaging: true,
          streaming_optimization: true,
          high_res_delivery: true,
          alternate_mix: true,
          project_file: true,
        },
        deliverables: ['24-bit 96kHz Master', 'Radio Clean Edit', 'TV Instrumental', 'Acapella Mix', 'Full Pro Tools Session ZIP', 'Mastered Stems'],
        published: true,
      },
    ],
    extras: [
      { id: 'ext_mix_1', gig_id: 'gig_mix_01', name: '24-Hour Express Studio Delivery', description: 'Jump to the front of the queue with priority delivery within 24 hours', price_inr: 1800, delivery_days: -2, enabled: true },
      { id: 'ext_mix_2', gig_id: 'gig_mix_01', name: 'Extra Mix Revision Pass', description: 'Additional round of client-directed mix adjustments', price_inr: 800, delivery_days: 1, enabled: true },
      { id: 'ext_mix_3', gig_id: 'gig_mix_01', name: 'Clean Radio & Performance TV Tracks', description: 'Dedicated edited vocal and performance backing files', price_inr: 1200, delivery_days: 0, enabled: true },
    ],
    requirements: [
      { id: 'req_mix_1', gig_id: 'gig_mix_01', question: 'Please share your stems download link (Google Drive / WeTransfer / Dropbox with 24-bit WAVs aligned from 0:00).', type: 'file_upload', required: true, order: 1 },
      { id: 'req_mix_2', gig_id: 'gig_mix_01', question: 'Song BPM (Tempo) and Musical Key (e.g. 120 BPM, C# Minor):', type: 'text', required: true, order: 2 },
      { id: 'req_mix_3', gig_id: 'gig_mix_01', question: 'Provide 1-2 commercial reference tracks (Spotify or YouTube links):', type: 'text', required: true, order: 3 },
      { id: 'req_mix_4', gig_id: 'gig_mix_01', question: 'Any specific creative FX notes (reverbs, telephone filters, pitch drops)?', type: 'text', required: false, order: 4 },
    ],
    faqs: [
      { id: 'faq_1', question: 'How should I export my stems?', answer: 'Export all tracks as dry 24-bit WAV files (or 48kHz). Make sure all tracks start exactly at time 0:00 so they stay synchronized when imported into my DAW.' },
      { id: 'faq_2', question: 'Do you tune the vocals?', answer: 'Yes! In standard and premium packages, I manually tune the lead vocals and harmonies using Celemony Melodyne for transparent, natural results, or AutoTune if you prefer modern trap aesthetics.' },
      { id: 'faq_3', question: 'What if I need an extra revision?', answer: 'Standard includes 4 revisions, and Premium offers unlimited revisions until you are 100% satisfied with the sound balance.' },
    ],
    media: [
      {
        id: 'med_mix_1',
        gig_id: 'gig_mix_01',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
        title: 'Studio SSL Console Mixing Session',
        sort_order: 1,
        primary: true,
      },
      {
        id: 'med_mix_2',
        gig_id: 'gig_mix_01',
        media_type: 'audio',
        file_url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3',
        audio_before_url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3',
        audio_after_url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3',
        title: 'Pop / R&B Mix Before & After Comparison',
        sort_order: 2,
        primary: false,
      },
      {
        id: 'med_mix_3',
        gig_id: 'gig_mix_01',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
        title: 'Analog Outboard Racks & Acoustic Studio',
        sort_order: 3,
        primary: false,
      },
    ],
    seller_rights_confirmed: true,
    max_active_projects: 3, // Capacity: 3 active projects
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-09-12T14:30:00Z',
    published_at: '2026-08-12T11:00:00Z',
  },
  {
    id: 'gig_prod_02',
    seller_id: 'usr_nain_9281',
    service_id: 'music-production',
    title_prefix: 'I will ',
    service_title: 'produce a custom radio-ready pop and hip hop beat with live guitars',
    category: 'Music & Audio',
    service_type: 'Custom Beat Making',
    metadata: {
      genres: ['Pop', 'Hip Hop / Trap', 'R&B / Soul'],
      styles: ['Melodic / Emotional', 'Uplifting'],
      instruments: ['Electric Guitar', 'Acoustic Guitar', 'Synthesizers', 'Live Drums / 808s'],
      target_daw: 'Ableton Live',
    },
    search_tags: ['beat making', 'pop production', 'hip hop beat', 'guitar beat', 'instrumental'],
    description: `### Custom Pop & Hip-Hop Beats Tailored Directly to Your Vocal Style

Are you an artist looking for an original signature sound instead of recycled generic beats? I compose, record, and produce tailor-made instrumentals featuring recorded Fender Stratocaster guitars and custom synth textures.

#### Included in This Service:
- 100% original composition (no uncleared samples)
- Live recorded acoustic and electric guitar riffs
- Punchy modern 808s and groove-locked drum programming
- Dynamic song arrangement with build-ups, breakdowns, and ear candy
- Commercial license allowing release on all digital streaming platforms

#### How It Works:
1. Send me your favorite artist references or singing demo.
2. I send a 60-second draft beat concept within 48 hours.
3. We refine the tempo, instrumentation, and bridge sections.
4. Receive final uncompressed WAVs, stems, and MIDI files!`,
    summary: 'Original modern pop and hip-hop beat production featuring live recorded guitars, hard-hitting drums, and commercial streaming rights.',
    status: 'draft',
    has_three_packages: true,
    packages: [
      {
        id: 'pkg_prod_basic',
        gig_id: 'gig_prod_02',
        package_type: 'basic',
        name: 'Standard Beat License',
        description: 'Single stereo WAV track (untagged) up to 2.5 minutes with commercial streaming license up to 100k streams.',
        price_inr: 3499,
        delivery_days: 3,
        revisions: 2,
        quantity_scope: 'Up to 2.5 minutes',
        included_features: {
          track_length: 'Up to 2.5 minutes',
          instruments_count: 12,
          stems_separated: false,
          midi_files: false,
          mixing_included: true,
          commercial_license: true,
        },
        deliverables: ['High-Res 24-bit WAV', 'Standard License Agreement'],
        published: false,
      },
      {
        id: 'pkg_prod_standard',
        gig_id: 'gig_prod_02',
        package_type: 'standard',
        name: 'Tracked Out Stems Beat',
        description: 'Full song arrangement with separated WAV stems for your vocal engineer, unlimited streaming license, and MIDI files.',
        price_inr: 7999,
        delivery_days: 5,
        revisions: 3,
        quantity_scope: 'Up to 3.5 minutes',
        included_features: {
          track_length: 'Up to 3.5 minutes',
          instruments_count: 24,
          stems_separated: true,
          midi_files: true,
          mixing_included: true,
          commercial_license: true,
        },
        deliverables: ['24-bit Stereo Master', 'All Tracked Stems (WAV)', 'Full MIDI Package', 'Commercial License'],
        published: false,
      },
      {
        id: 'pkg_prod_premium',
        gig_id: 'gig_prod_02',
        package_type: 'premium',
        name: 'Full Exclusive Production',
        description: '100% exclusive buyout rights, custom live guitars, bridge/outro extension, and complete Ableton project files.',
        price_inr: 14999,
        delivery_days: 7,
        revisions: 5,
        quantity_scope: 'Full song duration',
        included_features: {
          track_length: 'Up to 5 minutes',
          instruments_count: 45,
          stems_separated: true,
          midi_files: true,
          mixing_included: true,
          commercial_license: true,
        },
        deliverables: ['Exclusive Rights Agreement', 'Individual Stems ZIP', 'All MIDI Data', 'Ableton Project File', 'Instrumental & Demo Guides'],
        published: false,
      },
    ],
    extras: [
      { id: 'ext_prod_1', gig_id: 'gig_prod_02', name: 'Exclusive Full Copyright Buyout', description: 'Permanently retire the beat and own 100% of master and publishing', price_inr: 6000, delivery_days: 0, enabled: true },
      { id: 'ext_prod_2', gig_id: 'gig_prod_02', name: 'Guitar Solo Feature Section', description: 'Record a dedicated 16-bar melodic electric guitar solo', price_inr: 1800, delivery_days: 1, enabled: true },
    ],
    requirements: [
      { id: 'req_prod_1', gig_id: 'gig_prod_02', question: 'Describe the vibe, mood, and genre you want for this production.', type: 'text', required: true, order: 1 },
      { id: 'req_prod_2', gig_id: 'gig_prod_02', question: 'Share 2-3 links to songs with beats or production styles you admire.', type: 'text', required: true, order: 2 },
      { id: 'req_prod_3', gig_id: 'gig_prod_02', question: 'Upload an acoustic demo or voice memo if you already have lyrics/melody.', type: 'file_upload', required: false, order: 3 },
    ],
    faqs: [
      { id: 'faq_prod_1', question: 'Can I release this on Spotify and Apple Music?', answer: 'Yes! All packages include commercial streaming licenses. With the standard and premium packages, you can monetize across all DSPs and YouTube Content ID.' },
    ],
    media: [
      {
        id: 'med_prod_1',
        gig_id: 'gig_prod_02',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        title: 'Modern Production Studio Setup',
        sort_order: 1,
        primary: true,
      },
    ],
    seller_rights_confirmed: true,
    max_active_projects: 2, // Capacity: 2 active projects
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-17T16:20:00Z',
  },
];
