import 'server-only';

export interface EditorialArticle {
  slug: string;
  title: string;
  description: string;
  body: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  tags: string[];
  category: 'culture' | 'production' | 'business' | 'playlist' | 'spotlight' | 'history';
  heroEyebrow: string;
  image?: string;
  featured?: boolean;
  relatedArtistIds?: string[];
  relatedAlbumQueries?: string[];
  relatedTrackQueries?: string[];
}

export const EDITORIAL_AUTHOR = {
  name: 'GULLYGANG Editorial',
  url: 'https://gullygang.in/about',
};

export const ARTICLES: EditorialArticle[] = [
  {
    slug: 'decoding-drill-and-bass-desi-beats',
    title: 'Decoding Drill and Bass: How Desi Producers Re-shaped the 808',
    description:
      'From Mumbai chawls to South Delhi studios, Indian producers are bending drill rhythms into something distinctly local — a guide to the bass architecture powering modern Desi Hip-Hop.',
    publishedAt: '2026-01-12',
    updatedAt: '2026-01-12',
    readingMinutes: 8,
    tags: ['production', 'sound-design', 'drill', 'desi-hip-hop'],
    category: 'production',
    heroEyebrow: 'PRODUCTION NOTES',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    relatedArtistIds: ['divine', 'seedhe-maut', 'mc-stan'],
    body: `Drill never arrived in India as a foreign transplant — it landed already mutating. Long before the global drill wave of the late 2010s, Mumbai and Delhi producers were already bending sub-bass patterns, sliding 808s, and triplet hi-hats to fit Hindi syllables, Urdu phrasing, and Punjabi cadence. The result is a sound that owes a clear debt to New York and Chicago drill, but never tries to hide its regional accent.

The architecture of a Desi drill beat usually starts with the same tools as the form's pioneers: a Roland TR-808 (or a faithful software emulation), a dark minor-key loop, and a swing-heavy drum kit. What changes is what Indian producers do on top of that scaffolding. Syncopation often opens up to leave room for MCs to spit longer Hindi phrases. Snare rolls are placed to anticipate a rhyme scheme's stressed syllables, not just to mark bar boundaries. Sub-bass glides are tuned to sit under Hindi consonants that simply do not exist in English rap.

In Mumbai, the lineage is dense. Producers working alongside the gully rap scene have leaned into heavy, distorted 808s that bloom against sparse, eerie loops — a sound that flatters street narratives about rent cycles, late-night commutes, and ambition in the face of overcrowding. The low end is not just decoration; it is the song's emotional floor.

In Delhi, drill has fused naturally with the alternative hip-hop ecosystem. Producers there tend to favor cold, almost cinematic pads, sharper hi-hat patterns, and a snare that snaps like a car alarm in winter fog. The MCs ride this with breath-control and internal rhyme schemes that demand the beat leave them small pockets of silence.

What unites the two scenes is restraint. The best Desi drill producers do not pile on flourishes. They build a beat that can survive a verse that stretches for two full minutes without a hook, because in the underground, verses matter more than choruses.

Listeners who want to hear the evolution only need to follow a few artist journeys. Mumbai-origin MCs who cut their teeth on heavy 808 gully anthems now share festival lineups with Delhi duos whose drill arrangements have moved toward minimalist, near-industrial textures. Both threads still sit comfortably under one umbrella — call it Desi drill, call it street rap, call it whatever you want — because the bass is doing the same job in both places: it is giving a language a new kind of weight.`,
  },
  {
    slug: 'independent-records-vs-major-labels',
    title: 'Independent Records vs Major Labels in the Indian Hip-Hop Era',
    description:
      "Why India's most ambitious rap releases are increasingly coming from self-run labels — and what the majors still offer that indie imprints cannot match.",
    publishedAt: '2026-01-05',
    updatedAt: '2026-01-08',
    readingMinutes: 7,
    tags: ['music-business', 'editorial', 'indie'],
    category: 'business',
    heroEyebrow: 'INDUSTRY',
    image: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?q=80&w=1200&auto=format&fit=crop',
    relatedArtistIds: ['prabh-deep', 'krsna', 'chaar-diwaari'],
    body: `For most of the last decade, an Indian rapper had one realistic path to a national release: sign with a major label distributor, accept a smaller advance than the international equivalent, and trade creative latitude for playlist access. That contract is now being renegotiated, in public, by artists who would rather own the masters than chase a top-of-funnel radio push.

The independent route in Indian hip-hop is not romantic — it is operational. A self-run label today can release an album on streaming platforms, license it to YouTube Content ID, sell cassettes at a Delhi gig, and pocket the margin that would otherwise disappear into a parent company's overhead. Some of those independents are still tiny: one producer, one manager, one WhatsApp group. Others are quietly building infrastructure that rivals the majors on regional A&R.

What independents offer that the majors often cannot is patience. A major label expects an album cycle to fit a twelve-week marketing window. An indie imprint can give a conceptual album two years of slow build, drop singles only when the artist is ready, and tour between releases instead of chasing features. For an MC making dense, lyric-forward music, that is not a luxury — it is the precondition for the work.

What the majors still do well is scale. A major-distributed release can land on a curated playlist on day one, can afford a multi-city radio buy-in, and can underwrite a music video that costs more than a typical indie album. For artists trying to break out of the underground and into living-room-name recognition, that infrastructure is genuinely useful.

The most interesting Indian hip-hop releases of the last few years have come from artists who learned to use both. They keep ownership of their masters through a small imprint, but they partner with a major for distribution and playlist pitching. The result is something the old industry model never quite produced: an artist who controls the music and still reaches the casual listener.

For emerging artists weighing the choice, the calculus is no longer about which side of the industry to be on. It is about which pieces of each side to assemble.`,
  },
  {
    slug: 'the-renaissance-of-indian-underground-rap',
    title: 'The Renaissance of Indian Underground Rap',
    description:
      'A new wave of Delhi, Mumbai, and Bengaluru artists is building a sustainable underground scene outside the playlist economy — here is what is actually changing.',
    publishedAt: '2025-12-22',
    updatedAt: '2025-12-22',
    readingMinutes: 9,
    tags: ['underground', 'culture', 'desi-hip-hop', 'editorial'],
    category: 'culture',
    heroEyebrow: 'SCENE REPORT',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    relatedArtistIds: ['chaar-diwaari', 'prabh-deep', 'brodha-v'],
    body: `Talk to anyone who books a small venue in Delhi, Mumbai, or Bengaluru and you will hear the same thing: the underground is bigger than it was three years ago, and the audience is younger. The headline-grabbing signings and stadium tours still belong to the established names, but the live circuit that supports the next tier has quietly matured.

What makes the current moment different from earlier underground waves is infrastructure. Independent promoters now run multi-city tours with real production budgets. Tiny labels handle vinyl pressings, cassette runs, and digital distribution for artists who explicitly do not want to chase the major-label pipeline. The audience, in turn, shows up early, stays late, and actually buys the merch — a small economic fact that decides whether the scene can survive.

The artists driving this wave tend to share a few traits. They write their own concepts, often over multiple projects. They treat production as a serious craft, frequently producing or co-producing their own records. They tour relentlessly, treating every gig as a release. And they treat streaming platforms as one channel among several, not as the only one that matters.

A few of them are now crossing over into the broader Desi hip-hop conversation without abandoning the underground ethic. Their music still feels rooted in a specific city, a specific slang, a specific kind of late-night studio session — but it is reaching listeners who never thought they would care about Hindi-language rap. That crossover is happening slowly, through live shows and word of mouth, not through playlist placement.

For listeners who only know Indian hip-hop through the biggest hits, the underground can feel like a different genre. It rewards close listening. It does not always wear a hook on its sleeve. It assumes you are paying attention, and it usually rewards that assumption.`,
  },
  {
    slug: 'top-10-rappers-in-india',
    title: 'The Voices Reshaping Indian Hip-Hop Right Now',
    description:
      'A working shortlist of the MCs whose verses are defining the current era of Desi rap — across languages, scenes, and stylistic lineages.',
    publishedAt: '2025-12-08',
    updatedAt: '2025-12-15',
    readingMinutes: 10,
    tags: ['desi-hip-hop', 'indian-rap', 'hip-hop', 'editorial'],
    category: 'spotlight',
    heroEyebrow: 'EDITORIAL PICKS',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    relatedArtistIds: ['divine', 'seedhe-maut', 'krsna', 'hanumankind', 'prabh-deep', 'mc-stan', 'chaar-diwaari', 'brodha-v'],
    body: `Any list of the most important Indian rappers right now is going to be controversial — that is part of the point. The scene has grown large enough that no single list captures it honestly. What follows is a working shortlist of MCs whose recent work is shaping how Indian hip-hop sounds and how the rest of the world hears it.

DIVINE remains the artist most international listeners reach for first, and his recent output suggests he is not interested in repeating his biggest hits. The newer verses lean further into personal storytelling and away from anthem-style street narratives, which has cost him some of the casual playlist audience but earned him a deeper critical one. The voice is the same; the writing has grown up alongside it.

Seedhe Maut, the Delhi duo of Encore ABJ and Calm, continue to set the technical bar for Indian hip-hop in any language. Their internal rhyme schemes and breath control are studied by younger MCs the way American rappers once studied Royce da 5'9" or Pharoahe Monch. Their live shows remain the scene's gold standard for energy and tightness.

KR$NA is the closest thing Indian hip-hop has to a pure battle-rap technician with mass appeal. His writing rewards close listening — double entendres, layered wordplay, and structural tricks that do not announce themselves on first pass. He is also unusually disciplined about release quality, which is rare in any scene.

Hanumankind broke through to a genuinely global audience on the strength of a single aggressive, southern-flavoured record. What that breakthrough hid is how much range he has shown in the work since — quieter cuts, looser flows, more vulnerability. He is the artist to watch for the next wave.

Prabh Deep represents the alternative path through Indian hip-hop. Conceptual, jazz-tinged, rooted in Delhi but reaching for a more international sound. His albums are built as full projects, not as collections of singles, and they reward listening in order.

MC Stan continues to define a sound that is unmistakably his own: Pune-rooted trap with a vocal cadence that nobody else in the scene quite replicates. He remains one of the most distinctive new-school voices in the country.

Chaar Diwaari is the wildcard on this list — abrasive, theatrical, experimental in ways that confuse a casual listener and reward a devoted one. The underground scene that orbits his releases is small but unusually loyal, and his production work for other artists is starting to shape the sound of an entire sub-scene.

Brodha V has spent years proving that Indian classical music and hip-hop do not coexist but actively reinforce each other. His multilingual flows and rhythmic discipline set a template that a generation of younger MCs is now borrowing from.

The remaining names worth flagging — across languages and cities from Hyderabad to Guwahati to Kochi — are too many to do justice to in a short list, but their combined output is what makes the present era of Indian hip-hop feel less like a moment and more like a movement.`,
  },
  {
    slug: 'mumbai-gully-rap-origins',
    title: 'Mumbai Gully Rap: Origins of a Movement',
    description:
      "How a single city's train commutes, chawls, and cassette shops produced a sound the rest of India — and the world — had to take seriously.",
    publishedAt: '2025-11-18',
    updatedAt: '2025-11-18',
    readingMinutes: 8,
    tags: ['mumbai', 'underground', 'desi-hip-hop', 'culture'],
    category: 'culture',
    heroEyebrow: 'CITY PROFILE',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200&auto=format&fit=crop',
    relatedArtistIds: ['divine', 'mc-stan'],
    body: `Mumbai's relationship with hip-hop predates any album release. Long before the first gully rap track went viral, the city's trains, chawls, and late-night studios were already incubating a sound: heavy 808s, dense Hindi verses, and a specific kind of storytelling that came from riding the Western line home at midnight.

The first wave was always going to come from the suburbs. There is something about commuting through Mumbai that compresses storytelling — three hours a day on a local train forces you to observe the city in fragments, and the MCs who came up in JB Nagar, Andheri, and Kurla translated those fragments into verses. The city's slang did the rest.

What made the gully rap sound recognizable on first listen was its production choice. Mumbai producers, working with limited home-studio gear, leaned into the 808 harder than their Delhi counterparts did. The low end became a kind of sonic signature — heavy, slightly distorted, and tuned to fit under Hindi consonants that English-language producers had no reason to anticipate.

The visual language mattered too. Cover art that put the artist's face against a Mumbai backdrop — local trains, chawl staircases, monsoons — told the audience immediately that this was not New York rap translated into Hindi. It was Mumbai rap, full stop.

The scene's international breakthrough came in stages: a viral track, a feature film, a global tour, a song with an international producer. Each stage widened the audience without diluting the voice. That is the unusual part of the story — most regional scenes lose their specificity once they reach a global platform. Mumbai gully rap, somehow, kept its postcode.`,
  },
  {
    slug: 'hindi-rap-lyrics-and-bilingual-flow',
    title: 'Bilingual Flow: How Hindi Rappers Code-Switch Over English Beats',
    description:
      'Code-switching is not a compromise — it is a craft. A look at how Indian MCs use Hindi, English, Urdu, and Punjabi inside a single bar.',
    publishedAt: '2025-11-02',
    updatedAt: '2025-11-02',
    readingMinutes: 7,
    tags: ['production', 'culture', 'desi-hip-hop'],
    category: 'production',
    heroEyebrow: 'CRAFT',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop',
    relatedArtistIds: ['krsna', 'prabh-deep', 'brodha-v'],
    body: `Code-switching in Indian hip-hop is not decorative. The best MCs in the scene treat language the way a jazz musician treats chord changes — as a structural element that has to land at exactly the right moment or the whole line collapses.

A typical bilingual verse does not translate cleanly. The Hindi and English halves do not always carry the same weight, and a strong writer uses that asymmetry deliberately. A punchline lands harder in the language the audience is least expecting. A line that explains the setup in English and lands the punch in Hindi is a small structural trick that listeners feel even when they cannot articulate why.

Urdu and Punjabi code-switching adds another layer. Both languages bring phonetic tools — soft consonants, internal vowels, suffixes — that change the rhythm of a bar in ways English cannot. An MC who can land a line that bends through three languages without losing flow is doing something close to what a drummer does switching time signatures mid-fill.

The technical challenge is timing. Each language has its own natural cadence, and a verse that ignores those cadences sounds like three different songs glued together. The MCs who pull it off share a habit: they practice the multilingual line aloud at performance tempo until it stops feeling like translation and starts feeling like a single breath.`,
  },
];

export function getAllArticleSlugs(): string[] {
  return ARTICLES.map((a) => a.slug);
}

export function getArticleBySlug(slug: string): EditorialArticle | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function getAllArticles(): EditorialArticle[] {
  return [...ARTICLES].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getArticlesByTag(tag: string): EditorialArticle[] {
  return getAllArticles().filter((a) => a.tags.includes(tag));
}

const ARTIST_ALIASES: Record<string, string[]> = {
  divine: ['divine', 'vivian divine', 'gully gang'],
  'seedhe-maut': ['seedhe-maut', 'seedhe maut', 'encore abj', 'calm', 'tbsm'],
  krsna: ['krsna', 'kr$na', 'kr-na', 'prozpekt'],
  hanumankind: ['hanumankind', 'sooraj cherukat'],
  'prabh-deep': ['prabh-deep', 'prabh deep'],
  'mc-stan': ['mc-stan', 'mc stan', 'altaf tadavi'],
  'chaar-diwaari': ['chaar-diwaari', 'chaar diwaari', 'garv soni'],
  'brodha-v': ['brodha-v', 'brodha v', 'vighnesh shivanand'],
};

export function getArticlesByArtist(artistId: string, artistName?: string): EditorialArticle[] {
  const cleanId = artistId.toLowerCase().trim();
  const cleanName = artistName?.toLowerCase().trim() || '';

  // Match canonical alias key
  const matchedCanonicalKey = Object.keys(ARTIST_ALIASES).find((key) => {
    const aliases = ARTIST_ALIASES[key];
    return (
      key === cleanId ||
      aliases.includes(cleanId) ||
      (cleanName && aliases.some((a) => cleanName.includes(a) || a.includes(cleanName)))
    );
  });

  const lookupKey = matchedCanonicalKey || cleanId;

  return getAllArticles().filter((a) => {
    if (!a.relatedArtistIds || a.relatedArtistIds.length === 0) return false;
    return (
      a.relatedArtistIds.includes(lookupKey) ||
      a.relatedArtistIds.includes(cleanId) ||
      (matchedCanonicalKey ? a.relatedArtistIds.includes(matchedCanonicalKey) : false)
    );
  });
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const article of ARTICLES) {
    for (const tag of article.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export interface TagSummary {
  slug: string;
  count: number;
  articles: EditorialArticle[];
  description: string;
}

const TAG_DESCRIPTIONS: Record<string, string> = {
  mumbai: 'Reporting, profiles, and scene notes from the city that invented gully rap.',
  'music-business': 'How the Indian hip-hop industry is being built — one indie label at a time.',
  production: 'Production craft, beat architecture, and the technical work behind the verses.',
  'sound-design': 'Mixing, mastering, and the sonic choices that define a generation of Desi beats.',
  underground: 'The artists, labels, and venues operating outside the playlist economy.',
  culture: 'Long-form writing on the cultural currents shaping Indian hip-hop.',
  'desi-hip-hop': 'Coverage of the broader Desi Hip-Hop movement across languages and scenes.',
  drill: 'Drill music, its offshoots, and how Indian producers have made the form their own.',
  editorial: 'Editorial essays and scene commentary from GULLYGANG.',
  'hip-hop': 'General hip-hop writing with an Indian focus.',
  'indian-rap': 'Profiles and analysis of the artists defining modern Indian rap.',
  indie: 'Independent releases, labels, and the infrastructure of the indie ecosystem.',
};

export function getTagSummary(tag: string): TagSummary | null {
  const articles = getArticlesByTag(tag);
  if (articles.length === 0) return null;
  return {
    slug: tag,
    count: articles.length,
    articles,
    description: TAG_DESCRIPTIONS[tag] ?? `Articles tagged ${tag} on GULLYGANG.`,
  };
}

export function getAllTagSummaries(): TagSummary[] {
  return getAllTags()
    .map((tag) => getTagSummary(tag))
    .filter((s): s is TagSummary => s !== null);
}

// Any tag with fewer articles than this threshold is considered thin taxonomy
// and will emit "noindex, follow" to protect the domain from index bloat.
export const INDEXABLE_TAG_THRESHOLD = 999;

export function isTagIndexable(summary: TagSummary): boolean {
  return summary.count >= INDEXABLE_TAG_THRESHOLD;
}
