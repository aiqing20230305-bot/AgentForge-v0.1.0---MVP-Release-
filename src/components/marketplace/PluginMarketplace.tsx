import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  Download,
  TrendingUp,
  Package,
  Filter,
  Grid,
  List,
  ExternalLink,
  Github,
  Award,
  Users,
  Clock,
  Tag,
  CheckCircle,
  Shield
} from 'lucide-react';

// Types
interface Plugin {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  stats: {
    downloads: number;
    stars: number;
    rating: number;
    reviews: number;
  };
  metadata: {
    version: string;
    lastUpdated: string;
    license: string;
    compatibility: string[];
  };
  tags: string[];
  category: string;
  featured: boolean;
  verified: boolean;
  links: {
    github?: string;
    docs?: string;
    demo?: string;
  };
  screenshots: string[];
  pricing: 'free' | 'paid' | 'freemium';
}

interface PluginMarketplaceProps {
  onInstall?: (plugin: Plugin) => void;
  installedPlugins?: string[];
}

// Sample data - in production this would come from API
const SAMPLE_PLUGINS: Plugin[] = [
  {
    id: '1',
    name: 'Web Search Pro',
    slug: 'web-search-pro',
    tagline: 'Advanced web scraping with anti-bot protection',
    description: 'Professional-grade web search and scraping toolkit with proxy rotation, CAPTCHA solving, and rate limiting. Perfect for research agents and data collection workflows.',
    author: {
      name: 'AgentForge Team',
      avatar: '/avatars/team.png',
      verified: true
    },
    stats: {
      downloads: 12500,
      stars: 456,
      rating: 4.8,
      reviews: 89
    },
    metadata: {
      version: '2.3.1',
      lastUpdated: '2026-03-15',
      license: 'MIT',
      compatibility: ['0.9.x', '1.0.x']
    },
    tags: ['search', 'scraping', 'research', 'data-collection'],
    category: 'Data Sources',
    featured: true,
    verified: true,
    links: {
      github: 'https://github.com/agentforge/web-search-pro',
      docs: 'https://docs.agentforge.dev/plugins/web-search-pro',
      demo: 'https://demo.agentforge.dev/web-search-pro'
    },
    screenshots: ['/screenshots/web-search-1.png', '/screenshots/web-search-2.png'],
    pricing: 'freemium'
  },
  {
    id: '2',
    name: 'Vector Memory',
    slug: 'vector-memory',
    tagline: 'Long-term memory with semantic search',
    description: 'Add persistent memory to your agents with vector embeddings and semantic retrieval. Supports multiple vector databases including Pinecone, Weaviate, and Qdrant.',
    author: {
      name: 'DevCommunity',
      avatar: '/avatars/community.png',
      verified: false
    },
    stats: {
      downloads: 8900,
      stars: 342,
      rating: 4.6,
      reviews: 67
    },
    metadata: {
      version: '1.5.0',
      lastUpdated: '2026-03-10',
      license: 'Apache-2.0',
      compatibility: ['0.9.x', '1.0.x']
    },
    tags: ['memory', 'rag', 'embeddings', 'vector-db'],
    category: 'Memory & Context',
    featured: true,
    verified: true,
    links: {
      github: 'https://github.com/community/vector-memory',
      docs: 'https://docs.agentforge.dev/plugins/vector-memory'
    },
    screenshots: [],
    pricing: 'free'
  },
  {
    id: '3',
    name: 'Slack Integration',
    slug: 'slack-integration',
    tagline: 'Connect your agents to Slack workspaces',
    description: 'Full-featured Slack bot integration with slash commands, interactive messages, and event handling. Build customer support, workflow automation, and team assistant agents.',
    author: {
      name: 'IntegrationLabs',
      avatar: '/avatars/integrations.png',
      verified: true
    },
    stats: {
      downloads: 6700,
      stars: 289,
      rating: 4.7,
      reviews: 45
    },
    metadata: {
      version: '3.0.2',
      lastUpdated: '2026-03-12',
      license: 'MIT',
      compatibility: ['1.0.x']
    },
    tags: ['slack', 'communication', 'integration', 'bot'],
    category: 'Integrations',
    featured: false,
    verified: true,
    links: {
      github: 'https://github.com/integrations/slack-plugin',
      docs: 'https://docs.agentforge.dev/plugins/slack'
    },
    screenshots: [],
    pricing: 'free'
  },
  {
    id: '4',
    name: 'Code Executor',
    slug: 'code-executor',
    tagline: 'Safe sandboxed code execution',
    description: 'Execute Python, JavaScript, and TypeScript code in secure sandboxes. Perfect for code generation agents, data analysis, and computational tasks.',
    author: {
      name: 'SecurityFirst',
      avatar: '/avatars/security.png',
      verified: true
    },
    stats: {
      downloads: 5400,
      stars: 234,
      rating: 4.5,
      reviews: 38
    },
    metadata: {
      version: '1.2.0',
      lastUpdated: '2026-03-08',
      license: 'MIT',
      compatibility: ['0.9.x', '1.0.x']
    },
    tags: ['code', 'execution', 'sandbox', 'python', 'javascript'],
    category: 'Tools',
    featured: true,
    verified: true,
    links: {
      github: 'https://github.com/security/code-executor',
      docs: 'https://docs.agentforge.dev/plugins/code-executor',
      demo: 'https://demo.agentforge.dev/code-executor'
    },
    screenshots: [],
    pricing: 'freemium'
  },
  {
    id: '5',
    name: 'Analytics Dashboard',
    slug: 'analytics-dashboard',
    tagline: 'Real-time agent performance monitoring',
    description: 'Comprehensive analytics and monitoring for your agents. Track token usage, response times, error rates, and user satisfaction metrics in beautiful dashboards.',
    author: {
      name: 'DataViz Pro',
      avatar: '/avatars/dataviz.png',
      verified: false
    },
    stats: {
      downloads: 3200,
      stars: 178,
      rating: 4.4,
      reviews: 29
    },
    metadata: {
      version: '0.8.5',
      lastUpdated: '2026-03-14',
      license: 'Commercial',
      compatibility: ['1.0.x']
    },
    tags: ['analytics', 'monitoring', 'dashboard', 'metrics'],
    category: 'Monitoring',
    featured: false,
    verified: false,
    links: {
      docs: 'https://docs.agentforge.dev/plugins/analytics'
    },
    screenshots: [],
    pricing: 'paid'
  }
];

const CATEGORIES = [
  'All',
  'Data Sources',
  'Memory & Context',
  'Integrations',
  'Tools',
  'Monitoring',
  'UI Components',
  'AI Models',
  'Utilities'
];

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'downloads', label: 'Most Downloads' },
  { value: 'stars', label: 'Most Stars' },
  { value: 'newest', label: 'Newest' },
  { value: 'updated', label: 'Recently Updated' }
];

// Components
const PluginCard: React.FC<{
  plugin: Plugin;
  view: 'grid' | 'list';
  isInstalled: boolean;
  onInstall: (plugin: Plugin) => void;
}> = ({ plugin, view, isInstalled, onInstall }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  if (view === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {plugin.name}
                  </h3>
                  {plugin.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                  {plugin.featured && (
                    <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{plugin.tagline}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {formatNumber(plugin.stats.downloads)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {plugin.stats.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(plugin.metadata.lastUpdated)}
                  </span>
                  <span>v{plugin.metadata.version}</span>
                </div>
              </div>

              <button
                onClick={() => onInstall(plugin)}
                disabled={isInstalled}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  isInstalled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isInstalled ? 'Installed' : 'Install'}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {plugin.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="flex gap-1">
            {plugin.verified && (
              <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center" title="Verified">
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
            )}
            {plugin.featured && (
              <div className="w-6 h-6 bg-yellow-50 rounded flex items-center justify-center" title="Featured">
                <Award className="w-4 h-4 text-yellow-500" />
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {plugin.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {plugin.tagline}
        </p>

        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {formatNumber(plugin.stats.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {plugin.stats.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {plugin.stats.reviews}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {plugin.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onInstall(plugin)}
            disabled={isInstalled}
            className={`flex-grow px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isInstalled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isInstalled ? 'Installed' : 'Install'}
          </button>
          {plugin.links.github && (
            <a
              href={plugin.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Github className="w-4 h-4 text-gray-600" />
            </a>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>v{plugin.metadata.version}</span>
          <span>{formatDate(plugin.metadata.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
};

const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({
  onInstall = () => {},
  installedPlugins = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('trending');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    SAMPLE_PLUGINS.forEach(plugin => plugin.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  // Filter and sort plugins
  const filteredPlugins = useMemo(() => {
    let filtered = SAMPLE_PLUGINS;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        plugin =>
          plugin.name.toLowerCase().includes(query) ||
          plugin.tagline.toLowerCase().includes(query) ||
          plugin.description.toLowerCase().includes(query) ||
          plugin.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(plugin => plugin.category === selectedCategory);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(plugin =>
        selectedTags.every(tag => plugin.tags.includes(tag))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.stats.downloads - a.stats.downloads;
        case 'stars':
          return b.stats.stars - a.stats.stars;
        case 'newest':
          return new Date(b.metadata.lastUpdated).getTime() - new Date(a.metadata.lastUpdated).getTime();
        case 'updated':
          return new Date(b.metadata.lastUpdated).getTime() - new Date(a.metadata.lastUpdated).getTime();
        case 'trending':
        default:
          // Trending: combination of recent downloads and stars
          const trendingScore = (plugin: Plugin) =>
            plugin.stats.downloads * 0.6 + plugin.stats.stars * 0.4;
          return trendingScore(b) - trendingScore(a);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plugin Marketplace</h1>
        <p className="text-gray-600">
          Extend your agents with community-built plugins
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plugins, tags, or features..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg font-medium transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all tags
              </button>
            )}
          </div>
        )}

        {/* Category Tabs and Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2 ${
                  view === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 border-l border-gray-300 ${
                  view === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} found
      </div>

      {/* Plugin Grid/List */}
      {filteredPlugins.length > 0 ? (
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredPlugins.map(plugin => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              view={view}
              isInstalled={installedPlugins.includes(plugin.id)}
              onInstall={onInstall}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Build Your Own Plugin</h2>
        <p className="mb-6 opacity-90">
          Join our Plugin Contest and win prizes up to $5,000!
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/docs/plugin-development"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Plugin Dev Guide
          </a>
          <a
            href="/plugin-contest"
            className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Contest Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default PluginMarketplace;
