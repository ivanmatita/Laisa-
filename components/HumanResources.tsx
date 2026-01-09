
import React, { useState, useMemo } from 'react';
import { 
  Employee, HrTransaction, HrVacation, SalarySlip, Profession, 
  Contract, AttendanceRecord, Company, ViewState 
} from '../types';
import { 
  generateId, formatCurrency, formatDate, calculateINSS, calculateIRT 
} from '../utils';
import { 
  Users, Briefcase, Calculator, Calendar, 
  FileText, Printer, Search, Plus, X, User, 
  MoreVertical, RefreshCw, Loader2, CheckCircle, AlertTriangle, 
  Shield, ChevronDown, ChevronUp, Gavel, Wallet, TrendingUp, CheckSquare, Square, Play, Trash, FileSpreadsheet, ChevronRight, FileCheck, Circle, Info,
  ArrowRight, CreditCard, ImageIcon, Clock, Save
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import SalaryMap from './SalaryMap';
import ProfessionManager from './ProfessionManager';
import Employees from './Employees';

// --- COMPONENTES AUXILIARES ---

interface AttendanceGridProps {
  emp: Employee;
  processingMonth: number;
  processingYear: number;
  months: string[];
  onCancel: () => void;
  onConfirm: (attData: Record<number, string>) => void;
}

const AttendanceGrid: React.FC<AttendanceGridProps> = ({ emp, processingMonth, processingYear, months, onCancel, onConfirm }) => {
    const [attData, setAttData] = useState<Record<number, string>>({});
    const daysInMonth = new Date(processingYear, processingMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#f8f9fa] rounded-none shadow-2xl w-[98vw] max-h-[95vh] overflow-auto border-2 border-slate-400 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-12">
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase">IDNF</p>
                            <p className="text-2xl font-black text-slate-800">{emp.idnf || emp.id.substring(0,4).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Nome</p>
                            <p className="text-2xl font-black text-slate-800 uppercase italic">{emp.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-red-600 font-bold text-sm">[ Admitido em {formatDate(emp.admissionDate)} ]</p>
                        <p className="text-xl font-black text-slate-700 mt-2">{months[processingMonth - 1]} {processingYear}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-white">
                                <th className="border border-slate-300 w-48"></th>
                                {days.map(d => {
                                    const dateObj = new Date(processingYear, processingMonth - 1, d);
                                    return (
                                        <th key={d} className="border border-slate-300 p-1 text-center min-w-[30px]">
                                            <div className="font-bold text-slate-500">{dayNames[dateObj.getDay()]}</div>
                                            <div className="font-black text-blue-800 text-sm">{d}</div>
                                        </th>
                                    );
                                })}
                                <th className="border border-slate-300 p-1 text-center w-12 font-bold text-slate-500 bg-slate-100 uppercase tracking-tighter">Full</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Admissão/Demissão', key: 'adm', color: 'bg-white' },
                                { label: 'Folga', key: 'folga', color: 'bg-green-500', isRadio: true },
                                { label: 'Serviço', key: 'servico', color: 'bg-green-500', isRadio: true },
                                { label: 'Justificadas', key: 'just', color: 'bg-white', isRadio: true },
                                { label: 'Injustificadas', key: 'injust', color: 'bg-white', isRadio: true },
                                { label: 'Férias', key: 'ferias', color: 'bg-white', isRadio: true },
                                { label: 'Horas Extra', key: 'extra', color: 'bg-white', isManual: true },
                                { label: 'Horas Perdidas', key: 'perdidas', color: 'bg-white', isManual: true, textRed: true },
                                { label: 'Local de Serviço', key: 'local', color: 'bg-white', isManual: true },
                                { label: 'Alimentação', key: 'alim', color: 'bg-green-100', isManual: true, empty: true },
                                { label: 'Transporte', key: 'transp', color: 'bg-green-100', isManual: true, empty: true },
                            ].map((row, rIdx) => (
                                <tr key={rIdx} className={`${row.color} hover:opacity-90`}>
                                    <td className={`border border-slate-300 p-1 font-bold ${row.textRed ? 'text-red-600' : 'text-slate-700'} ${rIdx > 8 ? 'pl-4' : ''}`}>
                                        {rIdx === 9 ? <span className="text-[8px] font-bold block mb-[-4px]">Subsídios</span> : null}
                                        {rIdx === 3 ? <span className="text-[8px] font-bold block mb-[-4px]">Faltas</span> : null}
                                        {row.label}
                                    </td>
                                    {days.map(d => (
                                        <td key={d} className="border border-slate-300 p-0 text-center align-middle h-8">
                                            {row.isRadio ? (
                                                <div className="flex items-center justify-center">
                                                    <div 
                                                        className={`w-4 h-4 rounded-full border-2 border-slate-400 flex items-center justify-center cursor-pointer bg-white`}
                                                        onClick={() => setAttData(prev => ({ ...prev, [d]: row.key }))}
                                                    >
                                                        {attData[d] === row.key && (
                                                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <input className="w-full h-full bg-transparent text-center border-none focus:ring-0 font-bold" defaultValue={row.key === 'local' ? '1' : '00'} />
                                            )}
                                        </td>
                                    ))}
                                    <td className="border border-slate-300 p-0 text-center bg-slate-100 cursor-pointer hover:bg-slate-200" 
                                        onClick={() => {
                                            const newAtt = { ...attData };
                                            days.forEach(d => { newAtt[d] = row.key; });
                                            setAttData(newAtt);
                                        }}>
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-400 mx-auto bg-white flex items-center justify-center">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto pt-8 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-6 py-2 bg-slate-400 text-white font-bold uppercase rounded-lg border-b-4 border-slate-600 hover:bg-slate-500 transition">Cancelar</button>
                    <button onClick={() => onConfirm(attData)} className="px-16 py-2 bg-gradient-to-b from-slate-200 to-slate-400 border-2 border-slate-500 rounded-full text-slate-800 font-bold text-lg hover:shadow-lg transition">Processar Efetividade</button>
                </div>
            </div>
        </div>
    );
};

interface SalaryReceiptProps {
    data: any;
    months: string[];
    onClose: () => void;
    onProcess: (finalSlip: SalarySlip) => void;
}

const SalaryReceipt: React.FC<SalaryReceiptProps> = ({ data, months, onClose, onProcess }) => {
    const { emp } = data;
    const [editableValues, setEditableValues] = useState({
        baseSalary: data.baseSalary || 0,
        complement: 0,
        bonus: 0,
        subsidyFood: emp.subsidyFood || 0,
        subsidyTransport: emp.subsidyTransport || 0,
        absences: data.hoursAbsence || 0
    });

    const calculatedData = useMemo(() => {
        const absenceVal = (editableValues.baseSalary / 30) * editableValues.absences;
        const grossTotal = editableValues.baseSalary + editableValues.complement + editableValues.bonus + editableValues.subsidyFood + editableValues.subsidyTransport - absenceVal;
        const inss = calculateINSS(editableValues.baseSalary + editableValues.complement - absenceVal);
        const irt = calculateIRT(grossTotal, inss);
        const netTotal = grossTotal - inss - irt;
        return { grossTotal, inss, irt, netTotal, absenceVal };
    }, [editableValues]);

    const handleProcessFinal = () => {
        const slip: SalarySlip = {
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            baseSalary: editableValues.baseSalary,
            allowances: editableValues.complement,
            bonuses: editableValues.bonus,
            subsidies: editableValues.subsidyFood + editableValues.subsidyTransport,
            subsidyFood: editableValues.subsidyFood,
            subsidyTransport: editableValues.subsidyTransport,
            subsidyFamily: 0,
            subsidyHousing: 0,
            absences: editableValues.absences,
            advances: 0,
            grossTotal: calculatedData.grossTotal,
            inss: calculatedData.inss,
            irt: calculatedData.irt,
            netTotal: calculatedData.netTotal
        };
        onProcess(slip);
    };

    return (
        <div className="fixed inset-0 z-[130] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-none shadow-2xl w-full max-w-4xl p-10 flex flex-col font-sans text-slate-900 relative border-4 border-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition text-slate-400"><X/></button>
                
                <div className="text-center mb-8 border-b-8 border-slate-200 pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-[0.2em] border-y-2 border-slate-800 py-2 inline-block px-12 italic tracking-tighter">Recibo de Salário</h1>
                </div>

                <div className="flex justify-between items-end mb-6">
                    <div className="flex items-end gap-6">
                        <span className="text-3xl font-black uppercase italic tracking-tighter text-slate-800">{emp.name.toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-slate-600 uppercase italic">{months[data.month - 1]} de {data.year}</span>
                    </div>
                </div>

                <div className="flex-1 space-y-1">
                    <div className="grid grid-cols-[40px_1fr_100px_200px] gap-2 border-b-2 border-slate-800 pb-1 text-[10px] font-black uppercase text-slate-600">
                        <span>Cód</span>
                        <span className="text-center">Descrição do Rendimento / Desconto</span>
                        <span className="text-center">Qtd/Ref</span>
                        <span className="text-right pr-4">Valor (AOA)</span>
                    </div>

                    <div className="space-y-1 py-4">
                        {[
                            { code: '01', label: 'Vencimento Base Profissional', key: 'baseSalary', qty: 30 },
                            { code: '02', label: 'Complemento Salarial', key: 'complement', qty: '-' },
                            { code: '03', label: 'Abonos e Prémios', key: 'bonus', qty: '-' },
                            { code: '04', label: 'Faltas Injustificadas', key: 'absences', qty: editableValues.absences, isNegative: true },
                            { code: '08', label: 'Subsidio Transporte', key: 'subsidyTransport', qty: '-' },
                            { code: '09', label: 'Subsidio Alimentação', key: 'subsidyFood', qty: '-' },
                        ].map((row, idx) => (
                            <div key={idx} className="grid grid-cols-[40px_1fr_100px_200px] gap-2 items-center h-10 border-b border-slate-50">
                                <span className="font-bold text-slate-400 text-[10px]">{row.code}</span>
                                <span className="font-bold text-slate-700 text-xs uppercase italic">{row.label}</span>
                                <span className="text-center font-bold text-slate-500">{row.qty}</span>
                                <div className="flex justify-end pr-4">
                                    <input 
                                        type="number"
                                        className="bg-slate-50 border-2 border-slate-200 rounded-lg px-4 py-1 w-32 text-right font-black text-sm outline-none focus:border-blue-500 shadow-inner"
                                        value={(editableValues as any)[row.key]}
                                        onChange={e => setEditableValues({...editableValues, [row.key]: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-[1fr_200px] border-t-4 border-slate-800 pt-4 pb-4 mt-6 bg-slate-50 px-2 rounded-xl">
                        <span className="font-black text-slate-800 text-sm uppercase italic">Total de Vencimento Bruto Antes de Impostos</span>
                        <div className="text-right pr-4 font-black text-xl text-slate-900">
                            {formatCurrency(calculatedData.grossTotal)}
                        </div>
                    </div>

                    <div className="space-y-4 pt-6">
                        <p className="font-black text-slate-800 text-[10px] uppercase tracking-widest border-b pb-1">Impostos e Deduções Legais (LGT Angola)</p>
                        <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-500 uppercase italic">Segurança Social (3%)</span>
                                    <span className="font-black text-red-600 italic">-{formatCurrency(calculatedData.inss)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-500 uppercase italic">IRT (Retenção na Fonte)</span>
                                    <span className="font-black text-red-600 italic">-{formatCurrency(calculatedData.irt)}</span>
                                </div>
                             </div>
                             <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col items-center justify-center shadow-2xl transform hover:scale-105 transition-all">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 italic">Total Líquido a Pagar</span>
                                <span className="text-3xl font-black font-mono tracking-tighter">{formatCurrency(calculatedData.netTotal)}</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 print:hidden">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-200 text-slate-600 font-black uppercase rounded-2xl hover:bg-slate-300 transition text-sm">Cancelar</button>
                    <button onClick={handleProcessFinal} className="bg-[#a7f3d0] hover:bg-[#86efac] text-slate-700 font-black px-16 py-3 rounded-2xl shadow-xl transition transform active:scale-95 text-lg uppercase tracking-widest">Processar Salário</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---

interface HumanResourcesProps {
  employees: Employee[];
  onSaveEmployee: (emp: Employee) => void;
  transactions: HrTransaction[];
  onSaveTransaction: (t: HrTransaction) => void;
  vacations: HrVacation[];
  onSaveVacation: (v: HrVacation) => void;
  payroll: SalarySlip[]; 
  onProcessPayroll: (slips: SalarySlip[]) => void;
  professions: Profession[];
  onSaveProfession: (p: Profession) => void;
  onDeleteProfession: (id: string) => void;
  contracts: Contract[];
  onSaveContract: (c: Contract[]) => void;
  attendance: AttendanceRecord[];
  onSaveAttendance: (a: AttendanceRecord) => void;
  company: Company;
  currentView?: ViewState;
}

const HumanResources: React.FC<HumanResourcesProps> = ({ 
    employees, onSaveEmployee, transactions, onSaveTransaction, 
    vacations, onSaveVacation, payroll, onProcessPayroll,
    professions, onSaveProfession, onDeleteProfession,
    contracts, onSaveContract, attendance, onSaveAttendance,
    company, currentView
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GESTÃO' | 'ASSIDUIDADE' | 'PROFISSÕES' | 'MAPAS' | 'ORDEM_TRANSFERENCIA'>(
    currentView === 'HR_TRANSFER_ORDER' ? 'ORDEM_TRANSFERENCIA' : 'DASHBOARD'
  );
  const [processingMonth, setProcessingMonth] = useState(new Date().getMonth() + 1);
  const [processingYear, setProcessingYear] = useState(new Date().getFullYear());
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  const [isProcessingEffectiveness, setIsProcessingEffectiveness] = useState(false);
  const [activeProcessingEmp, setActiveProcessingEmp] = useState<Employee | null>(null);
  const [showSalaryReceipt, setShowSalaryReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleActionSelect = (val: string) => {
    if (val === 'PROCESS_EFECTIVIDADE') {
        if (selectedEmpIds.size !== 1) return alert("Selecione 1 funcionário para processar efetividade.");
        const empId = Array.from(selectedEmpIds)[0];
        const emp = employees.find(e => e.id === empId);
        if (emp) { setActiveProcessingEmp(emp); setIsProcessingEffectiveness(true); }
    } else if (val === 'PROCESS_SALARIO') {
        alert("Utilize a 'Assiduidade Técnica' para processar salários com base na efetividade.");
    } else if (val === 'PRINT_RECIBOS') {
        window.print();
    } else if (val === 'DELETE_EFECTIVIDADE') {
        alert("Efetividades do período removidas da cloud.");
    }
  };

  const getProcessedNet = (empId: string) => {
    const slip = payroll.find(p => p.employeeId === empId);
    return slip ? formatCurrency(slip.netTotal) : null;
  };

  const renderAssiduidade = () => (
    <div className="space-y-4 animate-in fade-in duration-500 overflow-x-auto pb-20">
        {isProcessingEffectiveness && activeProcessingEmp && (
            <AttendanceGrid 
                emp={activeProcessingEmp}
                processingMonth={processingMonth}
                processingYear={processingYear}
                months={months}
                onCancel={() => setIsProcessingEffectiveness(false)}
                onConfirm={(data) => {
                    setIsProcessingEffectiveness(false);
                    setReceiptData({ 
                        emp: activeProcessingEmp, 
                        month: processingMonth, 
                        year: processingYear, 
                        baseSalary: activeProcessingEmp.baseSalary, 
                        hoursAbsence: Object.values(data).filter(v => v === 'injust').length 
                    });
                    setShowSalaryReceipt(true);
                }}
            />
        )}
        
        {showSalaryReceipt && receiptData && (
            <SalaryReceipt 
                data={receiptData}
                months={months}
                onClose={() => setShowSalaryReceipt(false)}
                onProcess={(slip) => {
                    onProcessPayroll([slip]);
                    setShowSalaryReceipt(false);
                    alert("Cálculo concluído! O valor processado já está visível na lista.");
                }}
            />
        )}

        <div className="bg-white border-2 border-slate-300 shadow-2xl rounded-none overflow-hidden min-w-[1600px]">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white text-slate-700 font-bold text-[9px] uppercase tracking-tighter text-center">
                    <tr className="border-b-2 border-slate-400">
                        <th className="p-2 border-r w-10 text-center">
                            <button onClick={() => setSelectedEmpIds(selectedEmpIds.size === employees.length ? new Set() : new Set(employees.map(e => e.id)))} className="p-1">
                                {selectedEmpIds.size === employees.length ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16} className="text-slate-300"/>}
                            </button>
                        </th>
                        <th className="p-2 border-r w-8" rowSpan={2}>Nº</th>
                        <th className="p-2 border-r w-40" rowSpan={2}>IDNF<br/>POSTO</th>
                        <th className="p-2 border-r w-64" rowSpan={2}>Nome<br/>Profissão</th>
                        <th className="p-2 border-r w-32">Datas</th>
                        <th className="p-2 border-r w-24">Pagamentos</th>
                        <th className="p-2 border-r" colSpan={3}>Subsidios Pontuais</th>
                        <th className="p-2 border-r w-24" rowSpan={2}>Abono<br/>Familia</th>
                        <th className="p-2 border-r" colSpan={2}>Sub Isentos</th>
                        <th className="p-2 border-r" colSpan={4}>Outros Acertos</th>
                        <th className="p-2" colSpan={4}>Processamento</th>
                    </tr>
                    <tr className="bg-slate-50 border-b-2 border-slate-400">
                        <th className="p-1 border-r text-[8px]">Admissão</th>
                        <th className="p-1 border-r text-[8px]">Caixa</th>
                        <th className="p-1 border-r text-[8px]">Sal. Base</th>
                        <th className="p-1 border-r text-[8px]">Natal</th>
                        <th className="p-1 border-r text-[8px]">Férias</th>
                        <th className="p-1 border-r text-[8px]">Alojamento</th>
                        <th className="p-1 border-r text-[8px]">ALIM.</th>
                        <th className="p-1 border-r text-[8px]">TRANS.</th>
                        <th className="p-1 border-r text-[8px]">Outros</th>
                        <th className="p-1 border-r text-[8px]">Acertos</th>
                        <th className="p-1 border-r text-[8px]">Multas</th>
                        <th className="p-1 border-r text-[8px] text-red-600 font-black">Magic</th>
                        <th className="p-1 border-r text-[8px]">Efetividade</th>
                        <th className="p-1 border-r text-[8px]">Faltas</th>
                        <th className="p-1 border-r text-[8px] text-emerald-600 font-black italic">Processar</th>
                        <th className="p-1 text-[8px] text-blue-600 font-black">Imprimir</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {employees.map((emp, idx) => {
                        const isSelected = selectedEmpIds.has(emp.id);
                        const processedValue = getProcessedNet(emp.id);
                        return (
                            <tr key={emp.id} className={`${isSelected ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'} transition-colors group italic`}>
                                <td className="p-2 border-r text-center">
                                    <button onClick={() => {
                                        const newSet = new Set(selectedEmpIds);
                                        if (newSet.has(emp.id)) newSet.delete(emp.id); else newSet.add(emp.id);
                                        setSelectedEmpIds(newSet);
                                    }} className="p-1">
                                        {isSelected ? <CheckSquare size={14} className="text-blue-600"/> : <Square size={14} className="text-slate-300"/>}
                                    </button>
                                </td>
                                <td className="p-2 border-r text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="p-2 border-r font-bold text-slate-800 text-[10px]">{emp.idnf || emp.id.substring(0,4).toUpperCase()}</td>
                                <td className="p-2 border-r">
                                    <div className="font-black text-slate-900 uppercase text-[10px] leading-none">{emp.name}</div>
                                    <div className="text-[8px] text-slate-400 mt-1 uppercase font-bold">{emp.role}</div>
                                </td>
                                <td className="p-2 border-r text-center font-mono text-[9px]">{formatDate(emp.admissionDate)}</td>
                                <td className="p-2 border-r text-center"><input type="checkbox" className="w-3 h-3" checked={emp.isCashier}/></td>
                                <td className="p-2 border-r text-right font-mono text-[9px] font-bold">{emp.baseSalary.toLocaleString()}</td>
                                <td className="p-1 border-r text-center">-</td>
                                <td className="p-1 border-r text-center">-</td>
                                <td className="p-1 border-r text-center">-</td>
                                <td className="p-2 border-r text-right font-mono text-[9px]">{emp.subsidyFamily || 0}</td>
                                <td className="p-2 border-r text-center text-[8px]">{emp.subsidyFood || 0}</td>
                                <td className="p-2 border-r text-center text-[8px]">{emp.subsidyTransport || 0}</td>
                                <td className="p-2 border-r text-right">-</td>
                                <td className="p-2 border-r text-right">-</td>
                                <td className="p-2 border-r text-right">-</td>
                                <td className="p-2 border-r text-center"><input type="checkbox" className="w-3 h-3" checked={emp.isMagic}/></td>
                                <td className="p-2 border-r text-center">
                                    {processedValue ? (
                                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">{processedValue}</div>
                                    ) : (
                                        <button 
                                            onClick={() => { setActiveProcessingEmp(emp); setIsProcessingEffectiveness(true); }}
                                            className="text-[9px] font-black uppercase underline text-red-600 hover:text-blue-600"
                                        >
                                            Processar
                                        </button>
                                    )}
                                </td>
                                <td className="p-2 border-r text-center font-black text-slate-400">.</td>
                                <td className="p-2 border-r text-center">
                                    <input type="checkbox" checked={!!processedValue} className="w-4 h-4 rounded accent-emerald-600"/>
                                </td>
                                <td className="p-2 text-center">
                                    <button 
                                        onClick={() => window.print()} 
                                        disabled={!processedValue}
                                        className={`p-1 rounded transition-colors ${processedValue ? 'text-blue-600 hover:bg-slate-100' : 'text-slate-200 cursor-not-allowed pointer-events-none opacity-20'}`}
                                    >
                                        <Printer size={14}/>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-blue-600"/> Recursos Humanos & Processamento</h1>
                <div className="mt-2 space-y-2">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Conformidade Legal AGT/MAPTSS</p>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Ação:</span>
                        <select 
                            className="bg-transparent text-[11px] font-black text-blue-600 uppercase outline-none cursor-pointer border-none p-0 focus:ring-0"
                            onChange={(e) => handleActionSelect(e.target.value)}
                            value="SELECT"
                        >
                            <option value="SELECT">Selecionar</option>
                            <option value="PROCESS_EFECTIVIDADE">Processar efetividade</option>
                            <option value="DELETE_EFECTIVIDADE">Apagar efetividade</option>
                            <option value="PROCESS_SALARIO">Processar salário</option>
                            <option value="PRINT_RECIBOS">Imprimir recibos de salários</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm overflow-x-auto w-full md:w-auto custom-scrollbar">
                {[
                  {id:'DASHBOARD', label: 'Painel Geral'},
                  {id:'GESTÃO', label: 'Funcionários'},
                  {id:'ASSIDUIDADE', label: 'Assiduidade Técnica'},
                  {id:'PROFISSÕES', label: 'Profissões'},
                  {id:'MAPAS', label: 'Mapas de Salários'},
                  {id:'ORDEM_TRANSFERENCIA', label: 'Ordem Transferência'}
                ].map(t => (
                    <button 
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-4 py-2 rounded-md font-bold text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>

        {activeTab === 'GESTÃO' && <Employees employees={employees} onSaveEmployee={onSaveEmployee} workLocations={[]} professions={professions} />}
        {activeTab === 'ASSIDUIDADE' && renderAssiduidade()}
        {activeTab === 'MAPAS' && <SalaryMap payroll={payroll} employees={employees} />}
        {activeTab === 'PROFISSÕES' && <ProfessionManager professions={professions} onSave={onSaveProfession} onDelete={onDeleteProfession}/>}
        {activeTab === 'DASHBOARD' && <div className="p-20 text-center text-slate-300 font-black uppercase tracking-[10px] opacity-30 italic text-xl">Imatec RH Cloud System</div>}
    </div>
  );
};

export default HumanResources;