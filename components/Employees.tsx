import React, { useState, useMemo, useEffect } from 'react';
import { Employee, WorkLocation, Profession } from '../types';
import { generateId, formatCurrency, calculateINSS, calculateIRT, formatDate } from '../utils';
import { supabase } from '../services/supabaseClient';
import { 
  Users, UserPlus, Search, Filter, Printer, FileText, Trash2, Edit2, Eye, Ban, CheckCircle, 
  MapPin, Phone, Mail, Calendar, CreditCard, Building2, ChevronDown, ChevronUp, X, Save, Upload, User, 
  RefreshCw, Database, AlertCircle, Info, Settings, Ruler, Gavel, Wallet, Gift, FileSignature, 
  UserCheck, UserMinus, MoreVertical, Calculator, ChevronRight, List, Briefcase, Plus, PlusCircle,
  ArrowLeft, Loader2, Home, Hash, ClipboardList, Clock, Sparkles, Coffee, ImageIcon, Globe, Lock,
  DollarSign
} from 'lucide-react';

interface EmployeesProps {
  employees: Employee[];
  onSaveEmployee: (emp: Employee) => void;
  workLocations: WorkLocation[];
  professions: Profession[];
  onIssueContract?: (emp: Employee) => void; 
}

const Employees: React.FC<EmployeesProps> = ({ employees, onSaveEmployee, workLocations, professions, onIssueContract }) => {
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    status: 'Active',
    contractType: 'Determinado',
    gender: 'M',
    maritalStatus: 'Solteiro',
    baseSalary: 0,
    subsidyFood: 0,
    subsidyTransport: 0
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    professional: true,
    fiscal: true,
    subsidies: false
  });

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(depts);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.nif && e.nif.includes(searchTerm)) ||
                          (e.biNumber && e.biNumber.includes(searchTerm));
      
      const matchStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'ACTIVE' ? e.status === 'Active' : e.status !== 'Active');
      
      const matchDept = deptFilter === 'ALL' || e.department === deptFilter;
      
      return matchSearch && matchStatus && matchDept;
    });
  }, [employees, searchTerm, statusFilter, deptFilter]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleEdit = (emp: Employee) => {
    setFormData(emp);
    setView('FORM');
  };

  const handleCreate = () => {
    setFormData({
      id: generateId(),
      status: 'Active',
      contractType: 'Determinado',
      gender: 'M',
      maritalStatus: 'Solteiro',
      admissionDate: new Date().toISOString().split('T')[0],
      baseSalary: 0,
      subsidyFood: 0,
      subsidyTransport: 0
    });
    setView('FORM');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nif || !formData.role) return alert("Preencha os campos obrigatórios (*)");

    setIsLoading(true);
    try {
        const empToSave = { ...formData } as Employee;
        onSaveEmployee(empToSave);
        setView('LIST');
        alert("Funcionário guardado com sucesso!");
    } catch (err: any) {
        alert("Erro ao salvar: " + err.message);
    } finally {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    }
  };

  const SectionHeader = ({ title, section, icon: Icon }: any) => (
    <button 
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Icon size={18}/></div>
        <span className="font-black text-[10px] uppercase tracking-[2px] text-slate-700">{title}</span>
      </div>
      {expandedSections[section] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
    </button>
  );

  return (
    <div className="h-full space-y-6 animate-in fade-in duration-500">
      {view === 'LIST' ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-blue-600"/> Gestão de Funcionários
              </h1>
              <p className="text-xs text-slate-500">Controlo de pessoal, vínculos e documentos</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-lg">
                <UserPlus size={18}/> Novo Funcionário
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
              <input 
                className="w-full pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Pesquisar por nome, NIF ou BI..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select className="border p-2 rounded-lg bg-slate-50 text-xs font-bold outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                <option value="ALL">Todos Estados</option>
                <option value="ACTIVE">Activos</option>
                <option value="INACTIVE">Inactivos</option>
              </select>
              <select className="border p-2 rounded-lg bg-slate-50 text-xs font-bold outline-none" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                <option value="ALL">Todos Departamentos</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Funcionário</th>
                    <th className="p-4">Cargo / Dept</th>
                    <th className="p-4">Contribuinte / BI</th>
                    <th className="p-4">Vínculo</th>
                    <th className="p-4 text-right">Salário Base</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-blue-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border uppercase">
                            {emp.photoUrl ? <img src={emp.photoUrl} className="w-full h-full rounded-full object-cover"/> : emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 uppercase italic">{emp.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">IDNF: {emp.idnf || emp.id.substring(0,6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-700 uppercase">{emp.role}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest">{emp.department}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-slate-600">NIF: {emp.nif}</div>
                        <div className="font-mono text-slate-400">BI: {emp.biNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-600">{formatDate(emp.admissionDate)}</div>
                        <div className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">{emp.contractType}</div>
                      </td>
                      <td className="p-4 text-right font-black text-slate-800">
                        {formatCurrency(emp.baseSalary)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${emp.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          {emp.status === 'Active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition shadow-sm" title="Editar"><Edit2 size={16}/></button>
                          <button onClick={() => onIssueContract?.(emp)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition shadow-sm" title="Gerar Contrato"><FileSignature size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr><td colSpan={7} className="p-20 text-center text-slate-300 font-black uppercase tracking-[10px] bg-slate-50 italic">Sem registos encontrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-lg border-b-4 border-blue-600">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-800 rounded-full transition border border-white/10"><ArrowLeft size={20}/></button>
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                <UserPlus className="text-blue-400"/> Ficha de Funcionário Cloud
              </h2>
            </div>
            <button onClick={() => setView('LIST')} className="p-2 hover:bg-red-600 rounded-full transition border border-white/10"><X size={20}/></button>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-4">
            {/* Secção: Dados Pessoais */}
            <div className="space-y-4">
              <SectionHeader title="01. Dados Pessoais e Identificação" section="personal" icon={User}/>
              {expandedSections.personal && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-t-0 rounded-b-xl animate-in slide-in-from-top-2">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo *</label>
                    <input required className="w-full p-2 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-blue-500" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Data Nascimento</label>
                    <input type="date" className="w-full p-2 border-2 border-slate-100 rounded-lg outline-none focus:border-blue-500" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">NIF (Contribuinte) *</label>
                    <input required className="w-full p-2 border-2 border-slate-100 rounded-lg font-mono outline-none focus:border-blue-500" value={formData.nif || ''} onChange={e => setFormData({...formData, nif: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Bilhete Identidade *</label>
                    <input required className="w-full p-2 border-2 border-slate-100 rounded-lg font-mono outline-none focus:border-blue-500" value={formData.biNumber || ''} onChange={e => setFormData({...formData, biNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nº INSS (Segurança Social)</label>
                    <input className="w-full p-2 border-2 border-slate-100 rounded-lg font-mono outline-none focus:border-blue-500" value={formData.ssn || ''} onChange={e => setFormData({...formData, ssn: e.target.value})} />
                  </div>
                </div>
              )}
            </div>

            {/* Secção: Profissional */}
            <div className="space-y-4">
              <SectionHeader title="02. Vínculo Profissional e Categoria" section="professional" icon={Briefcase}/>
              {expandedSections.professional && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-t-0 rounded-b-xl animate-in slide-in-from-top-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Data de Admissão</label>
                    <input type="date" className="w-full p-2 border-2 border-slate-100 rounded-lg outline-none focus:border-blue-500" value={formData.admissionDate || ''} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Função / Cargo *</label>
                    <input required className="w-full p-2 border-2 border-slate-100 rounded-lg outline-none focus:border-blue-500 font-bold" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Departamento</label>
                    <input className="w-full p-2 border-2 border-slate-100 rounded-lg outline-none focus:border-blue-500" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tipo de Contrato</label>
                    <select className="w-full p-2 border-2 border-slate-100 rounded-lg bg-white" value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value as any})}>
                      <option value="Determinado">Tempo Determinado</option>
                      <option value="Indeterminado">Tempo Indeterminado</option>
                      <option value="Estagio">Estágio</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Local de Trabalho (Obra)</label>
                    <select className="w-full p-2 border-2 border-slate-100 rounded-lg bg-white" value={formData.workLocationId || ''} onChange={e => setFormData({...formData, workLocationId: e.target.value})}>
                      <option value="">Nenhum / Sede</option>
                      {workLocations.map(wl => <option key={wl.id} value={wl.id}>{wl.name}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Secção: Financeira */}
            <div className="space-y-4">
              <SectionHeader title="03. Remuneração e Subsídios" section="fiscal" icon={DollarSign}/>
              {expandedSections.fiscal && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-t-0 rounded-b-xl animate-in slide-in-from-top-2">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="text-[10px] font-black text-blue-600 uppercase block mb-1">Salário Base (Kz)</label>
                    <input type="number" className="w-full bg-white p-2 border-2 border-blue-200 rounded-lg font-black text-blue-700 text-lg outline-none" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sub. Alimentação (Diário)</label>
                    <input type="number" className="w-full bg-white p-2 border-2 border-slate-200 rounded-lg font-bold outline-none" value={formData.subsidyFood} onChange={e => setFormData({...formData, subsidyFood: Number(e.target.value)})} />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sub. Transporte (Diário)</label>
                    <input type="number" className="w-full bg-white p-2 border-2 border-slate-200 rounded-lg font-bold outline-none" value={formData.subsidyTransport} onChange={e => setFormData({...formData, subsidyTransport: Number(e.target.value)})} />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t-4 border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white py-4 z-10">
              <button type="button" onClick={() => setView('LIST')} className="px-8 py-3 border-4 border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition">Cancelar</button>
              <button type="submit" disabled={isLoading} className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Gravar Colaborador
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Employees;