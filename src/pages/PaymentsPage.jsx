import { useState, useMemo } from 'react';
import { Plus, Download, ChevronRight, IndianRupee, FileText } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { DEMO_PAYMENTS, DEMO_PATIENTS } from '../utils/demoData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { classNames } from '../utils/helpers';

export default function PaymentsPage() {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payments, setPayments] = useState(DEMO_PAYMENTS);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPayments = payments.filter(p => p.date === todayStr);
  const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: "Today's Revenue", value: formatCurrency(todayTotal), icon: IndianRupee, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
    { label: "Transactions", value: todayPayments.length, icon: FileText, color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]' },
    { label: "Pending Dues", value: formatCurrency(2500), icon: IndianRupee, color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]' },
  ];

  return (
    <div className="flex flex-col min-h-0 space-y-4 sm:space-y-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Payments & Billing</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage invoices, receipts, and daily revenue</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" icon={Download} className="hidden sm:flex">Export Report</Button>
          <Button icon={Plus} onClick={() => setShowAddPayment(true)}>Record Payment</Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} padding="p-5" hover>
              <div className="flex items-center gap-4">
                <div className={classNames('w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0', stat.bg)}>
                  <Icon size={20} className={stat.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#6B7280] truncate">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#111827] tracking-tight truncate">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Payments Table ── */}
      <Card padding="p-0" className="flex flex-col flex-1 min-h-0">
        <div className="p-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <h3 className="text-sm font-bold text-[#111827]">Recent Transactions</h3>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {['All', 'Cash', 'Card', 'UPI'].map((mode, i) => (
              <Badge key={mode} color={i === 0 ? 'primary' : 'gray'} className="cursor-pointer bg-white whitespace-nowrap">{mode}</Badge>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-0 flex-1">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] sticky top-0 z-10 shadow-sm border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Receipt No</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Patient</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Method</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {payments.map((payment) => {
                const patient = DEMO_PATIENTS.find(p => p.id === payment.patientId);
                return (
                  <tr key={payment.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-5 py-4 text-sm font-bold text-[#111827]">{payment.receiptNo}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'} size="sm" className="hidden sm:flex shrink-0" />
                        <span className="text-sm font-semibold text-[#111827] truncate max-w-[150px] group-hover:text-[#2563EB] transition-colors">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-[#4B5563]">{formatDate(payment.date)}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#10B981]">{formatCurrency(payment.amount)}</td>
                    <td className="px-5 py-4">
                      <Badge color={payment.method === 'cash' ? 'primary' : payment.method === 'upi' ? 'purple' : 'teal'} className="uppercase !text-[10px]">
                        {payment.method}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Button size="sm" variant="ghost" className="hidden sm:inline-flex">View</Button>
                      <Button size="sm" variant="secondary" icon={Download}>Print</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Record Payment Modal ── */}
      <Modal isOpen={showAddPayment} onClose={() => setShowAddPayment(false)} title="Record Payment" size="md"
        footer={<><Button variant="secondary" onClick={() => setShowAddPayment(false)}>Cancel</Button><Button disabled>Save Payment</Button></>}>
        <div className="space-y-4">
          <Input label="Patient" type="select">
            <option value="">Select a patient...</option>
            {DEMO_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </Input>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount Received (₹)" type="number" placeholder="0.00" />
            <Input label="Date" type="date" defaultValue={todayStr} />
          </div>
          <div>
            <label className="text-[13px] font-bold text-[#374151] block mb-2">Payment Method</label>
            <div className="flex gap-2">
              {['Cash', 'UPI', 'Debit/Credit Card'].map(m => (
                <button key={m} className={classNames('flex-1 py-2 rounded-[10px] text-sm font-medium border transition-colors shadow-sm', m === 'UPI' ? 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]' : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]')}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Input label="Particulars / Services" type="textarea" placeholder="Consultation fee, tests, etc." />
          <Input label="Transaction ID / Notes (Optional)" placeholder="e.g. UPI Ref #12345678" />
        </div>
      </Modal>
    </div>
  );
}
