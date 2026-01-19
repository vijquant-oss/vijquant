import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  LogOut, 
  Mail, 
  Briefcase, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Clock,
  CheckCircle,
  Archive,
  AlertCircle,
  X,
  Save,
  Zap,
  ArrowLeft
} from 'lucide-react';
import Logo from '@/components/vijquant/Logo';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  created_at: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  tags: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  created_at: string;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  features: string[];
  technologies: string[];
  glow_color: string;
  active: boolean;
  sort_order: number;
}
 const Admin: React.FC = () => {
  const { user, loading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'inquiries' | 'portfolio' | 'services'>('inquiries');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<ContactSubmission | null>(null);

  // Fetch data when user is authenticated
  const fetchData = React.useCallback(async () => {
    setDataLoading(true);
    try {
      if (activeTab === 'inquiries') {
        const { data } = await supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false });
        setSubmissions(data || []);
      } else if (activeTab === 'portfolio') {
        const { data } = await supabase
          .from('portfolio_projects')
          .select('*')
          .order('created_at', { ascending: false });
        setProjects(data || []);
      } else if (activeTab === 'services') {
        const { data } = await supabase
          .from('services')
          .select('*')
          .order('sort_order', { ascending: true });
        const rows = (data ?? []) as unknown as Partial<Service>[];
        setServices(
          rows.map((s) => ({
            ...(s as Service),
            technologies: (s as Service).technologies ?? [],
            features: (s as Service).features ?? [],
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setDataLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      setLoginError(error.message);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const updateSubmissionStatus = async (id: string, status: ContactSubmission['status']) => {
    await supabase
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    fetchData();
  };

  const deleteSubmission = async (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      await supabase.from('contact_submissions').delete().eq('id', id);
      fetchData();
    }
  };

  const saveProject = async (project: Partial<PortfolioProject>) => {
    if (editingProject?.id) {
      await supabase
        .from('portfolio_projects')
        .update({ ...project, updated_at: new Date().toISOString() })
        .eq('id', editingProject.id);
    } else {
      await supabase.from('portfolio_projects').insert([project]);
    }
    setShowProjectModal(false);
    setEditingProject(null);
    fetchData();
  };

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await supabase.from('portfolio_projects').delete().eq('id', id);
      fetchData();
    }
  };

  const saveService = async (service: Partial<Service>) => {
    if (editingService?.id) {
      await supabase
        .from('services')
        .update({ ...service, updated_at: new Date().toISOString() })
        .eq('id', editingService.id);
    } else {
      await supabase.from('services').insert([service]);
    }
    setShowServiceModal(false);
    setEditingService(null);
    fetchData();
  };

  const deleteService = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await supabase.from('services').delete().eq('id', id);
      fetchData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10" />
        
        <div className="relative w-full max-w-md">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center relative overflow-hidden">
                <Logo imgClassName="absolute inset-0 w-full h-full object-cover" zapClassName="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Vijquant</span>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white text-center mb-6">
              Sign in to continue
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="admin@vijquant.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-gray-400 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to website
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center overflow-hidden relative">
                  <Logo imgClassName="absolute inset-0 w-full h-full object-cover" zapClassName="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">Vijquant</span>
                  <span className="text-xs text-gray-500 ml-2">Admin</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'inquiries', label: 'Inquiries', icon: Mail, count: submissions.filter(s => s.status === 'new').length },
            { id: 'portfolio', label: 'Portfolio', icon: Briefcase, count: projects.length },
            { id: 'services', label: 'Services', icon: Settings, count: services.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Contact Inquiries</h2>
                  <div className="text-sm text-gray-400">
                    {submissions.filter(s => s.status === 'new').length} new inquiries
                  </div>
                </div>

                {submissions.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No inquiries yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white truncate">{submission.name}</h3>
                              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(submission.status)}`}>
                                {getStatusIcon(submission.status)}
                                {submission.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{submission.email}</p>
                            {submission.company && (
                              <p className="text-sm text-gray-500 mb-2">{submission.company}</p>
                            )}
                            <p className="text-gray-300 line-clamp-2">{submission.message}</p>
                            <p className="text-xs text-gray-600 mt-2">
                              {new Date(submission.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setViewingSubmission(submission);
                                setShowSubmissionModal(true);
                              }}
                              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSubmission(submission.id)}
                              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Portfolio Projects</h2>
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setShowProjectModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:from-blue-500 hover:to-violet-500 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group"
                    >
                      {project.image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-xs text-blue-400 uppercase tracking-wider">{project.category}</span>
                            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                          </div>
                          {project.featured && (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(project.tags || []).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-white/5 text-gray-400 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setShowProjectModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Tab */}
{activeTab === 'services' && (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white">Services</h2>
      <button
        onClick={() => {
          setEditingService(null);
          setShowServiceModal(true);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:from-blue-500 hover:to-violet-500 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Service
      </button>
    </div>

<div className="grid gap-4">
  {(services ?? []).map((service) => (
    <div
      key={service.id}
      className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {service.title}
            </h3>

            <span
              className={`px-2 py-1 rounded-full text-xs ${
                service.active
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              {service.active ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="text-gray-400 mb-3">
            {service.description ?? ""}
          </p>

          <div className="flex flex-wrap gap-1">
            {(service.technologies ?? []).map((tech, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-white/5 text-gray-400 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingService(service);
              setShowServiceModal(true);
            }}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => deleteService(service.id)}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowSubmissionModal(false)} />
          <div className="relative w-full max-w-2xl bg-slate-900/95 rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSubmissionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Inquiry Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="text-white">{viewingSubmission.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-white">{viewingSubmission.email}</p>
              </div>
              {viewingSubmission.phone && (
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="text-white">{viewingSubmission.phone}</p>
                </div>
              )}
              {viewingSubmission.company && (
                <div>
                  <label className="text-sm text-gray-500">Company</label>
                  <p className="text-white">{viewingSubmission.company}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">Message</label>
                <p className="text-gray-300 whitespace-pre-wrap">{viewingSubmission.message}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Submitted</label>
                <p className="text-gray-400">
                  {new Date(viewingSubmission.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-2 block">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['new', 'in_progress', 'completed', 'archived'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateSubmissionStatus(viewingSubmission.id, status);
                        setViewingSubmission({ ...viewingSubmission, status });
                      }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all ${
                        viewingSubmission.status === status
                          ? getStatusColor(status)
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {getStatusIcon(status)}
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectFormModal
          project={editingProject}
          onSave={saveProject}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <ServiceFormModal
          service={editingService}
          onSave={saveService}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
};

// Project Form Modal Component
const ProjectFormModal: React.FC<{
  project: PortfolioProject | null;
  onSave: (project: Partial<PortfolioProject>) => void;
  onClose: () => void;
}> = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    category: project?.category || 'Web Apps',
    description: project?.description || '',
    image_url: project?.image_url || '',
    tags: project?.tags?.join(', ') || '',
    live_url: project?.live_url || '',
    github_url: project?.github_url || '',
    featured: project?.featured || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      category: formData.category,
      description: formData.description,
      image_url: formData.image_url,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      live_url: formData.live_url,
      github_url: formData.github_url,
      featured: formData.featured,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900/95 rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="Web Apps">Web Apps</option>
              <option value="UI/UX">UI/UX</option>
              <option value="3D">3D</option>
              <option value="Software">Software</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              placeholder="React, TypeScript, Node.js"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Live URL</label>
              <input
                type="url"
                value={formData.live_url}
                onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-5 h-5 rounded bg-white/5 border border-white/10 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-gray-400">Featured project</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:from-blue-500 hover:to-violet-500 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Service Form Modal Component
const ServiceFormModal: React.FC<{
  service: Service | null;
  onSave: (service: Partial<Service>) => void;
  onClose: () => void;
 }> = ({ service, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    icon: service?.icon || 'web',
    features: service?.features?.join('\n') || '',
    technologies: service?.technologies?.join(', ') || '',
    glow_color: service?.glow_color || 'blue',
    active: service?.active ?? true,
    sort_order: service?.sort_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
      glow_color: formData.glow_color,
      active: formData.active,
      sort_order: formData.sort_order,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900/95 rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {service ? 'Edit Service' : 'Add New Service'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="web">Web Development</option>
                <option value="design">UI/UX Design</option>
                <option value="3d">3D Experiences</option>
                <option value="software">Software</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Glow Color</label>
              <select
                value={formData.glow_color}
                onChange={(e) => setFormData({ ...formData, glow_color: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="blue">Blue</option>
                <option value="violet">Violet</option>
                <option value="cyan">Cyan</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Features (one per line)</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
              rows={4}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Technologies (comma-separated)</label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              placeholder="React, Node.js, AWS"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-3 pb-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/5 border border-white/10 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-gray-400">Active</label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:from-blue-500 hover:to-violet-500 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
