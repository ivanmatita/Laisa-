
import React, { useState, useMemo } from 'react';
import { 
  Employee, HrTransaction, HrVacation, SalarySlip, Profession, 
  Contract, AttendanceRecord, Company, ViewState, CashRegister, PaymentMethod 
} from '../types';
import { 
  generateId, formatCurrency, formatDate, calculateINSS, calculateIRT, numberToExtenso 
} from '../utils';
import { 
  Users, Briefcase, Calculator, Calendar, 
  FileText, Printer, Search, Plus, X, User, 
  MoreVertical, RefreshCw, Loader2, CheckCircle, AlertTriangle, 
  Shield, ChevronDown, ChevronUp, Gavel, Wallet, TrendingUp, CheckSquare, Square, Play, Trash, FileSpreadsheet, ChevronRight, FileCheck, Circle, Info,
  ArrowRight, CreditCard, ImageIcon, Clock, Save, DollarSign, ArrowDownLeft, Settings, Settings2, Monitor,
  // Fix: Added missing Gift, FileSignature, UserCheck and UserMinus icons to imports
  Gift, FileSignature, UserCheck, UserMinus
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import SalaryMap from './SalaryMap';
import ProfessionManager from './ProfessionManager';
import Employees from './Employees';
import EffectivenessMap from './EffectivenessMap';
import SalaryListReport from './SalaryListReport';

// --- COMPONENTES AUXILIARES ---

interface AttendanceGridProps {
  emp: Employee;
  processingMonth: number;
  processingYear: number;
  months: string[];
  onCancel: () => void;
  onConfirm: (attData: Record<number, string>, subs: { trans: number, alim: number }) => void;
}

const AttendanceGrid: React.FC<AttendanceGridProps> = ({ emp, processingMonth, processingYear, months, onCancel, onConfirm }) => {
    const [attData, setAttData] = useState<Record<number, string>>({});
    const [subs, setSubs] = useState({ trans: 0, alim: 0 });
    const daysInMonth = new Date(processingYear, processingMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    const handleFullSelection = (type: string) => {
        const newAtt = { ...attData };
        days.forEach(d => { newAtt[d] = type; });
        setAttData(newAtt);
    };

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
                            ].map((row, rIdx) => (
                                <tr key={rIdx} className={`${row.color} hover:opacity-90`}>
                                    <td className={`border border-slate-300 p-1 font-bold ${row.textRed ? 'text-red-600' : 'text-slate-700'}`}>
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
                                        onClick={() => row.isRadio && handleFullSelection(row.key)}>
                                        {row.isRadio && (
                                            <div className="w-4 h-4 rounded-full border-2 border-slate-400 mx-auto bg-white flex items-center justify-center">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-emerald-50">
                                <td className="border border-slate-300 p-1 font-black text-[10px] uppercase text-emerald-800">Subsídio Alimentação</td>
                                <td colSpan={daysInMonth} className="border border-slate-300 p-0">
                                    <input 
                                        type="number" 
                                        className="w-full h-8 bg-transparent px-4 font-black text-emerald-700 outline-none" 
                                        placeholder="Inserir Valor Manual..." 
                                        value={subs.alim || ''}
                                        onChange={e => setSubs({...subs, alim: Number(e.target.value)})}
                                    />
                                </td>
                                <td className="border border-slate-300"></td>
                            </tr>
                            <tr className="bg-blue-50">
                                <td className="border border-slate-300 p-1 font-black text-[10px] uppercase text-blue-800">Subsídio Transporte</td>
                                <td colSpan={daysInMonth} className="border border-slate-300 p-0">
                                    <input 
                                        type="number" 
                                        className="w-full h-8 bg-transparent px-4 font-black text-blue-700 outline-none" 
                                        placeholder="Inserir Valor Manual..." 
                                        value={subs.trans || ''}
                                        onChange={e => setSubs({...subs, trans: Number(e.target.value)})}
                                    />
                                </td>
                                <td className="border border-slate-300"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto pt-8 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-6 py-2 bg-slate-400 text-white font-bold uppercase rounded-lg border-b-4 border-slate-600 hover:bg-slate-500 transition">Cancelar</button>
                    <button onClick={() => onConfirm(attData, subs)} className="px-16 py-2 bg-gradient-to-b from-slate-200 to-slate-400 border-2 border-slate-500 rounded-full text-slate-800 font-bold text-lg hover:shadow-lg transition">Processar Efetividade</button>
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
        baseSalary: data.baseSalary || emp.baseSalary || 0,
        complement: emp.complementSalary || 0,
        bonus: 0,
        subsidyFood: data.subsAlimManual || emp.subsidyFood || 0,
        subsidyTransport: data.subsTransManual || emp.subsidyTransport || 0,
        subsidyHousing: emp.subsidyHousing || 0,
        subsidyVacation: emp.subsidyVacation || 0,
        subsidyChristmas: emp.subsidyChristmas || 0,
        subsidyFamily: emp.subsidyFamily || 0,
        absences: data.hoursAbsence || 0, // Unjustified
        justifiedAbsences: 0,
        advances: 0
    });

    const calculatedData = useMemo(() => {
        // Angolan LGT Deduction for Unjustified Absences: (Base / 30) * Absences
        const absenceVal = (editableValues.baseSalary / 30) * editableValues.absences;
        const totalBaseIliquido = editableValues.baseSalary + editableValues.complement - absenceVal + editableValues.bonus;
        
        // INSS is 3% for the employee
        const inss = calculateINSS(editableValues.baseSalary + editableValues.complement - absenceVal);
        const subsidiesTotal = editableValues.subsidyFood + editableValues.subsidyTransport + editableValues.subsidyHousing + editableValues.subsidyVacation + editableValues.subsidyChristmas + editableValues.subsidyFamily;
        const totalVencimentoAntesImpostos = totalBaseIliquido + subsidiesTotal;
        
        const irt = calculateIRT(totalVencimentoAntesImpostos, inss);
        const netTotal = totalVencimentoAntesImpostos - inss - irt - editableValues.advances;
        
        return { totalBaseIliquido, inss, irt, netTotal, absenceVal, totalVencimentoAntesImpostos };
    }, [editableValues]);

    const handleProcessFinal = () => {
        const slip: SalarySlip = {
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            baseSalary: editableValues.baseSalary,
            allowances: editableValues.complement,
            bonuses: editableValues.bonus,
            subsidies: calculatedData.totalVencimentoAntesImpostos - calculatedData.totalBaseIliquido,
            subsidyFood: editableValues.subsidyFood,
            subsidyTransport: editableValues.subsidyTransport,
            subsidyFamily: editableValues.subsidyFamily,
            subsidyHousing: editableValues.subsidyHousing,
            absences: editableValues.absences,
            advances: editableValues.advances,
            grossTotal: calculatedData.totalVencimentoAntesImpostos,
            inss: calculatedData.inss,
            irt: calculatedData.irt,
            netTotal: calculatedData.netTotal,
            month: data.month,
            year: data.year,
            isProcessed: true,
            attendanceDetails: data.attendanceDetails
        };
        onProcess(slip);
    };

    return (
        <div className="fixed inset-0 z-[130] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-none shadow-2xl w-full max-w-[1200px] p-8 flex flex-col font-sans text-slate-900 border-4 border-slate-800 overflow-auto max-h-[90vh]">
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-slate-900 text-white px-8 py-2 font-black uppercase text-lg tracking-widest border-l-8 border-blue-500">
                        RECIBO SALARIO
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-slate-700">{months[data.month - 1]} de {data.year}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <span className="text-3xl font-black text-slate-900">{emp.employeeNumber || '2'}</span>
                    <span className="text-3xl font-black uppercase tracking-tighter text-slate-800">{emp.name}</span>
                </div>

                <div className="flex-1 space-y-1">
                    <div className="grid grid-cols-[60px_1fr_100px_200px] gap-4 border-b-2 border-slate-300 pb-1 text-xs font-black uppercase text-slate-600 px-2">
                        <span>Cód</span>
                        <span className="text-center">Secretaria</span>
                        <span className="text-center">QTD</span>
                        <span className="text-right">VALOR</span>
                    </div>

                    <div className="space-y-2 py-4">
                        {[
                            { code: '01', label: 'Vencimento Base para a Categoria Profissional', key: 'baseSalary', qtd: 31 },
                            { code: '02', label: 'Complemento Salarial', key: 'complement', qtd: 27 },
                            { code: '03', label: `Abatimento de Faltas Admissão(${editableValues.absences}d) (Total Horas=${editableValues.absences*8}Hrs)`, key: 'absences', qtd: editableValues.absences, isNegative: true, calc: calculatedData.absenceVal },
                            { code: '03B', label: `Faltas Justificadas`, key: 'justifiedAbsences', qtd: editableValues.justifiedAbsences, calc: 0 },
                            { code: '04', label: 'Horas Extra', key: 'bonus', qtd: 0 },
                            { code: '05', label: 'Total de Vencimento Base Iliquido (01+02-03+04)', key: 'totalBase', isTotal: true, val: calculatedData.totalBaseIliquido },
                            { code: '', label: 'Subsidios', isSubheader: true },
                            { code: '06', label: 'Subsidio de Férias', key: 'subsidyVacation', qtd: 'Vg' },
                            { code: '07', label: 'Subsidio de Natal', key: 'subsidyChristmas', qtd: 'Vg' },
                            { code: '', label: 'Abono de Familia (Isento até 5000 akz)', key: 'subsidyFamily', qtd: 'Vg' },
                            { code: '08', label: 'Subsidio Transporte', key: 'subsidyTransport', qtd: 0 },
                            { code: '09', label: 'Subsidio Alimentação', key: 'subsidyFood', qtd: 0 },
                            { code: '10', label: 'Subsidio Alojamento', key: 'subsidyHousing', qtd: 'Vg' },
                            { code: '13', label: 'Total de Vencimento antes de Impostos [05]+[06]+[07]+[08]+[09]+[10]+[11]-[12]', isTotal: true, val: calculatedData.totalVencimentoAntesImpostos },
                        ].map((row, idx) => {
                            if (row.isSubheader) return <div key={idx} className="font-black text-slate-800 text-xs px-2 pt-2">{row.label}</div>;
                            if (row.isTotal) return (
                                <div key={idx} className="grid grid-cols-[60px_1fr_100px_200px] gap-4 items-center h-10 border-t border-slate-300 font-black text-slate-800">
                                    <span className="text-xs">{row.code}</span>
                                    <span className="text-xs uppercase">{row.label}</span>
                                    <span className="text-center"></span>
                                    <span className="text-right border-t border-slate-800 pr-2">{formatCurrency(row.val!).replace('Kz','')}</span>
                                </div>
                            );
                            return (
                                <div key={idx} className="grid grid-cols-[60px_1fr_100px_200px] gap-4 items-center h-8">
                                    <span className="font-bold text-slate-400 text-xs">{row.code}</span>
                                    <span className="font-bold text-slate-700 text-xs">{row.label}</span>
                                    <span className="text-center font-bold text-slate-500 text-xs">{row.qtd}</span>
                                    <div className="flex justify-end pr-2">
                                        {row.calc !== undefined && row.calc === 0 && row.key !== 'justifiedAbsences' ? (
                                            <span className="font-black text-slate-400 text-sm">0,00</span>
                                        ) : row.calc !== undefined && row.isNegative ? (
                                            <span className="font-black text-slate-800 text-sm">- {formatCurrency(row.calc).replace('Kz','')}</span>
                                        ) : (
                                            <input 
                                                type="number"
                                                className="bg-white border border-slate-400 rounded-full px-4 py-1 w-40 text-right font-black text-sm outline-none focus:border-blue-500 shadow-sm"
                                                value={(editableValues as any)[row.key]}
                                                onChange={e => setEditableValues({...editableValues, [row.key]: Number(e.target.value)})}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-4 py-4 border-t-2 border-slate-100">
                         <div className="flex flex-col items-end space-y-1">
                             <div className="flex gap-4 items-center">
                                <span className="font-black text-red-600 text-xs uppercase">Impostos</span>
                                <span className="font-black text-red-600 text-xs">ISENTO</span>
                             </div>
                             <div className="flex justify-between w-full max-w-[500px]">
                                <span className="font-bold text-slate-600 text-xs">Vencimento Liquido depois de Impostos [ 13]-[14]-[15]</span>
                                <span className="font-black text-slate-900 text-sm">{formatCurrency(calculatedData.netTotal).replace('Kz','')}</span>
                             </div>
                             <div className="flex gap-4 items-center">
                                <button className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Arredondar</button>
                                <div className="border border-slate-400 rounded-full px-4 py-1 w-40 text-right font-black text-sm bg-slate-50">{(Math.round(calculatedData.netTotal / 100) * 100).toLocaleString()}</div>
                             </div>
                             <div className="flex justify-between w-full max-w-[500px] border-t-2 border-slate-800 pt-1">
                                <span className="font-black text-slate-900 text-sm uppercase">TOTAL A RECEBER</span>
                                <span className="font-black text-slate-900 text-sm">{formatCurrency(calculatedData.netTotal).replace('Kz','')}</span>
                             </div>
                         </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center border-t pt-6">
                    <div>
                        <p className="text-red-600 font-black text-sm">Total de Abonos e Adiantamentos 0,00</p>
                    </div>
                    <div className="flex gap-6 items-center">
                        <span className="text-red-600 font-black text-xl italic uppercase">Valor a pagar ={formatCurrency(calculatedData.netTotal).replace('Kz','')}</span>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="px-8 py-3 bg-slate-200 text-slate-600 font-black uppercase rounded-xl hover:bg-slate-300 transition text-xs">Voltar</button>
                            <button onClick={handleProcessFinal} className="bg-[#a7f3d0] hover:bg-[#86efac] text-slate-700 font-black px-20 py-3 rounded-xl shadow-lg transition transform active:scale-95 text-lg uppercase tracking-widest">Processar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface FinalPrintReceiptProps {
    slip: SalarySlip;
    company: Company;
    employee: Employee;
    months: string[];
    onClose: () => void;
}

const FinalPrintReceipt: React.FC<FinalPrintReceiptProps> = ({ slip, company, employee, months, onClose }) => {
    const f = (v: number) => formatCurrency(v).replace('Kz', '').trim();

    const renderReceiptPart = (label: string) => (
        <div className="flex-1 p-8 font-sans text-slate-900 text-[9px] leading-tight">
            <div className="text-center mb-6">
                <p className="font-bold text-xs uppercase">{company.name}</p>
                <p className="font-bold">NIF: {company.nif}</p>
            </div>
            
            <div className="flex justify-between items-end mb-4 border-b-2 border-slate-800 pb-2">
                <div className="space-y-0.5">
                    <p className="font-bold flex gap-2"><span className="text-slate-400">2</span> <span className="uppercase text-sm font-black">{employee.name}</span></p>
                    <p className="font-bold">Profissão: {employee.role}</p>
                    <p className="text-slate-500 font-medium italic">[ Admitido em {formatDate(employee.admissionDate)} ]</p>
                </div>
                <div className="text-right">
                    <p className="font-black text-slate-400 uppercase text-[8px] tracking-widest">{label}</p>
                    <p className="font-black uppercase text-xs">RECIBO DE VENCIMENTO</p>
                    <p className="font-bold">{months[slip.month - 1]} de {slip.year}</p>
                    <p className="font-bold">NIF Nº: {employee.nif}</p>
                    <p className="font-bold">INSS Nº: {employee.ssn || '00000'}</p>
                </div>
            </div>

            <div className="grid grid-cols-[40px_1fr_60px_100px] font-black border-b border-slate-300 pb-1 uppercase text-[8px]">
                <span>COD</span>
                <span>Descrição</span>
                <span className="text-center">QTD</span>
                <span className="text-right">VALOR</span>
            </div>

            <div className="space-y-1.5 py-4 min-h-[350px]">
                <div className="grid grid-cols-[40px_1fr_60px_100px] items-center">
                    <span className="text-slate-400">01</span>
                    <span className="font-bold uppercase">Vencimento Base para a Categoria Profissional</span>
                    <span className="text-center font-bold">31</span>
                    <span className="text-right font-bold">{f(slip.baseSalary)}</span>
                </div>
                <div className="grid grid-cols-[40px_1fr_60px_100px] items-center">
                    <span className="text-slate-400">02</span>
                    <span className="font-bold uppercase">Complemento Salarial</span>
                    <span className="text-center font-bold">27</span>
                    <span className="text-right font-bold">{f(slip.allowances)}</span>
                </div>
                {slip.absences > 0 && (
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center text-red-600">
                        <span className="text-slate-300">04</span>
                        <span className="font-bold uppercase italic">Abatimento de Faltas Admissão({slip.absences}d)</span>
                        <span className="text-center font-bold">{slip.absences}</span>
                        <span className="text-right font-bold">-{f((slip.baseSalary / 30) * slip.absences)}</span>
                    </div>
                )}
                <div className="grid grid-cols-[40px_1fr_60px_100px] items-center border-t border-slate-300 pt-1 font-bold">
                    <span className="text-slate-400">07</span>
                    <span className="uppercase">[01+02-03+04+05-06] Total de Vencimento</span>
                    <span className=""></span>
                    <span className="text-right">{f(slip.baseSalary + slip.allowances - ((slip.baseSalary / 30) * slip.absences))}</span>
                </div>

                <div className="pt-4 space-y-1">
                    <p className="font-black text-slate-400 uppercase italic">Subsidios</p>
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center">
                        <span className="text-slate-400">08</span>
                        <span className="font-bold uppercase">Subsidio de Férias</span>
                        <span className="text-center font-bold">Vg</span>
                        <span className="text-right font-bold">{f(slip.subsidyVacation || 0)}</span>
                    </div>
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center">
                        <span className="text-slate-400">09</span>
                        <span className="font-bold uppercase">Subsidio de Natal</span>
                        <span className="text-center font-bold">Vg</span>
                        <span className="text-right font-bold">{f(slip.subsidyChristmas || 0)}</span>
                    </div>
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center">
                        <span className="text-slate-400">10</span>
                        <span className="font-bold uppercase">Abono de Familia</span>
                        <span className="text-center font-bold">Vg</span>
                        <span className="text-right font-bold">{f(slip.subsidyFamily)}</span>
                    </div>
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center">
                        <span className="text-slate-400">13</span>
                        <span className="font-bold uppercase">Subsidio de Alojamento</span>
                        <span className="text-center font-bold">Vg</span>
                        <span className="text-right font-bold">{f(slip.subsidyHousing)}</span>
                    </div>
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center border-t border-slate-200 pt-1 font-bold">
                        <span className="text-slate-400">15</span>
                        <span className="uppercase">[08+09+10+11+12+13+14] Total de Subsidios</span>
                        <span className=""></span>
                        <span className="text-right">{f(slip.subsidies)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-[40px_1fr_60px_100px] items-center border-t-2 border-slate-800 pt-1 font-black text-slate-800 mt-4">
                    <span className="">18</span>
                    <span className="uppercase">[07+15+16-17] Total de Vencimento Antes de Impostos</span>
                    <span className=""></span>
                    <span className="text-right">{f(slip.grossTotal)}</span>
                </div>

                <div className="pt-4 space-y-1">
                    <p className="font-black text-slate-400 uppercase italic">Impostos</p>
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center">
                        <span className="text-slate-400">19</span>
                        <span className="font-bold uppercase">Segurança Social do Trabalhador [18-08]x3%</span>
                        <span className="text-center font-bold"></span>
                        <span className="text-right font-bold">{f(slip.inss)}</span>
                    </div>
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center">
                        <span className="text-slate-400">20</span>
                        <span className="font-bold uppercase">IRT [07+[11]>30.000+[12]>30.000+[13]50%+10+16-17-19]</span>
                        <span className="text-center font-bold"></span>
                        <span className="text-right font-bold">{f(slip.irt)}</span>
                    </div>
                    <div className="grid grid-cols-[40px_1fr_60px_100px] items-center border-t border-slate-300 pt-1 font-bold">
                        <span className="text-slate-400">21</span>
                        <span className="uppercase">Vencimento liquido depois de impostos [18-19-20]</span>
                        <span className=""></span>
                        <span className="text-right">{f(slip.netTotal)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-[40px_1fr_60px_100px] items-center font-black text-slate-900 mt-6 border-t border-slate-300 pt-2">
                    <span className="">22</span>
                    <span className="uppercase">VENCIMENTO LIQUIDO</span>
                    <span className=""></span>
                    <span className="text-right">{f(slip.netTotal)}</span>
                </div>
            </div>

            <div className="mt-auto pt-8 border-t-2 border-slate-800">
                <div className="grid grid-cols-[40px_1fr_100px] items-center font-black text-[11px] uppercase">
                    <span>24</span>
                    <span>TOTAL A RECEBER [22-23]</span>
                    <span className="text-right">{f(slip.netTotal)}</span>
                </div>
                
                <div className="mt-20 flex justify-between items-end">
                    <div className="w-64 border-b border-slate-800 pb-1">
                        <span className="font-bold">Recebi:</span>
                    </div>
                    <div className="text-[7px] font-bold text-slate-400 flex items-center gap-1">
                         <div className="w-2 h-2 bg-slate-400"></div> Powered by Afrogest™
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[140] bg-slate-100 flex flex-col items-center animate-in fade-in overflow-y-auto">
            <div className="w-full bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-[150] print:hidden">
                <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    <Printer size={18} className="text-blue-400"/> Pré-visualização de Recibo A4
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl font-black uppercase text-xs shadow-lg transition transform active:scale-95">Imprimir</button>
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-2 rounded-xl font-black uppercase text-xs transition">Fechar</button>
                </div>
            </div>

            <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl flex flex-row divide-x-2 divide-dashed divide-slate-400 print:shadow-none print:w-full print:divide-slate-300" id="receipt-print-area">
                {renderReceiptPart('ORIGINAL')}
                {renderReceiptPart('DUPLICADO')}
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #receipt-print-area, #receipt-print-area * { visibility: visible; }
                    #receipt-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                    }
                    @page { size: A4 landscape; margin: 0; }
                }
            `}</style>
        </div>
    );
};

interface EmployeeActionsModalProps {
    employee: Employee;
    onClose: () => void;
    onAction: (action: string) => void;
}

const EmployeeActionsModal: React.FC<EmployeeActionsModalProps> = ({ employee, onClose, onAction }) => {
    const actions = [
        { label: "Ver Cadastro", icon: User },
        { label: "Editar Dados Pessoais", icon: Settings },
        { label: "Imprimir", icon: Printer },
        { label: "Medidas de Fardas", icon: Settings2 },
        { label: "Multas e Penalizações", icon: AlertTriangle },
        { label: "Acertos Salariais", icon: Calculator },
        // Fix: icon: Gift correctly mapped
        { label: "Gratificações Periodicas Mensais", icon: Gift },
        { label: "Abonos ou Adiantamentos", icon: Wallet },
        // Fix: icon: FileSignature correctly mapped
        { label: "Emitir Contrato de Trabalho", icon: FileSignature },
        // Fix: icon: UserCheck correctly mapped
        { label: "Readmitir Funcionario", icon: UserCheck },
        // Fix: icon: UserMinus correctly mapped
        { label: "Demitir Funcionario", icon: UserMinus }
    ];

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#a7f3d0] p-1 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="bg-white rounded-[1.4rem] overflow-hidden border border-emerald-200 flex flex-col max-h-[85vh]">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 text-center shrink-0 border-b border-white/20">
                        <h3 className="text-white font-black uppercase text-base tracking-tighter italic">{employee.name}</h3>
                    </div>
                    <div className="p-4 space-y-1.5 bg-slate-50 overflow-y-auto custom-scrollbar flex-1">
                        {actions.map((act, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onAction(act.label)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-left px-4 py-3.5 rounded-xl flex items-center justify-between group transition-all transform active:scale-95 shadow-lg border-b-4 border-blue-800"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-inner group-hover:bg-white/40 group-hover:scale-110 transition-all">
                                        <act.icon size={16} className="text-white"/>
                                    </div>
                                    <span className="font-bold text-xs uppercase tracking-tight leading-none">{act.label}</span>
                                </div>
                                <ChevronRight size={16} className="text-white/40 group-hover:text-white transition-all"/>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-100 flex justify-center border-t">
                        <button onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2">
                           <X size={14}/> Fechar Menu de Ações
                        </button>
                    </div>
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
  onClearPayroll?: (empId: string, month: number, year: number) => void;
  professions: Profession[];
  onSaveProfession: (p: Profession) => void;
  onDeleteProfession: (id: string) => void;
  contracts: Contract[];
  onSaveContract: (c: Contract[]) => void;
  attendance: AttendanceRecord[];
  onSaveAttendance: (a: AttendanceRecord) => void;
  company: Company;
  currentView?: ViewState;
  cashRegisters?: CashRegister[];
}

const HumanResources: React.FC<HumanResourcesProps> = ({ 
    employees, onSaveEmployee, transactions, onSaveTransaction, 
    vacations, onSaveVacation, payroll, onProcessPayroll, onClearPayroll,
    professions, onSaveProfession, onDeleteProfession,
    contracts, onSaveContract, attendance, onSaveAttendance,
    company, currentView, cashRegisters = []
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GESTÃO' | 'ASSIDUIDADE' | 'PROFISSÕES' | 'MAPAS' | 'ORDEM_TRANSFERENCIA' | 'EFETIVIDADE_MAP' | 'VENCIMENTO_LIST'>(() => {
    if (currentView === 'HR_TRANSFER_ORDER') return 'ORDEM_TRANSFERENCIA';
    if (currentView === 'HR_EFFECTIVENESS_MAP') return 'EFETIVIDADE_MAP';
    if (currentView === 'HR_SALARY_LIST') return 'VENCIMENTO_LIST';
    return 'DASHBOARD';
  });

  const [processingMonth, setProcessingMonth] = useState(new Date().getMonth() + 1);
  const [processingYear, setProcessingYear] = useState(new Date().getFullYear());
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  
  // Track effectiveness per period
  const [processedEffectiveness, setProcessedEffectiveness] = useState<Set<string>>(new Set()); 
  const [employeeCashiers, setEmployeeCashiers] = useState<Record<string, string>>({});

  const [isProcessingEffectiveness, setIsProcessingEffectiveness] = useState(false);
  const [activeProcessingEmp, setActiveProcessingEmp] = useState<Employee | null>(null);
  const [showSalaryReceipt, setShowSalaryReceipt] = useState(false);
  const [showFinalReceipt, setShowFinalReceipt] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedEmployeeForActions, setSelectedEmployeeForActions] = useState<Employee | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [finalSlipToPrint, setFinalSlipToPrint] = useState<SalarySlip | null>(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedCashId, setSelectedCashId] = useState('');

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleActionSelect = (val: string) => {
    if (val === 'PROCESS_EFECTIVIDADE') {
        if (selectedEmpIds.size === 0) return alert("Selecione funcionários para processar efetividade.");
        const newSet = new Set(processedEffectiveness);
        selectedEmpIds.forEach(id => newSet.add(`${id}-${processingMonth}-${processingYear}`));
        setProcessedEffectiveness(newSet);
        alert("Efetividade processada automaticamente para os funcionários selecionados!");
    } else if (val === 'DELETE_EFECTIVIDADE') {
        if (selectedEmpIds.size === 0) return alert("Selecione funcionários para apagar efetividade.");
        if (confirm("Deseja apagar a efetividade dos funcionários selecionados para este período?")) {
            const newSet = new Set(processedEffectiveness);
            selectedEmpIds.forEach(id => newSet.delete(`${id}-${processingMonth}-${processingYear}`));
            setProcessedEffectiveness(newSet);
            alert("Efetividade removida.");
        }
    } else if (val === 'PROCESS_SALARIO') {
        if (selectedEmpIds.size !== 1) return alert("Selecione apenas 1 funcionário para abrir o painel de processamento.");
        const empId = Array.from(selectedEmpIds)[0];
        const emp = employees.find(e => e.id === empId);
        if (emp) {
            if (!processedEffectiveness.has(`${emp.id}-${processingMonth}-${processingYear}`)) {
                return alert("REGRA: Só é permitido processar salário quando a efetividade estiver processada primeiro.");
            }
            setReceiptData({ 
                emp, month: processingMonth, year: processingYear, baseSalary: emp.baseSalary 
            });
            setShowSalaryReceipt(true);
        }
    } else if (val === 'PRINT_RECIBOS') {
        if (selectedEmpIds.size !== 1) return alert("Selecione 1 funcionário para imprimir.");
        const empId = Array.from(selectedEmpIds)[0];
        const slip = getProcessedSlip(empId);
        if (slip) {
            setFinalSlipToPrint(slip);
            setShowFinalReceipt(true);
        } else {
            alert("Salário não processado para este funcionário neste período.");
        }
    } else if (val === 'DELETE_SALARIO') {
        if (selectedEmpIds.size === 0) return alert("Selecione funcionários para apagar salários.");
        if (confirm("Deseja apagar os processamentos salariais selecionados?")) {
            selectedEmpIds.forEach(id => onClearPayroll?.(id, processingMonth, processingYear));
            alert("Processamentos salariais removidos da Cloud.");
        }
    }
  };

  const handleTransfer = () => {
    if (selectedEmpIds.size === 0) return alert("Selecione os funcionários para a transferência.");
    setShowTransferModal(true);
  };

  const executeTransfer = async () => {
    if (!selectedCashId) return alert("Selecione o caixa de saída global ou verifique seleções individuais.");
    
    const newSlips: SalarySlip[] = [];
    // Fix: Explicitly using Array.from and type assertion to resolve type inference errors
    for (const empId of Array.from(selectedEmpIds) as string[]) {
        const emp = employees.find(e => e.id === empId);
        const existing = getProcessedSlip(empId);
        
        if (!processedEffectiveness.has(`${empId}-${processingMonth}-${processingYear}`)) {
            console.warn(`Pulando funcionário ${emp?.name} - Efetividade não processada.`);
            continue;
        }

        if (emp && !existing) {
            const inss = calculateINSS(emp.baseSalary + (emp.complementSalary || 0));
            const gross = emp.baseSalary + (emp.complementSalary || 0) + emp.subsidyFood + emp.subsidyTransport;
            const irt = calculateIRT(gross, inss);
            const net = gross - inss - irt;

            newSlips.push({
                employeeId: emp.id,
                employeeName: emp.name,
                employeeRole: emp.role,
                baseSalary: emp.baseSalary,
                allowances: emp.complementSalary || 0,
                bonuses: 0,
                subsidies: emp.subsidyFood + emp.subsidyTransport,
                subsidyFood: emp.subsidyFood,
                subsidyTransport: emp.subsidyTransport,
                subsidyFamily: emp.subsidyFamily,
                subsidyHousing: emp.subsidyHousing,
                absences: 0,
                advances: 0,
                grossTotal: gross,
                inss: inss,
                irt: irt,
                netTotal: net,
                month: processingMonth,
                year: processingYear,
                isProcessed: true
            });
        }
    }

    if (newSlips.length > 0) {
        onProcessPayroll(newSlips);
    }

    const totalNetToPay = (Array.from(selectedEmpIds) as string[]).reduce((acc: number, id: string) => {
        const slip = payroll.find(p => p.employeeId === id && p.month === processingMonth && p.year === processingYear) 
                    || newSlips.find(p => p.employeeId === id);
        return acc + (slip?.netTotal || 0);
    }, 0);

    try {
        const { error } = await supabase.from('movimentos_caixa').insert({
            caixa_id: selectedCashId,
            tipo: 'EXIT',
            valor: totalNetToPay,
            descricao: `Pagamento de Salários - ${months[processingMonth-1]} ${processingYear}`,
            operador_nome: 'Admin',
            origem: 'HR',
            empresa_id: company.id
        });
        if (error) throw error;
        alert("Transferência efetuada e salários processados com sucesso!");
        setShowTransferModal(false);
        setSelectedEmpIds(new Set());
    } catch (e: any) {
        alert("Erro ao registrar no caixa: " + e.message);
    }
  };

  const getProcessedSlip = (empId: string) => {
    return payroll.find(p => p.employeeId === empId && p.month === processingMonth && p.year === processingYear);
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
                onConfirm={(data, s) => {
                    setIsProcessingEffectiveness(false);
                    const newSet = new Set(processedEffectiveness);
                    newSet.add(`${activeProcessingEmp.id}-${processingMonth}-${processingYear}`);
                    setProcessedEffectiveness(newSet);
                    setReceiptData({ 
                        emp: activeProcessingEmp, 
                        month: processingMonth, 
                        year: processingYear, 
                        baseSalary: activeProcessingEmp.baseSalary, 
                        hoursAbsence: Object.values(data).filter(v => v === 'injust').length,
                        subsAlimManual: s.alim,
                        subsTransManual: s.trans,
                        attendanceDetails: data
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
                }}
            />
        )}

        {showFinalReceipt && finalSlipToPrint && (
            <FinalPrintReceipt 
                slip={finalSlipToPrint}
                company={company}
                employee={employees.find(e => e.id === finalSlipToPrint.employeeId)!}
                months={months}
                onClose={() => { setShowFinalReceipt(false); setFinalSlipToPrint(null); }}
            />
        )}

        {showActionsModal && selectedEmployeeForActions && (
            <EmployeeActionsModal 
                employee={selectedEmployeeForActions}
                onClose={() => { setShowActionsModal(false); setSelectedEmployeeForActions(null); }}
                onAction={(label) => {
                    if (label === "Editar Dados Pessoais") {
                        setActiveTab('GESTÃO');
                        setShowActionsModal(false);
                    } else if (label === "Acertos Salariais" || label === "Gratificações Periodicas Mensais") {
                        if (!processedEffectiveness.has(`${selectedEmployeeForActions.id}-${processingMonth}-${processingYear}`)) {
                            alert("Só é permitido processar salário quando a efetividade estiver processada primeiro.");
                        } else {
                            setReceiptData({ emp: selectedEmployeeForActions, month: processingMonth, year: processingYear });
                            setShowSalaryReceipt(true);
                        }
                        setShowActionsModal(false);
                    } else {
                        alert(`Ação "${label}" em desenvolvimento.`);
                        setShowActionsModal(false);
                    }
                }}
            />
        )}

        <div className="bg-white border-2 border-slate-300 shadow-2xl rounded-none overflow-hidden min-w-[1600px]">
            <table className="w-full text-left border-collapse text-[10px] theme-red">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase tracking-tighter text-center">
                    <tr className="border-b-2 border-slate-400">
                        <th className="p-2 border-r w-10 text-center">
                            <button onClick={() => setSelectedEmpIds(selectedEmpIds.size === employees.length ? new Set() : new Set(employees.map(e => e.id)))} className="p-1">
                                {selectedEmpIds.size === employees.length ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16} className="text-slate-300"/>}
                            </button>
                        </th>
                        <th className="p-2 border-r w-8" rowSpan={2}>Nº</th>
                        <th className="p-2 border-r w-40" rowSpan={2}>IDNF<br/>POSTO</th>
                        <th className="p-2 border-r w-64" rowSpan={2}>Nome<br/>Profissão</th>
                        <th className="p-2 border-r w-48" rowSpan={2}>Selecionar Caixa<br/>(Para Transferência)</th>
                        <th className="p-2 border-r w-32">Datas</th>
                        <th className="p-2 border-r w-24">Pagamentos</th>
                        <th className="p-2 border-r" colSpan={3}>Subsidios Pontuais</th>
                        <th className="p-2 border-r w-24" rowSpan={2}>Abono<br/>Familia</th>
                        <th className="p-2 border-r" colSpan={2}>Sub Isentos</th>
                        <th className="p-2 border-r" colSpan={4}>Outros Acertos</th>
                        <th className="p-2" colSpan={5}>Processamento</th>
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
                        <th className="p-1 text-[8px] text-blue-600 font-black border-r">Imprimir</th>
                        <th className="p-1 text-[8px] text-slate-800 font-black">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {employees.map((emp, idx) => {
                        const isSelected = selectedEmpIds.has(emp.id);
                        const slip = getProcessedSlip(emp.id);
                        const isEffectivenessDone = processedEffectiveness.has(`${emp.id}-${processingMonth}-${processingYear}`);
                        
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
                                <td className="p-2 border-r text-center">
                                    <select 
                                        className="w-full text-[9px] font-black uppercase border border-slate-100 rounded bg-slate-50 outline-none focus:ring-1 focus:ring-blue-400"
                                        value={employeeCashiers[emp.id] || ''}
                                        onChange={e => setEmployeeCashiers({...employeeCashiers, [emp.id]: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        {cashRegisters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
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
                                    {isEffectivenessDone ? (
                                        <div className="flex items-center justify-center text-emerald-600 gap-1 font-black uppercase text-[8px]">
                                            <CheckCircle size={12}/> Done
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center text-amber-500 gap-1 font-black uppercase text-[8px]">
                                            <AlertTriangle size={12}/> Pend.
                                        </div>
                                    )}
                                </td>
                                <td className="p-2 border-r text-center font-black text-slate-400">.</td>
                                <td className="p-2 border-r text-center">
                                    {slip ? (
                                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">{formatCurrency(slip.netTotal)}</div>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                if (!isEffectivenessDone) return alert("REGRA: Só é permitido processar salário quando a efetividade estiver processada primeiro.");
                                                setActiveProcessingEmp(emp); 
                                                setIsProcessingEffectiveness(true); 
                                            }}
                                            className={`text-[9px] font-black uppercase underline ${isEffectivenessDone ? 'text-red-600 hover:text-blue-600' : 'text-slate-300 cursor-not-allowed'}`}
                                        >
                                            Processar
                                        </button>
                                    )}
                                </td>
                                <td className="p-2 border-r text-center">
                                    <button 
                                        onClick={() => {
                                            if (slip) {
                                                setFinalSlipToPrint(slip);
                                                setShowFinalReceipt(true);
                                            }
                                        }} 
                                        disabled={!slip}
                                        className={`p-1 rounded transition-colors ${slip ? 'text-blue-600 hover:bg-slate-100' : 'text-slate-200 cursor-not-allowed opacity-20'}`}
                                    >
                                        <Printer size={14}/>
                                    </button>
                                </td>
                                <td className="p-2 text-center">
                                    <button 
                                        onClick={() => { setSelectedEmployeeForActions(emp); setShowActionsModal(true); }}
                                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                    >
                                        <MoreVertical size={16}/>
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
                <div className="mt-2 flex flex-wrap gap-4">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest self-center">Conformidade Legal AGT/MAPTSS</p>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Ação:</span>
                        <select 
                            className="bg-transparent text-[11px] font-black text-blue-600 uppercase outline-none cursor-pointer border-none p-0 focus:ring-0"
                            onChange={(e) => handleActionSelect(e.target.value)}
                            value="SELECT"
                        >
                            <option value="SELECT">Selecionar</option>
                            <option value="PROCESS_EFECTIVIDADE">Processar Efetividade (Massa)</option>
                            <option value="DELETE_EFECTIVIDADE">Apagar Efetividade (Massa)</option>
                            <option value="PROCESS_SALARIO">Processar Salário</option>
                            <option value="PRINT_RECIBOS">Imprimir Recibos Salários</option>
                            <option value="DELETE_SALARIO">Apagar Salário</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleTransfer}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition flex items-center gap-2"
                    >
                        <ArrowRight size={14}/> Transferir
                    </button>
                </div>
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm overflow-x-auto w-full md:w-auto custom-scrollbar">
                {[
                  {id:'DASHBOARD', label: 'Painel Geral'},
                  {id:'GESTÃO', label: 'Funcionários'},
                  {id:'ASSIDUIDADE', label: 'Assiduidade Técnica'},
                  {id:'EFETIVIDADE_MAP', label: 'Mapa de Efetividade'},
                  {id:'VENCIMENTO_LIST', label: 'Listagem por Vencimento'},
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
        {activeTab === 'EFETIVIDADE_MAP' && <EffectivenessMap employees={employees} company={company} year={processingYear} month={processingMonth} />}
        {activeTab === 'VENCIMENTO_LIST' && <SalaryListReport employees={employees} payroll={payroll} year={processingYear} />}
        {activeTab === 'MAPAS' && <SalaryMap payroll={payroll} employees={employees} />}
        {activeTab === 'PROFISSÕES' && <ProfessionManager professions={professions} onSave={onSaveProfession} onDelete={onDeleteProfession}/>}
        {activeTab === 'DASHBOARD' && <div className="p-20 text-center text-slate-300 font-black uppercase tracking-[10px] opacity-30 italic text-xl">Imatec RH Cloud System</div>}

        {/* Modal de Transferência */}
        {showTransferModal && (
            <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                        <h3 className="font-black text-lg uppercase tracking-widest flex items-center gap-2"><DollarSign className="text-emerald-400"/> Transferência Bancária</h3>
                        <button onClick={() => setShowTransferModal(false)} className="hover:bg-red-600 p-1 rounded-full transition"><X size={20}/></button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Selecionar Caixa de Saída</label>
                            <select 
                                className="w-full p-4 border-2 border-slate-100 rounded-2xl font-black text-slate-700 bg-slate-50 focus:border-blue-600 outline-none transition-all"
                                value={selectedCashId}
                                onChange={e => setSelectedCashId(e.target.value)}
                            >
                                <option value="">Selecione o Caixa...</option>
                                {cashRegisters.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({formatCurrency(c.balance)})</option>
                                ))}
                            </select>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 text-[10px] text-blue-800 font-bold uppercase tracking-widest leading-relaxed">
                            <Info className="inline-block mr-2" size={14}/>
                            Ao confirmar, o sistema irá processar automaticamente o vencimento dos {selectedEmpIds.size} funcionários selecionados e registrar a saída no caixa.
                        </div>
                        <button 
                            onClick={executeTransfer}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-[3px] shadow-xl shadow-emerald-200 transition transform active:scale-95"
                        >
                            Confirmar Pagamento
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default HumanResources;
