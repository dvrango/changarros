'use client';

import { useState } from 'react';
import { Lead, LeadStatus, LeadItem } from '@/types';
import { ChevronDown, ChevronUp, MessageSquare, StickyNote } from 'lucide-react';

// Need date-fns or similar, but let's use simple JS Date for now to avoid dep
const formatDate = (ts: number) => new Date(ts).toLocaleString('es-MX', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

interface LeadTableProps {
    leads: Lead[];
    onStatusChange: (id: string, status: LeadStatus) => Promise<void>;
    onNotesChange: (id: string, notes: string) => Promise<void>;
    whatsappPhone: string;
}

const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-green-100 text-green-800',
};

const statusLabels: Record<LeadStatus, string> = {
    new: 'Nuevo',
    contacted: 'Contactado',
    closed: 'Cerrado',
};

export default function LeadTable({ leads, onStatusChange, onNotesChange, whatsappPhone }: LeadTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [notesBuffer, setNotesBuffer] = useState('');

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const startEditingNotes = (lead: Lead) => {
        setEditingNotes(lead.id);
        setNotesBuffer(lead.notes || '');
    };

    const saveNotes = async (id: string) => {
        await onNotesChange(id, notesBuffer);
        setEditingNotes(null);
    };

    const openWhatsApp = (lead: Lead) => {
        // Generate message for owner
        const itemsList = lead.items.map(i => `${i.quantity}x ${i.name}`).join('\n');
        const text = `Pedido #${lead.id.slice(0, 5)}\nTotal: $${lead.total}\n\n${itemsList}`;
        window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    function renderStatusBadge(lead: Lead) {
        return (
            <select
                onClick={(e) => e.stopPropagation()}
                value={lead.status}
                onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${statusColors[lead.status] || 'bg-gray-100'}`}
            >
                {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resumen</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Ver</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                        <>
                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExpand(lead.id)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="max-w-xs truncate">{lead.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                                    <div className="text-xs text-gray-500">{lead.items.length} items</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${lead.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(lead)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); toggleExpand(lead.id); }} className="text-gray-400 hover:text-gray-600">
                                        {expandedId === lead.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </td>
                            </tr>
                            {expandedId === lead.id && (
                                <tr className="bg-gray-50">
                                    <td colSpan={5} className="px-6 py-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Detalle</h4>
                                                <ul className="bg-white border rounded-md divide-y divide-gray-200">
                                                    {lead.items.map((item, idx) => (
                                                        <li key={idx} className="px-3 py-2 flex justify-between text-sm">
                                                            <span>{item.quantity}x {item.name}</span>
                                                            <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button onClick={() => openWhatsApp(lead)} className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Abrir WhatsApp
                                                </button>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-sm font-medium text-gray-900">Notas Internas</h4>
                                                    {editingNotes === lead.id ? (
                                                        <button onClick={() => saveNotes(lead.id)} className="text-xs text-blue-600 font-bold">Guardar</button>
                                                    ) : (
                                                        <button onClick={() => startEditingNotes(lead)} className="text-xs text-gray-500 hover:text-gray-700">Editar</button>
                                                    )}
                                                </div>
                                                {editingNotes === lead.id ? (
                                                    <textarea className="w-full border rounded-md p-2 text-sm" rows={3} value={notesBuffer} onChange={e => setNotesBuffer(e.target.value)} />
                                                ) : (
                                                    <div className="bg-white border rounded-md p-3 text-sm text-gray-600 cursor-pointer hover:bg-gray-50" onClick={() => startEditingNotes(lead)}>
                                                        {lead.notes || <span className="text-gray-400 italic">Sin notas...</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
