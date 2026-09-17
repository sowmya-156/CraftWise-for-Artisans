import { MarketOpportunity } from './types.js';

export interface MarketMatchContext {
  craftType?: string;
  category?: string;
  materials?: string[];
  price?: number;
  state?: string;
  district?: string;
  cooperativeName?: string;
}

/**
 * Transparent, explainable Market Linkage Engine for Indian Artisans
 * Connects rural and marginalized craft producers to official government portals,
 * verified B2B marketplaces, artisan cooperatives, and e-commerce buyer networks.
 */
export function generateMarketRecommendations(context: MarketMatchContext): MarketOpportunity[] {
  const craft = (context.craftType || '').toLowerCase();
  const category = (context.category || '').toLowerCase();
  const state = (context.state || '').toLowerCase();
  const materials = (context.materials || []).map(m => m.toLowerCase());
  const price = context.price || 500;

  const catalog: MarketOpportunity[] = [
    {
      id: 'gem-artisan',
      name: 'Government e-Marketplace (GeM) - Artisan Corner',
      category: 'government',
      badge: 'Official GoI Portal',
      matchScore: 96,
      matchingCategory: 'Public Procurement & Ministries',
      locationScope: 'All India (with Regional Hubs)',
      eligibility: 'Artisans with Pehchan Card or Udyam registration (exemption for rural SHGs)',
      officialUrl: 'https://gem.gov.in',
      actionText: 'View Official Platform',
      description: 'Central and State Government departments purchase handmade office decor, mementos, and utility wares directly with 0% vendor listing fees.',
      whyRecommended: [
        'Government departments have a mandatory minimum 25% procurement quota from MSEs and handicraft producers.',
        'Direct bank account payments without middleman deductions.',
        'High demand for sustainable desk items, baskets, and conference gift sets.'
      ]
    },
    {
      id: 'trifed-tribes',
      name: 'TRIFED / Tribes India Network',
      category: 'government',
      badge: 'Tribal & Rural Artisan Support',
      matchScore: 92,
      matchingCategory: 'Natural Materials & Forest Crafts',
      locationScope: 'National Retail & Export network',
      eligibility: 'Tribal & marginalized rural artisans, forest-dwellers, and bamboo/terracotta craftspeople',
      officialUrl: 'https://tribesindia.com',
      actionText: 'Explore Sourcing Rules',
      description: 'Ministry of Tribal Affairs nodal agency operating 120+ retail outlets across metropolitan airports, state capitals, and international exhibitions.',
      whyRecommended: [
        materials.some(m => m.includes('bamboo') || m.includes('cane') || m.includes('grass'))
          ? 'High match for natural fiber crafts (bamboo/cane) actively promoted under the National Bamboo Mission.'
          : 'Dedicated procurement cells that purchase craft inventory upfront at fair artisan prices.',
        'Protection against distress sales with guaranteed advance payments.',
        'State marketing federations provide free transit and packaging.'
      ]
    },
    {
      id: 'ondc-crafts',
      name: 'ONDC (Open Network for Digital Commerce) Artisan Nodes',
      category: 'ecommerce',
      badge: 'Open Network Protocol',
      matchScore: 90,
      matchingCategory: 'Direct-to-Consumer Digital Cataloging',
      locationScope: 'Pan-India hyperlocal & national',
      eligibility: 'Open to all individual artisans and self-help groups (SHGs)',
      officialUrl: 'https://ondc.org',
      actionText: 'Connect via Buyer Apps',
      description: 'Decentralized Indian e-commerce network allowing artisans to list products once and sell across Paytm, Mystore, Pincode, and Magicpin simultaneously.',
      whyRecommended: [
        'No monopolistic 30% platform commissions — transaction fee capped below 5%.',
        'Direct settlement to artisan mobile numbers via UPI.',
        'Compatible with CraftWise Digital Selling Kit links.'
      ]
    },
    {
      id: 'hunar-haat',
      name: 'Hunar Haat & Shilpgram Festivals',
      category: 'institutional',
      badge: 'Exhibition & Direct Buyer Meets',
      matchScore: 88,
      matchingCategory: 'Traditional & Heritage Crafts',
      locationScope: 'State Capitals & Delhi Pragati Maidan',
      eligibility: 'Master artisans, rural craftspeople, and women entrepreneurs',
      officialUrl: 'https://hunarhaat.org',
      actionText: 'Check Upcoming Haats',
      description: 'Flagship artisan conclaves organized by the Ministry of Minority Affairs offering free exhibition stalls, travel allowance, and direct urban buyer engagement.',
      whyRecommended: [
        'Zero stall rental cost for verified traditional craft makers.',
        'High footfall from urban retail buyers, bulk gift purchasers, and tourists.',
        'Opportunity to demonstrate live craft-making and build direct customer contacts.'
      ]
    },
    {
      id: 'amazon-karigar',
      name: 'Amazon Karigar & Saheli Program',
      category: 'ecommerce',
      badge: 'Online Marketplace Channel',
      matchScore: 85,
      matchingCategory: 'E-Commerce Retail & Gift Shoppers',
      locationScope: 'National fulfillment',
      eligibility: 'Artisans, cooperatives, or NGO partners with basic GST/composite scheme or PAN',
      officialUrl: 'https://www.amazon.in/b?node=13936605031',
      actionText: 'View Karigar Guidelines',
      description: 'Special storefront featuring 10,000+ master craft items with reduced referral fees, free product photography support, and dedicated storefront badges.',
      whyRecommended: [
        'Enables customers searching for authentic handmade home decor to discover your product.',
        'Subsidized courier logistics via Amazon Easy Ship pick-up from tier-2 and tier-3 towns.',
        'Seasonal festive pushes during Diwali, Rakhi, and New Year.'
      ]
    },
    {
      id: 'flipkart-samarth',
      name: 'Flipkart Samarth Initiative',
      category: 'ecommerce',
      badge: 'Rural Artisan Onboarding',
      matchScore: 86,
      matchingCategory: 'Affordable & Everyday Handicrafts',
      locationScope: 'Pan-India Tier 1-3 delivery',
      eligibility: 'Artisans, weavers, and self-help groups supported by state governments',
      officialUrl: 'https://www.flipkart.com/samarth',
      actionText: 'Explore Samarth Benefits',
      description: 'Dedicated incubation initiative with 0% commission for the initial 6 months, account management support, and cataloging assistance.',
      whyRecommended: [
        'Waiver of initial marketplace commissions boosts profit margins.',
        'Partnered with state handicraft development corporations (e.g., Lepakshi, APCO).',
        'Strong reach across tier-2, tier-3, and rural consumers.'
      ]
    },
    {
      id: 'dastkar-society',
      name: 'Dastkar & Craft Council Exhibitions',
      category: 'cooperative',
      badge: 'Artisan Society & Fair Trade',
      matchScore: 84,
      matchingCategory: 'Artisanal Collectives & B2B Wholesalers',
      locationScope: 'Metro exhibitions & artisan bazaars',
      eligibility: 'Traditional craftspeople, family guilds, and craft cooperatives',
      officialUrl: 'https://dastkar.org',
      actionText: 'View Society Programs',
      description: 'Pioneering not-for-profit artisan association offering design mentoring, quality control workshops, and direct stalls at Nature Bazaars.',
      whyRecommended: [
        'Curated platform with affluent heritage buyers who respect fair artisan pricing.',
        'B2B tie-ups with boutique interior designers, hotel chains, and retail exporters.',
        'Community networking with fellow master artisans from other states.'
      ]
    },
    {
      id: 'epch-india',
      name: 'Export Promotion Council for Handicrafts (EPCH)',
      category: 'export',
      badge: 'Global Trade & Export Orders',
      matchScore: 82,
      matchingCategory: 'Bulk B2B & Export Inquiries',
      locationScope: 'International (Europe, USA, Middle East, Japan)',
      eligibility: 'Artisan clusters, export cooperatives, and high-capacity craft groups',
      officialUrl: 'https://epch.in',
      actionText: 'Learn About Export Clusters',
      description: 'Apex export body organizing the biannual IHGF Delhi Fair, connecting Indian producers to overseas importers, department stores, and catalogers.',
      whyRecommended: [
        price >= 300
          ? 'Your handcrafted item meets international sustainability and natural aesthetic preferences.'
          : 'Opportunity for container-scale bulk orders for hotel amenities and home storage.',
        'Special assistance for artisan clusters in obtaining international design patents and GI tags.'
      ]
    }
  ];

  // Tailor match scores dynamically based on specific artisan details:
  return catalog.map(item => {
    let score = item.matchScore;
    const reasons = [...item.whyRecommended];

    // State / Regional boost (e.g. Andhra Pradesh / Visakhapatnam)
    if (state.includes('andhra') || state.includes('telangana')) {
      if (item.id === 'gem-artisan') {
        score = Math.min(99, score + 3);
        reasons.unshift('Priority facilitation at Andhra Pradesh State GeM facilitation cell in Visakhapatnam & Vijayawada.');
      }
      if (item.id === 'flipkart-samarth') {
        score = Math.min(98, score + 4);
        reasons.unshift('MoU exists between Flipkart Samarth and AP Society for Elimination of Rural Poverty (SERP).');
      }
    }

    // Material boost (bamboo / cane / natural fiber)
    if (materials.some(m => m.includes('bamboo') || m.includes('cane') || m.includes('jute') || m.includes('grass'))) {
      if (item.id === 'trifed-tribes') {
        score = Math.min(99, score + 5);
        reasons.unshift('Direct procurement bonus under the National Bamboo Mission craft incentives.');
      }
    }

    // Cooperative boost
    if (context.cooperativeName && item.category === 'cooperative') {
      score = Math.min(97, score + 6);
      reasons.unshift(`Direct onboarding priority for registered cooperative: "${context.cooperativeName}".`);
    }

    return {
      ...item,
      matchScore: score,
      whyRecommended: reasons
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
