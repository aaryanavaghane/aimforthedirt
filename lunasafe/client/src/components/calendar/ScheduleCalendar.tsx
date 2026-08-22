import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkOrder, InfrastructureAsset, ShiftType } from '../../types';
import { formatInr } from '../../utils/formatCurrency';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Filter, 
  IndianRupee,
  Building2,
  Waves,
  Navigation,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScheduleCalendarProps {
  workOrders: WorkOrder[];
  assets: InfrastructureAsset[];
  onScheduleWorkOrder: (payload: {
    assetId: string;
    actionType: string;
    assignedCrew: string;
    scheduledDate: string;
    scheduledTime: string;
    shift: ShiftType;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    notes?: string;
  }) => Promise<void>;
  onSelectAsset?: (asset: InfrastructureAsset) => void;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  workOrders,
  assets,
  onScheduleWorkOrder,
  onSelectAsset
}) => {
  // Calendar date view (Defaulting to August 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // 0-indexed, 7 = August
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-21');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterShift, setFilterShift] = useState<string>('all');
  
  // Modal state for scheduling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [actionType, setActionType] = useState<string>('');
  const [assignedCrew, setAssignedCrew] = useState<string>('PMC Quick Response Drainage Strike Team 1');
  const [modalDate, setModalDate] = useState<string>('2026-08-22');
  const [modalTime, setModalTime] = useState<string>('01:30 AM');
  const [modalShift, setModalShift] = useState<ShiftType>('NIGHT_WINDOW');
  const [assetSearchTerm, setAssetSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filtered work orders by zone and shift
  const filteredWorkOrders = workOrders.filter(wo => {
    if (filterZone !== 'all' && !wo.zoneArea?.toLowerCase().includes(filterZone.toLowerCase())) return false;
    if (filterShift !== 'all' && wo.shift !== filterShift) return false;
    return true;
  });

  // Get work orders for a specific date (YYYY-MM-DD)
  const getOrdersForDate = (dateStr: string) => {
    return filteredWorkOrders.filter(wo => wo.scheduledDate === dateStr);
  };

  // Active day's work orders
  const selectedDayOrders = getOrdersForDate(selectedDate);

  // Available unique zones from assets
  const zones = Array.from(new Set(assets.map(a => a.location.ward.replace(' Ward Office', '')))).sort();

  const handleOpenScheduleModal = (dateStr?: string, assetId?: string) => {
    if (dateStr) setModalDate(dateStr);
    if (assetId) {
      setSelectedAssetId(assetId);
      const target = assets.find(a => a.id === assetId);
      if (target) setActionType(target.recommendedAction);
    } else if (assets.length > 0) {
      setSelectedAssetId(assets[0].id);
      setActionType(assets[0].recommendedAction);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAsset = assets.find(a => a.id === selectedAssetId);
    if (!targetAsset) return;

    try {
      setIsSubmitting(true);
      await onScheduleWorkOrder({
        assetId: targetAsset.id,
        actionType: actionType || targetAsset.recommendedAction,
        assignedCrew,
        scheduledDate: modalDate,
        scheduledTime: modalTime,
        shift: modalShift,
        priority: targetAsset.status === 'critical' ? 'CRITICAL' : 'HIGH',
        notes: `AI Predictive Maintenance dispatched for ${targetAsset.name} in ${targetAsset.location.ward}.`
      });

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });

      setIsModalOpen(false);
      setSelectedDate(modalDate);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShiftBadge = (shift?: ShiftType) => {
    switch (shift) {
      case 'NIGHT_WINDOW':
        return { label: 'Night Shift (01:00-05:00)', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
      case 'MORNING_PEAK':
        return { label: 'Morning Surge (06:00-12:00)', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'AFTERNOON_OFFPEAK':
        return { label: 'Off-Peak (12:00-18:00)', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: '24x7 Emergency', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
    }
  };

  const filteredAssetsForModal = assets.filter(a => {
    if (!assetSearchTerm.trim()) return true;
    const term = assetSearchTerm.toLowerCase();
    return a.name.toLowerCase().includes(term) || a.location.ward.toLowerCase().includes(term);
  });

  const totalAllocatedBudget = workOrders.reduce((sum, w) => sum + (w.estimatedCost || 35000), 0);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Calendar Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white font-display">
              PMC Maintenance Scheduling & Crew Calendar
            </h2>
          </div>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Dispatch, coordinate, and monitor preventative engineering shifts across all 15 Pune Municipal Corporation zones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenScheduleModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold font-display shadow-glow-emerald transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Work Order</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-[10px] block uppercase">Scheduled Orders</span>
          <span className="text-xl font-bold text-white font-display mt-0.5">{workOrders.length} Planned</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-[10px] block uppercase">Active Strike Crews</span>
          <span className="text-xl font-bold text-cyan-400 font-display mt-0.5">8 Squads Deployed</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-[10px] block uppercase">Night Window Shifts</span>
          <span className="text-xl font-bold text-indigo-400 font-display mt-0.5">
            {workOrders.filter(w => w.shift === 'NIGHT_WINDOW').length} Night Ops
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-[10px] block uppercase">Allocated Budget</span>
          <span className="text-xl font-bold text-emerald-400 font-display mt-0.5">
            {formatInr(totalAllocatedBudget)}
          </span>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Month Grid */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl">
          {/* Month Navigator & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <h3 className="text-lg lg:text-xl font-bold text-white font-display">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Zone and Shift Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                <Filter className="w-3 h-3 text-cyan-400" />
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Pune Zones</option>
                  {zones.map(z => (
                    <option key={z} value={z} className="bg-slate-900">{z}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                <Clock className="w-3 h-3 text-indigo-400" />
                <select
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Shifts</option>
                  <option value="NIGHT_WINDOW" className="bg-slate-900">Night Window (01-05 AM)</option>
                  <option value="MORNING_PEAK" className="bg-slate-900">Morning Peak</option>
                  <option value="AFTERNOON_OFFPEAK" className="bg-slate-900">Afternoon Off-Peak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-slate-500 mb-2">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Month Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 lg:gap-2">
            {/* Empty padding days for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 lg:h-24 rounded-xl bg-slate-950/20 border border-transparent" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNumber = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const dayOrders = getOrdersForDate(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === '2026-08-21';

              const hasCritical = dayOrders.some(o => o.priority === 'CRITICAL');
              const hasCompleted = dayOrders.some(o => o.status === 'COMPLETED');

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 lg:h-24 p-1.5 lg:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-glow-cyan'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${
                      isToday
                        ? 'px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-black'
                        : isSelected
                        ? 'text-cyan-400'
                        : 'text-slate-300'
                    }`}>
                      {dayNumber}
                    </span>

                    {dayOrders.length > 0 && (
                      <span className={`w-2 h-2 rounded-full ${
                        hasCritical ? 'bg-rose-500 animate-pulse' : hasCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                    )}
                  </div>

                  {/* Day mini tags */}
                  <div className="space-y-1 overflow-hidden">
                    {dayOrders.slice(0, 2).map((wo) => (
                      <div
                        key={wo.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-mono font-medium ${
                          wo.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {wo.assetName}
                      </div>
                    ))}
                    {dayOrders.length > 2 && (
                      <div className="text-[9px] text-slate-500 font-mono pl-1">
                        +{dayOrders.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Plus shortcut button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenScheduleModal(dateStr);
                    }}
                    className="absolute top-1 right-1 p-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Date Dispatches Detail */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Scheduled Dispatches
                </span>
                <h3 className="text-base lg:text-lg font-bold text-white font-display">
                  {selectedDate}
                </h3>
              </div>

              <button
                onClick={() => handleOpenScheduleModal(selectedDate)}
                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold font-mono flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of orders for selected day */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {selectedDayOrders.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-400 text-xs">
                  <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <p>No maintenance dispatches scheduled for this date.</p>
                  <button
                    onClick={() => handleOpenScheduleModal(selectedDate)}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono font-bold text-xs"
                  >
                    Schedule Preventive Shift
                  </button>
                </div>
              ) : (
                selectedDayOrders.map((wo) => {
                  const shiftBadge = getShiftBadge(wo.shift);
                  const targetAsset = assets.find(a => a.id === wo.assetId);

                  return (
                    <div
                      key={wo.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white font-display">
                              {wo.assetName}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                              wo.priority === 'CRITICAL' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}>
                              {wo.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {wo.zoneArea} Ward • {wo.scheduledTime || '01:00 AM'}
                          </p>
                        </div>

                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          wo.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        }`}>
                          {wo.status}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-200">
                        <div className="font-semibold text-cyan-300 flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          <span>{wo.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{wo.notes}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-400" />
                          {wo.assignedCrew.split(' ')[0]} {wo.assignedCrew.split(' ')[1]}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {formatInr(wo.estimatedCost || 35000)}
                        </span>
                      </div>

                      {targetAsset && onSelectAsset && (
                        <button
                          onClick={() => onSelectAsset(targetAsset)}
                          className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 text-[10px] font-mono font-bold transition-all"
                        >
                          View Live Sensor Telemetry →
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>PMC Scheduled Shift Integrity</span>
            <span className="text-emerald-400 font-bold">100% Operational</span>
          </div>
        </div>
      </div>

      {/* Schedule Work Order Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Schedule PMC Predictive Maintenance Shift
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dispatch engineering crews to prevent catastrophic failure on Pune infrastructure.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-mono">
                {/* Select Asset with Search */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-bold">
                      Select Target Pune Infrastructure Node:
                    </label>
                  </div>
                  
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Type to filter node (e.g. Katraj, Lohegaon, Kothrud)..."
                      value={assetSearchTerm}
                      onChange={(e) => setAssetSearchTerm(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-cyan-500 focus:outline-none text-xs"
                    />
                  </div>

                  <select
                    value={selectedAssetId}
                    onChange={(e) => {
                      setSelectedAssetId(e.target.value);
                      const target = assets.find(a => a.id === e.target.value);
                      if (target) setActionType(target.recommendedAction);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {filteredAssetsForModal.slice(0, 100).map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.location.ward.replace(' Ward Office', '')}] {a.name} (Health: {a.healthScore}/100, {formatInr(a.proactiveCost)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Maintenance Action Type */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Recommended AI Engineering Action:
                  </label>
                  <textarea
                    rows={2}
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 focus:outline-none font-sans"
                    placeholder="e.g. Robotic hydro-suction silt extraction or full-depth asphalt reclamation..."
                  />
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Scheduled Date:</label>
                    <input
                      type="date"
                      value={modalDate}
                      onChange={(e) => setModalDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Scheduled Time Window:</label>
                    <input
                      type="text"
                      value={modalTime}
                      onChange={(e) => setModalTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 focus:outline-none"
                      placeholder="01:30 AM"
                    />
                  </div>
                </div>

                {/* Shift and Assigned Crew */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Shift Category:</label>
                    <select
                      value={modalShift}
                      onChange={(e) => setModalShift(e.target.value as ShiftType)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="NIGHT_WINDOW">Night Shift (01:00-05:00 AM)</option>
                      <option value="MORNING_PEAK">Morning Surge (06:00-12:00 PM)</option>
                      <option value="AFTERNOON_OFFPEAK">Off-Peak (12:00-06:00 PM)</option>
                      <option value="EMERGENCY_24X7">24x7 Immediate Strike</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Assigned PMC Fleet:</label>
                    <select
                      value={assignedCrew}
                      onChange={(e) => setAssignedCrew(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="PMC Quick Response Drainage Strike Team 1">PMC Drainage Strike Team 1</option>
                      <option value="PMC Specialized Bridge Engineering Unit">PMC Bridge Engineering Unit</option>
                      <option value="PMC Thermal Pavement Maintenance Crew 4">PMC Thermal Pavement Crew 4</option>
                      <option value="PMC Heavy Road Construction Fleet 2">PMC Heavy Road Fleet 2</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-display shadow-glow-emerald transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Scheduling Crew...' : 'Confirm PMC Dispatch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
