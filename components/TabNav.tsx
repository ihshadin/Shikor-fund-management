'use client';

import { LucideIcon } from 'lucide-react';

export interface TabDef {
  id: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  badge?: number;
}

interface TabNavProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}

export default function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <>
      {/* Desktop: horizontal scrollable tab bar */}
      <div className="mb-5 hidden sm:block">
        <div className="tab-glass flex gap-1 rounded-lg overflow-x-auto shadow-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button key={tab.id} onClick={() => onChange(tab.id)}
                className="relative flex flex-shrink-0 items-center gap-2 border-r-2 border-transparent rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200"
                style={isActive ? {
                  background: 'linear-gradient(to top, #0a0a0f,  #005bff33, #0a0a0f)',
                  color: 'white',
                  borderRightColor: '#02399d',
                  // boxShadow: '0 4px 18px rgba(32,109,247,0.4)',
                } : {
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                {isActive && <span className="absolute inset-0 rounded-lg shimmer-bg opacity-25" />}
                <Icon size={16} className="relative" />
                <span className="relative">{tab.label}</span>
                {tab.badge != null && tab.badge > 0 && (
                  <span className="relative flex h-5 min-w-5 items-center justify-center rounded-lg px-1.5 text-xs font-bold"
                    style={isActive
                      ? { background: 'rgba(255,255,255,0.28)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  >{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="border-t"
          style={{ background: 'rgba(6,6,10,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderColor: 'rgba(32,109,247,0.15)' }}
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <button key={tab.id} onClick={() => onChange(tab.id)}
                  className="relative flex flex-1 flex-shrink-0 flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-semibold transition-all min-w-[60px]"
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.3)' }}
                >
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-lg"
                      style={{ background: '#206df7', boxShadow: '0 0 8px #206df7' }} />
                  )}
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-lg transition-all">
                    <Icon size={17} />
                    {tab.badge != null && tab.badge > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-lg px-1 text-[9px] font-bold text-white"
                        style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.3)' }}
                      >{tab.badge}</span>
                    )}
                  </div>
                  {tab.shortLabel ?? tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
